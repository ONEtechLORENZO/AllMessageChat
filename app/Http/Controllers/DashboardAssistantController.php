<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Campaign;
use App\Models\Company;
use App\Models\Contact;
use App\Models\Msg;
use App\Models\Session;
use App\Models\Template;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class DashboardAssistantController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'command' => ['required', 'string', 'max:1000'],
            'page' => ['nullable', 'array'],
            'page.url' => ['nullable', 'string', 'max:500'],
            'page.component' => ['nullable', 'string', 'max:255'],
            'page.title' => ['nullable', 'string', 'max:255'],
            'page.props' => ['nullable', 'array'],
        ]);

        $user = $request->user();
        $command = trim((string) $validated['command']);
        $normalized = Str::of($command)->lower()->squish()->value();
        $page = $validated['page'] ?? [];

        if ($response = $this->handleHelpIntent($normalized, $page)) {
            return response()->json($response);
        }

        if ($response = $this->handleCampaignIntent($request, $command, $normalized)) {
            return response()->json($response);
        }

        if ($response = $this->handleTemplateIntent($request, $command, $normalized)) {
            return response()->json($response);
        }

        if ($response = $this->handleSearchIntent($request, $command, $normalized)) {
            return response()->json($response);
        }

        if ($response = $this->handleNavigationIntent($normalized)) {
            return response()->json($response);
        }

        if ($response = $this->handleDashboardQuestionIntent($request, $normalized, $page)) {
            return response()->json($response);
        }

        return response()->json([
            'message' => 'I can help with campaigns, templates, dashboard search, navigation, and quick dashboard questions. Try "create a campaign called spring_sale" or "search campaigns for welcome".',
            'suggestions' => [
                'Create a campaign called spring_sale',
                'Create a marketing template in English',
                'Search campaigns for welcome',
                'What can you do on this page?',
            ],
        ]);
    }

    private function handleHelpIntent(string $normalized, array $page): ?array
    {
        if (
            !Str::contains($normalized, ['help', 'what can you do', 'how can you help', 'what can i do']) &&
            !Str::contains($normalized, ['what is this page', 'explain this page'])
        ) {
            return null;
        }

        $pageTitle = $page['title'] ?? null;
        $pageContext = $pageTitle
            ? "You are on {$pageTitle}. "
            : '';

        return [
            'message' => $pageContext . 'I can create draft campaigns, create templates when the needed details are present, search dashboard records, open the right areas of the app, and answer quick questions about balances, sessions, messages, campaigns, templates, and the current page.',
            'suggestions' => [
                'Create a campaign called april_launch',
                'Open templates',
                'Search contacts for mario',
                'How many campaigns do I have?',
            ],
        ];
    }

    private function handleCampaignIntent(Request $request, string $command, string $normalized): ?array
    {
        if (!preg_match('/\b(create|make|start|build|setup|set up)\b.*\bcampaign\b/', $normalized)) {
            return null;
        }

        $companyId = Cache::get('selected_company_' . $request->user()->id) ?: Company::query()->value('id') ?: 1;
        $name = $this->extractNamedValue($command) ?: 'campaign_' . now()->format('Ymd_His');

        $campaign = Campaign::create([
            'name' => $this->normalizeSlugLikeName($name),
            'status' => 'draft',
            'company_id' => $companyId,
            'current_page' => 1,
            'offset' => 0,
        ]);

        return [
            'message' => "I created a draft campaign named {$campaign->name}. I'm opening it now so you can finish the audience, content, and schedule.",
            'action' => [
                'type' => 'visit',
                'url' => route('detailCampaign', ['id' => $campaign->id]),
            ],
            'suggestions' => [
                'Search campaigns for ' . $campaign->name,
                'Open dashboard',
            ],
        ];
    }

    private function handleTemplateIntent(Request $request, string $command, string $normalized): ?array
    {
        if (!preg_match('/\b(create|make|start|build|setup|set up)\b.*\btemplate\b/', $normalized)) {
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
                'message' => 'I cannot create a template yet because there are no connected accounts for this user. Open Templates after connecting an account first.',
                'action' => [
                    'type' => 'visit',
                    'url' => route('account_templates'),
                ],
            ];
        }

        $account = $this->resolveAccountFromCommand($accounts, $normalized);
        if (!$account && $accounts->count() === 1) {
            $account = $accounts->first();
        }

        if (!$account) {
            $accountList = $accounts
                ->take(4)
                ->map(fn ($item) => "{$item->company_name} ({$item->service})")
                ->implode(', ');

            return [
                'message' => "I found multiple accounts. Tell me which one to use, for example: create a marketing template for {$accounts->first()->company_name} in English. Available accounts: {$accountList}.",
                'suggestions' => $accounts
                    ->take(3)
                    ->map(fn ($item) => "Create a marketing template for {$item->company_name} in English")
                    ->values()
                    ->all(),
            ];
        }

        $category = $this->extractTemplateCategory($normalized);
        $languages = $this->extractLanguages($normalized);

        if (!$category || empty($languages)) {
            return [
                'message' => "I can open template creation for {$account->company_name}, but to create it directly I still need a category and at least one language. Try: create a marketing template for {$account->company_name} in English.",
                'action' => [
                    'type' => 'visit',
                    'url' => route('account_templates', [
                        'account_id' => $account->id,
                        'assistant' => 'create',
                    ]),
                ],
                'suggestions' => [
                    "Create a marketing template for {$account->company_name} in English",
                    "Create an authentication template for {$account->company_name} in Italian",
                ],
            ];
        }

        $companyId = Cache::get('selected_company_' . $user->id) ?: Company::query()->value('id');
        $name = $this->extractNamedValue($command)
            ?: Str::lower($category . '_' . now()->format('Ymd_His'));

        $template = new Template();
        $template->name = $this->normalizeSlugLikeName($name);
        $template->category = $category;
        $template->languages = $languages;
        $template->status = 'draft';
        $template->company_id = $companyId;
        $template->account_id = $account->id;
        $template->created_by = $user->id;
        $template->save();

        return [
            'message' => "I created the draft template {$template->name} for {$account->company_name}. I'm opening it now so you can finish the content and submit it.",
            'action' => [
                'type' => 'visit',
                'url' => route('template_detail_view', [$account->id, $template->id]),
            ],
            'suggestions' => [
                'Open templates',
                'Create a campaign called launch_sequence',
            ],
        ];
    }

    private function handleSearchIntent(Request $request, string $command, string $normalized): ?array
    {
        if (!Str::contains($normalized, ['search', 'find', 'look up', 'lookup'])) {
            return null;
        }

        $query = $this->extractSearchQuery($command, $normalized);
        $accounts = Account::query()
            ->where('user_id', $request->user()->id)
            ->select('id', 'company_name', 'service')
            ->orderBy('company_name')
            ->get();

        if (Str::contains($normalized, ['campaign'])) {
            return [
                'message' => $query
                    ? "I'm opening campaigns filtered for {$query}."
                    : 'I\'m opening campaigns.',
                'action' => [
                    'type' => 'visit',
                    'url' => route('listCampaign', array_filter([
                        'search' => $query ?: null,
                    ])),
                ],
            ];
        }

        if (Str::contains($normalized, ['contact'])) {
            return [
                'message' => $query
                    ? "I'm opening contacts filtered for {$query}."
                    : 'I\'m opening contacts.',
                'action' => [
                    'type' => 'visit',
                    'url' => route('listContact', array_filter([
                        'search' => $query ?: null,
                    ])),
                ],
            ];
        }

        if (Str::contains($normalized, ['lead'])) {
            return [
                'message' => $query
                    ? "I'm opening leads filtered for {$query}."
                    : 'I\'m opening leads.',
                'action' => [
                    'type' => 'visit',
                    'url' => route('listLead', array_filter([
                        'search' => $query ?: null,
                    ])),
                ],
            ];
        }

        if (Str::contains($normalized, ['message log', 'message logs', 'logs'])) {
            return [
                'message' => $query
                    ? "I'm opening message logs filtered for {$query}."
                    : 'I\'m opening message logs.',
                'action' => [
                    'type' => 'visit',
                    'url' => route('listMessageLogs', array_filter([
                        'search' => $query ?: null,
                    ])),
                ],
            ];
        }

        if (Str::contains($normalized, ['template'])) {
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
                'action' => [
                    'type' => 'visit',
                    'url' => route('account_templates', array_filter([
                        'account_id' => $account?->id,
                        'assistant_search' => $query ?: null,
                    ])),
                ],
            ];
        }

        return [
            'message' => 'Tell me what to search, for example "search campaigns for launch", "search contacts for mario", or "search templates for welcome".',
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
            'dashboard' => ['Dashboard', route('dashboard')],
            'campaign' => ['Campaigns', route('listCampaign')],
            'template' => ['Templates', route('account_templates')],
            'chat' => ['Chats', route('chat_list')],
            'automation' => ['Automations', route('listAutomation')],
            'message log' => ['Message Logs', route('listMessageLogs')],
            'message logs' => ['Message Logs', route('listMessageLogs')],
            'message' => ['Messages', route('listMessage')],
            'contact' => ['Contacts', route('listContact')],
            'lead' => ['Leads', route('listLead')],
            'wallet' => ['Billing', route('wallet')],
        ];

        if (!Str::contains($normalized, ['open', 'go to', 'take me to', 'show'])) {
            return null;
        }

        foreach ($map as $keyword => [$label, $url]) {
            if (Str::contains($normalized, $keyword)) {
                return [
                    'message' => "I'm opening {$label}.",
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
        $user = $request->user();
        $companyId = Cache::get('selected_company_' . $user->id) ?: Company::query()->value('id');
        $pageProps = is_array($page['props'] ?? null) ? $page['props'] : [];

        if ($response = $this->handlePageDataQuestionIntent($normalized, $page, $pageProps)) {
            return $response;
        }

        if (Str::contains($normalized, ['balance', 'wallet'])) {
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

        if (Str::contains($normalized, ['session', 'sessions', 'limit'])) {
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

        if (Str::contains($normalized, ['message', 'messages', 'conversation', 'conversations']) && Str::contains($normalized, ['month', 'this month'])) {
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

        if (Str::contains($normalized, ['how many campaigns', 'campaign count', 'campaigns do i have'])) {
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

        if (Str::contains($normalized, ['how many templates', 'template count', 'templates do i have'])) {
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

        if (Str::contains($normalized, ['how many accounts', 'social accounts', 'connected accounts'])) {
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

        if (Str::contains($normalized, ['how many contacts', 'contact count'])) {
            $count = Contact::query()->count();

            return [
                'message' => "There are {$count} contacts available in the dashboard data.",
                'suggestions' => [
                    'Open contacts',
                    'Search contacts for mario',
                ],
            ];
        }

        if (Str::contains($normalized, ['this page', 'current page', 'page'])) {
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

        $asksAboutPageData = Str::contains($normalized, [
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

        if (Str::contains($normalized, ['list', 'records', 'items', 'rows'])) {
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
        if (Str::contains($normalized, 'authentication')) {
            return 'AUTHENTICATION';
        }

        if (Str::contains($normalized, 'marketing')) {
            return 'MARKETING';
        }

        if (Str::contains($normalized, 'utility')) {
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
            if (Str::contains(' ' . $normalized . ' ', $keyword)) {
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
                Str::contains($normalized, Str::lower($account->company_name)) ||
                Str::contains($normalized, Str::lower($account->service))
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
            return "This is {$title}. It summarizes wallet, message activity, sessions, and message log data. I can answer quick KPI questions here or move you to campaigns, templates, billing, and logs.";
        }

        if (Str::contains($component, 'campaign')) {
            return "This is {$title}. It is used to create, review, and manage campaign workflows. I can create a draft campaign, open campaign results, or search existing campaigns.";
        }

        if (Str::contains($component, 'template')) {
            return "This is {$title}. It is used to manage WhatsApp templates for connected accounts. I can create a draft template when you provide account, category, and language, or open the template workflow for you.";
        }

        return "This is {$title}. I can help you navigate this area, search related records, and explain what actions are available.";
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
}
