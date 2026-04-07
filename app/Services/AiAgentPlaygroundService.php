<?php

namespace App\Services;

use App\Models\AiAgent;
use Illuminate\Http\Client\RequestException;
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

    public function syncAssistant(AiAgent $agent, string $instructions): array
    {
        $payload = [
            'name' => $agent->name,
            'model' => $agent->model,
            'instructions' => $instructions,
            'tools' => [],
            'response_format' => 'auto',
            'metadata' => [
                'source' => 'crm-ai-agent',
                'agent_key' => $agent->key,
                'app_user_id' => (string) $agent->user_id,
            ],
        ];

        if (filled($agent->assistant_id)) {
            try {
                $response = $this->assistantRequest()
                    ->post('/assistants/' . $agent->assistant_id, $payload)
                    ->throw()
                    ->json();
            } catch (RequestException $exception) {
                if ($exception->response?->status() !== 404) {
                    throw $exception;
                }

                $response = $this->assistantRequest()
                    ->post('/assistants', $payload)
                    ->throw()
                    ->json();
            }
        } else {
            $response = $this->assistantRequest()
                ->post('/assistants', $payload)
                ->throw()
                ->json();
        }

        return is_array($response) ? $response : [];
    }

    public function streamAssistantReply(AiAgent $agent, string $message, ?string $threadId = null): StreamedResponse
    {
        return response()->stream(function () use ($agent, $message, $threadId) {
            $this->bootStreamingOutput();

            try {
                $activeThreadId = $threadId ?: $this->createThread();

                $this->emit([
                    'type' => 'meta',
                    'thread_id' => $activeThreadId,
                ]);

                $this->assistantRequest()
                    ->post("/threads/{$activeThreadId}/messages", [
                        'role' => 'user',
                        'content' => $message,
                    ])
                    ->throw();

                $response = $this->assistantRequest()
                    ->withHeaders([
                        'Accept' => 'text/event-stream',
                        'Content-Type' => 'application/json',
                    ])
                    ->withOptions(['stream' => true])
                    ->send('POST', "/threads/{$activeThreadId}/runs", [
                        'body' => json_encode([
                            'assistant_id' => $agent->assistant_id,
                            'stream' => true,
                        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
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
                    $buffer .= $stream->read(2048);

                    while (($position = strpos($buffer, "\n")) !== false) {
                        $line = substr($buffer, 0, $position);
                        $buffer = substr($buffer, $position + 1);
                        $line = rtrim($line, "\r");

                        if ($line === '') {
                            $this->handleAssistantEvent($eventName, $dataLines);
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
                    $this->handleAssistantEvent($eventName, $dataLines);
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

    private function createThread(): string
    {
        $response = $this->assistantRequest()
            ->post('/threads', [])
            ->throw()
            ->json();

        $threadId = (string) data_get($response, 'id', '');

        if ($threadId === '') {
            throw new \RuntimeException('OpenAI did not return a thread ID.');
        }

        return $threadId;
    }

    private function assistantRequest(): PendingRequest
    {
        $request = Http::baseUrl('https://api.openai.com/v1')
            ->withToken(config('services.openai_one.api_key'))
            ->withHeaders([
                'OpenAI-Beta' => 'assistants=v2',
            ])
            ->timeout((int) config('services.openai_one.timeout', 120));

        $caBundle = config('services.openai_one.ca_bundle');

        if (filled($caBundle)) {
            $request = $request->withOptions([
                'verify' => $caBundle,
            ]);
        }

        return $request;
    }

    private function handleAssistantEvent(?string $eventName, array $dataLines): void
    {
        $rawData = trim(implode("\n", $dataLines));

        if ($rawData === '' || $rawData === '[DONE]') {
            return;
        }

        $payload = json_decode($rawData, true);

        if (! is_array($payload)) {
            return;
        }

        $type = $eventName ?: ($payload['event'] ?? null) ?: ($payload['type'] ?? null);

        if ($type === 'thread.message.delta') {
            foreach ((array) data_get($payload, 'delta.content', []) as $contentItem) {
                $delta = (string) data_get($contentItem, 'text.value', '');

                if ($delta !== '') {
                    $this->emit([
                        'type' => 'delta',
                        'text' => $delta,
                    ]);
                }
            }

            return;
        }

        if (in_array($type, ['thread.run.failed', 'error'], true)) {
            $message = data_get($payload, 'data.last_error.message')
                ?? data_get($payload, 'error.message')
                ?? data_get($payload, 'message')
                ?? 'OpenAI request failed.';

            $this->emitError((string) $message);
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
