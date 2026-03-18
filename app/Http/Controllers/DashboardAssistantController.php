<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Api;
use App\Models\Automation;
use App\Models\Campaign;
use App\Models\Catalog;
use App\Models\Company;
use App\Models\Contact;
use App\Models\Group;
use App\Models\Import;
use App\Models\InteractiveMessage;
use App\Models\Lead;
use App\Models\Message;
use App\Models\MessageLog;
use App\Models\MessageButton;
use App\Models\Msg;
use App\Models\Opportunity;
use App\Models\Order;
use App\Models\Organization;
use App\Models\Plan;
use App\Models\Price;
use App\Models\Product;
use App\Models\Session;
use App\Models\Setting;
use App\Models\SupportRequest;
use App\Models\Tag;
use App\Models\Template;
use App\Models\Wallet;
use App\Services\InputAnalysisService;
use App\Services\OpenAiAssistantService;
use App\Support\Assistant\AssistantActionAuthorizer;
use App\Support\Assistant\AssistantDataQueryService;
use App\Support\Assistant\AssistantPersistenceMapper;
use App\Support\Assistant\AssistantRecordResolver;
use App\Support\Assistant\TemplateAccountResolver;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role as PermissionRole;

class DashboardAssistantController extends Controller
{
    public function handle(Request $request, OpenAiAssistantService $openAiAssistant, InputAnalysisService $inputAnalysis): JsonResponse
    {
        $validated = $request->validate([
            'command' => ['required', 'string', 'max:1000'],
            'page' => ['nullable', 'array'],
            'page.url' => ['nullable', 'string', 'max:500'],
            'page.component' => ['nullable', 'string', 'max:255'],
            'page.title' => ['nullable', 'string', 'max:255'],
            'page.props' => ['nullable', 'array'],
            'assistant_state' => ['nullable', 'array'],
        ]);

        $user = $request->user();
        $command = trim((string) $validated['command']);
        $page = $validated['page'] ?? [];
        $assistantState = $this->normalizeAssistantState($validated['assistant_state'] ?? null, $page);
        $page = $this->enrichAssistantPageContext($page, $assistantState);
        $analysis = $inputAnalysis->analyze([
            'command' => $command,
            'page' => $page,
            'assistant_state' => $assistantState,
        ]);
        $effectiveCommand = $this->buildCommandFromAnalysis($command, $analysis);
        $normalized = $this->normalizeNaturalCommand($effectiveCommand);
        $isInformationQuestion = $this->isInformationQuestionCommand($normalized, $page);

        if ($response = $this->handlePageActionCommandIntent($effectiveCommand, $normalized, $page)) {
            return $this->jsonAssistantResponse($response, $page);
        }

        if ($isInformationQuestion) {
            if ($response = $this->handleDashboardQuestionIntent($request, $normalized, $page)) {
                return $this->jsonAssistantResponse($response, $page);
            }
        }

        if ($response = $this->handleSmartCreationHelpIntent($request, $effectiveCommand, $normalized, $page)) {
            return $this->jsonAssistantResponse($response, $page);
        }

        if ($response = $this->handleCurrentTemplateEditorIntent($request, $effectiveCommand, $normalized, $assistantState, $page)) {
            return $this->jsonAssistantResponse($response, $page);
        }

        if ($response = $this->handlePendingIntent($request, $effectiveCommand, $normalized, $assistantState, $page)) {
            return $this->jsonAssistantResponse($response, $page);
        }

        if ($response = $this->handleStructuredModuleIntent($request, $effectiveCommand, $normalized, $page)) {
            return $this->jsonAssistantResponse($response, $page);
        }

        if ($response = $this->handleHelpIntent($normalized, $page)) {
            return $this->jsonAssistantResponse($response, $page);
        }

        if ($response = $this->handleWorkflowGuidanceIntent($normalized, $page)) {
            return $this->jsonAssistantResponse($response, $page);
        }

        if ($response = $this->handleCampaignIntent($request, $effectiveCommand, $normalized)) {
            return $this->jsonAssistantResponse($response, $page);
        }

        if ($response = $this->handleTemplateIntent($request, $effectiveCommand, $normalized)) {
            return $this->jsonAssistantResponse($response, $page);
        }

        if ($response = $this->handleSearchIntent($request, $effectiveCommand, $normalized)) {
            return $this->jsonAssistantResponse($response, $page);
        }

        if ($response = $this->handleNavigationIntent($normalized)) {
            return $this->jsonAssistantResponse($response, $page);
        }

        if (!$isInformationQuestion && ($response = $this->handleDashboardQuestionIntent($request, $normalized, $page))) {
            return $this->jsonAssistantResponse($response, $page);
        }

        if ($decision = $openAiAssistant->decide([
            'command' => $effectiveCommand,
            'page' => $page,
            'assistant_state' => $assistantState,
        ])) {
            if (($decision['type'] ?? null) === 'message' && filled($decision['message'] ?? null)) {
                return $this->jsonAssistantResponse([
                    'message' => $decision['message'],
                    'suggestions' => [],
                    'assistant_state' => $assistantState,
                ], $page);
            }

            if (($decision['type'] ?? null) === 'tool_call') {
                if ($response = $this->handleOpenAiToolCall($request, $decision, $assistantState, $page)) {
                    return $this->jsonAssistantResponse($response, $page);
                }
            }
        }

        if ($isInformationQuestion) {
            return $this->jsonAssistantResponse([
                'message' => $this->fallbackDataQuestionMessage($normalized, $page),
                'suggestions' => [
                    'What is on this page?',
                    'How many items are on this page?',
                    'Open dashboard',
                ],
            ], $page);
        }

        return $this->jsonAssistantResponse([
            'message' => $this->fallbackCapabilityMessage($page),
            'suggestions' => [
                'What is on this page?',
                'What can you do on this page?',
                'Open this page list',
                'Create a campaign called spring_sale',
            ],
        ], $page);
    }

    private function buildCommandFromAnalysis(string $command, ?array $analysis): string
    {
        $normalizedOriginal = $this->normalizeNaturalCommand($command);

        if ($this->isDataQuestionCommand($normalizedOriginal)) {
            return $command;
        }

        if (!is_array($analysis) || (($analysis['confidence'] ?? 0) < 0.55)) {
            return $command;
        }

        $intent = (string) ($analysis['intent'] ?? '');
        $module = trim((string) ($analysis['module'] ?? ''));

        if (($analysis['explicit_navigation'] ?? false) && $intent === 'navigate') {
            $target = trim((string) ($analysis['target'] ?? $module));

            return $target !== '' ? "open {$target}" : $command;
        }

        if ($intent === 'workflow_help' && $module !== '') {
            return "how do i create {$module}";
        }

        if ($intent === 'search' && $module !== '') {
            $query = trim((string) ($analysis['query'] ?? ''));

            return $query !== '' ? "search {$module} for {$query}" : "search {$module}";
        }

        if ($intent === 'dashboard_stat') {
            $metric = trim((string) ($analysis['metric'] ?? ''));

            return $metric !== '' ? $metric : $command;
        }

        if ($intent !== 'create' || $module === '') {
            return $command;
        }

        return match ($module) {
            'template' => $this->buildAnalyzedTemplateCommand($analysis, $command),
            'campaign' => $this->buildAnalyzedCampaignCommand($analysis, $command),
            default => $command,
        };
    }

    private function isDataQuestionCommand(string $normalized): bool
    {
        if (preg_match('/\bhow many\b|\bcount\b|\btotal\b|\bnumber of\b|\btell me\b|\bshow me\b|\bwhat data\b|\bwhat information\b/', $normalized) === 1) {
            return true;
        }

        if ($this->resolveRelativeDateRange($normalized) !== null) {
            return true;
        }

        return false;
    }

    private function isInformationQuestionCommand(string $normalized, array $page): bool
    {
        if ($this->isDataQuestionCommand($normalized)) {
            return true;
        }

        if (preg_match('/^(what|which|who|when|where|why|is|are|does|do|can|could|would)\b/', $normalized) === 1) {
            return true;
        }

        if ($this->containsIntent($normalized, [
            'this page',
            'current page',
            'this template',
            'this campaign',
            'this contact',
            'this lead',
            'this product',
            'this order',
            'this automation',
            'this role',
            'this api',
            'this account',
            'this billing',
        ])) {
            return true;
        }

        $currentModule = $this->inferModuleFromPage($page);

        return $currentModule !== null && preg_match('/\b(this|current)\b/', $normalized) === 1;
    }

    private function buildAnalyzedTemplateCommand(array $analysis, string $fallback): string
    {
        $parts = ['create'];

        $category = trim((string) ($analysis['category'] ?? ''));
        if ($category !== '') {
            $parts[] = $category;
        }

        $parts[] = 'template';

        $accountName = trim((string) ($analysis['account_name'] ?? ''));
        if ($accountName !== '') {
            $parts[] = 'for ' . $accountName;
        }

        $language = trim((string) ($analysis['language'] ?? ''));
        if ($language !== '') {
            $parts[] = 'in ' . $language;
        }

        $name = trim((string) ($analysis['name'] ?? ''));
        if ($name !== '') {
            $parts[] = 'called ' . $name;
        }

        $rebuilt = trim(implode(' ', $parts));

        return $rebuilt !== 'create template' ? $rebuilt : 'create template';
    }

    private function buildAnalyzedCampaignCommand(array $analysis, string $fallback): string
    {
        $name = trim((string) ($analysis['name'] ?? ''));

        return $name !== '' ? "create a campaign called {$name}" : 'create a campaign';
    }

    private function handleSmartCreationHelpIntent(Request $request, string $command, string $normalized, array $page): ?array
    {
        $asksForGuidedHelp = $this->containsIntent($normalized, [
            'help me create',
            'help me to create',
            'guide me',
            'how do i create',
            'how to create',
            'how should i create',
            'how do i make',
            'how can i create',
            'how can i make',
            'how should i make',
            'create template',
            'make template',
        ]);

        $asksToCreate = $this->containsIntent($normalized, [
            'create',
            'make',
            'start',
            'build',
            'setup',
            'set up',
        ]);

        if ($this->containsIntent($normalized, ['campaign', 'campaigns']) && ($asksForGuidedHelp || $asksToCreate)) {
            if ($asksForGuidedHelp) {
                return [
                    'message' => 'To create a campaign, start with the campaign name, then choose the audience or filters, select the template or message content, and review the schedule before launching. If you want, I can create the draft for you right now. Just tell me the campaign name, for example: create a campaign called spring_sale.',
                    'suggestions' => [
                        'Create a campaign called spring_sale',
                        'Create a campaign called launch_sequence',
                        'Search campaigns for welcome',
                    ],
                    'assistant_state' => $this->buildTaskAssistantState('create_campaign', 'campaigns', [], ['name']),
                ];
            }

            $name = $this->extractNamedValue($command);

            if ($name) {
                return $this->handleCampaignIntent($request, $command, $normalized);
            }

            return [
                'message' => 'I can create the campaign for you. I need the campaign name first. Example: create a campaign called spring_sale.',
                'suggestions' => [
                    'Create a campaign called spring_sale',
                    'Create a campaign called launch_sequence',
                ],
                'assistant_state' => $this->buildTaskAssistantState('create_campaign', 'campaigns', [], ['name']),
            ];
        }

        if ((!$asksForGuidedHelp && !$asksToCreate) || !$this->containsIntent($normalized, ['template', 'templates'])) {
            return null;
        }

        $user = $request->user();
        $accounts = Account::query()
            ->where('user_id', $user->id)
            ->select('id', 'company_name', 'service')
            ->orderBy('company_name')
            ->get();

        if ($accounts->isEmpty()) {
            return [
                'message' => 'I can help you create a template, but there are no connected accounts yet. Connect an account first, then I can guide you or create the draft for you.',
                'action' => [
                    'type' => 'visit',
                    'url' => $this->appRoute('account_templates'),
                ],
            ];
        }

        $account = $this->resolveAccountFromCommand($accounts, $normalized);
        if (!$account && $accounts->count() === 1) {
            $account = $accounts->first();
        }

        $category = $this->extractTemplateCategory($normalized);
        $languages = $this->extractLanguages($normalized);

        if ($account && $category && !empty($languages)) {
            return $this->handleTemplateIntent($request, $command, $normalized);
        }

        if (!$account && $accounts->count() > 1) {
            $accountList = $accounts
                ->take(4)
                ->map(fn ($item) => "{$item->company_name} ({$item->service})")
                ->implode(', ');

            return [
                'message' => "I can create the template for you. First tell me which account to use, then the category and language. Available accounts: {$accountList}. Example: create a marketing template for {$accounts->first()->company_name} in English.",
                'suggestions' => $accounts
                    ->take(3)
                    ->map(fn ($item) => "Create a marketing template for {$item->company_name} in English")
                    ->values()
                    ->all(),
                'assistant_state' => $this->buildTaskAssistantState('create_template', 'templates'),
            ];
        }

        $accountLabel = $account?->company_name ?? 'your account';
        $missing = [];
        if (!$account) {
            $missing[] = 'account';
        }
        if (!$category) {
            $missing[] = 'category';
        }
        if (empty($languages)) {
            $missing[] = 'language';
        }

        return [
            'message' => 'I can help you create the template directly. I still need ' . implode(', ', $missing) . " for {$accountLabel}. Example: create a marketing template" . ($account ? '' : ' for Acme') . ' in English.',
            'suggestions' => array_values(array_filter([
                $account ? "Create a marketing template for {$account->company_name} in English" : 'Create a marketing template for Acme in English',
                $account ? "Create an authentication template for {$account->company_name} in Italian" : 'Create an authentication template for Acme in Italian',
                'How do template categories work?',
            ])),
            'assistant_state' => $this->buildTaskAssistantState(
                'create_template',
                'templates',
                array_filter([
                    'account_id' => $account?->id,
                    'account_name' => $account?->company_name,
                ], fn ($value) => $value !== null && $value !== ''),
                $missing,
                [
                    'account_id' => $account?->id,
                    'account_name' => $account?->company_name,
                ]
            ),
        ];
    }

    private function handleStructuredModuleIntent(Request $request, string $command, string $normalized, array $page): ?array
    {
        $module = $this->inferActionableModule($normalized, $page);
        if (!$module) {
            return null;
        }

        $asksHowTo = $this->containsIntent($normalized, [
            'how to',
            'how do i',
            'how can i',
            'help me',
            'guide me',
            'steps',
        ]);

        if ($asksHowTo) {
            return $this->buildModuleWorkflowResponse($module);
        }

        if (in_array($module, ['billing', 'wallet'], true)) {
            return $this->handleBillingActionIntent($request, $command, $normalized);
        }

        if ($this->containsIntent($normalized, ['delete', 'remove'])) {
            return $this->handleDeleteRecordIntent($request, $command, $normalized, $module);
        }

        if ($this->containsIntent($normalized, ['update', 'edit', 'change', 'rename', 'set'])) {
            return $this->handleUpdateRecordIntent($request, $command, $normalized, $module);
        }

        if ($this->containsIntent($normalized, ['create', 'make', 'add', 'new', 'build', 'setup', 'set up'])) {
            return match ($module) {
                'contact' => $this->handleContactCreateIntent($request, $command, $normalized),
                'lead' => $this->handleLeadCreateIntent($request, $command, $normalized),
                'product' => $this->handleProductCreateIntent($request, $command, $normalized),
                'order' => $this->handleOrderCreateIntent($request, $command, $normalized),
                'automation' => $this->handleAutomationCreateIntent($request, $command, $normalized),
                'interactive message' => $this->handleInteractiveMessageCreateIntent($request, $command, $normalized),
                'role' => $this->handleRoleCreateIntent($request, $command, $normalized),
                'api' => $this->handleApiCreateIntent($request, $command, $normalized),
                'support request' => $this->handleSupportRequestCreateIntent($request, $command, $normalized),
                default => null,
            };
        }

        return null;
    }

    private function handleCurrentTemplateEditorIntent(Request $request, string $command, string $normalized, ?array $assistantState, array $page): ?array
    {
        $context = $this->resolveCurrentTemplateEditorContext($page);
        if (!$context) {
            return null;
        }

        if (($assistantState['intent'] ?? null) === 'edit_template_content') {
            return $this->continueTemplateEditorIntent($request, $command, $normalized, $assistantState, $context);
        }

        $isTemplateEditorRequest =
            $this->containsIntent($normalized, ['template', 'header', 'body', 'footer', 'button', 'send for review', 'submit']) ||
            $this->containsIntent($normalized, ['this template', 'current template']);

        if (!$isTemplateEditorRequest) {
            return null;
        }

        if ($this->containsIntent($normalized, ['send for review', 'submit this template', 'submit template', 'review this template'])) {
            return $this->submitCurrentTemplateEditor($request, $context);
        }

        $update = $this->extractTemplateEditorUpdate($command, $normalized);
        if ($update['has_changes'] ?? false) {
            return $this->applyTemplateEditorUpdate($context, $update);
        }

        if ($this->containsIntent($normalized, ['help me', 'guide me', 'how do i', 'how can i', 'how should i', 'create this template'])) {
            return [
                'message' => 'On this template page I can fill the header type, header text, body, footer, add buttons, and submit it for review. For example: set header type to text, set body to hello {{1}}, set footer to Reply STOP, add a quick reply button called Yes.',
                'suggestions' => [
                    'Set header type to text',
                    'Set body to hello {{1}}',
                    'Add a quick reply button called Yes',
                    'Submit this template',
                ],
            ];
        }

        return null;
    }

    private function continueTemplateEditorIntent(Request $request, string $command, string $normalized, array $assistantState, array $context): array
    {
        if ($this->containsIntent($normalized, ['submit', 'send for review'])) {
            return $this->submitCurrentTemplateEditor($request, $context);
        }

        $update = $this->extractTemplateEditorUpdate($command, $normalized);
        $pending = $assistantState['pending'] ?? [];

        if (isset($pending['button']) && !isset($update['button'])) {
            $button = $pending['button'];
            $text = $button['button_text'] ?? '';

            if ($text === '') {
                $button['button_text'] = trim($command);
            } elseif (($button['action'] ?? '') === 'call_phone_number' && ($button['phone_number'] ?? '') === '') {
                $button['phone_number'] = trim($command);
            } elseif (($button['action'] ?? '') === 'visit_website' && ($button['url'] ?? '') === '') {
                $button['url'] = trim($command);
            }

            $update['button'] = $button;
            $update['has_changes'] = true;
        }

        if ($update['has_changes'] ?? false) {
            return $this->applyTemplateEditorUpdate($context, $update);
        }

        return [
            'message' => 'Tell me what to set on this template, for example: set body to hello {{1}}, set footer to Reply STOP, add a quick reply button called Yes, or submit this template.',
            'assistant_state' => [
                'intent' => 'edit_template_content',
                'template_id' => $context['template_id'],
                'account_id' => $context['account_id'],
            ],
        ];
    }

    private function resolveCurrentTemplateEditorContext(array $page): ?array
    {
        $component = (string) ($page['component'] ?? '');
        $props = is_array($page['props'] ?? null) ? $page['props'] : [];
        $template = is_array($props['template'] ?? null) ? $props['template'] : null;

        if (!$template) {
            return null;
        }

        if (!Str::contains(Str::lower($component), 'template')) {
            return null;
        }

        $accountId = (int) ($template['account_id'] ?? 0);
        $templateId = (int) ($template['id'] ?? 0);
        if ($accountId <= 0 || $templateId <= 0) {
            return null;
        }

        $language = $this->extractTemplateEditorLanguage($page, $props, $template);

        return [
            'account_id' => $accountId,
            'template_id' => $templateId,
            'language' => $language,
        ];
    }

    private function extractTemplateEditorLanguage(array $page, array $props, array $template): string
    {
        $url = (string) ($page['url'] ?? '');
        if ($url !== '') {
            $query = parse_url($url, PHP_URL_QUERY);
            if (is_string($query)) {
                parse_str($query, $params);
                $language = trim((string) ($params['language'] ?? ''));
                if ($language !== '') {
                    return $language;
                }
            }
        }

        $languages = $template['languages'] ?? ($props['languages'] ?? []);
        if (is_array($languages) && isset($languages[0])) {
            return (string) $languages[0];
        }

        return 'english';
    }

    private function extractTemplateEditorUpdate(string $command, string $normalized): array
    {
        $update = ['has_changes' => false];

        if ($headerType = $this->extractTemplateEditorHeaderType($normalized)) {
            $update['header_type'] = $headerType;
            $update['has_changes'] = true;
        }

        if (preg_match('/header text to\s+(.+)$/i', $command, $matches) === 1) {
            $update['header_text'] = trim($matches[1], " \t\n\r\0\x0B\"'");
            $update['has_changes'] = true;
        } elseif (preg_match('/set header to\s+(.+)$/i', $command, $matches) === 1) {
            $update['header_text'] = trim($matches[1], " \t\n\r\0\x0B\"'");
            $update['header_type'] = $update['header_type'] ?? 'text';
            $update['has_changes'] = true;
        }

        if (preg_match('/body to\s+(.+)$/i', $command, $matches) === 1) {
            $update['body'] = trim($matches[1], " \t\n\r\0\x0B\"'");
            $update['has_changes'] = true;
        }

        if (preg_match('/footer to\s+(.+)$/i', $command, $matches) === 1) {
            $update['body_footer'] = trim($matches[1], " \t\n\r\0\x0B\"'");
            $update['has_changes'] = true;
        }

        if ($button = $this->extractTemplateEditorButton($command, $normalized)) {
            $update['button'] = $button;
            $update['has_changes'] = true;
        }

        return $update;
    }

    private function extractTemplateEditorHeaderType(string $normalized): ?string
    {
        foreach (['text', 'image', 'document', 'video'] as $type) {
            if ($this->containsIntent($normalized, ["header type {$type}", "header {$type}", "set header type to {$type}"])) {
                return $type;
            }
        }

        return null;
    }

    private function extractTemplateEditorButton(string $command, string $normalized): ?array
    {
        if (!$this->containsIntent($normalized, ['add button', 'add a button', 'add quick reply', 'add call button', 'add website button'])) {
            return null;
        }

        $button = [
            'button_type' => '',
            'button_text' => '',
            'action' => '',
            'phone_number' => '',
            'url' => '',
            'url_type' => '',
        ];

        if ($this->containsIntent($normalized, ['quick reply'])) {
            $button['button_type'] = 'Quick Reply';
        } else {
            $button['button_type'] = 'Call to Action';
        }

        if ($this->containsIntent($normalized, ['phone', 'call'])) {
            $button['action'] = 'call_phone_number';
        }

        if ($this->containsIntent($normalized, ['website', 'url', 'link'])) {
            $button['action'] = 'visit_website';
            $button['url_type'] = 'static';
        }

        if (preg_match('/called\s+(.+?)(?:\s+with|\s*$)/i', $command, $matches) === 1) {
            $button['button_text'] = trim($matches[1], " \t\n\r\0\x0B\"'");
        }

        if (preg_match('/phone\s+(\+?[0-9][0-9\s-]{5,})/i', $command, $matches) === 1) {
            $button['phone_number'] = preg_replace('/\s+|-/', '', trim($matches[1]));
        }

        if (preg_match('/(https?:\/\/\S+)/i', $command, $matches) === 1) {
            $button['url'] = trim($matches[1]);
        }

        if ($button['button_type'] === 'Call to Action' && $button['action'] === '') {
            return [
                'button_type' => 'Call to Action',
                'button_text' => $button['button_text'],
                'action' => '',
                'phone_number' => '',
                'url' => '',
                'url_type' => '',
            ];
        }

        return $button;
    }

