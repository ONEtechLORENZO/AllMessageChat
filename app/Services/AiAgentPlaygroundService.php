<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class AiAgentPlaygroundService
{
    public function isConfigured(): bool
    {
        return filled(config('services.openai_one.api_key'));
    }

    public function allowedModels(): array
    {
        return collect(config('ai_agents.models', []))
            ->pluck('value')
            ->filter()
            ->values()
            ->all();
    }

    public function stream(array $messages, string $instructions, string $model): StreamedResponse
    {
        $payload = [
            'model' => $model,
            'instructions' => $instructions,
            'input' => $this->formatMessages($messages),
            'tools' => [],
            'tool_choice' => 'none',
            'stream' => true,
        ];

        return response()->stream(function () use ($payload) {
            $this->bootStreamingOutput();

            try {
                $response = $this->request()
                    ->withHeaders([
                        'Accept' => 'text/event-stream',
                        'Content-Type' => 'application/json',
                    ])
                    ->withOptions(['stream' => true])
                    ->send('POST', '/responses', [
                        'body' => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    ]);

                if ($response->failed()) {
                    $this->emitError($this->errorMessageFromResponse($response));
                    $this->emitDone();
                    return;
                }

                $stream = $response->toPsrResponse()->getBody();
                $buffer = '';
                $eventName = null;
                $dataLines = [];

                while (! $stream->eof()) {
                    $buffer .= $stream->read(1024);

                    while (($position = strpos($buffer, "\n")) !== false) {
                        $line = substr($buffer, 0, $position);
                        $buffer = substr($buffer, $position + 1);
                        $line = rtrim($line, "\r");

                        if ($line === '') {
                            $this->handleOpenAiEvent($eventName, $dataLines);
                            $eventName = null;
                            $dataLines = [];
                            continue;
                        }

                        if (str_starts_with($line, 'event:')) {
                            $eventName = trim(substr($line, 6));
                            continue;
                        }

                        if (str_starts_with($line, 'data:')) {
                            $dataLines[] = ltrim(substr($line, 5));
                        }
                    }
                }

                if ($eventName !== null || $dataLines !== []) {
                    $this->handleOpenAiEvent($eventName, $dataLines);
                }
            } catch (Throwable $exception) {
                $this->emitError('OpenAI request failed: ' . $exception->getMessage());
            }

            $this->emitDone();
        }, 200, $this->sseHeaders());
    }

    public function streamError(string $message, int $status = 200): StreamedResponse
    {
        return response()->stream(function () use ($message) {
            $this->bootStreamingOutput();
            $this->emitError($message);
            $this->emitDone();
        }, $status, $this->sseHeaders());
    }

    private function request(): PendingRequest
    {
        $request = Http::baseUrl('https://api.openai.com/v1')
            ->withToken(config('services.openai_one.api_key'))
            ->timeout((int) config('services.openai_one.timeout', 120));

        $caBundle = config('services.openai_one.ca_bundle');

        if (filled($caBundle)) {
            $request = $request->withOptions([
                'verify' => $caBundle,
            ]);
        }

        return $request;
    }

    private function formatMessages(array $messages): array
    {
        return collect($messages)
            ->map(function (array $message) {
                return [
                    'role' => $message['role'],
                    'content' => (string) $message['content'],
                ];
            })
            ->values()
            ->all();
    }

    private function handleOpenAiEvent(?string $eventName, array $dataLines): void
    {
        $rawData = trim(implode("\n", $dataLines));

        if ($rawData === '' || $rawData === '[DONE]') {
            return;
        }

        $payload = json_decode($rawData, true);

        if (! is_array($payload)) {
            return;
        }

        $type = $eventName ?: ($payload['type'] ?? null);

        if ($type === 'response.output_text.delta') {
            $delta = (string) ($payload['delta'] ?? '');

            if ($delta !== '') {
                $this->emit([
                    'type' => 'delta',
                    'text' => $delta,
                ]);
            }

            return;
        }

        if ($type === 'response.failed' || $type === 'error') {
            $message = data_get($payload, 'error.message')
                ?? data_get($payload, 'message')
                ?? 'OpenAI request failed.';

            $this->emitError($message);
        }
    }

    private function errorMessageFromResponse(Response $response): string
    {
        $decoded = json_decode($response->body(), true);

        return data_get($decoded, 'error.message')
            ?? data_get($decoded, 'message')
            ?? $response->body()
            ?? 'OpenAI request failed.';
    }

    private function emitError(string $message): void
    {
        $this->emit([
            'type' => 'error',
            'message' => $message,
        ]);
    }

    private function emitDone(): void
    {
        $this->emit([
            'type' => 'done',
        ]);
    }

    private function emit(array $payload): void
    {
        echo 'data: ' . json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n\n";

        if (function_exists('ob_flush')) {
            @ob_flush();
        }

        flush();
    }

    private function sseHeaders(): array
    {
        return [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ];
    }

    private function bootStreamingOutput(): void
    {
        @ini_set('output_buffering', 'off');
        @ini_set('zlib.output_compression', '0');

        if (function_exists('apache_setenv')) {
            @apache_setenv('no-gzip', '1');
        }
    }
}
