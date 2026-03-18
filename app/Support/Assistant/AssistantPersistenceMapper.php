<?php

namespace App\Support\Assistant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AssistantPersistenceMapper
{
    public function mapCreatePayload(string $module, array $fields): array
    {
        $module = $this->normalizeModule($module);

        return match ($module) {
            'contacts' => $this->mapContactCreatePayload($fields),
            'templates' => $this->mapTemplateCreatePayload($fields),
            'leads' => array_filter([
                'name' => $fields['name'] ?? null,
                'status' => $fields['status'] ?? null,
            ], fn ($value) => $value !== null && $value !== ''),
            'products' => [
                'name' => $fields['name'],
                'price' => $fields['price'],
                'description' => $fields['description'],
                'availability' => $fields['availability'] ?? 1,
            ],
            'orders' => array_filter([
                'name' => $fields['name'],
                'status' => $fields['status'] ?? null,
                'description' => $fields['description'] ?? null,
                'due_date' => $fields['due_date'] ?? null,
            ], fn ($value) => $value !== null && $value !== ''),
            'automations' => [
                'name' => $fields['name'],
                'status' => $fields['status'] ?? '1',
            ],
            'interactive_messages' => [
                'name' => $fields['name'],
                'option_type' => $fields['option_type'] ?? 'button',
                'is_active' => $fields['is_active'] ?? '1',
                'list_options' => [],
            ],
            'roles' => [
                'name' => $fields['name'],
                'description' => $fields['description'] ?? '',
            ],
            'api' => [
                'name' => $fields['name'],
            ],
            'support_requests' => [
                'subject' => $fields['subject'],
                'type' => $fields['type'],
                'description' => $fields['description'],
                'status' => $fields['status'] ?? 'Open',
            ],
            default => $fields,
        };
    }

    public function mapUpdatePayload(string $module, Model $record, string $field, string $value): array
    {
        $module = $this->normalizeModule($module);

        return match ($module) {
            'contacts' => $this->mapContactUpdatePayload($record, $field, $value),
            'templates' => $this->mapTemplateUpdatePayload($record, $field, $value),
            'leads' => [
                'id' => $record->id,
                'name' => $field === 'name' ? $value : $record->name,
                $field => $value,
            ],
            'products' => [
                'id' => $record->id,
                'name' => $field === 'name' ? $value : $record->name,
                'price' => $field === 'price' ? $value : $record->price,
                'description' => $field === 'description' ? $value : $record->description,
                'availability' => $field === 'availability' ? $value : ($record->availability ?? 1),
            ],
            'orders' => array_filter([
                'id' => $record->id,
                'name' => $field === 'name' ? $value : $record->name,
                'status' => $field === 'status' ? $value : $record->status,
                'description' => $field === 'description' ? $value : $record->description,
                'due_date' => $field === 'due_date' ? $value : $record->due_date,
            ], fn ($entry) => $entry !== null),
            'interactive_messages' => [
                'id' => $record->id,
                'name' => $field === 'name' ? $value : $record->name,
                'is_active' => $field === 'is_active' ? $value : ($record->is_active ?? 1),
                'option_type' => $field === 'option_type' ? $value : $record->option_type,
                'list_options' => [],
            ],
            'support_requests' => [
                'id' => $record->id,
                'subject' => $field === 'subject' ? $value : $record->subject,
                'type' => $field === 'type' ? $value : $record->type,
                'description' => $field === 'description' ? $value : $record->description,
                'status' => $field === 'status' ? $value : $record->status,
            ],
            default => [
                'id' => $record->id,
                $field => $value,
            ],
        };
    }

    private function mapContactCreatePayload(array $fields): array
    {
        $payload = $this->splitName((string) ($fields['name'] ?? ''));

        return array_filter([
            'first_name' => $payload['first_name'] ?: null,
            'last_name' => $payload['last_name'],
            'email' => $fields['email'] ?? null,
            'phone_number' => $fields['phone_number'] ?? null,
        ], fn ($value) => $value !== null && $value !== '');
    }

    private function mapContactUpdatePayload(Model $record, string $field, string $value): array
    {
        $payload = ['id' => $record->id];

        if ($field === 'name') {
            $name = $this->splitName($value);
            $payload['first_name'] = $name['first_name'];
            $payload['last_name'] = $name['last_name'];

            return $payload;
        }

        $payload[$field] = $value;

        return $payload;
    }

    private function mapTemplateCreatePayload(array $fields): array
    {
        $category = Str::upper((string) ($fields['category'] ?? ''));
        $baseName = trim((string) ($fields['name'] ?? ''));
        $name = $baseName !== ''
            ? $this->normalizeSlugLikeName($baseName)
            : $this->normalizeSlugLikeName(Str::lower($category . '_' . now()->format('Ymd_His')));

        return [
            'name' => $name,
            'category' => $category,
            'languages' => array_values(array_filter([(string) ($fields['language'] ?? '')])),
            'account_id' => $fields['account_id'] ?? null,
        ];
    }

    private function mapTemplateUpdatePayload(Model $record, string $field, string $value): array
    {
        if ($field === 'language') {
            return [
                'id' => $record->id,
                'languages' => [$value],
            ];
        }

        return [
            'id' => $record->id,
            $field => $field === 'name' ? $this->normalizeSlugLikeName($value) : $value,
        ];
    }

    private function splitName(string $value): array
    {
        $parts = preg_split('/\s+/', trim($value)) ?: [];
        if (count($parts) > 1) {
            return [
                'first_name' => array_shift($parts),
                'last_name' => implode(' ', $parts),
            ];
        }

        return [
            'first_name' => '',
            'last_name' => $parts[0] ?? '',
        ];
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

    private function normalizeModule(string $module): string
    {
        return match (trim(Str::lower($module))) {
            'contact', 'contacts' => 'contacts',
            'template', 'templates' => 'templates',
            'lead', 'leads' => 'leads',
            'product', 'products' => 'products',
            'order', 'orders' => 'orders',
            'automation', 'automations' => 'automations',
            'interactive message', 'interactive_messages' => 'interactive_messages',
            'role', 'roles' => 'roles',
            'api', 'apis' => 'api',
            'support request', 'support_requests' => 'support_requests',
            default => trim(Str::lower($module)),
        };
    }
}