    private function applyTemplateEditorUpdate(array $context, array $update): array
    {
        $template = Template::where('account_id', $context['account_id'])
            ->where('id', $context['template_id'])
            ->first();

        if (!$template) {
            return ['message' => 'I could not find the current template.'];
        }

        $message = Message::where('template_id', $context['template_id'])
            ->where('language', $context['language'])
            ->first();

        if (!$message) {
            $message = new Message();
            $message->template_id = $context['template_id'];
            $message->language = $context['language'];
            $message->example = base64_encode(serialize([]));
        }

        if (isset($update['header_type'])) {
            if (in_array($update['header_type'], ['image', 'document', 'video'], true)) {
                return [
                    'message' => 'I can switch the header to media, but I still need you to upload the file manually on this page. If you want full automatic completion, use a text header.',
                    'suggestions' => [
                        'Set header type to text',
                        'Set header text to Welcome',
                    ],
                ];
            }

            $message->header_type = $update['header_type'];
        }

        if (isset($update['header_text'])) {
            $message->header_type = $message->header_type ?: 'text';
            $message->header_content = $update['header_text'];
        }

        if (isset($update['body'])) {
            $message->body = $update['body'];
        }

        if (isset($update['body_footer'])) {
            $message->footer_content = $update['body_footer'];
        }

        $message->attach_file = $message->attach_file ?? '';
        $message->save();

        if (isset($update['button'])) {
            $button = $update['button'];
            $missing = [];

            if (($button['button_type'] ?? '') === 'Quick Reply' && ($button['button_text'] ?? '') === '') {
                $missing[] = 'button text';
            }

            if (($button['button_type'] ?? '') === 'Call to Action') {
                if (($button['action'] ?? '') === '') {
                    $missing[] = 'action type';
                } elseif (($button['action'] ?? '') === 'call_phone_number' && ($button['phone_number'] ?? '') === '') {
                    $missing[] = 'phone number';
                } elseif (($button['action'] ?? '') === 'visit_website' && ($button['url'] ?? '') === '') {
                    $missing[] = 'url';
                }
            }

            if ($missing !== []) {
                return [
                    'message' => 'I can add that button, but I still need ' . implode(', ', $missing) . '.',
                    'assistant_state' => [
                        'intent' => 'edit_template_content',
                        'template_id' => $context['template_id'],
                        'account_id' => $context['account_id'],
                        'pending' => ['button' => $button],
                    ],
                    'suggestions' => [
                        'called Yes',
                        'phone +391234567890',
                        'https://example.com',
                    ],
                ];
            }

            $buttonModel = new MessageButton();
            $buttonModel->message_id = $message->id;
            $buttonModel->button_type = $button['button_type'];
            $buttonModel->body = $button['button_text'];
            $buttonModel->action = $button['button_type'] === 'Call to Action' ? ($button['action'] ?? '') : '';
            $buttonModel->phone_number = $button['action'] === 'call_phone_number' ? ($button['phone_number'] ?? '') : '';
            $buttonModel->url_type = $button['action'] === 'visit_website' ? ($button['url_type'] ?? 'static') : '';
            $buttonModel->url = $button['action'] === 'visit_website' ? ($button['url'] ?? '') : '';
            $buttonModel->save();
        }

        return [
            'message' => 'I updated this template draft. If you want, I can keep filling it or submit it for review.',
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('template_detail_view', [$context['account_id'], $context['template_id']]) . '?language=' . urlencode($context['language']),
            ],
            'suggestions' => [
                'Set body to hello {{1}}',
                'Set footer to Reply STOP',
                'Add a quick reply button called Yes',
                'Submit this template',
            ],
            'assistant_state' => null,
        ];
    }

    private function submitCurrentTemplateEditor(Request $request, array $context): array
    {
        $message = Message::where('template_id', $context['template_id'])
            ->where('language', $context['language'])
            ->first();

        if (!$message) {
            return [
                'message' => 'I cannot submit this template yet because the content is still empty. Start by setting the header type, body, and footer.',
                'suggestions' => [
                    'Set header type to text',
                    'Set body to hello {{1}}',
                    'Set footer to Reply STOP',
                ],
            ];
        }

        $headerType = trim((string) ($message->header_type ?? ''));
        $body = trim((string) ($message->body ?? ''));
        $footer = trim((string) ($message->footer_content ?? ''));

        $missing = [];
        if ($headerType === '') {
            $missing[] = 'header type';
        }
        if ($body === '') {
            $missing[] = 'body';
        }
        if ($footer === '') {
            $missing[] = 'footer';
        }
        if ($headerType === 'text' && trim((string) ($message->header_content ?? '')) === '') {
            $missing[] = 'header text';
        }
        if (in_array($headerType, ['image', 'document', 'video'], true) && trim((string) ($message->attach_file ?? '')) === '') {
            $missing[] = 'attachment file';
        }

        if ($missing !== []) {
            return [
                'message' => 'I cannot submit this template yet. I still need ' . implode(', ', $missing) . '.',
                'suggestions' => [
                    'Set header type to text',
                    'Set header text to Welcome',
                    'Set body to hello {{1}}',
                    'Set footer to Reply STOP',
                ],
            ];
        }

        $buttons = MessageButton::where('message_id', $message->id)->get()->map(function ($button) {
            return [
                'id' => $button->id,
                'button_type' => $button->button_type,
                'button_text' => $button->body,
                'action' => $button->action,
                'phone_number' => $button->phone_number,
                'url' => $button->url,
                'url_type' => $button->url_type,
            ];
        })->values()->all();

        $payload = [
            'language' => $context['language'],
            'header_type' => $headerType,
            'header_text' => $message->header_content ?? '',
            'body' => $body,
            'body_footer' => $footer,
            'buttons' => $buttons,
            'sample_value' => $message->example ? @unserialize(base64_decode((string) $message->example, true) ?: '') : [],
            'example' => '',
        ];

        $response = (new UserController())->storeTemplate(
            $this->buildAssistantRequest($request, $payload),
            $context['account_id'],
            $context['template_id']
        );

        if (method_exists($response, 'getSession')) {
            // no-op
        }

        return [
            'message' => 'I submitted this template for review.',
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('template_detail_view', [$context['account_id'], $context['template_id']]) . '?language=' . urlencode($context['language']),
            ],
            'assistant_state' => null,
        ];
    }

    private function handleHelpIntent(string $normalized, array $page): ?array
    {
        if (
            !$this->containsIntent($normalized, ['help', 'what can you do', 'how can you help', 'what can i do']) &&
            !$this->containsIntent($normalized, ['what is this page', 'explain this page'])
        ) {
            return null;
        }

        $pageTitle = $page['title'] ?? null;
        $pageContext = $pageTitle
            ? "You are on {$pageTitle}. "
            : '';

        return [
            'message' => $pageContext . 'I can work from the current page: answer questions about visible data, explain workflows, continue unfinished tasks, search records, and open safe create, list, detail, and edit flows across the dashboard.',
            'response_intent' => 'help',
            'suggestions' => [
                'What is on this page?',
                'How do I create a template?',
                'Open this page list',
                'How many items are on this page?',
            ],
        ];
    }

    private function handleWorkflowGuidanceIntent(string $normalized, array $page): ?array
    {
        if ($this->containsIntent($normalized, ['open', 'go to', 'take me to', 'show me', 'visit'])) {
            return null;
        }

        $asksHowTo = $this->containsIntent($normalized, [
            'how to',
            'how do i',
            'how can i',
            'steps to',
            'guide me',
            'help me create',
            'what can i do here',
            'how does this work',
        ]);

        if (!$asksHowTo && !$this->containsIntent($normalized, ['create template', 'create campaign', 'dashboard'])) {
            return null;
        }

        if ($this->containsIntent($normalized, ['template', 'templates'])) {
            return [
                'message' => 'To create a template, choose the WhatsApp account first, then define the category like marketing, utility, or authentication, add at least one language, and finish the content sections before submitting. I can create the draft for you when you specify the account, category, and language, for example: create a marketing template for Acme in English.',
                'response_intent' => 'workflow_help',
                'suggestions' => [
                    'Open templates',
                    'Create a marketing template in English',
                    'What is on this page?',
                ],
            ];
        }

        if ($this->containsIntent($normalized, ['campaign', 'campaigns'])) {
            return [
                'message' => 'To create a campaign, start with the campaign name, then define the audience or filters, choose the message or template content, and review the schedule before launching. I can create a draft campaign immediately if you give me a name, for example: create a campaign called spring_sale.',
                'response_intent' => 'workflow_help',
                'suggestions' => [
                    'Open campaigns',
                    'Create a campaign called spring_sale',
                    'Search campaigns for welcome',
                ],
            ];
        }

        if ($this->containsIntent($normalized, ['contact', 'contacts'])) {
            return [
                'message' => 'To create a contact, give me at least a name. Email and phone are optional. I can create it directly, for example: create a contact John Doe with email john@example.com and phone +39 333 123 4567.',
                'response_intent' => 'workflow_help',
                'suggestions' => [
                    'Create a contact John Doe',
                    'Create a contact John Doe with email john@example.com',
                    'Search contacts for John',
                ],
            ];
        }

        if ($this->containsIntent($normalized, ['lead', 'leads'])) {
            return [
                'message' => 'To create a lead, I need at least the lead name. I can also update or convert an existing lead if you give me the lead ID. Example: create a lead Acme Renewal.',
                'response_intent' => 'workflow_help',
                'suggestions' => [
                    'Create a lead Acme Renewal',
                    'Update lead 3 status to Qualified',
                    'Open leads',
                ],
            ];
        }

        if ($this->containsIntent($normalized, ['dashboard'])) {
            return [
                'message' => 'On the dashboard I can explain KPIs, answer questions about balances, sessions, campaigns, templates, messages, and summarize the data currently shown on screen. You can ask things like "what is on this page", "how many campaigns do I have", or "open billing".',
                'response_intent' => 'workflow_help',
                'suggestions' => [
                    'What is on this page?',
                    'How many campaigns do I have?',
                    'Open billing',
                ],
            ];
        }

        $pageTitle = $page['title'] ?? 'this page';
        $pageComponent = (string) ($page['component'] ?? '');

        if ($pageComponent !== '' || $pageTitle !== 'this page') {
            return [
                'message' => $this->describePage($pageTitle, $pageComponent),
                'response_intent' => 'workflow_help',
                'suggestions' => [
                    'What is on this page?',
                    'Open dashboard',
                    'Search dashboard data',
                ],
            ];
        }

        return null;
    }

    private function handleCampaignIntent(Request $request, string $command, string $normalized): ?array
    {
        if (
            !$this->containsIntent($normalized, ['campaign']) ||
            !$this->containsIntent($normalized, ['create', 'make', 'start', 'build', 'setup', 'set up'])
        ) {
            return null;
        }

        $name = $this->extractNamedValue($command);
        $validation = $this->validateManifestExecution('campaigns', 'create_campaign', ['name' => trim((string) $name)]);
        if (!$validation['ok']) {
            return array_merge(
                $this->buildExecutionFailureResponse(
                    'create_campaign',
                    'campaigns',
                    ['name' => trim((string) $name)],
                    $validation,
                    'I can create the campaign for you, but I still need the campaign name. Example: create a campaign called spring_sale.',
                    [
                        'Create a campaign called spring_sale',
                        'Create a campaign called follow_up_sequence',
                    ]
                ),
                ['response_intent' => 'create_campaign']
            );
        }

        $companyId = Cache::get('selected_company_' . $request->user()->id) ?: Company::query()->value('id') ?: 1;

        $campaign = Campaign::create([
            'name' => $this->normalizeSlugLikeName($name),
            'status' => 'draft',
            'company_id' => $companyId,
            'current_page' => 1,
            'offset' => 0,
        ]);

        return [
            'message' => "I created a draft campaign named {$campaign->name}. I'm opening it now so you can finish the audience, content, and schedule.",
            'response_intent' => 'create_campaign',
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('detailCampaign', ['id' => $campaign->id]),
            ],
            'suggestions' => [
                'Search campaigns for ' . $campaign->name,
                'Open dashboard',
            ],
        ];
    }

    private function handleTemplateIntent(Request $request, string $command, string $normalized): ?array
    {
        if (
            !$this->containsIntent($normalized, ['template']) ||
            !$this->containsIntent($normalized, ['create', 'make', 'start', 'build', 'setup', 'set up'])
        ) {
            return null;
        }

        $user = $request->user();
        $accounts = Account::query()
            ->where('user_id', $user->id)
            ->select('id', 'company_name', 'service', 'user_id')
            ->orderBy('company_name')
            ->get();

        if ($accounts->isEmpty()) {
            return [
                'message' => 'I cannot create a template yet because there are no connected accounts for this user. Open Templates after connecting an account first.',
                'response_intent' => 'create_template',
                'action' => [
                    'type' => 'visit',
                    'url' => $this->appRoute('account_templates'),
                ],
            ];
        }

        $accountResolution = $this->templateAccountResolver()->resolve($user, [
            'account_name' => $command,
        ], $accounts);
        $account = $accountResolution['account'];

        if (!$accountResolution['ok'] && ($accountResolution['missing_fields'] ?? []) !== []) {
            $accountList = $accounts
                ->take(4)
                ->map(fn ($item) => "{$item->company_name} ({$item->service})")
                ->implode(', ');

            return [
                'message' => "I found multiple accounts. Tell me which one to use, for example: create a marketing template for {$accounts->first()->company_name} in English. Available accounts: {$accountList}.",
                'response_intent' => 'create_template',
                'suggestions' => $accounts
                    ->take(3)
                    ->map(fn ($item) => "Create a marketing template for {$item->company_name} in English")
                    ->values()
                    ->all(),
                'assistant_state' => [
                    'intent' => 'create_template',
                ],
            ];
        }

        if (!$accountResolution['ok']) {
            return array_merge(
                $this->buildExecutionFailureResponse(
                    'create_template',
                    'templates',
                    [],
                    [
                        'error_code' => $accountResolution['error_code'],
                        'missing_fields' => $accountResolution['missing_fields'] ?? [],
                        'validation_errors' => $accountResolution['validation_errors'] ?? [],
                        'confirmation_required' => false,
                    ],
                    (string) $accountResolution['message']
                ),
                ['response_intent' => 'create_template']
            );
        }

        $authorization = $this->actionAuthorizer()->authorize($user, 'create_template', 'templates', null, ['account' => $account]);
        if (!$authorization['ok']) {
            return array_merge(
                $this->buildExecutionFailureResponse(
                    'create_template',
                    'templates',
                    ['account_id' => $account?->id],
                    $authorization,
                    $authorization['message']
                ),
                ['response_intent' => 'create_template']
            );
        }

        $category = $this->extractTemplateCategory($normalized);
        $languages = $this->extractLanguages($normalized);
        $templateFields = [
            'account_id' => $account?->id,
            'category' => $category ? Str::lower($category) : '',
            'language' => $languages[0] ?? '',
            'name' => trim((string) ($this->extractNamedValue($command) ?: '')),
        ];
        $validation = $this->validateManifestExecution('templates', 'create_template', $templateFields);

        if (!$validation['ok']) {
            return array_merge(
                $this->buildExecutionFailureResponse(
                    'create_template',
                    'templates',
                    array_filter([
                        'account_id' => $account?->id,
                        'account_name' => $account?->company_name,
                        'category' => $category,
                        'language' => $languages[0] ?? null,
                        'name' => $templateFields['name'],
                    ], fn ($value) => $value !== null && $value !== ''),
                    $validation,
                    "I can create the template directly for {$account->company_name}, but I still need " . implode(', ', $validation['missing_fields']) . ". Try: create a marketing template for {$account->company_name} in English.",
                    [
                        "Create a marketing template for {$account->company_name} in English",
                        "Create an authentication template for {$account->company_name} in Italian",
                    ],
                    [
                        'account_id' => $account->id,
                        'account_name' => $account->company_name,
                    ]
                ),
                ['response_intent' => 'create_template']
            );
        }

        $companyId = Cache::get('selected_company_' . $user->id) ?: Company::query()->value('id');
        $templatePayload = $this->persistenceMapper()->mapCreatePayload('templates', [
            'account_id' => $account->id,
            'category' => Str::lower($category ?? ''),
            'language' => $languages[0] ?? '',
            'name' => $this->extractNamedValue($command) ?: '',
        ]);
        $template = new Template();
        $template->name = $templatePayload['name'];
        $template->category = $templatePayload['category'];
        $template->languages = $templatePayload['languages'];
        $template->status = 'draft';
        $template->company_id = $companyId;
        $template->account_id = $templatePayload['account_id'];
        $template->created_by = $user->id;
        $template->save();

        return [
            'message' => "I created the draft template {$template->name} for {$account->company_name}. I'm opening it now so you can finish the content and submit it.",
            'response_intent' => 'create_template',
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('template_detail_view', [$account->id, $template->id]),
            ],
            'suggestions' => [
                'Open templates',
                'Create a campaign called launch_sequence',
            ],
            'assistant_state' => null,
        ];
    }

    private function handleSearchIntent(Request $request, string $command, string $normalized): ?array
    {
        if (!$this->containsIntent($normalized, ['search', 'find', 'look up', 'lookup'])) {
            return null;
        }

        $query = $this->extractSearchQuery($command, $normalized);
        $accounts = Account::query()
            ->where('user_id', $request->user()->id)
            ->select('id', 'company_name', 'service')
            ->orderBy('company_name')
            ->get();

        if ($this->containsIntent($normalized, ['campaign'])) {
            return [
                'message' => $query
                    ? "I'm opening campaigns filtered for {$query}."
                    : 'I\'m opening campaigns.',
                'response_intent' => 'search',
                'action' => [
                    'type' => 'visit',
                    'url' => $this->appRoute('listCampaign', array_filter([
                        'search' => $query ?: null,
                    ])),
                ],
            ];
        }

        if ($this->containsIntent($normalized, ['contact'])) {
            return [
                'message' => $query
                    ? "I'm opening contacts filtered for {$query}."
                    : 'I\'m opening contacts.',
                'response_intent' => 'search',
                'action' => [
                    'type' => 'visit',
                    'url' => $this->appRoute('listContact', array_filter([
                        'search' => $query ?: null,
                    ])),
                ],
            ];
        }

        if ($this->containsIntent($normalized, ['lead'])) {
            return [
                'message' => $query
                    ? "I'm opening leads filtered for {$query}."
                    : 'I\'m opening leads.',
                'response_intent' => 'search',
                'action' => [
                    'type' => 'visit',
                    'url' => $this->appRoute('listLead', array_filter([
                        'search' => $query ?: null,
                    ])),
                ],
            ];
        }

        if ($this->containsIntent($normalized, ['message log', 'message logs', 'logs'])) {
            return [
                'message' => $query
                    ? "I'm opening message logs filtered for {$query}."
                    : 'I\'m opening message logs.',
                'response_intent' => 'search',
                'action' => [
                    'type' => 'visit',
                    'url' => $this->appRoute('listMessageLogs', array_filter([
                        'search' => $query ?: null,
                    ])),
                ],
            ];
        }

        if ($this->containsIntent($normalized, ['template'])) {
            $account = $this->resolveAccountFromCommand($accounts, $normalized);
            if (!$account && $accounts->count() === 1) {
                $account = $accounts->first();
            }

            return [
                'message' => $account
                    ? ($query
                        ? "I'm opening templates for {$account->company_name} and pre-filling the template search with {$query}."
                        : "I'm opening templates for {$account->company_name}.")
                    : 'I\'m opening templates. Select an account to see template results.',
                'response_intent' => 'search',
                'action' => [
                    'type' => 'visit',
                    'url' => $this->appRoute('account_templates', array_filter([
                        'account_id' => $account?->id,
                        'assistant_search' => $query ?: null,
                    ])),
                ],
            ];
        }

        return [
            'message' => 'Tell me what to search, for example "search campaigns for launch", "search contacts for mario", or "search templates for welcome".',
            'response_intent' => 'search',
            'suggestions' => [
                'Search campaigns for welcome',
                'Search contacts for mario',
                'Search templates for promo',
            ],
        ];
    }

    private function handleNavigationIntent(string $normalized): ?array
    {
        $map = [
            'api documentation page' => ['API Documentation', $this->appRoute('api_documentation')],
            'api documentation tab' => ['API Documentation', $this->appRoute('api_documentation')],
            'api documentation' => ['API Documentation', $this->appRoute('api_documentation')],
            'roles and permissions' => ['Roles', $this->appRoute('listRole')],
            'workspace settings tab' => ['Workspace Settings', $this->appRoute('wallet_subscription')],
            'social profiles' => ['Accounts', $this->appRoute('social_profile')],
            'social profile' => ['Accounts', $this->appRoute('social_profile')],
            'interactive messages' => ['Interactive Messages', $this->appRoute('listInteractiveMessage')],
            'interactive message' => ['Interactive Messages', $this->appRoute('listInteractiveMessage')],
            'message logs' => ['Message Logs', $this->appRoute('listMessageLogs')],
            'message log' => ['Message Logs', $this->appRoute('listMessageLogs')],
            'settings page' => ['Settings', $this->appRoute('wallet_subscription')],
            'settings tab' => ['Settings', $this->appRoute('wallet_subscription')],
            'billing page' => ['Billing', $this->appRoute('wallet')],
            'billing tab' => ['Billing', $this->appRoute('wallet')],
            'roles page' => ['Roles', $this->appRoute('listRole')],
            'roles tab' => ['Roles', $this->appRoute('listRole')],
            'role permissions' => ['Roles', $this->appRoute('listRole')],
            'api keys' => ['API Keys', $this->appRoute('listApi')],
            'api key' => ['API Keys', $this->appRoute('listApi')],
            'workspace settings' => ['Workspace Settings', $this->appRoute('wallet_subscription')],
            'subscription settings' => ['Workspace Settings', $this->appRoute('wallet_subscription')],
            'dashboard' => ['Dashboard', $this->appRoute('dashboard')],
            'conversations' => ['Chats', $this->appRoute('chat_list')],
            'conversation' => ['Chats', $this->appRoute('chat_list')],
            'chats' => ['Chats', $this->appRoute('chat_list')],
            'campaign' => ['Campaigns', $this->appRoute('listCampaign')],
            'campaigns' => ['Campaigns', $this->appRoute('listCampaign')],
            'template' => ['Templates', $this->appRoute('account_templates')],
            'templates' => ['Templates', $this->appRoute('account_templates')],
            'chat' => ['Chats', $this->appRoute('chat_list')],
            'automation' => ['Automations', $this->appRoute('listAutomation')],
            'billing' => ['Billing', $this->appRoute('wallet')],
            'reports' => ['Reports', $this->appRoute('listMessage')],
            'report' => ['Reports', $this->appRoute('listMessage')],
            'api docs' => ['API Documentation', $this->appRoute('api_documentation')],
            'api reference' => ['API Documentation', $this->appRoute('api_documentation')],
            'documentation' => ['API Documentation', $this->appRoute('api_documentation')],
            'message' => ['Messages', $this->appRoute('listMessage')],
            'messages' => ['Messages', $this->appRoute('listMessage')],
            'contact' => ['Contacts', $this->appRoute('listContact')],
            'lead' => ['Leads', $this->appRoute('listLead')],
            'wallet' => ['Billing', $this->appRoute('wallet')],
            'account' => ['Accounts', $this->appRoute('social_profile')],
            'catalog' => ['Catalogs', $this->appRoute('listCatalog')],
            'api' => ['API Keys', $this->appRoute('listApi')],
            'import' => ['Imports', $this->appRoute('listImport')],
            'tag' => ['Tags', $this->appRoute('listTag')],
            'group' => ['Groups', $this->appRoute('listGroup')],
            'organization' => ['Organizations', $this->appRoute('listOrganization')],
            'deal' => ['Deals', $this->appRoute('listOpportunity')],
            'opportunity' => ['Deals', $this->appRoute('listOpportunity')],
            'product' => ['Products', $this->appRoute('listProduct')],
            'order' => ['Orders', $this->appRoute('listOrder')],
            'roles' => ['Roles', $this->appRoute('listRole')],
            'role' => ['Roles', $this->appRoute('listRole')],
            'settings' => ['Settings', $this->appRoute('wallet_subscription')],
            'subscription' => ['Workspace Settings', $this->appRoute('wallet_subscription')],
        ];

        if (!$this->containsIntent($normalized, ['open', 'go to', 'take me to', 'show'])) {
            return null;
        }

        uksort($map, static fn (string $left, string $right) => strlen($right) <=> strlen($left));

        foreach ($map as $keyword => [$label, $url]) {
            if ($this->containsIntent($normalized, $keyword)) {
                return [
                    'message' => "I'm opening {$label}.",
                    'response_intent' => 'navigate',
                    'action' => [
                        'type' => 'visit',
                        'url' => $url,
                    ],
                ];
            }
        }

        return null;
    }

    private function handleDashboardQuestionIntent(Request $request, string $normalized, array $page): ?array
    {
        if ($response = $this->dataQueryService()->answer($normalized, $page, $request->user())) {
            return $response;
        }

        $user = $request->user();
        $companyId = Cache::get('selected_company_' . $user->id) ?: Company::query()->value('id');
        $pageProps = is_array($page['props'] ?? null) ? $page['props'] : [];

        if ($response = $this->handlePageDataQuestionIntent($normalized, $page, $pageProps)) {
            return $response;
        }

        if ($response = $this->handleGlobalDataQuestionIntent($request, $normalized, $page)) {
            return $response;
        }

        if ($this->containsIntent($normalized, ['spent this month', 'money spent', 'amount spent', 'how much spent', 'how much did i spend'])) {
            $spent = $this->resolveSpentThisMonth($pageProps);

            return [
                'message' => 'You spent ' . number_format($spent, 3, '.', '') . ' this month.',
                'suggestions' => [
                    'Open billing',
                    'What is on this page?',
                ],
            ];
        }

        if ($this->containsIntent($normalized, ['balance', 'wallet'])) {
            $balance = Wallet::query()
                ->where('user_id', $user->id)
                ->value('balance_amount');

            return [
                'message' => 'Your current wallet balance is ' . ($balance !== null ? number_format((float) $balance, 2) : '0.00') . '.',
                'suggestions' => [
                    'Open billing',
                    'What can you do on this page?',
                ],
            ];
        }

        if ($this->containsIntent($normalized, ['session', 'sessions', 'limit'])) {
            $used = $this->getSessionCount();
            $limit = (int) (Company::query()->value('amount_limit') ?? 0);

            return [
                'message' => "You have used {$used} sessions this month out of a limit of {$limit}.",
                'suggestions' => [
                    'Open dashboard',
                    'How many messages this month?',
                ],
            ];
        }

        if ($this->containsIntent($normalized, ['message', 'messages', 'conversation', 'conversations']) && $this->containsIntent($normalized, ['month', 'this month'])) {
            $count = Msg::query()
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();

            return [
                'message' => "This month there are {$count} messages recorded in the dashboard.",
                'suggestions' => [
                    'Open message logs',
                    'Search message logs for failed',
                ],
            ];
        }

        if ($this->containsIntent($normalized, ['how many campaigns', 'campaign count', 'campaigns do i have'])) {
            $count = Campaign::query()
                ->when($companyId, fn ($query) => $query->where('company_id', $companyId))
                ->count();

            return [
                'message' => "There are {$count} campaigns in the current workspace.",
                'suggestions' => [
                    'Open campaigns',
                    'Create a campaign called follow_up_sequence',
                ],
            ];
        }

        if ($this->containsIntent($normalized, ['how many templates', 'template count', 'templates do i have'])) {
            $count = Template::query()
                ->when($companyId, fn ($query) => $query->where('company_id', $companyId))
                ->count();

            return [
                'message' => "There are {$count} templates in the current workspace.",
                'suggestions' => [
                    'Open templates',
                    'Create a marketing template in English',
                ],
            ];
        }

        if ($this->containsIntent($normalized, ['how many accounts', 'social accounts', 'connected accounts'])) {
            $count = Account::query()
                ->where('user_id', $user->id)
                ->count();

            return [
                'message' => "You have {$count} connected account" . ($count === 1 ? '' : 's') . '.',
                'suggestions' => [
                    'Open templates',
                    'Open dashboard',
                ],
            ];
        }

        if ($this->containsIntent($normalized, ['how many contacts', 'contact count'])) {
            $count = Contact::query()->count();

            return [
                'message' => "There are {$count} contacts available in the dashboard data.",
                'suggestions' => [
                    'Open contacts',
                    'Search contacts for mario',
                ],
            ];
        }

        if ($this->containsIntent($normalized, ['this page', 'current page', 'page'])) {
            $pageTitle = $page['title'] ?? 'this area';
            $pageComponent = $page['component'] ?? '';

            return [
                'message' => $this->describePage($pageTitle, $pageComponent),
                'suggestions' => [
                    'What can you do on this page?',
                    'Open dashboard',
                ],
            ];
        }

        return null;
    }

    private function handlePageDataQuestionIntent(string $normalized, array $page, array $pageProps): ?array
    {
        if (empty($pageProps)) {
            return null;
        }

        $asksAboutPageData = $this->containsIntent($normalized, [
            'what is on this page',
            'what is on the page',
            'what data',
            'what information',
            'show the page data',
            'summarize this page',
            'summarise this page',
            'explain this page',
            'current page',
            'on this page',
            'available on the page',
        ]);

        if ($asksAboutPageData) {
            return [
                'message' => $this->summarizePageProps($page, $pageProps),
                'suggestions' => [
                    'What records are listed on this page?',
                    'How many items are on this page?',
                    'Open dashboard',
                ],
            ];
        }

        $temporalAnswer = $this->answerPageTemporalQuestion($normalized, $pageProps);
        if ($temporalAnswer) {
            return [
                'message' => $temporalAnswer,
                'suggestions' => [
                    'How many items are on this page?',
                    'What is on this page?',
                ],
            ];
        }

        if (preg_match('/\bhow many\b|\bcount\b|\btotal\b/', $normalized)) {
            $countAnswer = $this->answerPageCountQuestion($normalized, $pageProps);
            if ($countAnswer) {
                return [
                    'message' => $countAnswer,
                    'suggestions' => [
                        'What is on this page?',
                        'Search dashboard data',
                    ],
                ];
            }
        }

        $scalarAnswer = $this->answerPageScalarQuestion($normalized, $pageProps);
        if ($scalarAnswer) {
            return [
                'message' => $scalarAnswer,
                'suggestions' => [
                    'What is on this page?',
                    'How many items are on this page?',
                ],
            ];
        }

        if ($this->containsIntent($normalized, ['list', 'records', 'items', 'rows'])) {
            $recordAnswer = $this->answerPageRecordQuestion($normalized, $pageProps);
            if ($recordAnswer) {
                return [
                    'message' => $recordAnswer,
                    'suggestions' => [
                        'How many items are on this page?',
                        'What is on this page?',
                    ],
                ];
            }
        }

        return null;
    }

    private function extractNamedValue(string $command): ?string
    {
        $patterns = [
            '/(?:called|named|title(?:d)? as)\s+["\']?([^"\']+)["\']?$/i',
            '/(?:called|named|title(?:d)? as)\s+(.+)/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $command, $matches)) {
                return trim($matches[1]);
            }
        }

        return null;
    }

    private function normalizeSlugLikeName(string $value): string
    {
        $normalized = Str::of($value)
            ->lower()
            ->replaceMatches('/[^a-z0-9_\s-]/', '')
            ->replace([' ', '-'], '_')
            ->replaceMatches('/_+/', '_')
            ->trim('_')
            ->value();

        return $normalized !== '' ? $normalized : 'draft_' . now()->format('Ymd_His');
    }

    private function extractTemplateCategory(string $normalized): ?string
    {
        if ($this->containsIntent($normalized, 'authentication')) {
            return 'AUTHENTICATION';
        }

        if ($this->containsIntent($normalized, 'marketing')) {
            return 'MARKETING';
        }

        if ($this->containsIntent($normalized, 'utility')) {
            return 'UTILITY';
        }

        return null;
    }

    private function extractLanguages(string $normalized): array
    {
        $map = [
            'english' => 'en',
            'en ' => 'en',
            ' italian' => 'it',
            'italian' => 'it',
            'italiano' => 'it',
            'spanish' => 'es',
            'french' => 'fr',
            'german' => 'de',
            'portuguese' => 'pt',
        ];

        $languages = [];
        foreach ($map as $keyword => $code) {
            if ($this->containsIntent(' ' . $normalized . ' ', trim($keyword))) {
                $languages[] = $code;
            }
        }

        return array_values(array_unique($languages));
    }

    private function resolveAccountFromCommand($accounts, string $normalized): ?Account
    {
        if (preg_match('/\baccount\s+(\d+)\b/', $normalized, $matches)) {
            return $accounts->firstWhere('id', (int) $matches[1]);
        }

        foreach ($accounts as $account) {
            if (
                $this->containsIntent($normalized, Str::lower($account->company_name)) ||
                $this->containsIntent($normalized, Str::lower($account->service))
            ) {
                return $account;
            }
        }

        return null;
    }

    private function extractSearchQuery(string $command, string $normalized): ?string
    {
        $cleaned = preg_replace('/\b(search|find|look up|lookup|campaigns?|contacts?|templates?|message logs?|messages?|for|in|on|the)\b/i', ' ', $command);
        $cleaned = preg_replace('/\s+/', ' ', (string) $cleaned);
        $cleaned = trim($cleaned);

        return $cleaned !== '' ? $cleaned : null;
    }

    private function extractContactFields(string $command, string $normalized): array
    {
        $fields = [
            'first_name' => '',
            'last_name' => '',
            'email' => $this->extractEmail($command) ?? '',
            'phone_number' => $this->extractPhoneNumber($command) ?? '',
        ];

        $name = $this->extractNamedValue($command) ?: $this->extractResidualName($command, [
            'create', 'make', 'add', 'new', 'a', 'an', 'the', 'contact', 'contacts', 'with', 'email', 'phone', 'number', 'mobile',
        ]);

        if ($name !== null && $name !== '') {
            if ($this->isPlaceholderNameValue($name)) {
                return $fields;
            }

            $parts = preg_split('/\s+/', trim($name)) ?: [];
            if (count($parts) > 1) {
                $fields['first_name'] = array_shift($parts);
                $fields['last_name'] = implode(' ', $parts);
            } else {
                $fields['last_name'] = $parts[0] ?? '';
            }
        }

        return $fields;
    }

    private function extractLeadFields(string $command, string $normalized): array
    {
        $name = $this->extractNamedValue($command) ?: $this->extractResidualName($command, [
            'create', 'make', 'add', 'new', 'a', 'an', 'the', 'lead', 'leads', 'with', 'status',
        ]);

        $status = '';
        if (preg_match('/\bstatus\b\s+(?:to|as)?\s*(.+)$/i', $command, $matches)) {
            $status = trim($matches[1]);
        }

        return [
            'name' => trim((string) $name),
            'status' => $status,
        ];
    }

    private function extractProductFields(string $command): array
    {
        $name = $this->extractNamedValue($command) ?: $this->extractResidualName($command, [
            'create', 'make', 'add', 'new', 'a', 'an', 'the', 'product', 'products', 'with', 'description',
        ]);
        $price = '';
        $description = '';

        if (preg_match('/\bfor\b\s+([0-9]+(?:\.[0-9]+)?)/i', $command, $matches)) {
            $price = trim($matches[1]);
        } elseif (preg_match('/\bprice\b\s+(?:to|as)?\s*([0-9]+(?:\.[0-9]+)?)/i', $command, $matches)) {
            $price = trim($matches[1]);
        }

        if (preg_match('/\bdescription\b\s+(.+)$/i', $command, $matches)) {
            $description = trim($matches[1]);
        }

        return [
            'name' => trim((string) $name),
            'price' => $price,
            'description' => $description,
            'availability' => 1,
        ];
    }

    private function extractOrderFields(string $command): array
    {
        $name = $this->extractNamedValue($command) ?: $this->extractResidualName($command, [
            'create', 'make', 'add', 'new', 'a', 'an', 'the', 'order', 'orders', 'with', 'status', 'description',
        ]);
        $status = '';
        $description = '';

        if (preg_match('/\bstatus\b\s+(?:to|as)?\s*(.+)$/i', $command, $matches)) {
            $status = trim($matches[1]);
        }
        if (preg_match('/\bdescription\b\s+(.+)$/i', $command, $matches)) {
            $description = trim($matches[1]);
        }

        return [
            'name' => trim((string) $name),
            'status' => $status,
            'description' => $description,
        ];
    }

    private function extractAutomationFields(string $command): array
    {
        $name = $this->extractNamedValue($command) ?: $this->extractResidualName($command, [
            'create', 'make', 'add', 'new', 'a', 'an', 'the', 'automation', 'automations', 'with', 'status',
        ]);
        $status = $this->containsIntent($this->normalizeNaturalCommand($command), ['inactive', 'disabled', 'off']) ? '0' : '1';

        return [
            'name' => trim((string) $name),
            'status' => $status,
        ];
    }

    private function extractInteractiveMessageFields(string $command, string $normalized): array
    {
        $name = $this->extractNamedValue($command) ?: $this->extractResidualName($command, [
            'create', 'make', 'add', 'new', 'a', 'an', 'the', 'interactive', 'message', 'messages', 'with', 'type',
        ]);

        $optionType = 'button';
        if ($this->containsIntent($normalized, ['list'])) {
            $optionType = 'list_option';
        }

        return [
            'name' => trim((string) $name),
            'option_type' => $optionType,
            'is_active' => $this->containsIntent($normalized, ['inactive', 'disabled']) ? '0' : '1',
        ];
    }

    private function extractRoleFields(string $command): array
    {
        return [
            'name' => trim((string) ($this->extractNamedValue($command) ?: $this->extractResidualName($command, [
                'create', 'make', 'add', 'new', 'a', 'an', 'the', 'role', 'roles',
            ]))),
            'description' => '',
        ];
    }

    private function extractApiFields(string $command): array
    {
        return [
            'name' => trim((string) ($this->extractNamedValue($command) ?: $this->extractResidualName($command, [
                'create', 'make', 'add', 'new', 'a', 'an', 'the', 'api', 'key', 'keys', 'token',
            ]))),
        ];
    }

    private function extractSupportRequestFields(string $command): array
    {
        $subject = $this->extractNamedValue($command) ?: $this->extractResidualName($command, [
            'create', 'make', 'add', 'new', 'a', 'an', 'the', 'support', 'request', 'requests', 'type', 'description', 'with',
        ]);
        $type = '';
        $description = '';

        if (preg_match('/\btype\b\s+([a-z_ -]+)/i', $command, $matches)) {
            $type = trim(Str::before($matches[1], 'description'));
        }
        if (preg_match('/\bdescription\b\s+(.+)$/i', $command, $matches)) {
            $description = trim($matches[1]);
        }

        return [
            'subject' => trim((string) $subject),
            'type' => $type,
            'description' => $description,
        ];
    }

    private function extractUpdateFieldAndValue(string $command, string $module): ?array
    {
        $fieldMap = [
            'first name' => 'first_name',
            'last name' => 'last_name',
            'phone number' => 'phone_number',
            'phone' => 'phone_number',
            'number' => 'phone_number',
            'email' => 'email',
            'status' => 'status',
            'name' => 'name',
            'price' => 'price',
            'description' => 'description',
            'subject' => 'subject',
            'type' => 'type',
            'due date' => 'due_date',
            'trigger mode' => 'trigger_mode',
            'option type' => 'option_type',
        ];

        foreach ($fieldMap as $label => $field) {
            if (preg_match('/\b' . preg_quote($label, '/') . '\b.*?\b(?:to|as)\b\s+(.+)$/i', $command, $matches)) {
                return [
                    'field' => $field,
                    'value' => trim($matches[1]),
                ];
            }
        }

        if (preg_match('/\brename\b.*?\bto\b\s+(.+)$/i', $command, $matches)) {
            return [
                'field' => 'name',
                'value' => trim($matches[1]),
            ];
        }

        return null;
    }

    private function handleGlobalDataQuestionIntent(Request $request, string $normalized, array $page): ?array
    {
        $module = $this->resolveQuestionModule($normalized, $page);
        if ($module === null) {
            return null;
        }

        $registry = $this->globalQuestionRegistry();
        $config = $registry[$module] ?? null;
        if ($config === null) {
            return null;
        }

        $modelClass = $config['model'];
        $model = new $modelClass();
        $query = $modelClass::query();

        $this->applyAssistantRecordVisibilityScope($query, $model, $request->user());

        $range = $this->resolveRelativeDateRange($normalized);
        if ($range !== null) {
            $dateColumn = $this->resolveModelDateColumn($model, $config['date_fields'] ?? []);
            if ($dateColumn === null) {
                return [
                    'message' => "I found the {$config['label']} module, but I cannot filter it by date because no supported date column is available.",
                    'suggestions' => [
                        "How many {$config['label']} are there?",
                        "Show {$config['label']}",
                    ],
                ];
            }

            $query->whereBetween($dateColumn, [$range['start'], $range['end']]);
        }

        if (preg_match('/\bhow many\b|\bcount\b|\btotal\b|\bnumber of\b/', $normalized) === 1) {
            $count = (clone $query)->count();
            $periodText = $range ? " in {$range['label']} ({$range['absolute_label']})" : '';

            return [
                'message' => "There " . ($count === 1 ? 'is' : 'are') . " {$count} {$config['label']} record" . ($count === 1 ? '' : 's') . "{$periodText}.",
                'suggestions' => [
                    "Show {$config['label']}",
                    "Open {$config['navigation']}",
                ],
            ];
        }

        if (!$this->containsIntent($normalized, [
            'show',
            'tell me',
            'what',
            'which',
            'list',
            'records',
            'items',
            'rows',
            'data',
            'information',
        ])) {
            return null;
        }

        $dateColumn = $this->resolveModelDateColumn($model, $config['date_fields'] ?? []);
        if ($dateColumn !== null) {
            $query->orderByDesc($dateColumn);
        } elseif ($this->modelHasColumn($model, 'id')) {
            $query->orderByDesc('id');
        }

        $records = $query->limit(5)->get();
        $count = (clone $query)->count();

        if ($count === 0) {
            $periodText = $range ? " in {$range['label']} ({$range['absolute_label']})" : '';

            return [
                'message' => "I could not find any {$config['label']} records{$periodText}.",
                'suggestions' => [
                    "Open {$config['navigation']}",
                    'Open dashboard',
                ],
            ];
        }

        if ($customResponse = $this->buildModuleSpecificDataResponse($module, $records->all(), $count, $range)) {
            return $customResponse;
        }

        $preview = $records
            ->map(fn ($record) => $this->extractModelPreviewLabel($record, $config['preview_fields'] ?? []))
            ->filter()
            ->unique()
            ->take(5)
            ->values()
            ->all();

        $periodText = $range ? " in {$range['label']} ({$range['absolute_label']})" : '';
        $message = "I found {$count} {$config['label']} record" . ($count === 1 ? '' : 's') . "{$periodText}.";

        if (!empty($preview)) {
            $message .= ' Examples: ' . implode(', ', $preview) . '.';
        }

        return [
            'message' => $message,
            'suggestions' => [
                "How many {$config['label']} are there?",
                "Open {$config['navigation']}",
            ],
        ];
    }

    private function buildModuleSpecificDataResponse(string $module, array $records, int $count, ?array $range): ?array
    {
        if ($module !== 'price') {
            return null;
        }

        $examples = [];
        foreach (array_slice($records, 0, 5) as $record) {
            $country = trim((string) data_get($record, 'country_code', 'Unknown country'));
            $parts = [];

            foreach ([
                'user_initiated' => 'user initiated',
                'business_initiated' => 'business initiated',
                'message' => 'message',
                'media' => 'media',
            ] as $field => $label) {
                $value = data_get($record, $field);
                if ($value === null || $value === '') {
                    continue;
                }

                $parts[] = "{$label} {$value}";
            }

            if (!empty($parts)) {
                $examples[] = "{$country}: " . implode(', ', $parts);
            }
        }

        $periodText = $range ? " in {$range['label']} ({$range['absolute_label']})" : '';
        $message = "I found {$count} price record" . ($count === 1 ? '' : 's') . "{$periodText}.";

        if (!empty($examples)) {
            $message .= ' Examples: ' . implode('; ', $examples) . '.';
        }

        return [
            'message' => $message,
            'suggestions' => [
                'How many prices are there?',
                'Open pricing',
            ],
        ];
    }

    private function extractEmail(string $command): ?string
    {
        if (!preg_match('/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i', $command, $matches)) {
            return null;
        }

        return trim($matches[0]);
    }

    private function extractPhoneNumber(string $command): ?string
    {
        if (!preg_match('/(?<!\d)(\+?\d[\d\s\-\(\)]{6,}\d)(?!\d)/', $command, $matches)) {
            return null;
        }

        return preg_replace('/\s+/', ' ', trim($matches[1]));
    }

    private function extractResidualName(string $command, array $removeTerms): ?string
    {
        $cleaned = preg_replace('/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i', ' ', $command) ?? $command;
        $cleaned = preg_replace('/(?<!\d)(\+?\d[\d\s\-\(\)]{6,}\d)(?!\d)/', ' ', $cleaned) ?? $cleaned;
        $cleaned = preg_replace('/\b(' . implode('|', array_map(fn ($term) => preg_quote($term, '/'), $removeTerms)) . ')\b/i', ' ', $cleaned) ?? $cleaned;
        $cleaned = preg_replace('/\s+/', ' ', $cleaned) ?? '';
        $cleaned = trim($cleaned, " \t\n\r\0\x0B,.");

        return $cleaned !== '' ? $cleaned : null;
    }

    private function isPlaceholderNameValue(string $value): bool
    {
        $normalized = Str::lower(trim($value));

        return in_array($normalized, ['a', 'an', 'the', 'contact', 'contacts', 'lead', 'leads', 'record'], true);
    }

    private function buildAssistantRequest(Request $request, array $payload): Request
    {
        $assistantRequest = Request::create('/', 'POST', $payload);
        $assistantRequest->setUserResolver(fn () => $request->user());

        return $assistantRequest;
    }

    private function updateContactRecord(Request $request, string $recordId, string $field, string $value): array
    {
        $contact = Contact::find($recordId);
        if (!$contact) {
            return [
                'message' => 'I could not find that contact.',
                'assistant_state' => null,
            ];
        }

        $payload = $this->persistenceMapper()->mapUpdatePayload('contacts', $contact, $field, $value);

        (new ContactController())->saveContact($this->buildAssistantRequest($request, $payload));

        return [
            'message' => "I updated contact {$contact->id}.",
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('detailContact', ['id' => $contact->id]),
            ],
            'assistant_state' => null,
        ];
    }

    private function updateLeadRecord(Request $request, string $recordId, string $field, string $value): array
    {
        $lead = Lead::find($recordId);
        if (!$lead) {
            return [
                'message' => 'I could not find that lead.',
                'assistant_state' => null,
            ];
        }

        $payload = $this->persistenceMapper()->mapUpdatePayload('leads', $lead, $field, $value);

        (new LeadController())->saveLead($this->buildAssistantRequest($request, $payload));

        return [
            'message' => "I updated lead {$lead->id}.",
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('detailLead', ['id' => $lead->id]),
            ],
            'assistant_state' => null,
        ];
    }

    private function updateCampaignRecord(Request $request, string $recordId, string $field, string $value): array
    {
        $campaign = Campaign::find($recordId);
        if (!$campaign) {
            return [
                'message' => 'I could not find that campaign.',
                'assistant_state' => null,
            ];
        }

        $fieldMap = [
            'name' => 'name',
            'status' => 'status',
        ];

        $targetField = $fieldMap[$field] ?? null;
        if (!$targetField) {
            return $this->buildExecutionFailureResponse(
                'update_record',
                'campaigns',
                ['record_id' => $recordId, 'field' => $field, 'value' => $value],
                [
                    'error_code' => 'validation_failed',
                    'missing_fields' => [],
                    'validation_errors' => ['field' => ['Campaign field mapping is not implemented yet.']],
                    'confirmation_required' => false,
                ],
                'I can currently update the campaign name or status. More campaign step updates still need explicit wiring.'
            );
        }

        $campaign->$targetField = $value;
        $campaign->save();

        return [
            'message' => "I updated campaign {$campaign->name}.",
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('detailCampaign', ['id' => $campaign->id]),
            ],
            'assistant_state' => null,
        ];
    }

    private function deleteContactRecord(string $recordId): array
    {
        $contact = Contact::find($recordId);
        if (!$contact) {
            return [
                'message' => 'I could not find that contact.',
                'assistant_state' => null,
            ];
        }

        $displayName = trim($contact->first_name . ' ' . $contact->last_name);
        $contact->delete();

        return [
            'message' => "I deleted contact {$displayName}.",
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('listContact'),
            ],
            'assistant_state' => null,
        ];
    }

    private function deleteLeadRecord(string $recordId): array
    {
        $lead = Lead::find($recordId);
        if (!$lead) {
            return [
                'message' => 'I could not find that lead.',
                'assistant_state' => null,
            ];
        }

        $name = $lead->name;
        $lead->delete();

        return [
            'message' => "I deleted lead {$name}.",
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('listLead'),
            ],
            'assistant_state' => null,
        ];
    }

    private function deleteCampaignRecord(string $recordId): array
    {
        $campaign = Campaign::find($recordId);
        if (!$campaign) {
            return [
                'message' => 'I could not find that campaign.',
                'assistant_state' => null,
            ];
        }

        $name = $campaign->name;
        $campaign->delete();

        return [
            'message' => "I deleted campaign {$name}.",
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('listCampaign'),
            ],
            'assistant_state' => null,
        ];
    }

    private function updateProductRecord(Request $request, string $recordId, string $field, string $value): array
    {
        $product = Product::find($recordId);
        if (!$product) {
            return ['message' => 'I could not find that product.', 'assistant_state' => null];
        }

        $payload = $this->persistenceMapper()->mapUpdatePayload('products', $product, $field, $value);

        (new ProductController())->saveProduct($this->buildAssistantRequest($request, $payload));

        return [
            'message' => "I updated product {$product->id}.",
            'action' => ['type' => 'visit', 'url' => $this->appRoute('detailProduct', ['id' => $product->id])],
            'assistant_state' => null,
        ];
    }

    private function updateOrderRecord(Request $request, string $recordId, string $field, string $value): array
    {
        $order = Order::find($recordId);
        if (!$order) {
            return ['message' => 'I could not find that order.', 'assistant_state' => null];
        }

        $payload = $this->persistenceMapper()->mapUpdatePayload('orders', $order, $field, $value);

        (new OrderController())->saveOrder($this->buildAssistantRequest($request, array_filter($payload, fn ($v) => $v !== null)));

        return [
            'message' => "I updated order {$order->id}.",
            'action' => ['type' => 'visit', 'url' => $this->appRoute('detailOrder', ['id' => $order->id])],
            'assistant_state' => null,
        ];
    }

    private function updateAutomationRecord(string $recordId, string $field, string $value): array
    {
        $automation = Automation::find($recordId);
        if (!$automation) {
            return ['message' => 'I could not find that automation.', 'assistant_state' => null];
        }

        if (!in_array($field, ['name', 'status', 'trigger_mode'], true)) {
            return $this->buildExecutionFailureResponse(
                'update_record',
                'automations',
                ['record_id' => $recordId, 'field' => $field, 'value' => $value],
                [
                    'error_code' => 'validation_failed',
                    'missing_fields' => [],
                    'validation_errors' => ['field' => ['Automation field mapping is not implemented yet.']],
                    'confirmation_required' => false,
                ],
                'I can currently update the automation name, status, or trigger mode.'
            );
        }

        $automation->$field = $value;
        $automation->save();

        return [
            'message' => "I updated automation {$automation->name}.",
            'action' => ['type' => 'visit', 'url' => $this->appRoute('createAutomation', ['id' => $automation->id])],
            'assistant_state' => null,
        ];
    }

    private function updateInteractiveMessageRecord(Request $request, string $recordId, string $field, string $value): array
    {
        $record = InteractiveMessage::find($recordId);
        if (!$record) {
            return ['message' => 'I could not find that interactive message.', 'assistant_state' => null];
        }

        $payload = $this->persistenceMapper()->mapUpdatePayload('interactive_messages', $record, $field, $value);

        (new InteractiveMessageController())->saveInteractiveMessage($this->buildAssistantRequest($request, $payload));

        return [
            'message' => "I updated interactive message {$record->id}.",
            'action' => ['type' => 'visit', 'url' => $this->appRoute('detailInteractiveMessage', ['id' => $record->id])],
            'assistant_state' => null,
        ];
    }

    private function updateRoleRecord(string $recordId, string $field, string $value): array
    {
        $role = PermissionRole::find($recordId);
        if (!$role) {
            return ['message' => 'I could not find that role.', 'assistant_state' => null];
        }

        if (!in_array($field, ['name', 'description'], true)) {
            return $this->buildExecutionFailureResponse(
                'update_record',
                'roles',
                ['record_id' => $recordId, 'field' => $field, 'value' => $value],
                [
                    'error_code' => 'validation_failed',
                    'missing_fields' => [],
                    'validation_errors' => ['field' => ['Role field mapping is not implemented yet.']],
                    'confirmation_required' => false,
                ],
                'I can currently update the role name or description.'
            );
        }

        $role->$field = $value;
        $role->save();

        return [
            'message' => "I updated role {$role->name}.",
            'action' => ['type' => 'visit', 'url' => $this->appRoute('detailRole', ['id' => $role->id])],
            'assistant_state' => null,
        ];
    }

    private function updateApiRecord(string $recordId, string $field, string $value): array
    {
        $api = Api::find($recordId);
        if (!$api) {
            return ['message' => 'I could not find that API key.', 'assistant_state' => null];
        }

        if (!in_array($field, ['name'], true)) {
            return $this->buildExecutionFailureResponse(
                'update_record',
                'api',
                ['record_id' => $recordId, 'field' => $field, 'value' => $value],
                [
                    'error_code' => 'validation_failed',
                    'missing_fields' => [],
                    'validation_errors' => ['field' => ['API field mapping is not implemented yet.']],
                    'confirmation_required' => false,
                ],
                'I can currently update the API key name only.'
            );
        }

        $api->$field = $value;
        $api->save();

        return [
            'message' => "I updated api key {$api->name}.",
            'action' => ['type' => 'visit', 'url' => $this->appRoute('detailApi', ['id' => $api->id])],
            'assistant_state' => null,
        ];
    }

    private function updateSupportRequestRecord(Request $request, string $recordId, string $field, string $value): array
    {
        $record = SupportRequest::find($recordId);
        if (!$record) {
            return ['message' => 'I could not find that support request.', 'assistant_state' => null];
        }

        $payload = $this->persistenceMapper()->mapUpdatePayload('support_requests', $record, $field, $value);

        (new SupportRequestController())->saveSupportRequest($this->buildAssistantRequest($request, $payload));

        return [
            'message' => "I updated support request {$record->subject}.",
            'action' => ['type' => 'visit', 'url' => $this->appRoute('detailSupportRequest', ['id' => $record->id])],
            'assistant_state' => null,
        ];
    }

    private function deleteProductRecord(string $recordId): array
    {
        $product = Product::find($recordId);
        if (!$product) {
            return ['message' => 'I could not find that product.', 'assistant_state' => null];
        }
        $name = $product->name;
        $product->lineItems()->delete();
        $product->delete();
        return ['message' => "I deleted product {$name}.", 'action' => ['type' => 'visit', 'url' => $this->appRoute('listProduct')], 'assistant_state' => null];
    }

    private function deleteOrderRecord(string $recordId): array
    {
        $order = Order::find($recordId);
        if (!$order) {
            return ['message' => 'I could not find that order.', 'assistant_state' => null];
        }
        $name = $order->name;
        $order->delete();
        return ['message' => "I deleted order {$name}.", 'action' => ['type' => 'visit', 'url' => $this->appRoute('listOrder')], 'assistant_state' => null];
    }

    private function deleteAutomationRecord(string $recordId): array
    {
        $automation = Automation::find($recordId);
        if (!$automation) {
            return ['message' => 'I could not find that automation.', 'assistant_state' => null];
        }
        $name = $automation->name;
        \DB::table('webhook_data')->where('automation_id', $automation->id)->delete();
        $automation->delete();
        return ['message' => "I deleted automation {$name}.", 'action' => ['type' => 'visit', 'url' => $this->appRoute('listAutomation')], 'assistant_state' => null];
    }

    private function deleteInteractiveMessageRecord(string $recordId): array
    {
        $record = InteractiveMessage::find($recordId);
        if (!$record) {
            return ['message' => 'I could not find that interactive message.', 'assistant_state' => null];
        }
        $name = $record->name;
        $record->delete();
        return ['message' => "I deleted interactive message {$name}.", 'action' => ['type' => 'visit', 'url' => $this->appRoute('listInteractiveMessage')], 'assistant_state' => null];
    }

    private function deleteRoleRecord(string $recordId): array
    {
        $role = PermissionRole::find($recordId);
        if (!$role) {
            return ['message' => 'I could not find that role.', 'assistant_state' => null];
        }
        $name = $role->name;
        $role->delete();
        return ['message' => "I deleted role {$name}.", 'action' => ['type' => 'visit', 'url' => $this->appRoute('listRole')], 'assistant_state' => null];
    }

    private function deleteApiRecord(string $recordId): array
    {
        $api = Api::find($recordId);
        if (!$api) {
            return ['message' => 'I could not find that API key.', 'assistant_state' => null];
        }
        $name = $api->name;
        $api->delete();
        return ['message' => "I deleted api key {$name}.", 'action' => ['type' => 'visit', 'url' => $this->appRoute('listApi')], 'assistant_state' => null];
    }

    private function deleteSupportRequestRecord(string $recordId): array
    {
        $record = SupportRequest::find($recordId);
        if (!$record) {
            return ['message' => 'I could not find that support request.', 'assistant_state' => null];
        }
        $subject = $record->subject;
        $record->delete();
        return ['message' => "I deleted support request {$subject}.", 'action' => ['type' => 'visit', 'url' => $this->appRoute('listSupportRequest')], 'assistant_state' => null];
    }

    private function getSessionCount(): int
    {
        $query = Session::query();
        $now = Carbon::now();

        foreach (['created_at', 'updated_at'] as $column) {
            if (Schema::hasColumn('sessions', $column)) {
                return (clone $query)
                    ->whereMonth($column, $now->month)
                    ->whereYear($column, $now->year)
                    ->count();
            }
        }

        return $query->count();
    }

    private function describePage(?string $pageTitle, string $pageComponent): string
    {
        $title = $pageTitle ?: 'this page';
        $component = Str::lower($pageComponent);

        if (Str::contains($component, 'dashboard')) {
            return "This is {$title}. It summarizes wallet, message activity, sessions, and message log data. I can answer KPI questions, explain the visible numbers, summarize the current page data, or move you to campaigns, templates, billing, and logs.";
        }

        if (Str::contains($component, 'campaign')) {
            return "This is {$title}. It is used to create, review, and manage campaign workflows. I can create a draft campaign, explain the campaign flow, open campaign results, search campaigns, or summarize the records shown here.";
        }

        if (Str::contains($component, 'template')) {
            return "This is {$title}. It is used to manage WhatsApp templates for connected accounts. I can explain how template creation works, create a draft template when you provide account, category, and language, summarize visible template data, or open the template workflow for you.";
        }

        if (Str::contains($component, ['contact', 'lead', 'opportunity', 'group', 'organization'])) {
            return "This is {$title}. It manages CRM-style records. I can summarize the visible records on the page, answer count questions, search related records, and open the relevant list area.";
        }

        if (Str::contains($component, ['wallet', 'subscription', 'settings'])) {
            return "This is {$title}. It is focused on billing, subscription, or workspace settings. I can explain the page, answer questions about balances and usage, and open the right billing or settings area.";
        }

        if (Str::contains($component, ['automation'])) {
            return "This is {$title}. It is used to manage automation flows and results. I can open automations, explain the workflow, and summarize the records visible on this page.";
        }

        if (Str::contains($component, ['message', 'chat'])) {
            return "This is {$title}. It is used for messages, chats, and logs. I can answer questions about message counts, open logs or chat areas, and summarize the data currently visible.";
        }

        if (Str::contains($component, ['catalog', 'product', 'order'])) {
            return "This is {$title}. It is used for catalog, product, or order management. I can explain the area, summarize page records, and take you to the related management screen.";
        }

        return "This is {$title}. I can explain what this page is for, summarize the visible data, answer questions about the records shown here, help with related workflows, and navigate to the right area.";
    }

    private function summarizePageProps(array $page, array $pageProps): string
    {
        $pageTitle = $page['title'] ?? 'this page';
        $counts = [];
        $highlights = [];

        foreach ($pageProps as $key => $value) {
            if (is_array($value) && $this->isSequentialArray($value)) {
                $counts[] = Str::headline($key) . ': ' . count($value);
                $preview = $this->buildRecordPreview($value);
                if ($preview) {
                    $highlights[] = Str::headline($key) . ' includes ' . $preview . '.';
                }
                continue;
            }

            if (is_scalar($value) && !in_array($key, ['current_page', 'plural', 'pageTitle'], true)) {
                $highlights[] = Str::headline($key) . ': ' . $this->stringifyScalar($value) . '.';
            }
        }

        $parts = ["On {$pageTitle}, I can see the current page data."];

        if (!empty($counts)) {
            $parts[] = 'Visible list counts: ' . implode('; ', array_slice($counts, 0, 5)) . '.';
        }

        if (!empty($highlights)) {
            $parts[] = implode(' ', array_slice($highlights, 0, 3));
        }

        if (count($parts) === 1) {
            $parts[] = 'This page does not expose much structured data beyond its basic metadata.';
        }

        return implode(' ', $parts);
    }

    private function answerPageCountQuestion(string $normalized, array $pageProps): ?string
    {
        foreach ($pageProps as $key => $value) {
            if (!is_array($value) || !$this->isSequentialArray($value)) {
                continue;
            }

            $label = Str::lower(Str::headline($key));
            $singular = Str::singular($label);

            if (
                Str::contains($normalized, $label) ||
                Str::contains($normalized, $singular) ||
                Str::contains($normalized, ['items', 'records', 'rows']) ||
                count($pageProps) === 1
            ) {
                return 'There are ' . count($value) . ' ' . $label . ' available on this page.';
            }
        }

        return null;
    }

    private function answerPageRecordQuestion(string $normalized, array $pageProps): ?string
    {
        foreach ($pageProps as $key => $value) {
            if (!is_array($value) || !$this->isSequentialArray($value) || empty($value)) {
                continue;
            }

            $label = Str::lower(Str::headline($key));
            $singular = Str::singular($label);

            if (
                Str::contains($normalized, $label) ||
                Str::contains($normalized, $singular) ||
                Str::contains($normalized, ['records', 'items', 'rows', 'list'])
            ) {
                $preview = $this->buildRecordPreview($value, 4);

                if ($preview) {
                    return Str::headline($key) . ' on this page include ' . $preview . '.';
                }

                return 'I can see ' . count($value) . ' ' . $label . ' on this page.';
            }
        }

        return null;
    }

    private function answerPageTemporalQuestion(string $normalized, array $pageProps): ?string
    {
        $range = $this->resolveRelativeDateRange($normalized);
        if ($range === null) {
            return null;
        }

        $bestMatch = null;

        foreach ($pageProps as $key => $value) {
            if (!is_array($value) || !$this->isSequentialArray($value) || empty($value)) {
                continue;
            }

            $label = Str::lower(Str::headline($key));
            $singular = Str::singular($label);
            $isTargetedList =
                Str::contains($normalized, $label) ||
                Str::contains($normalized, $singular) ||
                Str::contains($normalized, ['records', 'items', 'rows', 'data']);

            $filtered = [];

            foreach ($value as $item) {
                $recordDate = $this->extractRecordDateValue($item);
                if (!$recordDate) {
                    continue;
                }

                if ($recordDate->betweenIncluded($range['start'], $range['end'])) {
                    $filtered[] = is_array($item) ? $item : ['value' => $item];
                }
            }

            if (empty($filtered)) {
                continue;
            }

            $candidate = [
                'label' => $label,
                'items' => $filtered,
                'score' => ($isTargetedList ? 10 : 0) + count($filtered),
            ];

            if ($bestMatch === null || $candidate['score'] > $bestMatch['score']) {
                $bestMatch = $candidate;
            }
        }

        if ($bestMatch === null) {
            return "I could not find visible page records with dates in {$range['label']} ({$range['absolute_label']}).";
        }

        $count = count($bestMatch['items']);
        $preview = $this->buildRecordPreview($bestMatch['items'], 4);
        $message = "I found {$count} {$bestMatch['label']} record" . ($count === 1 ? '' : 's') . " in {$range['label']} ({$range['absolute_label']}).";

        if ($preview) {
            $message .= " Examples: {$preview}.";
        }

        return $message;
    }

    private function buildRecordPreview(array $items, int $limit = 3): ?string
    {
        $labels = [];

        foreach (array_slice($items, 0, $limit) as $item) {
            if (is_scalar($item)) {
                $labels[] = $this->stringifyScalar($item);
                continue;
            }

            if (!is_array($item)) {
                continue;
            }

            foreach (['name', 'title', 'company_name', 'email', 'phone', 'id'] as $field) {
                if (array_key_exists($field, $item) && $item[$field] !== null && $item[$field] !== '') {
                    $labels[] = $this->stringifyScalar($item[$field]);
                    break;
                }
            }
        }

        $labels = array_values(array_unique(array_filter($labels)));

        return empty($labels) ? null : implode(', ', $labels);
    }

    private function resolveRelativeDateRange(string $normalized): ?array
    {
        $now = Carbon::now();

        return match (true) {
            $this->containsIntent($normalized, ['last year', 'previous year']) => [
                'label' => 'last year',
                'absolute_label' => $now->copy()->subYear()->startOfYear()->format('F j, Y') . ' to ' . $now->copy()->subYear()->endOfYear()->format('F j, Y'),
                'start' => $now->copy()->subYear()->startOfYear(),
                'end' => $now->copy()->subYear()->endOfYear(),
            ],
            $this->containsIntent($normalized, ['this year', 'current year']) => [
                'label' => 'this year',
                'absolute_label' => $now->copy()->startOfYear()->format('F j, Y') . ' to ' . $now->copy()->endOfYear()->format('F j, Y'),
                'start' => $now->copy()->startOfYear(),
                'end' => $now->copy()->endOfYear(),
            ],
            $this->containsIntent($normalized, ['last month', 'previous month']) => [
                'label' => 'last month',
                'absolute_label' => $now->copy()->subMonthNoOverflow()->startOfMonth()->format('F j, Y') . ' to ' . $now->copy()->subMonthNoOverflow()->endOfMonth()->format('F j, Y'),
                'start' => $now->copy()->subMonthNoOverflow()->startOfMonth(),
                'end' => $now->copy()->subMonthNoOverflow()->endOfMonth(),
            ],
            $this->containsIntent($normalized, ['this month', 'current month']) => [
                'label' => 'this month',
                'absolute_label' => $now->copy()->startOfMonth()->format('F j, Y') . ' to ' . $now->copy()->endOfMonth()->format('F j, Y'),
                'start' => $now->copy()->startOfMonth(),
                'end' => $now->copy()->endOfMonth(),
            ],
            $this->containsIntent($normalized, ['today']) => [
                'label' => 'today',
                'absolute_label' => $now->copy()->startOfDay()->format('F j, Y'),
                'start' => $now->copy()->startOfDay(),
                'end' => $now->copy()->endOfDay(),
            ],
            $this->containsIntent($normalized, ['yesterday']) => [
                'label' => 'yesterday',
                'absolute_label' => $now->copy()->subDay()->format('F j, Y'),
                'start' => $now->copy()->subDay()->startOfDay(),
                'end' => $now->copy()->subDay()->endOfDay(),
            ],
            default => null,
        };
    }

    private function extractRecordDateValue(mixed $item): ?Carbon
    {
        if (!is_array($item)) {
            return null;
        }

        foreach ([
            'created_at',
            'updated_at',
            'date',
            'createdAt',
            'updatedAt',
            'sent_at',
            'scheduled_at',
            'due_date',
            'start_date',
            'end_date',
        ] as $field) {
            $value = $item[$field] ?? null;
            if (!is_string($value) || trim($value) === '') {
                continue;
            }

            try {
                return Carbon::parse($value);
            } catch (\Throwable) {
                continue;
            }
        }

        return null;
    }

    private function resolveQuestionModule(string $normalized, array $page): ?string
    {
        foreach ($this->globalQuestionAliases() as $module => $aliases) {
            if ($this->containsIntent($normalized, $aliases)) {
                return $module;
            }
        }

        $currentModule = $this->inferModuleFromPage($page);

        return is_string($currentModule) && $currentModule !== '' ? $currentModule : null;
    }

    private function globalQuestionAliases(): array
    {
        return [
            'contact' => ['contact', 'contacts'],
            'lead' => ['lead', 'leads'],
            'campaign' => ['campaign', 'campaigns'],
            'product' => ['product', 'products'],
            'order' => ['order', 'orders'],
            'automation' => ['automation', 'automations'],
            'interactive message' => ['interactive message', 'interactive messages'],
            'role' => ['role', 'roles', 'permissions', 'role permissions'],
            'api' => ['api', 'api key', 'api keys'],
            'support request' => ['support request', 'support requests', 'ticket', 'tickets'],
            'message' => ['message', 'messages', 'conversation', 'conversations'],
            'message log' => ['message log', 'message logs', 'logs'],
            'account' => ['account', 'accounts', 'social profile', 'social profiles'],
            'organization' => ['organization', 'organizations'],
            'tag' => ['tag', 'tags'],
            'group' => ['group', 'groups'],
            'deal' => ['deal', 'deals', 'opportunity', 'opportunities'],
            'import' => ['import', 'imports'],
            'catalog' => ['catalog', 'catalogs'],
            'price' => ['price', 'prices', 'pricing'],
            'plan' => ['plan', 'plans'],
        ];
    }

    private function globalQuestionRegistry(): array
    {
        return [
            'contact' => [
                'label' => 'contact',
                'model' => Contact::class,
                'preview_fields' => ['first_name', 'last_name', 'email', 'phone_number', 'id'],
                'date_fields' => ['created_at', 'updated_at', 'birth_date'],
                'navigation' => 'contacts',
            ],
            'lead' => [
                'label' => 'lead',
                'model' => Lead::class,
                'preview_fields' => ['name', 'sales_stage', 'amount', 'id'],
                'date_fields' => ['created_at', 'updated_at', 'expected_close_date'],
                'navigation' => 'leads',
            ],
            'campaign' => [
                'label' => 'campaign',
                'model' => Campaign::class,
                'preview_fields' => ['name', 'status', 'service', 'id'],
                'date_fields' => ['created_at', 'updated_at', 'scheduled_at'],
                'navigation' => 'campaigns',
            ],
            'product' => [
                'label' => 'product',
                'model' => Product::class,
                'preview_fields' => ['name', 'price', 'description', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'products',
            ],
            'order' => [
                'label' => 'order',
                'model' => Order::class,
                'preview_fields' => ['name', 'status', 'description', 'id'],
                'date_fields' => ['created_at', 'updated_at', 'due_date'],
                'navigation' => 'orders',
            ],
            'automation' => [
                'label' => 'automation',
                'model' => Automation::class,
                'preview_fields' => ['name', 'trigger_mode', 'status', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'automations',
            ],
            'interactive message' => [
                'label' => 'interactive message',
                'model' => InteractiveMessage::class,
                'preview_fields' => ['name', 'option_type', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'interactive messages',
            ],
            'role' => [
                'label' => 'role',
                'model' => PermissionRole::class,
                'preview_fields' => ['name', 'guard_name', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'roles',
            ],
            'api' => [
                'label' => 'api key',
                'model' => Api::class,
                'preview_fields' => ['name', 'api_key', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'api keys',
            ],
            'support request' => [
                'label' => 'support request',
                'model' => SupportRequest::class,
                'preview_fields' => ['subject', 'status', 'type', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'support requests',
            ],
            'message' => [
                'label' => 'message',
                'model' => Message::class,
                'preview_fields' => ['name', 'title', 'subject', 'id'],
                'date_fields' => ['created_at', 'updated_at', 'sent_at'],
                'navigation' => 'messages',
            ],
            'message log' => [
                'label' => 'message log',
                'model' => MessageLog::class,
                'preview_fields' => ['name', 'title', 'subject', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'message logs',
            ],
            'account' => [
                'label' => 'account',
                'model' => Account::class,
                'preview_fields' => ['company_name', 'name', 'service', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'accounts',
            ],
            'organization' => [
                'label' => 'organization',
                'model' => Organization::class,
                'preview_fields' => ['name', 'industry', 'email', 'phone_number', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'organizations',
            ],
            'tag' => [
                'label' => 'tag',
                'model' => Tag::class,
                'preview_fields' => ['name', 'description', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'tags',
            ],
            'group' => [
                'label' => 'group',
                'model' => Group::class,
                'preview_fields' => ['group_name', 'name', 'group_description', 'description', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'groups',
            ],
            'deal' => [
                'label' => 'deal',
                'model' => Opportunity::class,
                'preview_fields' => ['name', 'sales_stage', 'amount', 'id'],
                'date_fields' => ['created_at', 'updated_at', 'expected_close_date'],
                'navigation' => 'deals',
            ],
            'import' => [
                'label' => 'import',
                'model' => Import::class,
                'preview_fields' => ['name', 'title', 'file_name', 'status', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'imports',
            ],
            'catalog' => [
                'label' => 'catalog',
                'model' => Catalog::class,
                'preview_fields' => ['name', 'title', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'catalogs',
            ],
            'price' => [
                'label' => 'price',
                'model' => Price::class,
                'preview_fields' => ['name', 'title', 'amount', 'price', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'pricing',
            ],
            'plan' => [
                'label' => 'plan',
                'model' => Plan::class,
                'preview_fields' => ['name', 'title', 'id'],
                'date_fields' => ['created_at', 'updated_at'],
                'navigation' => 'plans',
            ],
        ];
    }

    private function applyAssistantRecordVisibilityScope($query, object $model, ?object $user): void
    {
        if (!$user) {
            return;
        }

        $selectedCompanyId = Cache::get('selected_company_' . $user->id) ?: Company::query()->value('id');

        if ($selectedCompanyId && $this->modelHasColumn($model, 'company_id')) {
            $query->where('company_id', $selectedCompanyId);
        }

        if ($this->modelHasColumn($model, 'user_id')) {
            $query->where('user_id', $user->id);
        }
    }

    private function resolveModelDateColumn(object $model, array $preferredColumns): ?string
    {
        foreach ($preferredColumns as $column) {
            if ($this->modelHasColumn($model, $column)) {
                return $column;
            }
        }

        return null;
    }

    private function modelHasColumn(object $model, string $column): bool
    {
        try {
            return Schema::hasColumn($model->getTable(), $column);
        } catch (\Throwable) {
            return false;
        }
    }

    private function extractModelPreviewLabel(object $record, array $fields): ?string
    {
        foreach ($fields as $field) {
            $value = data_get($record, $field);
            if ($value === null || $value === '') {
                continue;
            }

            if (is_array($value)) {
                continue;
            }

            if ($field === 'api_key') {
                $value = Str::limit((string) $value, 12, '...');
            }

            if (in_array($field, ['first_name', 'last_name'], true)) {
                $firstName = trim((string) data_get($record, 'first_name', ''));
                $lastName = trim((string) data_get($record, 'last_name', ''));
                $fullName = trim("{$firstName} {$lastName}");
                if ($fullName !== '') {
                    return $fullName;
                }
            }

            return $this->stringifyScalar($value);
        }

        return method_exists($record, 'getKey') ? (string) $record->getKey() : null;
    }

    private function stringifyScalar(mixed $value): string
    {
        if (is_bool($value)) {
            return $value ? 'yes' : 'no';
        }

        return (string) $value;
    }

    private function isSequentialArray(array $value): bool
    {
        return array_keys($value) === range(0, count($value) - 1);
    }

    private function flattenPageProps(array $data, string $prefix = '', int $depth = 0): array
    {
        if ($depth > 3) {
            return [];
        }

        $entries = [];

        foreach ($data as $key => $value) {
            if (in_array($key, ['auth', 'errors', 'ziggy', 'flash', 'translator', 'translations', 'current_page', 'plural', 'pageTitle'], true)) {
                continue;
            }

            $label = trim($prefix === '' ? (string) $key : $prefix . ' ' . (string) $key);

            if (is_scalar($value) || $value === null) {
                if ($value !== null && $value !== '') {
                    $entries[] = ['label' => $label, 'value' => $value];
                }

                continue;
            }

            if (!is_array($value)) {
                continue;
            }

            if ($this->isSequentialArray($value)) {
                $entries[] = ['label' => $label . ' count', 'value' => count($value)];
                $preview = $this->buildRecordPreview($value, 4);
                if ($preview) {
                    $entries[] = ['label' => $label . ' preview', 'value' => $preview];
                }
                continue;
            }

            $entries = array_merge($entries, $this->flattenPageProps($value, $label, $depth + 1));
        }

        return $entries;
    }

    private function meaningfulTokens(string $value): array
    {
        $normalized = preg_replace('/[^a-z0-9\s]+/', ' ', Str::lower($value)) ?? '';
        $tokens = preg_split('/\s+/', trim($normalized)) ?: [];
        $stopWords = [
            'the', 'a', 'an', 'is', 'are', 'of', 'to', 'for', 'on', 'in', 'this', 'that', 'me',
            'tell', 'show', 'what', 'which', 'how', 'many', 'much', 'do', 'does', 'did', 'page',
            'current', 'my', 'i', 'we', 'you', 'it', 'can',
        ];

        return array_values(array_unique(array_filter($tokens, function ($token) use ($stopWords) {
            return $token !== '' && !in_array($token, $stopWords, true) && strlen($token) > 1;
        })));
    }

    private function resolveSpentThisMonth(array $pageProps): float
    {
        $services = $pageProps['services'] ?? null;
        if (is_array($services)) {
            $sum = 0.0;

            foreach ($services as $key => $service) {
                if ($key === 'total_messages' || !is_array($service)) {
                    continue;
                }

                $sum += (float) ($service['amount'] ?? 0);
            }

            if ($sum > 0) {
                return $sum;
            }
        }

        return (float) (Msg::query()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount') ?? 0);
    }

    private function handlePendingIntent(Request $request, string $command, string $normalized, ?array $assistantState, array $page): ?array
    {
        $activeTask = (string) ($assistantState['active_task'] ?? $assistantState['intent'] ?? '');

        if (!is_array($assistantState) || $activeTask === '') {
            return null;
        }

        if ($activeTask === 'page_action') {
            $recordId = $this->extractFirstNumericValue($command);
            if (!$recordId) {
                return [
                    'message' => 'I still need the record ID to continue that action.',
                    'suggestions' => [
                        'Open detail 1',
                        'Edit 1',
                    ],
                    'assistant_state' => $assistantState,
                ];
            }

            return $this->handlePageActionIntent([
                'module' => $assistantState['module'] ?? '',
                'action' => $assistantState['action'] ?? 'detail',
                'record_id' => (string) $recordId,
            ], $page);
        }

        if ($activeTask === 'create_campaign') {
            $name = $this->extractNamedValue($command) ?: trim($command);

            if ($name === '') {
                return [
                    'message' => 'I still need the campaign name to continue.',
                    'suggestions' => [
                        'Create a campaign called spring_sale',
                        'Create a campaign called launch_sequence',
                    ],
                    'assistant_state' => $assistantState,
                ];
            }

            return $this->handleCampaignIntent(
                $request,
                'create a campaign called ' . $name,
                $this->normalizeNaturalCommand('create a campaign called ' . $name)
            );
        }

        if ($activeTask === 'create_contact') {
            return $this->continueContactCreateIntent($request, $command, $normalized, $assistantState);
        }

        if ($activeTask === 'create_lead') {
            return $this->continueLeadCreateIntent($request, $command, $normalized, $assistantState);
        }

        if ($activeTask === 'create_product') {
            return $this->continueProductCreateIntent($request, $command, $normalized, $assistantState);
        }

        if ($activeTask === 'create_order') {
            return $this->continueOrderCreateIntent($request, $command, $normalized, $assistantState);
        }

        if ($activeTask === 'create_automation') {
            return $this->continueAutomationCreateIntent($request, $command, $normalized, $assistantState);
        }

        if ($activeTask === 'create_interactive_message') {
            return $this->continueInteractiveMessageCreateIntent($request, $command, $normalized, $assistantState);
        }

        if ($activeTask === 'create_role') {
            return $this->continueRoleCreateIntent($request, $command, $normalized, $assistantState);
        }

        if ($activeTask === 'create_api') {
            return $this->continueApiCreateIntent($request, $command, $normalized, $assistantState);
        }

        if ($activeTask === 'create_support_request') {
            return $this->continueSupportRequestCreateIntent($request, $command, $normalized, $assistantState);
        }

        if ($activeTask === 'update_record') {
            return $this->continueUpdateRecordIntent($request, $command, $normalized, $assistantState);
        }

        if ($activeTask === 'delete_record') {
            return $this->continueDeleteRecordIntent($request, $command, $normalized, $assistantState);
        }

        if ($activeTask !== 'create_template') {
            return null;
        }

        $user = $request->user();
        $accounts = Account::query()
            ->where('user_id', $user->id)
            ->select('id', 'company_name', 'service', 'user_id')
            ->orderBy('company_name')
            ->get();

        $accountResolution = $this->templateAccountResolver()->resolve($user, [
            'account_id' => $assistantState['account_id'] ?? null,
            'account_name' => $assistantState['account_name'] ?? $command,
            'selected_profile_or_null' => $command,
        ], $accounts);
        $account = $accountResolution['account'];

        $category = $this->extractTemplateCategory($normalized);
        $languages = $this->extractLanguages($normalized);
        $name = $this->extractNamedValue($command);
        $validation = $this->validateManifestExecution('templates', 'create_template', [
            'account_id' => $account?->id,
            'category' => $category ? Str::lower($category) : '',
            'language' => $languages[0] ?? '',
            'name' => trim((string) $name),
        ]);

        if (($accountResolution['ok'] ?? false) === false || !$validation['ok']) {
            $missing = $validation['missing_fields'] ?? [];
            if (($accountResolution['ok'] ?? false) === false && !in_array('account_id', $missing, true)) {
                $missing[] = 'account_id';
            }

            $message = 'I am still missing ' . implode(', ', $missing) . ' to create the template.';
            if ($account) {
                $message .= " I already have the account {$account->company_name}.";
            }
            $message .= ' You can reply with the remaining details in one line, for example: marketing in English.';

            return $this->buildExecutionFailureResponse(
                'create_template',
                'templates',
                array_filter([
                    'account_id' => $account?->id,
                    'account_name' => $account?->company_name,
                    'category' => $category,
                    'language' => $languages[0] ?? null,
                    'name' => $name,
                ], fn ($value) => $value !== null && $value !== ''),
                array_merge($validation, ['missing_fields' => $missing]),
                $message,
                [
                    'marketing in English',
                    'authentication in Italian',
                    'utility in English',
                ],
                [
                    'account_id' => $account?->id,
                    'account_name' => $account?->company_name,
                ]
            );
        }

        $authorization = $this->actionAuthorizer()->authorize($user, 'create_template', 'templates', null, ['account' => $account]);
        if (!$authorization['ok']) {
            return $this->buildExecutionFailureResponse(
                'create_template',
                'templates',
                ['account_id' => $account?->id],
                $authorization,
                $authorization['message']
            );
        }

        $companyId = Cache::get('selected_company_' . $user->id) ?: Company::query()->value('id');
        $templatePayload = $this->persistenceMapper()->mapCreatePayload('templates', [
            'account_id' => $account->id,
            'category' => Str::lower($category ?? ''),
            'language' => $languages[0] ?? '',
            'name' => $name ?: '',
        ]);
        $template = new Template();
        $template->name = $templatePayload['name'];
        $template->category = $templatePayload['category'];
        $template->languages = $templatePayload['languages'];
        $template->status = 'draft';
        $template->company_id = $companyId;
        $template->account_id = $templatePayload['account_id'];
        $template->created_by = $user->id;
        $template->save();

        return [
            'message' => "I created the draft template {$template->name} for {$account->company_name}. I'm opening it now so you can finish the content and submit it.",
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('template_detail_view', [$account->id, $template->id]),
            ],
            'suggestions' => [
                'Open templates',
                'What is on this page?',
            ],
            'assistant_state' => null,
        ];
    }

    private function inferActionableModule(string $normalized, array $page = []): ?string
    {
        foreach (['contact', 'lead', 'campaign', 'template', 'product', 'order', 'automation', 'interactive message', 'role', 'api', 'support request', 'billing', 'wallet'] as $module) {
            $labels = [$module, Str::plural($module)];
            if ($this->containsIntent($normalized, $labels)) {
                return $module;
            }
        }

        $currentModule = $this->inferModuleFromPage($page);

        return in_array($currentModule, ['contact', 'lead', 'campaign', 'template', 'product', 'order', 'automation', 'interactive message', 'role', 'api', 'support request', 'billing', 'wallet'], true) ? $currentModule : null;
    }

    private function buildModuleWorkflowResponse(string $module): ?array
    {
        return match ($module) {
            'contact' => [
                'message' => 'To create a contact, give me at least a name. You can also include email or phone, and I will create it for you directly.',
                'suggestions' => [
                    'Create a contact John Doe',
                    'Create a contact John Doe with email john@example.com',
                    'Update contact 1 email to john@example.com',
                ],
            ],
            'lead' => [
                'message' => 'To create a lead, give me the lead name. I can also update or delete a lead when you provide the lead ID and the change you want.',
                'suggestions' => [
                    'Create a lead Acme Renewal',
                    'Update lead 3 status to Qualified',
                    'Delete lead 3',
                ],
            ],
            'product' => [
                'message' => 'To create a product, I need the product name, price, and description. I can also update or delete a product when you provide the product ID.',
                'suggestions' => [
                    'Create a product Premium Plan for 99 with description Monthly subscription',
                    'Update product 2 price to 149',
                    'Delete product 2',
                ],
            ],
            'order' => [
                'message' => 'To create an order, I need at least the order name. I can also update or delete an order when you provide the order ID.',
                'suggestions' => [
                    'Create an order Renewal Order',
                    'Update order 5 status to Paid',
                    'Delete order 5',
                ],
            ],
            'automation' => [
                'message' => 'To create an automation, give me the automation name. I can create the draft and open the flow builder for you.',
                'suggestions' => [
                    'Create an automation Welcome Flow',
                    'Update automation 2 status to 1',
                    'Delete automation 2',
                ],
            ],
            'interactive message' => [
                'message' => 'To create an interactive message, I need the name and the option type. I can create the draft and open it for editing.',
                'suggestions' => [
                    'Create an interactive message Main Menu',
                    'Update interactive message 2 name to Support Menu',
                    'Delete interactive message 2',
                ],
            ],
            'role' => [
                'message' => 'To create a role, I need the role name. I can create the role and open it so you can review its permissions.',
                'suggestions' => [
                    'Create a role Sales Manager',
                    'Update role 2 name to Support Lead',
                    'Open roles',
                ],
            ],
            'api' => [
                'message' => 'To create an API key, I need the API key name. I can create it and open the detail page so you can review the generated token.',
                'suggestions' => [
                    'Create an api key Integration Token',
                    'Update api 2 name to Webhook Token',
                    'Delete api 2',
                ],
            ],
            'support request' => [
                'message' => 'To create a support request, I need the subject, type, and description. I can create it directly if you provide those details.',
                'suggestions' => [
                    'Create a support request Billing issue type technical with description invoice not loading',
                    'Update support request 2 status to Closed',
                    'Open support requests',
                ],
            ],
            'billing', 'wallet' => [
                'message' => 'In billing, I can explain your current plan, answer wallet questions, open billing areas, and change simple settings like auto topup when you ask directly.',
                'suggestions' => [
                    'What is my current plan?',
                    'Enable auto topup',
                    'Open billing',
                ],
            ],
            'campaign' => [
                'message' => 'To create a campaign, start with the campaign name, then define the audience or filters, choose the content, and review the schedule before launching.',
                'suggestions' => [
                    'Create a campaign called spring_sale',
                    'Open campaigns',
                    'Search campaigns for welcome',
                ],
            ],
            'template' => [
                'message' => 'To create a template, I need the account, category, and language. Once I have those, I can create the draft and open it for content editing.',
                'suggestions' => [
                    'Create a marketing template for Acme in English',
                    'How do template categories work?',
                    'Open templates',
                ],
            ],
            default => null,
        };
    }

    private function handleContactCreateIntent(Request $request, string $command, string $normalized): array
    {
        $fields = $this->extractContactFields($command, $normalized);

        return $this->executeContactCreate($request, $fields);
    }

    private function continueContactCreateIntent(Request $request, string $command, string $normalized, array $assistantState): array
    {
        $fields = array_merge($assistantState['fields'] ?? [], $this->extractContactFields($command, $normalized));

        return $this->executeContactCreate($request, $fields);
    }

    private function executeContactCreate(Request $request, array $fields): array
    {
        $fields = [
            'first_name' => trim((string) ($fields['first_name'] ?? '')),
            'last_name' => trim((string) ($fields['last_name'] ?? '')),
            'email' => trim((string) ($fields['email'] ?? '')),
            'phone_number' => trim((string) ($fields['phone_number'] ?? '')),
        ];

        if ($fields['last_name'] === '' && $fields['first_name'] !== '') {
            $fields['last_name'] = $fields['first_name'];
            $fields['first_name'] = '';
        }

        $validation = $this->validateManifestExecution('contacts', 'create_contact', $fields);
        if (!$validation['ok'] || $this->isPlaceholderNameValue($fields['last_name'])) {
            if ($this->isPlaceholderNameValue($fields['last_name'])) {
                $validation['ok'] = false;
                $validation['error_code'] = 'missing_fields';
                $validation['missing_fields'] = ['name'];
            }

            return array_merge(
                $this->buildExecutionFailureResponse(
                    'create_contact',
                    'contacts',
                    $fields,
                    $validation,
                    'I can create the contact for you. I still need at least the contact name. You can also include email or phone.',
                    [
                        'Create a contact John Doe',
                        'John Doe with email john@example.com',
                        'Mario Rossi phone +39 333 123 4567',
                    ]
                ),
                ['response_intent' => 'create_contact']
            );
        }

        $payload = $this->persistenceMapper()->mapCreatePayload('contacts', [
            'name' => trim(implode(' ', array_filter([$fields['first_name'], $fields['last_name']]))),
            'email' => $fields['email'],
            'phone_number' => $fields['phone_number'],
        ]);

        $contactId = (new ContactController())->saveContact($this->buildAssistantRequest($request, $payload));
        $contact = Contact::find($contactId);
        $displayName = trim(($contact?->first_name ?? $fields['first_name']) . ' ' . ($contact?->last_name ?? $fields['last_name']));

        return [
            'message' => "I created the contact {$displayName}. I'm opening it now.",
            'response_intent' => 'create_contact',
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('detailContact', ['id' => $contactId]),
            ],
            'suggestions' => [
                'Open contacts',
                "Search contacts for {$displayName}",
            ],
            'assistant_state' => null,
        ];
    }

    private function handleLeadCreateIntent(Request $request, string $command, string $normalized): array
    {
        $fields = $this->extractLeadFields($command, $normalized);

        return $this->executeLeadCreate($request, $fields);
    }

    private function continueLeadCreateIntent(Request $request, string $command, string $normalized, array $assistantState): array
    {
        $fields = array_merge($assistantState['fields'] ?? [], $this->extractLeadFields($command, $normalized));

        return $this->executeLeadCreate($request, $fields);
    }

    private function executeLeadCreate(Request $request, array $fields): array
    {
        $fields = [
            'name' => trim((string) ($fields['name'] ?? '')),
            'status' => trim((string) ($fields['status'] ?? '')),
        ];

        $validation = $this->validateManifestExecution('leads', 'create_lead', $fields);
        if (!$validation['ok']) {
            return $this->buildExecutionFailureResponse(
                'create_lead',
                'leads',
                $fields,
                $validation,
                'I can create the lead for you. I still need the lead name.',
                [
                    'Create a lead Acme Renewal',
                    'Acme Renewal',
                    'Create a lead New Opportunity',
                ]
            );
        }

        $payload = $this->persistenceMapper()->mapCreatePayload('leads', $fields);

        $leadId = (new LeadController())->saveLead($this->buildAssistantRequest($request, $payload));
        $lead = Lead::find($leadId);

        return [
            'message' => "I created the lead {$lead?->name}. I'm opening it now.",
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('detailLead', ['id' => $leadId]),
            ],
            'suggestions' => [
                'Open leads',
                "Search leads for {$lead?->name}",
            ],
            'assistant_state' => null,
        ];
    }

    private function handleProductCreateIntent(Request $request, string $command, string $normalized): array
    {
        return $this->executeProductCreate($request, $this->extractProductFields($command));
    }

    private function continueProductCreateIntent(Request $request, string $command, string $normalized, array $assistantState): array
    {
        return $this->executeProductCreate($request, array_merge($assistantState['fields'] ?? [], $this->extractProductFields($command)));
    }

    private function executeProductCreate(Request $request, array $fields): array
    {
        $fields = [
            'name' => trim((string) ($fields['name'] ?? '')),
            'price' => trim((string) ($fields['price'] ?? '')),
            'description' => trim((string) ($fields['description'] ?? '')),
            'availability' => $fields['availability'] ?? 1,
        ];

        $validation = $this->validateManifestExecution('products', 'create_product', $fields);
        if (!$validation['ok']) {
            return $this->buildExecutionFailureResponse(
                'create_product',
                'products',
                $validation['fields'],
                $validation,
                'I can create the product for you. I still need ' . implode(', ', $validation['missing_fields']) . '. Example: create a product Premium Plan for 99 with description Monthly subscription.',
                [
                    'Premium Plan for 99 with description Monthly subscription',
                    'Starter Bundle for 49 with description Entry plan',
                ]
            );
        }

        $fields = $validation['fields'];

        $productId = (new ProductController())->saveProduct($this->buildAssistantRequest($request, $this->persistenceMapper()->mapCreatePayload('products', $fields)));

        return [
            'message' => "I created the product {$fields['name']}. I'm opening it now.",
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('detailProduct', ['id' => $productId]),
            ],
            'assistant_state' => null,
        ];
    }

    private function handleOrderCreateIntent(Request $request, string $command, string $normalized): array
    {
        return $this->executeOrderCreate($request, $this->extractOrderFields($command));
    }

    private function continueOrderCreateIntent(Request $request, string $command, string $normalized, array $assistantState): array
    {
        return $this->executeOrderCreate($request, array_merge($assistantState['fields'] ?? [], $this->extractOrderFields($command)));
    }

    private function executeOrderCreate(Request $request, array $fields): array
    {
        $fields = [
            'name' => trim((string) ($fields['name'] ?? '')),
            'status' => trim((string) ($fields['status'] ?? '')),
            'description' => trim((string) ($fields['description'] ?? '')),
        ];

        $validation = $this->validateManifestExecution('orders', 'create_order', $fields);
        if (!$validation['ok']) {
            return $this->buildExecutionFailureResponse(
                'create_order',
                'orders',
                $fields,
                $validation,
                'I can create the order for you. I still need the order name.',
                [
                    'Create an order Renewal Order',
                    'Monthly Renewal',
                ]
            );
        }

        $orderId = (new OrderController())->saveOrder($this->buildAssistantRequest($request, $this->persistenceMapper()->mapCreatePayload('orders', $fields)));

        return [
            'message' => "I created the order {$fields['name']}. I'm opening it now.",
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('detailOrder', ['id' => $orderId]),
            ],
            'assistant_state' => null,
        ];
    }

    private function handleAutomationCreateIntent(Request $request, string $command, string $normalized): array
    {
        return $this->executeAutomationCreate($request, $this->extractAutomationFields($command));
    }

    private function continueAutomationCreateIntent(Request $request, string $command, string $normalized, array $assistantState): array
    {
        return $this->executeAutomationCreate($request, array_merge($assistantState['fields'] ?? [], $this->extractAutomationFields($command)));
    }

    private function executeAutomationCreate(Request $request, array $fields): array
    {
        $fields = [
            'name' => trim((string) ($fields['name'] ?? '')),
            'status' => (string) ($fields['status'] ?? '1'),
        ];

        $validation = $this->validateManifestExecution('automations', 'create_automation', $fields);
        if (!$validation['ok']) {
            return $this->buildExecutionFailureResponse(
                'create_automation',
                'automations',
                $validation['fields'],
                $validation,
                'I can create the automation for you. I still need the automation name.',
                [
                    'Create an automation Welcome Flow',
                    'Lead Routing Flow',
                ]
            );
        }

        $name = trim((string) ($validation['fields']['name'] ?? ''));
        $status = (string) ($validation['fields']['status'] ?? '1');

        $companyId = Cache::get('selected_company_' . $request->user()->id);
        $automation = new Automation();
        $automation->name = $name;
        $automation->status = $status;
        $automation->company_id = $companyId;
        $automation->uuid = (string) Str::uuid();
        $automation->save();

        return [
            'message' => "I created the automation {$automation->name}. I'm opening the flow builder now.",
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('createAutomation', ['id' => $automation->id]),
            ],
            'assistant_state' => null,
        ];
    }

    private function handleInteractiveMessageCreateIntent(Request $request, string $command, string $normalized): array
    {
        return $this->executeInteractiveMessageCreate($request, $this->extractInteractiveMessageFields($command, $normalized));
    }

    private function continueInteractiveMessageCreateIntent(Request $request, string $command, string $normalized, array $assistantState): array
    {
        return $this->executeInteractiveMessageCreate($request, array_merge($assistantState['fields'] ?? [], $this->extractInteractiveMessageFields($command, $normalized)));
    }

    private function executeInteractiveMessageCreate(Request $request, array $fields): array
    {
        $fields = [
            'name' => trim((string) ($fields['name'] ?? '')),
            'option_type' => trim((string) ($fields['option_type'] ?? 'button')),
            'is_active' => (string) ($fields['is_active'] ?? '1'),
        ];

        $validation = $this->validateManifestExecution('interactive_messages', 'create_interactive_message', $fields);
        if (!$validation['ok']) {
            return $this->buildExecutionFailureResponse(
                'create_interactive_message',
                'interactive_messages',
                $validation['fields'],
                $validation,
                'I can create the interactive message for you. I still need the message name.',
                [
                    'Create an interactive message Main Menu',
                    'Support Menu',
                ]
            );
        }

        $fields = $validation['fields'];

        $interactiveId = (new InteractiveMessageController())->saveInteractiveMessage($this->buildAssistantRequest($request, $this->persistenceMapper()->mapCreatePayload('interactive_messages', $fields)));

        return [
            'message' => "I created the interactive message {$fields['name']}. I'm opening it now.",
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('detailInteractiveMessage', ['id' => $interactiveId]),
            ],
            'assistant_state' => null,
        ];
    }

    private function handleRoleCreateIntent(Request $request, string $command, string $normalized): array
    {
        return $this->executeRoleCreate($this->extractRoleFields($command));
    }

    private function continueRoleCreateIntent(Request $request, string $command, string $normalized, array $assistantState): array
    {
        return $this->executeRoleCreate(array_merge($assistantState['fields'] ?? [], $this->extractRoleFields($command)));
    }

    private function executeRoleCreate(array $fields): array
    {
        $name = trim((string) ($fields['name'] ?? ''));
        $description = trim((string) ($fields['description'] ?? ''));

        $validation = $this->validateManifestExecution('roles', 'create_role', [
            'name' => $name,
            'description' => $description,
        ]);
        if (!$validation['ok']) {
            return $this->buildExecutionFailureResponse(
                'create_role',
                'roles',
                $validation['fields'],
                $validation,
                'I can create the role for you. I still need the role name.',
                [
                    'Create a role Sales Manager',
                    'Support Lead',
                ]
            );
        }

        $payload = $this->persistenceMapper()->mapCreatePayload('roles', ['name' => $name, 'description' => $description]);
        $role = new PermissionRole();
        $role->guard_name = 'web';
        $role->user = auth()->id();
        $role->name = $payload['name'];
        $role->description = $payload['description'];
        $role->save();

        return [
            'message' => "I created the role {$role->name}. I'm opening it now.",
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('detailRole', ['id' => $role->id]),
            ],
            'assistant_state' => null,
        ];
    }

    private function handleApiCreateIntent(Request $request, string $command, string $normalized): array
    {
        return $this->executeApiCreate($request, $this->extractApiFields($command));
    }

    private function continueApiCreateIntent(Request $request, string $command, string $normalized, array $assistantState): array
    {
        return $this->executeApiCreate($request, array_merge($assistantState['fields'] ?? [], $this->extractApiFields($command)));
    }

    private function executeApiCreate(Request $request, array $fields): array
    {
        $name = trim((string) ($fields['name'] ?? ''));

        $validation = $this->validateManifestExecution('api', 'create_api', ['name' => $name]);
        if (!$validation['ok']) {
            return $this->buildExecutionFailureResponse(
                'create_api',
                'api',
                $validation['fields'],
                $validation,
                'I can create the API key for you. I still need the API key name.',
                [
                    'Create an api key Integration Token',
                    'Webhook Token',
                ]
            );
        }

        $payload = $this->persistenceMapper()->mapCreatePayload('api', ['name' => $name]);
        $token = $request->user()->createToken('API_TOKEN');
        $api = new Api();
        $api->name = $payload['name'];
        $api->ip = [];
        $api->read_only = false;
        $api->write_only = false;
        $api->api_key = $token->plainTextToken;
        $api->save();

        return [
            'message' => "I created the API key {$api->name}. I'm opening it now.",
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('detailApi', ['id' => $api->id]),
            ],
            'assistant_state' => null,
        ];
    }

    private function handleSupportRequestCreateIntent(Request $request, string $command, string $normalized): array
    {
        return $this->executeSupportRequestCreate($request, $this->extractSupportRequestFields($command));
    }

    private function continueSupportRequestCreateIntent(Request $request, string $command, string $normalized, array $assistantState): array
    {
        return $this->executeSupportRequestCreate($request, array_merge($assistantState['fields'] ?? [], $this->extractSupportRequestFields($command)));
    }

    private function executeSupportRequestCreate(Request $request, array $fields): array
    {
        $fields = [
            'subject' => trim((string) ($fields['subject'] ?? '')),
            'type' => trim((string) ($fields['type'] ?? '')),
            'description' => trim((string) ($fields['description'] ?? '')),
        ];

        $validation = $this->validateManifestExecution('support_requests', 'create_support_request', $fields);
        if (!$validation['ok']) {
            return $this->buildExecutionFailureResponse(
                'create_support_request',
                'support_requests',
                $fields,
                $validation,
                'I can create the support request for you. I still need ' . implode(', ', $validation['missing_fields']) . '.',
                [
                    'Billing issue type technical with description invoice not loading',
                    'Access problem type support with description cannot log in',
                ]
            );
        }

        $supportId = (new SupportRequestController())->saveSupportRequest($this->buildAssistantRequest($request, $this->persistenceMapper()->mapCreatePayload('support_requests', $fields)));

        return [
            'message' => "I created support request {$fields['subject']}. I'm opening it now.",
            'action' => [
                'type' => 'visit',
                'url' => $this->appRoute('detailSupportRequest', ['id' => $supportId]),
            ],
            'assistant_state' => null,
        ];
    }

    private function handleUpdateRecordIntent(Request $request, string $command, string $normalized, string $module): array
    {
        $recordId = (string) ($this->extractFirstNumericValue($command) ?? '');
        $fieldUpdate = $this->extractUpdateFieldAndValue($command, $module);
        $normalizedModule = $this->normalizeTargetModule($module);
        $validation = $this->validateManifestExecution($normalizedModule, 'update_record', [
            'record_id' => $recordId,
            'field' => $fieldUpdate['field'] ?? '',
            'value' => $fieldUpdate['value'] ?? '',
        ]);

        if (!$validation['ok']) {
            return $this->buildExecutionFailureResponse(
                'update_record',
                $normalizedModule,
                array_filter([
                    'record_id' => $recordId,
                    'field' => $fieldUpdate['field'] ?? null,
                    'value' => $fieldUpdate['value'] ?? null,
                ], fn ($value) => $value !== null && $value !== ''),
                $validation,
                "I can update the {$module}, but I still need the record ID and the field change. Example: update {$module} 3 email to john@example.com.",
                [
                    "Update {$module} 1 name to New Name",
                    "Update {$module} 1 status to Active",
                ],
                [
                    'module' => $module,
                    'record_id' => $recordId,
                    'field' => $fieldUpdate['field'] ?? null,
                    'value' => $fieldUpdate['value'] ?? null,
                ]
            );
        }

        return $this->executeRecordUpdate($request, $module, $recordId, $fieldUpdate['field'], $fieldUpdate['value']);
    }

    private function continueUpdateRecordIntent(Request $request, string $command, string $normalized, array $assistantState): array
    {
        $module = (string) ($assistantState['module'] ?? '');
        $recordId = (string) ($assistantState['record_id'] ?? ($this->extractFirstNumericValue($command) ?? ''));
        $fieldUpdate = $this->extractUpdateFieldAndValue($command, $module);
        $field = $fieldUpdate['field'] ?? ($assistantState['field'] ?? '');
        $value = $fieldUpdate['value'] ?? ($assistantState['value'] ?? '');
        $normalizedModule = $this->normalizeTargetModule($module);
        $validation = $this->validateManifestExecution($normalizedModule, 'update_record', [
            'record_id' => $recordId,
            'field' => $field,
            'value' => $value,
        ]);

        if (!$validation['ok']) {
            return $this->buildExecutionFailureResponse(
                'update_record',
                $normalizedModule,
                array_filter([
                    'record_id' => $recordId,
                    'field' => $field,
                    'value' => $value,
                ], fn ($entry) => $entry !== ''),
                $validation,
                "I still need the {$module} record ID, the field name, and the new value to complete that update.",
                [
                    "Update {$module} 1 name to New Name",
                    "Update {$module} 1 status to Active",
                ],
                [
                    'module' => $module,
                    'record_id' => $recordId,
                    'field' => $field,
                    'value' => $value,
                ]
            );
        }

        return $this->executeRecordUpdate($request, $module, $recordId, $field, $value);
    }

    private function executeRecordUpdate(Request $request, string $module, string $recordId, string $field, string $value): array
    {
        $module = Str::lower(trim($module));
        $field = Str::lower(trim($field));
        $value = trim($value);
        $validation = $this->validateManifestExecution($module, 'update_record', [
            'record_id' => $recordId,
            'field' => $field,
            'value' => $value,
        ]);

        if (!$validation['ok']) {
            return $this->buildExecutionFailureResponse(
                'update_record',
                $module,
                [
                    'record_id' => $recordId,
                    'field' => $field,
                    'value' => $value,
                ],
                $validation,
                'I still need the module, record ID, field, and value to update that record.'
            );
        }

        $recordResolution = $this->recordResolver()->resolve($module, $recordId);
        if (!$recordResolution['ok']) {
            return $this->buildExecutionFailureResponse(
                'update_record',
                $module,
                ['record_id' => $recordId, 'field' => $field, 'value' => $value],
                [
                    'error_code' => $recordResolution['error_code'],
                    'missing_fields' => [],
                    'validation_errors' => ['record_id' => [$recordResolution['message']]],
                    'confirmation_required' => false,
                ],
                $recordResolution['message']
            );
        }

        $authorization = $this->actionAuthorizer()->authorize($request->user(), 'update_record', $module, $recordResolution['record']);
        if (!$authorization['ok']) {
            return $this->buildExecutionFailureResponse(
                'update_record',
                $module,
                ['record_id' => $recordId, 'field' => $field, 'value' => $value],
                $authorization,
                $authorization['message']
            );
        }

        return match ($module) {
            'contact' => $this->updateContactRecord($request, $recordId, $field, $value),
            'lead' => $this->updateLeadRecord($request, $recordId, $field, $value),
            'campaign' => $this->updateCampaignRecord($request, $recordId, $field, $value),
            'product' => $this->updateProductRecord($request, $recordId, $field, $value),
            'order' => $this->updateOrderRecord($request, $recordId, $field, $value),
            'automation' => $this->updateAutomationRecord($recordId, $field, $value),
            'interactive message' => $this->updateInteractiveMessageRecord($request, $recordId, $field, $value),
            'role' => $this->updateRoleRecord($recordId, $field, $value),
            'api' => $this->updateApiRecord($recordId, $field, $value),
            'support request' => $this->updateSupportRequestRecord($request, $recordId, $field, $value),
            default => [
                'message' => "I can open {$module} records, but structured updates are not wired yet for that module.",
                'assistant_state' => null,
                'tool_result' => [
                    'ok' => false,
                    'error_code' => 'unsupported_action',
                    'message' => "I can open {$module} records, but structured updates are not wired yet for that module.",
                    'missing_fields' => [],
                    'validation_errors' => ['module' => ['Update handler is not implemented for this module.']],
                    'confirmation_required' => false,
                ],
            ],
        };
    }

    private function handleDeleteRecordIntent(Request $request, string $command, string $normalized, string $module): array
    {
        $recordId = (string) ($this->extractFirstNumericValue($command) ?? '');
        $normalizedModule = $this->normalizeTargetModule($module);
        if ($recordId === '') {
            $validation = $this->validateManifestExecution($normalizedModule, 'delete_record', [
                'record_id' => $recordId,
            ]);

            return $this->buildExecutionFailureResponse(
                'delete_record',
                $normalizedModule,
                ['record_id' => $recordId],
                $validation,
                "I can delete the {$module}, but I still need the record ID.",
                [
                    "Delete {$module} 1",
                    "Open {$module} list",
                ],
                [
                    'confirmation_required' => true,
                    'module' => $module,
                ]
            );
        }

        return $this->executeRecordDelete($request, $module, $recordId, false);
    }

    private function handleBillingActionIntent(Request $request, string $command, string $normalized): ?array
    {
        if ($this->containsIntent($normalized, ['current plan', 'my plan', 'subscription plan'])) {
            $company = Company::first();
            $plan = $company?->plan ?: 'unknown';

            return [
                'message' => "Your current plan is {$plan}.",
                'suggestions' => [
                    'Open billing',
                    'Enable auto topup',
                ],
            ];
        }

        if ($this->containsIntent($normalized, ['enable auto topup', 'turn on auto topup'])) {
            $setting = Setting::firstOrNew(['meta_key' => 'auto_topup_status']);
            $setting->meta_value = base64_encode(serialize(true));
            $setting->save();

            return [
                'message' => 'I enabled auto topup.',
                'suggestions' => [
                    'Open billing',
                    'Disable auto topup',
                ],
            ];
        }

        if ($this->containsIntent($normalized, ['disable auto topup', 'turn off auto topup'])) {
            $setting = Setting::firstOrNew(['meta_key' => 'auto_topup_status']);
            $setting->meta_value = base64_encode(serialize(false));
            $setting->save();

            return [
                'message' => 'I disabled auto topup.',
                'suggestions' => [
                    'Open billing',
                    'Enable auto topup',
                ],
            ];
        }

        return null;
    }

    private function continueDeleteRecordIntent(Request $request, string $command, string $normalized, array $assistantState): array
    {
        $module = (string) ($assistantState['module'] ?? '');
        $recordId = (string) ($assistantState['record_id'] ?? ($this->extractFirstNumericValue($command) ?? ''));
        $confirmed = $this->containsIntent($normalized, ['yes', 'confirm', 'do it', 'delete it']) ? 'yes' : '';
        $validation = $this->validateManifestExecution($module, 'delete_record', [
            'record_id' => $recordId,
            'confirmation' => $confirmed,
        ]);

        if (($validation['missing_fields'] ?? []) === ['confirmation']) {
            return $this->executeRecordDelete($request, $module, $recordId, false);
        }

        if (!$validation['ok']) {
            return $this->buildExecutionFailureResponse(
                'delete_record',
                $module,
                array_filter([
                    'record_id' => $recordId,
                    'confirmation' => $confirmed,
                ]),
                $validation,
                "I still need the {$module} record ID before I can delete it."
            );
        }

        return $this->executeRecordDelete($request, $module, $recordId, true);
    }

    private function executeRecordDelete(Request $request, string $module, string $recordId, bool $confirmed): array
    {
        $module = Str::lower(trim($module));
        $validation = $this->validateManifestExecution($module, 'delete_record', [
            'record_id' => $recordId,
            'confirmation' => $confirmed ? 'yes' : '',
        ]);

        if (($validation['missing_fields'] ?? []) !== [] && in_array('confirmation', $validation['missing_fields'], true)) {
            return $this->buildExecutionFailureResponse(
                'delete_record',
                $module,
                ['record_id' => $recordId],
                $validation,
                "Please confirm that you want me to delete {$module} {$recordId}. Reply with yes to continue.",
                [
                    'yes',
                    "open {$module} {$recordId}",
                ],
                [
                    'module' => $module,
                    'record_id' => $recordId,
                    'confirmation_required' => true,
                ]
            );
        }

        if (!$validation['ok']) {
            return $this->buildExecutionFailureResponse(
                'delete_record',
                $module,
                ['record_id' => $recordId],
                $validation,
                'I still need the record ID before I can delete it.'
            );
        }

        $recordResolution = $this->recordResolver()->resolve($module, $recordId);
        if (!$recordResolution['ok']) {
            return $this->buildExecutionFailureResponse(
                'delete_record',
                $module,
                ['record_id' => $recordId],
                [
                    'error_code' => $recordResolution['error_code'],
                    'missing_fields' => [],
                    'validation_errors' => ['record_id' => [$recordResolution['message']]],
                    'confirmation_required' => false,
                ],
                $recordResolution['message']
            );
        }

        $authorization = $this->actionAuthorizer()->authorize($request->user(), 'delete_record', $module, $recordResolution['record']);
        if (!$authorization['ok']) {
            return $this->buildExecutionFailureResponse(
                'delete_record',
                $module,
                ['record_id' => $recordId],
                $authorization,
                $authorization['message']
            );
        }

        return match ($module) {
            'contact' => $this->deleteContactRecord($recordId),
            'lead' => $this->deleteLeadRecord($recordId),
            'campaign' => $this->deleteCampaignRecord($recordId),
            'product' => $this->deleteProductRecord($recordId),
            'order' => $this->deleteOrderRecord($recordId),
            'automation' => $this->deleteAutomationRecord($recordId),
            'interactive message' => $this->deleteInteractiveMessageRecord($recordId),
            'role' => $this->deleteRoleRecord($recordId),
            'api' => $this->deleteApiRecord($recordId),
            'support request' => $this->deleteSupportRequestRecord($recordId),
            default => [
                'message' => "Structured delete is not wired yet for {$module}.",
                'assistant_state' => null,
                'tool_result' => [
                    'ok' => false,
                    'error_code' => 'unsupported_action',
                    'message' => "Structured delete is not wired yet for {$module}.",
                    'missing_fields' => [],
                    'validation_errors' => ['module' => ['Delete handler is not implemented for this module.']],
                    'confirmation_required' => false,
                ],
            ],
        };
    }

    private function normalizeNaturalCommand(string $command): string
    {
        $normalized = Str::of($command)->lower()->squish()->value();

        $replacements = [
            'campain' => 'campaign',
            'campagin' => 'campaign',
            'campiagn' => 'campaign',
            'templete' => 'template',
            'tempalte' => 'template',
            'tamplate' => 'template',
            'serach' => 'search',
            'seach' => 'search',
            'dashbaord' => 'dashboard',
            'dashbord' => 'dashboard',
            'walet' => 'wallet',
            'billng' => 'billing',
            'contcat' => 'contact',
            'acount' => 'account',
            'engish' => 'english',
            'italan' => 'italian',
            'marketng' => 'marketing',
            'authentcation' => 'authentication',
            'utlity' => 'utility',
            'opne' => 'open',
            'mesage' => 'message',
            'sesions' => 'sessions',
            'automtion' => 'automation',
            'creat' => 'create',
            'crate' => 'create',
            'ceate' => 'create',
        ];

        foreach ($replacements as $wrong => $right) {
            $normalized = preg_replace('/\b' . preg_quote($wrong, '/') . '\b/', $right, $normalized);
        }

        return trim((string) $normalized);
    }

    private function containsIntent(string $haystack, array|string $needles): bool
    {
        foreach ((array) $needles as $needle) {
            if ($this->containsPhraseFuzzy($haystack, (string) $needle)) {
                return true;
            }
        }

        return false;
    }

    private function jsonAssistantResponse(array $response, array $page): JsonResponse
    {
        return response()->json($this->finalizeAssistantResponse($response, $page));
    }

    private function enrichAssistantPageContext(array $page, ?array $assistantState = null): array
    {
        $module = (string) ($page['module'] ?? $this->inferModuleFromPage($page) ?? '');
        $manifest = $this->resolvePageManifest($page, $module, $assistantState);

        if ($module !== '' && empty($page['module'])) {
            $page['module'] = $module;
        }

        $page['page_manifest_json'] = $manifest;
        $page['allowed_page_actions'] = $manifest['allowed_actions'] ?? ($page['allowed_page_actions'] ?? []);
        $page['page_validation_rules_json'] = $manifest['validation'] ?? ($page['page_validation_rules_json'] ?? []);

        return $page;
    }

    private function resolvePageManifest(array $page, string $module, ?array $assistantState = null): array
    {
        $route = Str::lower((string) ($page['route_name'] ?? ''));
        $title = Str::lower((string) ($page['title'] ?? ''));
        $component = Str::lower((string) ($page['component'] ?? ''));
        $url = Str::lower((string) ($page['url'] ?? ''));
        $task = (string) ($assistantState['active_task'] ?? $assistantState['intent'] ?? '');

        if (Str::contains($task, 'delete') || in_array($task, ['delete_record'], true)) {
            return $this->pageManifestRegistry()['destructive_actions'];
        }

        if ($module === 'template' || Str::contains($route . ' ' . $title . ' ' . $component . ' ' . $url, 'template')) {
            return $this->pageManifestRegistry()['templates'];
        }

        if ($module === 'campaign' || Str::contains($route . ' ' . $title . ' ' . $component . ' ' . $url, 'campaign')) {
            return $this->pageManifestRegistry()['campaigns'];
        }

        if ($module === 'contact' || Str::contains($route . ' ' . $title . ' ' . $component . ' ' . $url, 'contact')) {
            return $this->pageManifestRegistry()['contacts'];
        }

        if ($module === 'lead' || Str::contains($route . ' ' . $title . ' ' . $component . ' ' . $url, 'lead')) {
            return $this->pageManifestRegistry()['leads'];
        }

        if ($module === 'product' || Str::contains($route . ' ' . $title . ' ' . $component . ' ' . $url, 'product')) {
            return $this->pageManifestRegistry()['products'];
        }

        if ($module === 'order' || Str::contains($route . ' ' . $title . ' ' . $component . ' ' . $url, 'order')) {
            return $this->pageManifestRegistry()['orders'];
        }

        if ($module === 'automation' || Str::contains($route . ' ' . $title . ' ' . $component . ' ' . $url, 'automation')) {
            return $this->pageManifestRegistry()['automations'];
        }

        if ($module === 'account' || Str::contains($route . ' ' . $title . ' ' . $component . ' ' . $url, 'social_profile')) {
            return $this->pageManifestRegistry()['social_profiles'];
        }

        if ($module === 'chat' || Str::contains($route . ' ' . $title . ' ' . $component . ' ' . $url, 'chat')) {
            return $this->pageManifestRegistry()['chats'];
        }

        if ($module === 'interactive message' || Str::contains($route . ' ' . $title . ' ' . $component . ' ' . $url, 'interactive')) {
            return $this->pageManifestRegistry()['interactive_messages'];
        }

        if (in_array($module, ['wallet', 'billing'], true) || Str::contains($route . ' ' . $title . ' ' . $component . ' ' . $url, 'billing wallet')) {
            return $this->pageManifestRegistry()['billing'];
        }

        if ($module === 'role' || Str::contains($route . ' ' . $title . ' ' . $component . ' ' . $url, 'role')) {
            return $this->pageManifestRegistry()['roles'];
        }

        if (($module === 'api' || Str::contains($route . ' ' . $title . ' ' . $component . ' ' . $url, 'api key')) && !Str::contains($route . ' ' . $title . ' ' . $component . ' ' . $url, 'documentation')) {
            return $this->pageManifestRegistry()['api'];
        }

        if ($module === 'support request' || Str::contains($route . ' ' . $title . ' ' . $component . ' ' . $url, 'support request')) {
            return $this->pageManifestRegistry()['support_requests'];
        }

        if (($module === 'api' && Str::contains($route . ' ' . $title . ' ' . $component . ' ' . $url, 'documentation')) || Str::contains($route, 'api_documentation')) {
            return $this->pageManifestRegistry()['api_documentation'];
        }

        return [
            'module' => $module !== '' ? Str::plural($module) : 'dashboard',
            'page' => $route !== '' ? $route : 'dashboard',
            'allowed_actions' => $page['allowed_page_actions'] ?? ['navigate', 'search', 'answer_page_question'],
            'required_fields_by_action' => [],
            'validation' => $page['page_validation_rules_json'] ?? [],
        ];
    }

    private function pageManifestRegistry(): array
    {
        return [
            'campaigns' => [
                'module' => 'campaigns',
                'page' => 'campaigns.create',
                'allowed_actions' => ['create_campaign', 'navigate', 'search', 'open_page_action'],
                'required_fields_by_action' => [
                    'create_campaign' => ['name'],
                    'update_record' => ['record_id', 'field', 'value'],
                    'delete_record' => ['record_id', 'confirmation'],
                ],
                'optional_fields_by_action' => [
                    'create_campaign' => ['audience', 'template_id', 'schedule_at', 'notes'],
                ],
                'confirmation_required_by_action' => [
                    'delete_record' => true,
                ],
                'validation' => [
                    'name' => [
                        'pattern' => '^[A-Za-z0-9 _-]{3,120}$',
                        'hint' => 'Use a short internal campaign name.',
                    ],
                    'field' => [
                        'allowed' => ['name', 'status'],
                    ],
                    'value' => [
                        'hint' => 'Provide the new field value as plain text.',
                    ],
                    'audience' => [
                        'hint' => 'Pick a saved filter, contact list, or segment before launch.',
                    ],
                    'schedule_at' => [
                        'hint' => 'Use a future date and time or leave empty for draft.',
                    ],
                ],
            ],
            'templates' => [
                'module' => 'templates',
                'page' => 'templates.create',
                'allowed_actions' => ['create_template', 'navigate', 'search', 'edit_template_content', 'open_page_action'],
                'required_fields_by_action' => [
                    'create_template' => ['account_id', 'category', 'language'],
                ],
                'optional_fields_by_action' => [
                    'create_template' => ['name'],
                ],
                'validation' => [
                    'name' => [
                        'pattern' => '^[a-z0-9_]+$',
                        'hint' => 'lowercase letters, numbers, underscores only',
                    ],
                    'category' => [
                        'allowed' => ['marketing', 'utility', 'authentication'],
                    ],
                    'language' => [
                        'allowed' => ['en', 'it', 'es', 'fr', 'de'],
                    ],
                    'account_id' => [
                        'hint' => 'Must be a connected social profile owned by the current workspace.',
                    ],
                ],
            ],
            'social_profiles' => [
                'module' => 'social_profiles',
                'page' => 'social_profile',
                'allowed_actions' => ['navigate', 'search', 'open_page_action', 'answer_page_question'],
                'required_fields_by_action' => [
                    'select_profile' => ['account_id'],
                ],
                'validation' => [
                    'account_id' => [
                        'hint' => 'Must match a connected social profile visible to the user.',
                    ],
                    'service' => [
                        'allowed' => ['whatsapp', 'facebook', 'instagram', 'telegram'],
                    ],
                ],
            ],
            'chats' => [
                'module' => 'chats',
                'page' => 'chat_list',
                'allowed_actions' => ['navigate', 'search', 'answer_page_question', 'open_page_action'],
                'required_fields_by_action' => [
                    'open_chat' => ['contact_id'],
                ],
                'validation' => [
                    'contact_id' => [
                        'hint' => 'Use a visible contact or chat thread from the current list.',
                    ],
                    'search' => [
                        'hint' => 'Search defaults to contact name, number, or recent message text.',
                    ],
                ],
            ],
            'contacts' => [
                'module' => 'contacts',
                'page' => 'contacts.create',
                'allowed_actions' => ['create_contact', 'update_record', 'delete_record', 'navigate', 'search', 'open_page_action'],
                'required_fields_by_action' => [
                    'create_contact' => ['name'],
                    'update_record' => ['record_id', 'field', 'value'],
                    'delete_record' => ['record_id', 'confirmation'],
                ],
                'optional_fields_by_action' => [
                    'create_contact' => ['email', 'phone_number'],
                ],
                'confirmation_required_by_action' => [
                    'delete_record' => true,
                ],
                'validation' => [
                    'name' => [
                        'pattern' => '^.{2,120}$',
                        'hint' => 'Provide at least a first or last name.',
                    ],
                    'field' => [
                        'allowed' => ['name', 'email', 'phone_number'],
                    ],
                    'email' => [
                        'pattern' => '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
                    ],
                    'phone_number' => [
                        'pattern' => '^\\+?[0-9\\s\\-\\(\\)]{7,30}$',
                    ],
                ],
            ],
            'leads' => [
                'module' => 'leads',
                'page' => 'leads.create',
                'allowed_actions' => ['create_lead', 'update_record', 'delete_record', 'navigate', 'search', 'open_page_action'],
                'required_fields_by_action' => [
                    'create_lead' => ['name'],
                    'update_record' => ['record_id', 'field', 'value'],
                    'delete_record' => ['record_id', 'confirmation'],
                ],
                'optional_fields_by_action' => [
                    'create_lead' => ['status'],
                ],
                'confirmation_required_by_action' => [
                    'delete_record' => true,
                ],
                'validation' => [
                    'name' => [
                        'pattern' => '^.{2,120}$',
                    ],
                    'field' => [
                        'allowed' => ['name', 'status'],
                    ],
                ],
            ],
            'products' => [
                'module' => 'products',
                'page' => 'products.create',
                'allowed_actions' => ['create_product', 'update_record', 'delete_record', 'navigate', 'search', 'open_page_action'],
                'required_fields_by_action' => [
                    'create_product' => ['name', 'price', 'description'],
                    'update_record' => ['record_id', 'field', 'value'],
                    'delete_record' => ['record_id', 'confirmation'],
                ],
                'optional_fields_by_action' => [
                    'create_product' => ['availability'],
                ],
                'safe_defaults_by_action' => [
                    'create_product' => ['availability' => 1],
                ],
                'confirmation_required_by_action' => [
                    'delete_record' => true,
                ],
                'validation' => [
                    'name' => [
                        'pattern' => '^.{2,120}$',
                    ],
                    'price' => [
                        'pattern' => '^[0-9]+(?:\\.[0-9]+)?$',
                    ],
                    'field' => [
                        'allowed' => ['name', 'price', 'description', 'availability'],
                    ],
                    'availability' => [
                        'allowed' => [0, 1, '0', '1'],
                    ],
                ],
            ],
            'orders' => [
                'module' => 'orders',
                'page' => 'orders.create',
                'allowed_actions' => ['create_order', 'update_record', 'delete_record', 'navigate', 'search', 'open_page_action'],
                'required_fields_by_action' => [
                    'create_order' => ['name'],
                    'update_record' => ['record_id', 'field', 'value'],
                    'delete_record' => ['record_id', 'confirmation'],
                ],
                'optional_fields_by_action' => [
                    'create_order' => ['status', 'description', 'due_date'],
                ],
                'confirmation_required_by_action' => [
                    'delete_record' => true,
                ],
                'validation' => [
                    'name' => [
                        'pattern' => '^.{2,120}$',
                    ],
                    'field' => [
                        'allowed' => ['name', 'status', 'description', 'due_date'],
                    ],
                ],
            ],
            'automations' => [
                'module' => 'automations',
                'page' => 'automations.create',
                'allowed_actions' => ['create_automation', 'update_record', 'delete_record', 'navigate', 'search', 'open_page_action'],
                'required_fields_by_action' => [
                    'create_automation' => ['name'],
                    'update_record' => ['record_id', 'field', 'value'],
                    'delete_record' => ['record_id', 'confirmation'],
                ],
                'optional_fields_by_action' => [
                    'create_automation' => ['status'],
                ],
                'safe_defaults_by_action' => [
                    'create_automation' => ['status' => '1'],
                ],
                'confirmation_required_by_action' => [
                    'delete_record' => true,
                ],
                'validation' => [
                    'name' => [
                        'pattern' => '^.{2,120}$',
                    ],
                    'field' => [
                        'allowed' => ['name', 'status', 'trigger_mode'],
                    ],
                    'status' => [
                        'allowed' => ['0', '1', 0, 1],
                    ],
                ],
            ],
            'interactive_messages' => [
                'module' => 'interactive_messages',
                'page' => 'interactive_messages.create',
                'allowed_actions' => ['create_interactive_message', 'navigate', 'search', 'open_page_action'],
                'required_fields_by_action' => [
                    'create_interactive_message' => ['name'],
                    'update_record' => ['record_id', 'field', 'value'],
                    'delete_record' => ['record_id', 'confirmation'],
                ],
                'optional_fields_by_action' => [
                    'create_interactive_message' => ['option_type', 'is_active'],
                ],
                'safe_defaults_by_action' => [
                    'create_interactive_message' => ['option_type' => 'button', 'is_active' => '1'],
                ],
                'confirmation_required_by_action' => [
                    'delete_record' => true,
                ],
                'validation' => [
                    'name' => [
                        'pattern' => '^.{3,120}$',
                        'hint' => 'Provide a clear internal name.',
                    ],
                    'field' => [
                        'allowed' => ['name', 'option_type', 'is_active'],
                    ],
                    'option_type' => [
                        'allowed' => ['button', 'list', 'list_option'],
                    ],
                    'is_active' => [
                        'allowed' => ['0', '1', 0, 1],
                    ],
                ],
            ],
            'billing' => [
                'module' => 'billing',
                'page' => 'wallet',
                'allowed_actions' => ['navigate', 'answer_page_question', 'search', 'open_page_action'],
                'required_fields_by_action' => [
                    'set_auto_topup' => ['status'],
                ],
                'validation' => [
                    'status' => [
                        'allowed' => [0, 1, '0', '1', false, true],
                    ],
                    'payment_method_id' => [
                        'hint' => 'Must reference a saved payment method on the current workspace.',
                    ],
                ],
            ],
            'roles' => [
                'module' => 'roles',
                'page' => 'roles.create',
                'allowed_actions' => ['create_role', 'navigate', 'search', 'open_page_action'],
                'required_fields_by_action' => [
                    'create_role' => ['name'],
                    'update_record' => ['record_id', 'field', 'value'],
                    'delete_record' => ['record_id', 'confirmation'],
                ],
                'optional_fields_by_action' => [
                    'create_role' => ['description'],
                ],
                'confirmation_required_by_action' => [
                    'delete_record' => true,
                ],
                'validation' => [
                    'name' => [
                        'pattern' => '^[A-Za-z0-9 _-]{3,120}$',
                        'hint' => 'Use a unique role name.',
                    ],
                    'field' => [
                        'allowed' => ['name', 'description'],
                    ],
                ],
            ],
            'api' => [
                'module' => 'api',
                'page' => 'api.create',
                'allowed_actions' => ['create_api', 'update_record', 'delete_record', 'navigate', 'search', 'open_page_action'],
                'required_fields_by_action' => [
                    'create_api' => ['name'],
                    'update_record' => ['record_id', 'field', 'value'],
                    'delete_record' => ['record_id', 'confirmation'],
                ],
                'confirmation_required_by_action' => [
                    'delete_record' => true,
                ],
                'validation' => [
                    'name' => [
                        'pattern' => '^.{2,120}$',
                    ],
                    'field' => [
                        'allowed' => ['name'],
                    ],
                ],
            ],
            'support_requests' => [
                'module' => 'support_requests',
                'page' => 'support_requests.create',
                'allowed_actions' => ['create_support_request', 'update_record', 'delete_record', 'navigate', 'search', 'open_page_action'],
                'required_fields_by_action' => [
                    'create_support_request' => ['subject', 'type', 'description'],
                    'update_record' => ['record_id', 'field', 'value'],
                    'delete_record' => ['record_id', 'confirmation'],
                ],
                'optional_fields_by_action' => [
                    'create_support_request' => ['status'],
                ],
                'confirmation_required_by_action' => [
                    'delete_record' => true,
                ],
                'validation' => [
                    'subject' => [
                        'pattern' => '^.{3,160}$',
                    ],
                    'type' => [
                        'allowed' => ['technical', 'support', 'billing', 'general'],
                    ],
                    'field' => [
                        'allowed' => ['subject', 'type', 'description', 'status'],
                    ],
                ],
            ],
            'api_documentation' => [
                'module' => 'api_documentation',
                'page' => 'api_documentation',
                'allowed_actions' => ['navigate', 'search', 'answer_page_question'],
                'required_fields_by_action' => [],
                'validation' => [
                    'topic' => [
                        'allowed' => ['authentication', 'messages', 'templates', 'webhooks', 'rate_limits'],
                    ],
                ],
            ],
            'destructive_actions' => [
                'module' => 'destructive_actions',
                'page' => 'confirm_delete',
                'allowed_actions' => ['delete_record', 'navigate'],
                'required_fields_by_action' => [
                    'delete_record' => ['module', 'record_id', 'confirmation'],
                ],
                'validation' => [
                    'confirmation' => [
                        'allowed' => ['yes', 'confirm', 'delete'],
                        'hint' => 'Require explicit confirmation before deleting.',
                    ],
                    'record_id' => [
                        'hint' => 'Must reference an existing visible record.',
                    ],
                ],
            ],
        ];
    }

    private function resolveExecutionManifest(string $module): ?array
    {
        $normalizedModule = $this->normalizeTargetModule($module);
        $registry = $this->pageManifestRegistry();

        return $registry[$normalizedModule] ?? null;
    }

    private function prepareManifestFields(string $module, string $action, array $fields): array
    {
        $normalizedModule = $this->normalizeTargetModule($module);
        $prepared = $fields;

        // These field aliases are execution-specific model mappings and are not yet expressible in the manifest itself.
        if ($normalizedModule === 'contacts' && $action === 'create_contact') {
            $prepared['name'] = trim(implode(' ', array_filter([
                trim((string) ($fields['first_name'] ?? '')),
                trim((string) ($fields['last_name'] ?? '')),
            ])));
        }

        if ($normalizedModule === 'templates' && $action === 'create_template') {
            $prepared['language'] = is_array($fields['languages'] ?? null)
                ? (string) (($fields['languages'][0] ?? ''))
                : trim((string) ($fields['language'] ?? ''));
        }

        return $prepared;
    }

    private function validateManifestExecution(string $module, string $action, array $fields): array
    {
        $manifest = $this->resolveExecutionManifest($module);
        if (!$manifest) {
            return [
                'ok' => false,
                'error_code' => 'manifest_missing',
                'message' => "No execution manifest is defined for {$module}.",
                'missing_fields' => [],
                'validation_errors' => ['manifest' => ['Execution manifest missing for module.']],
                'confirmation_required' => false,
                'fields' => $fields,
                'manifest' => null,
            ];
        }

        $preparedFields = array_merge(
            $manifest['safe_defaults_by_action'][$action] ?? [],
            $this->prepareManifestFields($module, $action, $fields)
        );
        $requiredFields = array_values($manifest['required_fields_by_action'][$action] ?? []);
        $validationRules = $manifest['validation'] ?? [];
        $missingFields = [];
        $validationErrors = [];

        if (!array_key_exists($action, $manifest['required_fields_by_action'] ?? [])) {
            return [
                'ok' => false,
                'error_code' => 'unsupported_action',
                'message' => "The action {$action} is not supported for {$module}.",
                'missing_fields' => [],
                'validation_errors' => ['action' => ['Action is not allowed by the manifest.']],
                'confirmation_required' => false,
                'fields' => $preparedFields,
                'manifest' => $manifest,
            ];
        }

        foreach ($requiredFields as $field) {
            if (!$this->hasManifestValue($preparedFields[$field] ?? null)) {
                $missingFields[] = $field;
            }
        }

        foreach ($validationRules as $field => $rules) {
            if (!$this->hasManifestValue($preparedFields[$field] ?? null)) {
                continue;
            }

            $value = $preparedFields[$field];

            if (isset($rules['allowed'])) {
                $allowed = array_map('strval', (array) $rules['allowed']);
                $values = is_array($value) ? array_map('strval', $value) : [strval($value)];
                foreach ($values as $candidate) {
                    if (!in_array($candidate, $allowed, true)) {
                        $validationErrors[$field][] = $rules['hint'] ?? 'Value is not allowed.';
                        break;
                    }
                }
            }

            if (isset($rules['pattern']) && !is_array($value)) {
                $pattern = '/'.$rules['pattern'].'/u';
                if (@preg_match($pattern, (string) $value) !== 1) {
                    $validationErrors[$field][] = $rules['hint'] ?? 'Value format is invalid.';
                }
            }
        }

        $confirmationRequired = (bool) (($manifest['confirmation_required_by_action'][$action] ?? false) === true);

        return [
            'ok' => $missingFields === [] && $validationErrors === [],
            'error_code' => $missingFields !== [] ? 'missing_fields' : ($validationErrors !== [] ? 'validation_failed' : null),
            'message' => '',
            'missing_fields' => $missingFields,
            'validation_errors' => $validationErrors,
            'confirmation_required' => $confirmationRequired,
            'fields' => $preparedFields,
            'manifest' => $manifest,
        ];
    }

    private function hasManifestValue(mixed $value): bool
    {
        if (is_array($value)) {
            return $value !== [];
        }

        if (is_bool($value)) {
            return $value;
        }

        return trim((string) $value) !== '';
    }

    private function buildExecutionFailureResponse(
        string $task,
        string $module,
        array $fields,
        array $validation,
        string $message,
        array $suggestions = [],
        array $stateOverrides = []
    ): array {
        $normalizedModule = $this->normalizeTargetModule($module);

        return [
            'message' => $message,
            'suggestions' => $suggestions,
            'assistant_state' => $this->buildTaskAssistantState(
                $task,
                $normalizedModule,
                $fields,
                $validation['missing_fields'] ?? [],
                array_merge([
                    'confirmation_required' => (bool) ($validation['confirmation_required'] ?? false),
                ], $stateOverrides)
            ),
            'tool_result' => [
                'ok' => false,
                'error_code' => $validation['error_code'] ?? 'validation_failed',
                'message' => $message,
                'missing_fields' => array_values($validation['missing_fields'] ?? []),
                'validation_errors' => $validation['validation_errors'] ?? [],
                'confirmation_required' => (bool) ($validation['confirmation_required'] ?? false),
            ],
        ];
    }

    private function templateAccountResolver(): TemplateAccountResolver
    {
        return app(TemplateAccountResolver::class);
    }

    private function actionAuthorizer(): AssistantActionAuthorizer
    {
        return app(AssistantActionAuthorizer::class);
    }

    private function persistenceMapper(): AssistantPersistenceMapper
    {
        return app(AssistantPersistenceMapper::class);
    }

    private function recordResolver(): AssistantRecordResolver
    {
        return app(AssistantRecordResolver::class);
    }

    private function dataQueryService(): AssistantDataQueryService
    {
        return app(AssistantDataQueryService::class);
    }

    private function finalizeAssistantResponse(array $response, array $page): array
    {
        $response['assistant_state'] = $this->normalizeAssistantState(
            $response['assistant_state'] ?? null,
            $page,
            [
                'action' => $response['action'] ?? null,
                'message' => $response['message'] ?? null,
            ]
        );

        $response['tool_result'] = $this->buildNormalizedToolResult($response);

        if (is_array($response['assistant_state'] ?? null)) {
            $response['assistant_state']['last_tool_result'] = $response['tool_result'];
        }

        $response['assistant_response'] = $this->buildStructuredAssistantResponse($response, $page);
        $response['message'] = $response['assistant_response']['reply'];
        $response['action'] = $response['assistant_response']['action'];
        $response['intent'] = $response['assistant_response']['intent'];
        $response['status'] = $response['assistant_response']['status'];
        $response['target_module'] = $response['assistant_response']['target_module'];
        $response['missing_fields'] = $response['assistant_response']['missing_fields'];
        $response['collected_fields'] = $response['assistant_response']['collected_fields'];
        $response['validation_errors'] = $response['assistant_response']['validation_errors'];
        $response['confirmation_required'] = $response['assistant_response']['confirmation_required'];
        $response['suggestions'] = array_values($response['suggestions'] ?? []);
        $response['assistant_state'] = $response['assistant_response']['assistant_state'];

        return $response;
    }

    private function buildStructuredAssistantResponse(array $response, array $page): array
    {
        $assistantState = is_array($response['assistant_state'] ?? null) ? $response['assistant_state'] : null;
        $action = is_array($response['action'] ?? null) ? $response['action'] : null;
        $missingFields = array_values(array_filter((array) ($assistantState['missing_fields'] ?? $assistantState['missing'] ?? []), fn ($value) => $value !== null && $value !== ''));
        $collectedFields = is_array($assistantState['collected_fields'] ?? null)
            ? $assistantState['collected_fields']
            : (is_array($assistantState['fields'] ?? null) ? $assistantState['fields'] : []);

        $intent = (string) (
            $response['response_intent']
            ?? $assistantState['active_task']
            ?? $assistantState['intent']
            ?? ($action ? 'navigate' : 'respond')
        );

        $targetModule = (string) (
            $assistantState['target_module']
            ?? ($page['page_manifest_json']['module'] ?? $page['module'] ?? '')
        );

        $status = $this->resolveStructuredAssistantStatus($assistantState, $action, $missingFields);

        return [
            'intent' => $intent,
            'status' => $status,
            'reply' => (string) ($response['message'] ?? ''),
            'target_module' => $targetModule,
            'action' => $action,
            'missing_fields' => $missingFields,
            'collected_fields' => $collectedFields,
            'validation_errors' => is_array($response['tool_result']['validation_errors'] ?? null) ? $response['tool_result']['validation_errors'] : [],
            'confirmation_required' => (bool) ($assistantState['confirmation_required'] ?? false),
            'assistant_state' => $assistantState,
        ];
    }

    private function resolveStructuredAssistantStatus(?array $assistantState, ?array $action, array $missingFields): string
    {
        if ($missingFields !== []) {
            return 'needs_input';
        }

        if (($assistantState['confirmation_required'] ?? false) === true) {
            return 'needs_confirmation';
        }

        if ($action !== null) {
            return 'completed';
        }

        if ($assistantState !== null) {
            return (string) ($assistantState['task_status'] ?? 'in_progress');
        }

        return 'completed';
    }

    private function buildNormalizedToolResult(array $response): array
    {
        if (is_array($response['tool_result'] ?? null)) {
            return array_merge([
                'ok' => false,
                'error_code' => null,
                'message' => (string) ($response['message'] ?? ''),
                'missing_fields' => [],
                'validation_errors' => [],
                'confirmation_required' => false,
                'record_id' => null,
                'record_name' => null,
                'next_action' => null,
            ], $response['tool_result']);
        }

        $message = (string) ($response['message'] ?? '');
        $assistantState = is_array($response['assistant_state'] ?? null) ? $response['assistant_state'] : null;
        $action = is_array($response['action'] ?? null) ? $response['action'] : null;
        $missingFields = array_values(array_filter((array) ($assistantState['missing_fields'] ?? $assistantState['missing'] ?? []), fn ($value) => $value !== null && $value !== ''));
        $createdRecordId = $assistantState['created_record_id'] ?? null;

        if ($missingFields !== []) {
            return [
                'ok' => false,
                'error_code' => 'missing_fields',
                'message' => $message,
                'missing_fields' => $missingFields,
                'validation_errors' => [],
                'confirmation_required' => false,
            ];
        }

        if (($assistantState['confirmation_required'] ?? false) === true) {
            return [
                'ok' => false,
                'error_code' => 'confirmation_required',
                'message' => $message,
                'missing_fields' => [],
                'validation_errors' => [],
                'confirmation_required' => true,
            ];
        }

        if (Str::contains(Str::lower($message), ['could not find', 'cannot find', 'not found'])) {
            return [
                'ok' => false,
                'error_code' => 'not_found',
                'message' => $message,
                'missing_fields' => [],
                'validation_errors' => [],
                'confirmation_required' => false,
            ];
        }

        if ($action !== null || $createdRecordId !== null) {
            return [
                'ok' => true,
                'message' => $message,
                'missing_fields' => [],
                'validation_errors' => [],
                'confirmation_required' => false,
                'record_id' => $createdRecordId,
                'record_name' => $this->extractRecordNameFromMessage($message),
                'next_action' => $action,
            ];
        }

        return [
            'ok' => true,
            'message' => $message,
            'missing_fields' => [],
            'validation_errors' => [],
            'confirmation_required' => false,
            'record_id' => null,
            'record_name' => null,
            'next_action' => null,
        ];
    }

    private function extractRecordNameFromMessage(string $message): ?string
    {
        if (preg_match('/I (?:created|updated|deleted) (?:the )?(?:draft )?(?:contact|lead|campaign|template|product|order|automation|interactive message|role|api key|support request) ([^.]+)/i', $message, $matches) === 1) {
            return trim($matches[1]);
        }

        return null;
    }

    private function normalizeAssistantState(?array $state, array $page = [], ?array $lastToolResult = null): ?array
    {
        if (!is_array($state) || $state === []) {
            return null;
        }

        if (!empty($state['active_task'])) {
            return $this->inflateNormalizedAssistantState($state, $page, $lastToolResult);
        }

        return $this->convertLegacyAssistantState($state, $page, $lastToolResult);
    }

    private function inflateNormalizedAssistantState(array $state, array $page = [], ?array $lastToolResult = null): array
    {
        $activeTask = (string) ($state['active_task'] ?? '');
        $collectedFields = is_array($state['collected_fields'] ?? null) ? $state['collected_fields'] : [];
        $missingFields = array_values(array_filter((array) ($state['missing_fields'] ?? []), fn ($value) => $value !== null && $value !== ''));
        $optionalFields = array_values(array_filter((array) ($state['optional_fields'] ?? []), fn ($value) => $value !== null && $value !== ''));
        $targetModule = $this->normalizeTargetModule((string) ($state['target_module'] ?? ''));
        $targetRoute = $state['target_route'] ?? $this->assistantTargetRoute($activeTask, $targetModule);
        $taskStatus = (string) ($state['task_status'] ?? ($missingFields ? 'collecting_fields' : 'ready'));
        $lastOpenedPage = $state['last_opened_page'] ?? ($page['module'] ?? $page['title'] ?? null);
        $resolvedLastToolResult = array_key_exists('last_tool_result', $state)
            ? $state['last_tool_result']
            : ($lastToolResult ?? ($page['last_result_json_or_null'] ?? null));

        return array_merge($state, [
            'active_task' => $activeTask,
            'task_status' => $taskStatus,
            'target_module' => $targetModule,
            'target_route' => $targetRoute,
            'collected_fields' => $collectedFields,
            'missing_fields' => $missingFields,
            'optional_fields' => $optionalFields,
            'confirmation_required' => (bool) ($state['confirmation_required'] ?? false),
            'last_user_goal' => (string) ($state['last_user_goal'] ?? Str::replace('_', ' ', $activeTask)),
            'last_opened_page' => $lastOpenedPage,
            'last_tool_result' => $resolvedLastToolResult,
            'created_record_id' => $state['created_record_id'] ?? null,
            // Backward-compatible aliases still used by existing controller logic.
            'intent' => $state['intent'] ?? $activeTask,
            'fields' => $state['fields'] ?? $collectedFields,
            'missing' => $state['missing'] ?? $missingFields,
            'module' => $state['module'] ?? $this->normalizeLegacyModuleName($targetModule),
            'record_id' => $state['record_id'] ?? ($collectedFields['record_id'] ?? null),
            'field' => $state['field'] ?? ($collectedFields['field'] ?? null),
            'value' => $state['value'] ?? ($collectedFields['value'] ?? null),
            'account_id' => $state['account_id'] ?? ($collectedFields['account_id'] ?? null),
            'account_name' => $state['account_name'] ?? ($collectedFields['account_name'] ?? null),
            'pending' => $state['pending'] ?? null,
            'template_id' => $state['template_id'] ?? ($collectedFields['template_id'] ?? null),
        ]);
    }

    private function convertLegacyAssistantState(array $state, array $page = [], ?array $lastToolResult = null): array
    {
        $intent = (string) ($state['intent'] ?? '');
        $fields = is_array($state['fields'] ?? null) ? $state['fields'] : [];

        foreach (['record_id', 'field', 'value', 'account_id', 'account_name', 'template_id'] as $key) {
            if (array_key_exists($key, $state) && $state[$key] !== null && $state[$key] !== '') {
                $fields[$key] = $state[$key];
            }
        }

        $activeTask = $intent !== '' ? $intent : 'unknown_task';
        $targetModule = $this->normalizeTargetModule((string) ($state['module'] ?? $page['module'] ?? ''));
        $missing = array_values(array_filter((array) ($state['missing'] ?? []), fn ($value) => $value !== null && $value !== ''));
        $optional = $this->defaultOptionalFieldsForTask($activeTask);
        $taskStatus = $state['task_status']
            ?? ($missing ? 'collecting_fields' : (($intent === 'delete_record' && !empty($fields['record_id'])) ? 'awaiting_confirmation' : 'ready'));

        return $this->inflateNormalizedAssistantState([
            'active_task' => $activeTask,
            'task_status' => $taskStatus,
            'target_module' => $targetModule,
            'target_route' => $this->assistantTargetRoute($activeTask, $targetModule),
            'collected_fields' => $fields,
            'missing_fields' => $missing,
            'optional_fields' => $optional,
            'confirmation_required' => (bool) ($state['confirmation_required'] ?? $intent === 'delete_record'),
            'last_user_goal' => (string) ($state['last_user_goal'] ?? Str::replace('_', ' ', $activeTask)),
            'last_opened_page' => $state['last_opened_page'] ?? ($page['module'] ?? $page['title'] ?? null),
            'last_tool_result' => $state['last_tool_result'] ?? ($lastToolResult ?? ($page['last_result_json_or_null'] ?? null)),
            'created_record_id' => $state['created_record_id'] ?? null,
            'intent' => $intent,
            'fields' => $fields,
            'missing' => $missing,
            'module' => $state['module'] ?? $this->normalizeLegacyModuleName($targetModule),
            'record_id' => $state['record_id'] ?? null,
            'field' => $state['field'] ?? null,
            'value' => $state['value'] ?? null,
            'account_id' => $state['account_id'] ?? null,
            'account_name' => $state['account_name'] ?? null,
            'pending' => $state['pending'] ?? null,
            'template_id' => $state['template_id'] ?? null,
        ], $page, $lastToolResult);
    }

    private function assistantTargetRoute(string $activeTask, string $targetModule): ?string
    {
        return match ($activeTask) {
            'create_campaign' => 'campaigns.create',
            'create_template' => 'templates.create',
            'create_contact' => 'contacts.create',
            'create_lead' => 'leads.create',
            'create_product' => 'products.create',
            'create_order' => 'orders.create',
            'create_automation' => 'automations.create',
            'create_interactive_message' => 'interactive-messages.create',
            'create_role' => 'roles.create',
            'create_api' => 'api.create',
            'create_support_request' => 'support-requests.create',
            'update_record' => $targetModule !== '' ? $targetModule . '.edit' : null,
            'delete_record' => $targetModule !== '' ? $targetModule . '.delete' : null,
            'page_action' => $targetModule !== '' ? $targetModule . '.open' : null,
            'edit_template_content' => 'templates.edit',
            default => $targetModule !== '' ? $targetModule . '.index' : null,
        };
    }

    private function normalizeTargetModule(string $module): string
    {
        $module = trim(Str::lower($module));

        return match ($module) {
            'campaign', 'campaigns' => 'campaigns',
            'template', 'templates' => 'templates',
            'contact', 'contacts' => 'contacts',
            'lead', 'leads' => 'leads',
            'product', 'products' => 'products',
            'order', 'orders' => 'orders',
            'automation', 'automations' => 'automations',
            'interactive message', 'interactive messages' => 'interactive_messages',
            'role', 'roles' => 'roles',
            'api', 'apis', 'api key', 'api keys' => 'api',
            'support request', 'support requests' => 'support_requests',
            'wallet', 'billing' => 'billing',
            default => $module,
        };
    }

    private function normalizeLegacyModuleName(string $targetModule): string
    {
        return match ($targetModule) {
            'campaigns' => 'campaign',
            'templates' => 'template',
            'contacts' => 'contact',
            'leads' => 'lead',
            'products' => 'product',
            'orders' => 'order',
            'automations' => 'automation',
            'interactive_messages' => 'interactive message',
            'roles' => 'role',
            'api' => 'api',
            'support_requests' => 'support request',
            'billing' => 'billing',
            default => $targetModule,
        };
    }

    private function defaultOptionalFieldsForTask(string $activeTask): array
    {
        return match ($activeTask) {
            'create_campaign' => ['template_id', 'notes'],
            'create_template' => ['name'],
            'create_contact' => ['email', 'phone_number'],
            'create_lead' => ['status'],
            'create_product' => ['availability'],
            'create_order' => ['status', 'description'],
            'create_automation' => ['status'],
            'create_interactive_message' => ['option_type', 'is_active'],
            'create_role' => ['description'],
            'create_api' => [],
            'create_support_request' => [],
            default => [],
        };
    }

    private function buildTaskAssistantState(string $task, string $module, array $collectedFields = [], array $missingFields = [], array $overrides = []): array
    {
        $targetModule = $this->normalizeTargetModule($module);
        $state = [
            'active_task' => $task,
            'task_status' => $missingFields !== [] ? 'collecting_fields' : 'ready',
            'target_module' => $targetModule,
            'target_route' => $this->assistantTargetRoute($task, $targetModule),
            'collected_fields' => $collectedFields,
            'missing_fields' => array_values($missingFields),
            'optional_fields' => $this->defaultOptionalFieldsForTask($task),
            'confirmation_required' => false,
            'last_user_goal' => Str::replace('_', ' ', $task),
            'last_opened_page' => $targetModule !== '' ? $targetModule : null,
            'last_tool_result' => null,
            'created_record_id' => null,
            'intent' => $task,
            'fields' => $collectedFields,
            'missing' => array_values($missingFields),
            'module' => $this->normalizeLegacyModuleName($targetModule),
        ];

        return array_merge($state, $overrides);
    }

    private function containsPhraseFuzzy(string $haystack, string $needle): bool
    {
        $haystack = trim($haystack);
        $needle = trim(Str::lower($needle));

        if ($haystack === '' || $needle === '') {
            return false;
        }

        if (Str::contains($haystack, $needle)) {
            return true;
        }

        $haystackTokens = preg_split('/\s+/', $haystack) ?: [];
        $needleTokens = preg_split('/\s+/', $needle) ?: [];

        foreach ($needleTokens as $needleToken) {
            $matched = false;
            foreach ($haystackTokens as $haystackToken) {
                if ($this->tokensAreClose($needleToken, $haystackToken)) {
                    $matched = true;
                    break;
                }
            }

            if (!$matched) {
                return false;
            }
        }

        return true;
    }

    private function tokensAreClose(string $expected, string $actual): bool
    {
        if ($expected === $actual) {
            return true;
        }

        $distance = levenshtein($expected, $actual);
        $threshold = strlen($expected) >= 8 ? 2 : 1;

        return $distance <= $threshold;
    }

    private function appRoute(string $name, array $parameters = []): string
    {
        return route($name, $parameters, false);
    }

    private function handleOpenAiToolCall(Request $request, array $decision, ?array $assistantState, array $page): ?array
    {
        $name = (string) ($decision['name'] ?? '');
        $arguments = is_array($decision['arguments'] ?? null) ? $decision['arguments'] : [];

        return match ($name) {
            'create_campaign' => $this->handleCampaignIntent(
                $request,
                $this->buildCampaignCommand($arguments),
                $this->normalizeNaturalCommand($this->buildCampaignCommand($arguments))
            ),
            'create_contact' => $this->executeContactCreate($request, [
                'first_name' => trim((string) ($arguments['first_name'] ?? '')),
                'last_name' => trim((string) ($arguments['last_name'] ?? '')),
                'email' => trim((string) ($arguments['email'] ?? '')),
                'phone_number' => trim((string) ($arguments['phone_number'] ?? '')),
            ]),
            'create_lead' => $this->executeLeadCreate($request, [
                'name' => trim((string) ($arguments['name'] ?? '')),
                'status' => trim((string) ($arguments['status'] ?? '')),
            ]),
            'create_template' => $this->handleTemplateIntent(
                $request,
                $this->buildTemplateCommand($arguments),
                $this->normalizeNaturalCommand($this->buildTemplateCommand($arguments))
            ),
            'update_record' => $this->executeRecordUpdate(
                $request,
                trim((string) ($arguments['module'] ?? '')),
                (string) ($arguments['record_id'] ?? ''),
                trim((string) ($arguments['field'] ?? '')),
                trim((string) ($arguments['value'] ?? ''))
            ),
            'delete_record' => $this->executeRecordDelete(
                $request,
                trim((string) ($arguments['module'] ?? '')),
                (string) ($arguments['record_id'] ?? ''),
                false
            ),
            'search_records' => $this->handleSearchIntent(
                $request,
                $this->buildSearchCommand($arguments),
                $this->normalizeNaturalCommand($this->buildSearchCommand($arguments))
            ),
            'navigate_to_area' => $this->handleNavigationIntent(
                $this->normalizeNaturalCommand($this->buildNavigationCommand($arguments))
            ),
            'open_page_action' => $this->handlePageActionIntent($arguments, $page),
            'explain_workflow' => $this->handleWorkflowGuidanceIntent(
                $this->normalizeNaturalCommand($this->buildWorkflowCommand($arguments)),
                $page
            ),
            'answer_page_question' => $this->handleDashboardQuestionIntent(
                $request,
                $this->normalizeNaturalCommand((string) ($arguments['question'] ?? 'what is on this page')),
                $page
            ),
            'get_dashboard_stat' => $this->handleDashboardQuestionIntent(
                $request,
                $this->normalizeNaturalCommand((string) ($arguments['metric'] ?? 'dashboard stats')),
                $page
            ),
            default => null,
        };
    }

    private function handlePageActionIntent(array $arguments, array $page = []): ?array
    {
        $module = Str::lower(trim((string) ($arguments['module'] ?? '')));
        $action = Str::lower(trim((string) ($arguments['action'] ?? 'list')));
        $recordId = trim((string) ($arguments['record_id'] ?? ''));

        if ($module === '') {
            $module = (string) ($this->inferModuleFromPage($page) ?? '');
        }

        $registry = $this->pageActionRegistry();
        $config = $registry[$module] ?? null;

        if (!$config) {
            return null;
        }

        if ($action === 'create' && !empty($config['create'])) {
            return [
                'message' => "I'm opening {$config['label']} creation.",
                'action' => [
                    'type' => 'visit',
                    'url' => $this->appRoute($config['create']),
                ],
            ];
        }

        if (in_array($action, ['detail', 'edit'], true)) {
            if ($recordId === '') {
                return [
                    'message' => "I can open {$config['label']} {$action}, but I still need the record ID.",
                    'suggestions' => [
                        "Open {$module} list",
                        "Search {$module} for name",
                    ],
                    'assistant_state' => $this->buildTaskAssistantState('page_action', $module, ['action' => $action], ['record_id'], [
                        'action' => $action,
                        'module' => $module,
                    ]),
                ];
            }

            $routeName = $config[$action] ?? null;
            if ($routeName) {
                return [
                    'message' => "I'm opening {$config['label']} {$action}.",
                    'action' => [
                        'type' => 'visit',
                        'url' => $this->appRoute($routeName, ['id' => $recordId]),
                    ],
                ];
            }
        }

        if (!empty($config['list'])) {
            return [
                'message' => "I'm opening {$config['label']}.",
                'action' => [
                    'type' => 'visit',
                    'url' => $this->appRoute($config['list']),
                ],
            ];
        }

        return null;
    }

    private function answerPageScalarQuestion(string $normalized, array $pageProps): ?string
    {
        $entries = $this->flattenPageProps($pageProps);
        if (empty($entries)) {
            return null;
        }

        $questionTokens = $this->meaningfulTokens($normalized);
        if (empty($questionTokens)) {
            return null;
        }

        $best = null;
        $bestScore = 0;

        foreach ($entries as $entry) {
            $labelTokens = $this->meaningfulTokens($entry['label']);
            if (empty($labelTokens)) {
                continue;
            }

            $overlap = count(array_intersect($questionTokens, $labelTokens));
            if ($overlap <= 0) {
                continue;
            }

            $score = $overlap;
            if (is_numeric($entry['value']) && $this->containsIntent($normalized, ['amount', 'total', 'spent', 'spend', 'balance', 'price', 'cost'])) {
                $score += 2;
            }

            if ($score > $bestScore) {
                $bestScore = $score;
                $best = $entry;
            }
        }

        if (!$best || $bestScore < 2) {
            return null;
        }

        return Str::headline($best['label']) . ' is ' . $this->stringifyScalar($best['value']) . '.';
    }

    private function handlePageActionCommandIntent(string $command, string $normalized, array $page): ?array
    {
        if (
            $this->isInformationQuestionCommand($normalized, $page) &&
            preg_match('/\b(open|go to|take me|edit|update|create|new|list|detail|details)\b/', $normalized) !== 1
        ) {
            return null;
        }

        if (preg_match('/\bhow many\b|\bcount\b|\btotal\b|\bnumber of\b|\bwhat data\b|\bwhat information\b|\btell me\b/', $normalized) === 1) {
            return null;
        }

        if ($this->containsIntent($normalized, [
            'help me',
            'guide me',
            'how do i',
            'how can i',
            'how should i',
            'steps',
        ])) {
            return null;
        }

        $registry = $this->pageActionRegistry();
        $action = null;
        $hasExplicitNavigationIntent = $this->containsIntent($normalized, [
            'open',
            'go to',
            'take me to',
            'take me',
            'show me',
            'view',
            'list',
            'open page',
            'open the page',
            'open the',
        ]);

        $actionMatchers = [
            'create' => ['create', 'new'],
            'edit' => ['edit', 'update'],
            'detail' => ['detail', 'details', 'show details', 'open details', 'view details'],
            'list' => ['list', 'open list', 'show list'],
        ];

        foreach ($actionMatchers as $candidate => $aliases) {
            if ($this->containsIntent($normalized, $aliases)) {
                $action = $candidate;
                break;
            }
        }

        if (!$action) {
            foreach (['new' => 'create', 'view' => 'detail', 'show' => 'detail'] as $alias => $resolved) {
                if ($this->containsIntent($normalized, $alias)) {
                    $action = $resolved;
                    break;
                }
            }
        }

        if (!$action) {
            return null;
        }

        if ($action === 'create' && !$hasExplicitNavigationIntent) {
            return null;
        }

        $recordId = (string) ($this->extractFirstNumericValue($command) ?? '');

        foreach (array_keys($registry) as $module) {
            if (!$this->containsIntent($normalized, $module)) {
                continue;
            }

            return $this->handlePageActionIntent([
                'module' => $module,
                'action' => $action,
                'record_id' => $recordId,
            ], $page);
        }

        if ($this->containsIntent($normalized, ['this page', 'current page', 'here'])) {
            return $this->handlePageActionIntent([
                'module' => (string) ($this->inferModuleFromPage($page) ?? ''),
                'action' => $action,
                'record_id' => $recordId,
            ], $page);
        }

        $currentModule = $this->inferModuleFromPage($page);
        if ($currentModule && $this->containsIntent($normalized, ['open', 'go', 'take', 'edit', 'detail', 'new', 'show', 'view', 'list'])) {
            return $this->handlePageActionIntent([
                'module' => $currentModule,
                'action' => $action,
                'record_id' => $recordId,
            ], $page);
        }

        return null;
    }

    private function buildCampaignCommand(array $arguments): string
    {
        $name = trim((string) ($arguments['name'] ?? 'campaign_' . now()->format('Ymd_His')));

        return "create a campaign called {$name}";
    }

    private function buildTemplateCommand(array $arguments): string
    {
        $parts = ['create'];

        $category = trim((string) ($arguments['category'] ?? ''));
        if ($category !== '') {
            $parts[] = $category;
        }

        $parts[] = 'template';

        $accountName = trim((string) ($arguments['account_name'] ?? ''));
        if ($accountName !== '') {
            $parts[] = 'for ' . $accountName;
        }

        $language = trim((string) ($arguments['language'] ?? ''));
        if ($language !== '') {
            $parts[] = 'in ' . $language;
        }

        $name = trim((string) ($arguments['name'] ?? ''));
        if ($name !== '') {
            $parts[] = 'called ' . $name;
        }

        return implode(' ', $parts);
    }

    private function buildSearchCommand(array $arguments): string
    {
        $module = trim((string) ($arguments['module'] ?? 'dashboard data'));
        $query = trim((string) ($arguments['query'] ?? ''));
        $accountName = trim((string) ($arguments['account_name'] ?? ''));

        $command = 'search ' . $module;
        if ($query !== '') {
            $command .= ' for ' . $query;
        }
        if ($accountName !== '') {
            $command .= ' in ' . $accountName;
        }

        return $command;
    }

    private function buildNavigationCommand(array $arguments): string
    {
        $target = trim((string) ($arguments['target'] ?? 'dashboard'));

        return 'open ' . $target;
    }

    private function buildWorkflowCommand(array $arguments): string
    {
        $topic = trim((string) ($arguments['topic'] ?? 'dashboard'));

        return 'how do i use ' . $topic;
    }

    private function extractFirstNumericValue(string $command): ?int
    {
        if (!preg_match('/\b(\d+)\b/', $command, $matches)) {
            return null;
        }

        return (int) $matches[1];
    }

    private function fallbackCapabilityMessage(array $page): string
    {
        $pageTitle = $page['title'] ?? 'this page';
        $module = $this->inferModuleFromPage($page);
        $moduleHint = $module ? " I can also act directly on {$module} from here." : '';

        return "I can explain {$pageTitle}, answer questions about visible page data, continue unfinished tasks, search records, and open safe list, detail, edit, or create flows across the dashboard." . $moduleHint . ' Tell me the task directly or ask about the current page.';
    }

    private function fallbackDataQuestionMessage(string $normalized, array $page): string
    {
        $module = $this->resolveQuestionModule($normalized, $page);
        $range = $this->resolveRelativeDateRange($normalized);

        if ($module && $range) {
            return "I understood this as a {$module} data question for {$range['label']} ({$range['absolute_label']}), but I could not find a matching result from the available dashboard data.";
        }

        if ($module) {
            return "I understood this as a {$module} data question, but I could not find a matching result from the available dashboard data.";
        }

        if ($range) {
            return "I understood this as a dashboard data question for {$range['label']} ({$range['absolute_label']}), but I could not find a matching result from the available dashboard data.";
        }

        return 'I understood this as a dashboard data question, but I could not find a matching result from the available dashboard data.';
    }

    private function inferModuleFromPage(array $page): ?string
    {
        $text = Str::lower(trim(implode(' ', array_filter([
            (string) ($page['title'] ?? ''),
            (string) ($page['component'] ?? ''),
            (string) (($page['props']['current_page'] ?? '')),
            (string) (($page['props']['plural'] ?? '')),
        ]))));

        if ($text === '') {
            return null;
        }

        foreach (array_keys($this->pageActionRegistry()) as $module) {
            if ($this->containsIntent($text, $module)) {
                return $module;
            }
        }

        return match (true) {
            Str::contains($text, 'deals') => 'deal',
            Str::contains($text, 'templates') => 'template',
            Str::contains($text, 'campaigns') => 'campaign',
            Str::contains($text, 'contacts') => 'contact',
            Str::contains($text, 'leads') => 'lead',
            Str::contains($text, 'catalog') => 'catalog',
            Str::contains($text, 'imports') => 'import',
            Str::contains($text, 'support requests') => 'support request',
            Str::contains($text, 'api') => 'api',
            Str::contains($text, 'billing') || Str::contains($text, 'wallet') => 'billing',
            default => null,
        };
    }

    private function pageActionRegistry(): array
    {
        return [
            'campaign' => ['label' => 'campaign', 'list' => 'listCampaign', 'detail' => 'detailCampaign', 'create' => 'createCampaign'],
            'template' => ['label' => 'templates', 'list' => 'account_templates'],
            'contact' => ['label' => 'contacts', 'list' => 'listContact', 'detail' => 'detailContact', 'edit' => 'editContact'],
            'lead' => ['label' => 'leads', 'list' => 'listLead', 'detail' => 'detailLead', 'edit' => 'editLead'],
            'deal' => ['label' => 'deals', 'list' => 'listOpportunity', 'detail' => 'detailOpportunity', 'edit' => 'editOpportunity'],
            'opportunity' => ['label' => 'deals', 'list' => 'listOpportunity', 'detail' => 'detailOpportunity', 'edit' => 'editOpportunity'],
            'group' => ['label' => 'groups', 'list' => 'listGroup', 'detail' => 'detailGroup', 'edit' => 'editGroup'],
            'organization' => ['label' => 'organizations', 'list' => 'listOrganization', 'detail' => 'detailOrganization', 'edit' => 'editOrganization'],
            'product' => ['label' => 'products', 'list' => 'listProduct', 'detail' => 'detailProduct', 'edit' => 'editProduct'],
            'order' => ['label' => 'orders', 'list' => 'listOrder', 'detail' => 'detailOrder', 'edit' => 'editOrder'],
            'import' => ['label' => 'imports', 'list' => 'listImport', 'detail' => 'detailImport', 'create' => 'new_import'],
            'catalog' => ['label' => 'catalogs', 'list' => 'listCatalog', 'detail' => 'detailCatalog'],
            'tag' => ['label' => 'tags', 'list' => 'listTag', 'detail' => 'detailTag', 'edit' => 'editTag'],
            'category' => ['label' => 'lists', 'list' => 'listCategory', 'detail' => 'detailCategory', 'edit' => 'editCategory'],
            'field' => ['label' => 'fields', 'list' => 'listField', 'edit' => 'editField'],
            'automation' => ['label' => 'automations', 'list' => 'listAutomation', 'edit' => 'editAutomation', 'detail' => 'automation_result'],
            'lineitem' => ['label' => 'line items', 'list' => 'listLineItem', 'create' => 'createLineItem'],
            'api' => ['label' => 'API keys', 'list' => 'listApi', 'detail' => 'detailApi', 'edit' => 'editApi'],
            'role' => ['label' => 'roles', 'list' => 'listRole', 'detail' => 'detailRole', 'edit' => 'editRole'],
            'support request' => ['label' => 'support requests', 'list' => 'listSupportRequest', 'detail' => 'detailSupportRequest', 'edit' => 'editSupportRequest'],
            'support' => ['label' => 'support requests', 'list' => 'listSupportRequest', 'detail' => 'detailSupportRequest', 'edit' => 'editSupportRequest'],
            'message log' => ['label' => 'message logs', 'list' => 'listMessageLogs'],
            'message' => ['label' => 'messages', 'list' => 'listMessage'],
            'chat' => ['label' => 'chats', 'list' => 'chat_list'],
            'wallet' => ['label' => 'billing', 'list' => 'wallet'],
            'billing' => ['label' => 'billing', 'list' => 'wallet'],
            'account' => ['label' => 'accounts', 'list' => 'social_profile'],
            'interactive message' => ['label' => 'interactive messages', 'list' => 'listInteractiveMessage', 'detail' => 'detailInteractiveMessage', 'edit' => 'editInteractiveMessage'],
            'company' => ['label' => 'workspaces', 'detail' => 'detailCompany', 'edit' => 'editCompany'],
            'workspace' => ['label' => 'workspaces', 'detail' => 'detailCompany', 'edit' => 'editCompany'],
            'user' => ['label' => 'users', 'detail' => 'detailUser', 'edit' => 'editUser', 'create' => 'create_user'],
            'plan' => ['label' => 'plans', 'list' => 'listPlan', 'detail' => 'detailPlan', 'edit' => 'editPlan'],
            'price' => ['label' => 'pricing', 'list' => 'listPrice', 'edit' => 'editPrice'],
        ];
    }
}
