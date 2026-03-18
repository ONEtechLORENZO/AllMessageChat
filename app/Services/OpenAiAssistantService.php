<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAiAssistantService
{
    public function isEnabled(): bool
    {
        return filled(config('services.openai.api_key'));
    }

    public function decide(array $context): ?array
    {
        if (!$this->isEnabled()) {
            return null;
        }

        if ($decision = $this->decideWithAssistant($context)) {
            return $decision;
        }

        return $this->decideWithResponses($context);
    }

    private function decideWithResponses(array $context): ?array
    {
        $client = $this->baseClient();

        $payload = [
            'model' => config('services.openai.model', 'gpt-4o-mini'),
            'instructions' => $this->systemPrompt(),
            'input' => $this->buildInput($context),
            'temperature' => 0.2,
            'max_output_tokens' => 500,
            'store' => false,
            'tools' => $this->toolDefinitions(),
        ];

        try {
            $response = $client
                ->post('/responses', $payload)
                ->throw()
                ->json();
        } catch (\Throwable $exception) {
            Log::warning('OpenAI assistant request failed', [
                'message' => $exception->getMessage(),
            ]);

            return null;
        }

        return $this->parseDecision($response);
    }

    private function decideWithAssistant(array $context): ?array
    {
        $assistantId = trim((string) config('services.openai.assistant_id'));
        if ($assistantId === '') {
            return null;
        }

        $client = $this->baseClient([
            'OpenAI-Beta' => 'assistants=v2',
        ]);

        try {
            $assistant = $client->get('/assistants/' . $assistantId)->throw()->json();
        } catch (\Throwable $exception) {
            Log::warning('OpenAI assistant lookup failed', [
                'assistant_id' => $assistantId,
                'message' => $exception->getMessage(),
            ]);

            return null;
        }

        $payload = [
            'assistant_id' => $assistantId,
            'thread' => [
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $this->buildAssistantMessage($context),
                    ],
                ],
            ],
            'additional_instructions' => $this->systemPrompt(),
            'tool_choice' => 'auto',
            'tools' => $this->mergeAssistantTools($assistant['tools'] ?? []),
            'metadata' => [
                'source' => 'dashboard-assistant',
            ],
        ];

        try {
            $run = $client->post('/threads/runs', $payload)->throw()->json();
        } catch (\Throwable $exception) {
            Log::warning('OpenAI assistant run failed', [
                'assistant_id' => $assistantId,
                'message' => $exception->getMessage(),
            ]);

            return null;
        }

        $threadId = (string) ($run['thread_id'] ?? '');
        $runId = (string) ($run['id'] ?? '');
        if ($threadId === '' || $runId === '') {
            return null;
        }

        for ($attempt = 0; $attempt < 12; $attempt++) {
            usleep(500000);

            try {
                $status = $client->get("/threads/{$threadId}/runs/{$runId}")->throw()->json();
            } catch (\Throwable $exception) {
                Log::warning('OpenAI assistant poll failed', [
                    'assistant_id' => $assistantId,
                    'thread_id' => $threadId,
                    'run_id' => $runId,
                    'message' => $exception->getMessage(),
                ]);

                return null;
            }

            $runStatus = (string) ($status['status'] ?? '');

            if ($runStatus === 'requires_action') {
                return $this->parseAssistantToolCall($status);
            }

            if ($runStatus === 'completed') {
                return $this->fetchAssistantMessage($client, $threadId, $assistantId);
            }

            if (in_array($runStatus, ['failed', 'cancelled', 'expired', 'incomplete'], true)) {
                Log::warning('OpenAI assistant run ended without completion', [
                    'assistant_id' => $assistantId,
                    'thread_id' => $threadId,
                    'run_id' => $runId,
                    'status' => $runStatus,
                    'last_error' => $status['last_error'] ?? null,
                ]);

                return null;
            }
        }

        Log::warning('OpenAI assistant run timed out', [
            'assistant_id' => $assistantId,
            'thread_id' => $threadId,
            'run_id' => $runId,
        ]);

        return null;
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
            'Assistant capabilities:' . "\n" . $this->jsonValue([
                'create draft campaigns',
                'create draft templates',
                'create contacts',
                'create leads',
                'create products',
                'create orders',
                'create automations',
                'create interactive messages',
                'create roles',
                'create api keys',
                'create support requests',
                'update contacts, leads, and campaigns',
                'update products, orders, automations, interactive messages, roles, api keys, and support requests',
                'delete contacts, leads, campaigns, products, orders, automations, interactive messages, roles, api keys, and support requests with confirmation',
                'handle billing helpers like current plan and auto topup',
                'search dashboard records',
                'navigate to dashboard areas',
                'summarize current page data',
                'answer direct questions from current page props',
                'open current page detail, edit, list, and create flows',
                'answer workflow questions',
                'continue incomplete template creation tasks',
                'edit the current template editor draft by setting header, body, footer, and buttons',
                'submit the current template for review when it is complete',
            ]),
        ]);
    }

    private function buildAssistantMessage(array $context): string
    {
        return "Use the dashboard context below to help the user.\n\n" . $this->buildInput($context);
    }

    private function parseDecision(array $response): ?array
    {
        foreach (($response['output'] ?? []) as $outputItem) {
            if (($outputItem['type'] ?? null) === 'function_call') {
                $arguments = json_decode((string) ($outputItem['arguments'] ?? '{}'), true);

                return [
                    'type' => 'tool_call',
                    'name' => (string) ($outputItem['name'] ?? ''),
                    'arguments' => is_array($arguments) ? $arguments : [],
                ];
            }
        }

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

        if ($text === '') {
            return null;
        }

        return [
            'type' => 'message',
            'message' => trim($text),
        ];
    }

    private function parseAssistantToolCall(array $run): ?array
    {
        $toolCalls = $run['required_action']['submit_tool_outputs']['tool_calls'] ?? [];

        foreach ($toolCalls as $toolCall) {
            if (($toolCall['type'] ?? null) !== 'function') {
                continue;
            }

            $arguments = json_decode((string) ($toolCall['function']['arguments'] ?? '{}'), true);

            return [
                'type' => 'tool_call',
                'name' => (string) ($toolCall['function']['name'] ?? ''),
                'arguments' => is_array($arguments) ? $arguments : [],
            ];
        }

        return null;
    }

    private function fetchAssistantMessage($client, string $threadId, string $assistantId): ?array
    {
        try {
            $messages = $client
                ->get("/threads/{$threadId}/messages", [
                    'order' => 'desc',
                    'limit' => 10,
                ])
                ->throw()
                ->json();
        } catch (\Throwable $exception) {
            Log::warning('OpenAI assistant message fetch failed', [
                'assistant_id' => $assistantId,
                'thread_id' => $threadId,
                'message' => $exception->getMessage(),
            ]);

            return null;
        }

        foreach (($messages['data'] ?? []) as $message) {
            if (($message['role'] ?? null) !== 'assistant') {
                continue;
            }

            $text = '';
            foreach (($message['content'] ?? []) as $contentItem) {
                if (($contentItem['type'] ?? null) !== 'text') {
                    continue;
                }

                $text .= (string) ($contentItem['text']['value'] ?? '');
            }

            if ($text !== '') {
                return [
                    'type' => 'message',
                    'message' => trim($text),
                ];
            }
        }

        return null;
    }

    private function systemPrompt(): string
    {
        return <<<'PROMPT'
You are Enzo, a dashboard operator. You do not own business logic. The controller owns validation, routing, execution, permissions, and confirmation policy.

You must do exactly one of these:
- return a short grounded reply with no tool call, or
- call exactly one approved dashboard tool.

Operator rules:
- Ground every answer in runtime context, page manifest, or confirmed tool results.
- Never invent counts, IDs, balances, statuses, records, or hidden data.
- Treat the page manifest as the source of truth for allowed actions, required fields, validation rules, and safe defaults.
- Treat pending assistant state as the source of truth for continuation. If there is an unfinished task, continue that task first.
- Prefer safe direct action for non-destructive requests when the manifest allows it.
- Destructive actions require confirmation. Never imply completion before confirmation and confirmed tool results.
- If required data is missing, ask only for the minimum missing required fields.
- If the user asks about current page data, answer from runtime context first. If runtime context is insufficient, use a tool. If still unverified, say it cannot be confirmed.
- Keep replies concise and practical.
- Do not claim an action succeeded unless the tool/controller result confirms success.
PROMPT;
    }

    private function toolDefinitions(): array
    {
        return [
            [
                'type' => 'function',
                'name' => 'create_campaign',
                'description' => 'Create a draft campaign or continue campaign creation when the user wants a campaign.',
                'parameters' => $this->strictObjectSchema([
                    'name' => $this->nullableStringProperty(),
                ]),
                'strict' => true,
            ],
            [
                'type' => 'function',
                'name' => 'create_contact',
                'description' => 'Create or continue contact creation using any name, email, or phone details available.',
                'parameters' => $this->strictObjectSchema([
                    'first_name' => $this->nullableStringProperty(),
                    'last_name' => $this->nullableStringProperty(),
                    'email' => $this->nullableStringProperty(),
                    'phone_number' => $this->nullableStringProperty(),
                ]),
                'strict' => true,
            ],
            [
                'type' => 'function',
                'name' => 'create_lead',
                'description' => 'Create or continue lead creation using any name or status details available.',
                'parameters' => $this->strictObjectSchema([
                    'name' => $this->nullableStringProperty(),
                    'status' => $this->nullableStringProperty(),
                ]),
                'strict' => true,
            ],
            [
                'type' => 'function',
                'name' => 'create_template',
                'description' => 'Create or continue a template task using any account, category, language, and name details available.',
                'parameters' => $this->strictObjectSchema([
                    'account_name' => $this->nullableStringProperty(),
                    'category' => $this->nullableStringProperty(),
                    'language' => $this->nullableStringProperty(),
                    'name' => $this->nullableStringProperty(),
                ]),
                'strict' => true,
            ],
            [
                'type' => 'function',
                'name' => 'update_record',
                'description' => 'Update a supported dashboard record such as a contact, lead, or campaign when the user provides a record id, field, and new value.',
                'parameters' => $this->strictObjectSchema([
                    'module' => $this->nullableStringProperty(),
                    'record_id' => $this->nullableStringProperty(),
                    'field' => $this->nullableStringProperty(),
                    'value' => $this->nullableStringProperty(),
                ]),
                'strict' => true,
            ],
            [
                'type' => 'function',
                'name' => 'delete_record',
                'description' => 'Delete a supported dashboard record such as a contact, lead, or campaign. The application will confirm before deleting.',
                'parameters' => $this->strictObjectSchema([
                    'module' => $this->nullableStringProperty(),
                    'record_id' => $this->nullableStringProperty(),
                ]),
                'strict' => true,
            ],
            [
                'type' => 'function',
                'name' => 'search_records',
                'description' => 'Search dashboard records like campaigns, contacts, leads, templates, or message logs.',
                'parameters' => $this->strictObjectSchema([
                    'module' => $this->nullableStringProperty(),
                    'query' => $this->nullableStringProperty(),
                    'account_name' => $this->nullableStringProperty(),
                ]),
                'strict' => true,
            ],
            [
                'type' => 'function',
                'name' => 'navigate_to_area',
                'description' => 'Open a dashboard area like campaigns, templates, contacts, billing, dashboard, logs, automations, or catalogs.',
                'parameters' => $this->strictObjectSchema([
                    'target' => $this->nullableStringProperty(),
                ]),
                'strict' => true,
            ],
            [
                'type' => 'function',
                'name' => 'open_page_action',
                'description' => 'Open a module list, detail, edit, or create flow for a dashboard page.',
                'parameters' => $this->strictObjectSchema([
                    'module' => $this->nullableStringProperty(),
                    'action' => $this->nullableStringProperty(),
                    'record_id' => $this->nullableStringProperty(),
                ]),
                'strict' => true,
            ],
            [
                'type' => 'function',
                'name' => 'explain_workflow',
                'description' => 'Explain how to perform a workflow such as creating a template, campaign, or using the dashboard.',
                'parameters' => $this->strictObjectSchema([
                    'topic' => $this->nullableStringProperty(),
                ]),
                'strict' => true,
            ],
            [
                'type' => 'function',
                'name' => 'answer_page_question',
                'description' => 'Answer a question about the current page, current page data, page counts, or visible records.',
                'parameters' => $this->strictObjectSchema([
                    'question' => $this->nullableStringProperty(),
                ]),
                'strict' => true,
            ],
            [
                'type' => 'function',
                'name' => 'get_dashboard_stat',
                'description' => 'Answer dashboard statistic questions about balance, sessions, messages, campaigns, templates, accounts, or contacts.',
                'parameters' => $this->strictObjectSchema([
                    'metric' => $this->nullableStringProperty(),
                ]),
                'strict' => true,
            ],
        ];
    }

    private function strictObjectSchema(array $properties): array
    {
        return [
            'type' => 'object',
            'additionalProperties' => false,
            'properties' => $properties,
            'required' => array_keys($properties),
        ];
    }

    private function nullableStringProperty(): array
    {
        return [
            'type' => ['string', 'null'],
        ];
    }

    private function mergeAssistantTools(array $assistantTools): array
    {
        $merged = [];
        $seenNames = [];

        foreach ($assistantTools as $tool) {
            $merged[] = $tool;

            if (($tool['type'] ?? null) === 'function' && filled($tool['function']['name'] ?? null)) {
                $seenNames[] = (string) $tool['function']['name'];
            }
        }

        foreach ($this->assistantToolDefinitions() as $tool) {
            $name = (string) ($tool['function']['name'] ?? '');
            if ($name !== '' && in_array($name, $seenNames, true)) {
                continue;
            }

            $merged[] = $tool;
        }

        return $merged;
    }

    private function assistantToolDefinitions(): array
    {
        return array_map(function (array $tool): array {
            return [
                'type' => 'function',
                'function' => [
                    'name' => $tool['name'],
                    'description' => $tool['description'],
                    'parameters' => $tool['parameters'],
                    'strict' => $tool['strict'] ?? true,
                ],
            ];
        }, $this->toolDefinitions());
    }

    private function baseClient(array $headers = [])
    {
        $client = Http::baseUrl('https://api.openai.com/v1')
            ->withToken(config('services.openai.api_key'))
            ->withHeaders(array_merge([
                'Content-Type' => 'application/json',
            ], $headers))
            ->timeout((int) config('services.openai.timeout', 30));

        if ($caBundle = $this->resolveCaBundle()) {
            $client = $client->withOptions([
                'verify' => $caBundle,
            ]);
        }

        return $client;
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
