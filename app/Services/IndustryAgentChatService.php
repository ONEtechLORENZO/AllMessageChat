<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class IndustryAgentChatService
{
    public function catalog(): array
    {
        return [
            [
                'id' => 'loans',
                'title' => 'Loans',
                'tag' => 'Loans',
                'accent' => '#31cef4',
                'description' => 'Virtual assistant specialized in personal loans, consumer credit, and installment plans.',
                'greeting' => "Hello, I'm your Loans assistant. I can help with eligibility, rates, documents, and repayment options.",
            ],
            [
                'id' => 'banking',
                'title' => 'Banking',
                'tag' => 'Banking',
                'accent' => '#BF00FF',
                'description' => 'Digital assistant for current accounts, cards, transfers and everyday banking operations.',
                'greeting' => "Hello, I'm your Banking assistant. I can help with accounts, cards, transfers, and everyday banking questions.",
            ],
            [
                'id' => 'fashion',
                'title' => 'Fashion',
                'tag' => 'Style',
                'accent' => '#d7f200',
                'description' => 'Specialized assistant for style advice, fashion trends, and personalized shopping.',
                'greeting' => "Hello, I'm your Fashion assistant. I can help with style advice, product suggestions, and trend-based recommendations.",
            ],
            [
                'id' => 'hospitality',
                'title' => 'Hospitality',
                'tag' => 'Service',
                'accent' => '#f43f5e',
                'description' => 'Assistant for reservations, dining recommendations, travel experiences, and hospitality services.',
                'greeting' => "Hello, I'm your Hospitality assistant. I can help with reservations, guest services, and local recommendations.",
            ],
        ];
    }

    public function isConfigured(): bool
    {
        return filled($this->openAiConfig('secondary_api_key'))
            && filled($this->openAiConfig('assistant_id_sales'))
            && filled($this->openAiConfig('assistant_id_banking'))
            && filled($this->openAiConfig('assistant_id_fashion'))
            && filled($this->openAiConfig('assistant_id_hospitality'));
    }

    public function chat(string $agentId, array $messages): array
    {
        $agent = $this->findAgent($agentId);
        if ($agent === null) {
            throw new RuntimeException('Unknown AI agent selected.');
        }

        $payloadMessages = collect($messages)
            ->filter(function ($message) {
                return in_array($message['role'] ?? null, ['user', 'assistant'], true)
                    && filled($message['content'] ?? null);
            })
            ->take(-12)
            ->map(function ($message) {
                return [
                    'role' => $message['role'],
                    'content' => trim((string) $message['content']),
                ];
            })
            ->values()
            ->all();

        if ($payloadMessages === []) {
            throw new RuntimeException('A message is required to talk to the AI agent.');
        }

        if (! filled($agent['assistant_id'] ?? null)) {
            throw new RuntimeException('The selected AI assistant is not configured.');
        }

        $client = $this->baseClient();

        try {
            $thread = $client->post('/threads', [
                'messages' => array_map(function ($message) {
                    return [
                        'role' => $message['role'],
                        'content' => $message['content'],
                    ];
                }, $payloadMessages),
            ])->throw()->json();

            $threadId = (string) data_get($thread, 'id', '');
            if ($threadId === '') {
                throw new RuntimeException('Unable to create the assistant thread.');
            }

            $run = $client->post("/threads/{$threadId}/runs", [
                'assistant_id' => $agent['assistant_id'],
                'additional_instructions' => $agent['system_prompt'],
            ])->throw()->json();

            $runId = (string) data_get($run, 'id', '');
            if ($runId === '') {
                throw new RuntimeException('Unable to start the assistant run.');
            }

            $this->waitForRun($client, $threadId, $runId);
            $reply = $this->latestAssistantReply($client, $threadId);

            if ($reply === '') {
                throw new RuntimeException('The AI agent did not return a reply.');
            }

            return [
                'reply' => $reply,
                'agent' => $agent['title'],
            ];
        } catch (RequestException $exception) {
            throw $this->translateOpenAiException($exception, $agent['title']);
        }
    }

    private function findAgent(string $agentId): ?array
    {
        $definitions = [
            'loans' => [
                'title' => 'Loans',
                'assistant_id' => $this->openAiConfig('assistant_id_sales'),
                'system_prompt' => 'You are ONE Loans, a specialist for personal loans and consumer credit. Help users understand financing options, documents, monthly payments, interest rates, and eligibility in a professional, reassuring way. Never guarantee approval. Ask only for non-sensitive context and suggest official channels for final approval steps. Reply in the same language as the user unless they ask otherwise.',
            ],
            'banking' => [
                'title' => 'Banking',
                'assistant_id' => $this->openAiConfig('assistant_id_banking'),
                'system_prompt' => 'You are ONE Banking, a digital banking assistant for accounts, cards, transfers, statements, and everyday operations. Be clear, trustworthy, and concise. Never ask for passwords, OTPs, PINs, or full card numbers. For sensitive actions, direct the user to official secure channels. Reply in the same language as the user unless they ask otherwise.',
            ],
            'fashion' => [
                'title' => 'Fashion',
                'assistant_id' => $this->openAiConfig('assistant_id_fashion'),
                'system_prompt' => 'You are ONE Fashion, a personal style assistant. Help with outfits, trends, styling advice, seasonal recommendations, product matching, and shopping guidance. Be warm, stylish, and practical. Ask brief clarifying questions when useful. Reply in the same language as the user unless they ask otherwise.',
            ],
            'hospitality' => [
                'title' => 'Hospitality',
                'assistant_id' => $this->openAiConfig('assistant_id_hospitality'),
                'system_prompt' => 'You are ONE Hospitality, a concierge-style assistant for reservations, guest support, dining suggestions, and travel experiences. Be warm, polished, and service-oriented. Give structured, practical recommendations and highlight when confirmation with the venue or provider is needed. Reply in the same language as the user unless they ask otherwise.',
            ],
        ];

        return $definitions[$agentId] ?? null;
    }

    private function baseClient()
    {
        $apiKey = $this->openAiConfig('secondary_api_key');

        if (!filled($apiKey)) {
            throw new RuntimeException('OpenAI is not configured for this AI agent.');
        }

        $client = Http::baseUrl('https://api.openai.com/v1')
            ->withToken($apiKey)
            ->withHeaders([
                'OpenAI-Beta' => 'assistants=v2',
            ])
            ->timeout((int) config('services.openai.timeout', 30))
            ->acceptJson()
            ->asJson();

        if ($caBundle = $this->resolveCaBundle()) {
            $client = $client->withOptions([
                'verify' => $caBundle,
            ]);
        }

        return $client;
    }

    private function waitForRun($client, string $threadId, string $runId): void
    {
        $attempts = 0;

        while ($attempts < 45) {
            $attempts++;
            usleep(1000000);

            $run = $client->get("/threads/{$threadId}/runs/{$runId}")->throw()->json();
            $status = (string) data_get($run, 'status', '');

            if ($status === 'completed') {
                return;
            }

            if (in_array($status, ['failed', 'cancelled', 'expired', 'incomplete'], true)) {
                $message = (string) data_get($run, 'last_error.message', 'The assistant run failed.');
                throw new RuntimeException($message !== '' ? $message : 'The assistant run failed.');
            }
        }

        throw new RuntimeException('The assistant took too long to respond.');
    }

    private function latestAssistantReply($client, string $threadId): string
    {
        $messages = $client->get("/threads/{$threadId}/messages", [
            'order' => 'desc',
            'limit' => 10,
        ])->throw()->json();

        foreach (data_get($messages, 'data', []) as $message) {
            if (($message['role'] ?? null) !== 'assistant') {
                continue;
            }

            $reply = trim(
                collect($message['content'] ?? [])
                    ->filter(fn ($content) => ($content['type'] ?? null) === 'text')
                    ->map(fn ($content) => (string) data_get($content, 'text.value', ''))
                    ->implode("\n")
            );

            if ($reply !== '') {
                return $reply;
            }
        }

        return '';
    }

    private function resolveCaBundle(): ?string
    {
        $configured = $this->openAiConfig('ca_bundle');
        if (is_string($configured) && $configured !== '' && is_file($configured)) {
            return $configured;
        }

        $candidates = [
            'C:\\Program Files\\Git\\mingw64\\etc\\ssl\\certs\\ca-bundle.crt',
            'C:\\Program Files\\Git\\mingw64\\etc\\ssl\\cert.pem',
            'C:\\xampp\\apache\\bin\\curl-ca-bundle.crt',
        ];

        foreach ($candidates as $candidate) {
            if (is_file($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    private function openAiConfig(string $key): string
    {
        return trim((string) config("services.openai.{$key}", ''));
    }

    private function translateOpenAiException(RequestException $exception, string $agentTitle): RuntimeException
    {
        $status = $exception->response?->status();
        $message = trim((string) data_get($exception->response?->json(), 'error.message', ''));

        if ($status === 401) {
            return new RuntimeException('OpenAI rejected OPENAI_API_KEY_2 for the ' . $agentTitle . ' agent. Please verify that the key is active, complete, and belongs to the same OpenAI project as these assistants.');
        }

        if ($status === 404) {
            return new RuntimeException('The configured OpenAI assistant for the ' . $agentTitle . ' agent could not be found. Please verify the assistant ID in .env.');
        }

        return new RuntimeException($message !== '' ? $message : 'The AI agent request failed.');
    }
}
