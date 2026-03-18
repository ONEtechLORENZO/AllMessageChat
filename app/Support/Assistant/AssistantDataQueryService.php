<?php

namespace App\Support\Assistant;

use App\Models\Company;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class AssistantDataQueryService
{
    private AssistantDataRegistry $registry;

    public function __construct(AssistantDataRegistry $registry)
    {
        $this->registry = $registry;
    }

    public function answer(string $normalized, array $page, ?object $user): ?array
    {
        $pageProps = is_array($page['props'] ?? null) ? $page['props'] : [];

        if ($pageProps !== []) {
            if ($response = $this->answerPageQuestion($normalized, $page, $pageProps)) {
                return $response;
            }
        }

        return $this->answerGlobalQuestion($normalized, $page, $user);
    }

    public function resolveRelativeDateRange(string $normalized): ?array
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

    public function resolveQuestionModule(string $normalized, array $page): ?string
    {
        foreach ($this->registry->aliases() as $module => $aliases) {
            if ($this->containsIntent($normalized, $aliases)) {
                return $module;
            }
        }

        return $this->inferModuleFromPage($page);
    }

    private function answerPageQuestion(string $normalized, array $page, array $pageProps): ?array
    {
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

        if ($temporal = $this->answerPageTemporalQuestion($normalized, $pageProps)) {
            return [
                'message' => $temporal,
                'suggestions' => [
                    'How many items are on this page?',
                    'What is on this page?',
                ],
            ];
        }

        if (preg_match('/\bhow many\b|\bcount\b|\btotal\b|\bnumber of\b/', $normalized) === 1) {
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

        if ($scalarAnswer = $this->answerPageScalarQuestion($normalized, $pageProps)) {
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

    private function answerGlobalQuestion(string $normalized, array $page, ?object $user): ?array
    {
        $module = $this->resolveQuestionModule($normalized, $page);
        if ($module === null || $module === 'billing') {
            $module = $this->containsIntent($normalized, ['billing', 'wallet']) ? 'price' : $module;
        }

        if ($module === null) {
            return null;
        }

        $config = $this->registry->modules()[$module] ?? null;
        if ($config === null) {
            return null;
        }

        $modelClass = $config['model'];
        /** @var Model $model */
        $model = new $modelClass();
        $query = $modelClass::query();
        $this->applyVisibilityScope($query, $model, $user);

        $range = $this->resolveRelativeDateRange($normalized);
        if ($range !== null) {
            $dateColumn = $this->resolveModelDateColumn($model, $config['date_fields'] ?? []);
            if ($dateColumn !== null) {
                $query->whereBetween($dateColumn, [$range['start'], $range['end']]);
            }
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
            'show me',
            'tell me',
            'what',
            'which',
            'list',
            'records',
            'items',
            'rows',
            'data',
            'information',
            'prices',
        ])) {
            return null;
        }

        $dateColumn = $this->resolveModelDateColumn($model, $config['date_fields'] ?? []);
        if ($dateColumn !== null) {
            $query->orderByDesc($dateColumn);
        } elseif ($this->modelHasColumn($model, 'id')) {
            $query->orderByDesc('id');
        }

        $count = (clone $query)->count();
        $records = $query->limit(5)->get();

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

        if ($module === 'price') {
            return $this->buildPriceResponse($records->all(), $count, $range);
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
        if ($preview !== []) {
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

    private function buildPriceResponse(array $records, int $count, ?array $range): array
    {
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
            if ($parts !== []) {
                $examples[] = "{$country}: " . implode(', ', $parts);
            }
        }

        $periodText = $range ? " in {$range['label']} ({$range['absolute_label']})" : '';
        $message = "I found {$count} price record" . ($count === 1 ? '' : 's') . "{$periodText}.";
        if ($examples !== []) {
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
        if ($counts !== []) {
            $parts[] = 'Visible list counts: ' . implode('; ', array_slice($counts, 0, 5)) . '.';
        }
        if ($highlights !== []) {
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
            if (Str::contains($normalized, $label) || Str::contains($normalized, $singular) || Str::contains($normalized, ['items', 'records', 'rows']) || count($pageProps) === 1) {
                return 'There are ' . count($value) . ' ' . $label . ' available on this page.';
            }
        }

        return null;
    }

    private function answerPageRecordQuestion(string $normalized, array $pageProps): ?string
    {
        foreach ($pageProps as $key => $value) {
            if (!is_array($value) || !$this->isSequentialArray($value) || $value === []) {
                continue;
            }

            $label = Str::lower(Str::headline($key));
            $singular = Str::singular($label);
            if (Str::contains($normalized, $label) || Str::contains($normalized, $singular) || Str::contains($normalized, ['records', 'items', 'rows', 'list'])) {
                $preview = $this->buildRecordPreview($value, 4);

                return $preview ? Str::headline($key) . ' on this page include ' . $preview . '.' : 'I can see ' . count($value) . ' ' . $label . ' on this page.';
            }
        }

        return null;
    }

    private function answerPageScalarQuestion(string $normalized, array $pageProps): ?string
    {
        $entries = $this->flattenPageProps($pageProps);
        if ($entries === []) {
            return null;
        }

        $questionTokens = $this->meaningfulTokens($normalized);
        if ($questionTokens === []) {
            return null;
        }

        $best = null;
        $bestScore = 0;
        foreach ($entries as $entry) {
            $labelTokens = $this->meaningfulTokens($entry['label']);
            if ($labelTokens === []) {
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

    private function answerPageTemporalQuestion(string $normalized, array $pageProps): ?string
    {
        $range = $this->resolveRelativeDateRange($normalized);
        if ($range === null) {
            return null;
        }

        $bestMatch = null;
        foreach ($pageProps as $key => $value) {
            if (!is_array($value) || !$this->isSequentialArray($value) || $value === []) {
                continue;
            }

            $label = Str::lower(Str::headline($key));
            $singular = Str::singular($label);
            $isTargetedList = Str::contains($normalized, $label) || Str::contains($normalized, $singular) || Str::contains($normalized, ['records', 'items', 'rows', 'data']);
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

            if ($filtered === []) {
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

    private function applyVisibilityScope($query, Model $model, ?object $user): void
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

    private function resolveModelDateColumn(Model $model, array $preferredColumns): ?string
    {
        foreach ($preferredColumns as $column) {
            if ($this->modelHasColumn($model, $column)) {
                return $column;
            }
        }

        return null;
    }

    private function modelHasColumn(Model $model, string $column): bool
    {
        try {
            return Schema::hasColumn($model->getTable(), $column);
        } catch (\Throwable) {
            return false;
        }
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
            foreach (['name', 'title', 'company_name', 'email', 'phone', 'subject', 'country_code', 'id'] as $field) {
                if (array_key_exists($field, $item) && $item[$field] !== null && $item[$field] !== '') {
                    $labels[] = $this->stringifyScalar($item[$field]);
                    break;
                }
            }
        }

        $labels = array_values(array_unique(array_filter($labels)));
        return $labels === [] ? null : implode(', ', $labels);
    }

    private function extractModelPreviewLabel(object $record, array $fields): ?string
    {
        foreach ($fields as $field) {
            $value = data_get($record, $field);
            if ($value === null || $value === '' || is_array($value)) {
                continue;
            }

            if ($field === 'api_key') {
                $value = Str::limit((string) $value, 12, '...');
            }

            if (in_array($field, ['first_name', 'last_name'], true)) {
                $fullName = trim((string) data_get($record, 'first_name', '') . ' ' . (string) data_get($record, 'last_name', ''));
                if ($fullName !== '') {
                    return $fullName;
                }
            }

            return $this->stringifyScalar($value);
        }

        return method_exists($record, 'getKey') ? (string) $record->getKey() : null;
    }

    private function extractRecordDateValue(mixed $item): ?Carbon
    {
        if (!is_array($item)) {
            return null;
        }

        foreach (['created_at', 'updated_at', 'date', 'createdAt', 'updatedAt', 'sent_at', 'scheduled_at', 'due_date', 'start_date', 'end_date'] as $field) {
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
        $stopWords = ['the', 'a', 'an', 'is', 'are', 'of', 'to', 'for', 'on', 'in', 'this', 'that', 'me', 'tell', 'show', 'what', 'which', 'how', 'many', 'much', 'do', 'does', 'did', 'page', 'current', 'my', 'i', 'we', 'you', 'it', 'can'];

        return array_values(array_unique(array_filter($tokens, fn ($token) => $token !== '' && !in_array($token, $stopWords, true) && strlen($token) > 1)));
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

        foreach ($this->registry->aliases() as $module => $aliases) {
            if ($this->containsIntent($text, $aliases)) {
                return $module === 'billing' ? 'price' : $module;
            }
        }

        return null;
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
}
