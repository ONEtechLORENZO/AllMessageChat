<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InputAnalysisService
{
    public function isEnabled(): bool
    {
        return filled(config('services.openai.api_key'));
    }

    public function analyze(array $context): ?array
    {
        if (!$this->isEnabled()) {
            return null;
        }

        $client = Http::baseUrl('https://api.openai.com/v1')
            ->withToken(config('services.openai.api_key'))
            ->withHeaders([
                'Content-Type' => 'application/json',
            ])
            ->timeout((int) config('services.openai.analysis_timeout', config('services.openai.timeout', 30)));

        if ($caBundle = $this->resolveCaBundle()) {
            $client = $client->withOptions([
                'verify' => $caBundle,
            ]);
        }

        $payload = [
            'model' => config('services.openai.analysis_model', config('services.openai.model', 'gpt-4o-mini')),
            'instructions' => $this->systemPrompt(),
            'input' => $this->buildInput($context),
            'temperature' => 0.1,
            'max_output_tokens' => 350,
            'store' => false,
        ];

        try {
            $response = $client
                ->post('/responses', $payload)
                ->throw()
                ->json();
        } catch (\Throwable $exception) {
            Log::warning('OpenAI input analysis request failed', [
                'message' => $exception->getMessage(),
            ]);

            return null;
        }

        return $this->parseAnalysis($response);
    }

    private function buildInput(array $context): string
    {
        $page = is_array($context['page'] ?? null) ? $context['page'] : [];
        $assistantState = $context['assistant_state'] ?? ($page['assistant_state_json'] ?? null);

        return implode("\n\n", [
            'RUNTIME CONTEXT',
            'Current user message:' . "\n" . $this->stringValue($context['command'] ?? ''),
            'Current route:' . "\n" . $this->stringValue($page['route_name'] ?? null),
            'Current page title:' . "\n" . $this->stringValue($page['title'] ?? null),
            'Current module:' . "\n" . $this->stringValue($page['module'] ?? null),
            'Current workspace/account:' . "\n" . $this->stringValue($page['workspace_name'] ?? null),
            'Current selected channel/account/profile:' . "\n" . $this->stringValue($page['selected_profile_or_null'] ?? null),
            'Visible page summary:' . "\n" . $this->stringValue($page['short_page_summary'] ?? null),
            'Visible actions on this page:' . "\n" . $this->jsonValue($page['allowed_page_actions'] ?? []),
            'Visible filters:' . "\n" . $this->jsonValue($page['visible_filters_json'] ?? []),
            'Visible forms:' . "\n" . $this->jsonValue($page['visible_forms_json'] ?? []),
            'Visible tables/lists/cards:' . "\n" . $this->jsonValue($page['visible_data_summary_json'] ?? []),
            'Current record in focus:' . "\n" . $this->jsonValue($page['focused_record_json_or_null'] ?? null),
            'Open tabs/section:' . "\n" . $this->stringValue($page['open_section_or_tab'] ?? null),
            'Current page manifest:' . "\n" . $this->jsonValue($page['page_manifest_json'] ?? null),
            'Pending assistant state:' . "\n" . $this->jsonValue($assistantState),
            'Last tool/controller result:' . "\n" . $this->jsonValue($page['last_result_json_or_null'] ?? null),
            'Validation rules for current page:' . "\n" . $this->jsonValue($page['page_validation_rules_json'] ?? []),
        ]);
    }

    private function parseAnalysis(array $response): ?array
    {
        $text = '';

        foreach (($response['output'] ?? []) as $outputItem) {
            if (($outputItem['type'] ?? null) !== 'message') {
                continue;
            }

            foreach (($outputItem['content'] ?? []) as $contentItem) {
                if (($contentItem['type'] ?? null) === 'output_text') {
                    $text .= (string) ($contentItem['text'] ?? '');
                }
            }
        }

        $text = trim($text);
        if ($text === '') {
            return null;
        }

        $decoded = json_decode($text, true);
        if (!is_array($decoded)) {
            if (preg_match('/\{.*\}/s', $text, $matches) !== 1) {
                return null;
            }

            $decoded = json_decode($matches[0], true);
        }

        if (!is_array($decoded)) {
            return null;
        }

        return [
            'intent' => (string) ($decoded['intent'] ?? 'unknown'),
            'module' => (string) ($decoded['module'] ?? ''),
            'explicit_navigation' => (bool) ($decoded['explicit_navigation'] ?? false),
            'confidence' => max(0, min(1, (float) ($decoded['confidence'] ?? 0))),
            'target' => (string) ($decoded['target'] ?? ''),
            'query' => (string) ($decoded['query'] ?? ''),
            'record_id' => (string) ($decoded['record_id'] ?? ''),
            'field' => (string) ($decoded['field'] ?? ''),
            'value' => (string) ($decoded['value'] ?? ''),
            'name' => (string) ($decoded['name'] ?? ''),
            'account_name' => (string) ($decoded['account_name'] ?? ''),
            'category' => (string) ($decoded['category'] ?? ''),
            'language' => (string) ($decoded['language'] ?? ''),
            'metric' => (string) ($decoded['metric'] ?? ''),
        ];
    }

    private function systemPrompt(): string
    {
        return <<<'PROMPT'
You analyze dashboard assistant user input for Enzo.

Return only one compact JSON object with these keys:
- intent: one of "create", "update", "delete", "search", "navigate", "workflow_help", "page_question", "dashboard_stat", "unknown"
- module: one of "campaign", "template", "contact", "lead", "product", "order", "automation", "interactive message", "role", "api", "support request", "billing", "wallet", or ""
- explicit_navigation: boolean
- confidence: number from 0 to 1
- target: string
- query: string
- record_id: string
- field: string
- value: string
- name: string
- account_name: string
- category: string
- language: string
- metric: string

Rules:
- Fix spelling mistakes and weak grammar.
- Distinguish between "help me create a template" and "open templates".
- Mark explicit_navigation true only when the user clearly wants to open or go to a page.
- For help/steps/questions about creating something, use workflow_help, not navigate.
- For creation requests, extract any available fields.
- If the message is about visible numbers or KPIs, use dashboard_stat or page_question.
- Use the runtime context as the source of truth for current page state.
- Use the page manifest as the source of truth for approved actions and required fields.
- If the user is continuing an unfinished task, continue it.
- Do not infer impossible fields that are absent from the user message and runtime context.
- Do not invent IDs, record names, account names, balances, or counts.
- Do not include prose outside the JSON object.
PROMPT;
    }

    private function stringValue(mixed $value): string
    {
        if ($value === null || $value === '') {
            return 'null';
        }

        return is_scalar($value) ? (string) $value : $this->jsonValue($value);
    }

    private function jsonValue(mixed $value): string
    {
        if ($value === null) {
            return 'null';
        }

        return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?: 'null';
    }

    private function resolveCaBundle(): ?string
    {
        $configured = config('services.openai.ca_bundle');
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
}
