<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Contact;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class ContactCsvImportService
{
    private const SUPPORTED_COLUMNS = [
        'first_name',
        'last_name',
        'email',
        'phone_number',
    ];

    public function import(
        UploadedFile $file,
        User $user,
        array $tagSelections = [],
        array $listSelections = [],
    ): array {
        $result = [
            'success' => true,
            'imported_count' => 0,
            'updated_count' => 0,
            'skipped_count' => 0,
            'errors' => [],
        ];

        $handle = fopen($file->getRealPath(), 'r');

        if ($handle === false) {
            return [
                'success' => false,
                'imported_count' => 0,
                'updated_count' => 0,
                'skipped_count' => 0,
                'errors' => [
                    ['row' => 1, 'message' => 'Unable to read CSV file'],
                ],
            ];
        }

        $headerRow = fgetcsv($handle);

        if ($headerRow === false) {
            fclose($handle);

            return [
                'success' => false,
                'imported_count' => 0,
                'updated_count' => 0,
                'skipped_count' => 0,
                'errors' => [
                    ['row' => 1, 'message' => 'Missing CSV header row'],
                ],
            ];
        }

        $supportedIndexes = $this->resolveSupportedIndexes($headerRow);
        $tagIds = $this->resolveTagIds($tagSelections, $user->id);
        $categoryIds = $this->resolveCategoryIds($listSelections, $user->id);
        $rowNumber = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $rowNumber++;

            if ($this->rowIsBlank($row)) {
                continue;
            }

            $payload = $this->mapRow($row, $supportedIndexes);

            if ($this->mappedRowIsBlank($payload)) {
                continue;
            }

            if ($payload['email'] === '' && $payload['phone_number'] === '') {
                $result['skipped_count']++;
                $result['errors'][] = [
                    'row' => $rowNumber,
                    'message' => 'Missing email or phone_number',
                ];
                continue;
            }

            try {
                DB::transaction(function () use (
                    $payload,
                    $user,
                    $tagIds,
                    $categoryIds,
                    &$result
                ) {
                    $contact = $this->findExistingContact($payload);
                    $isNew = $contact === null;

                    if ($contact === null) {
                        $contact = new Contact();
                        $contact->creater_id = $user->id;
                    }

                    foreach (self::SUPPORTED_COLUMNS as $column) {
                        if ($payload[$column] !== '') {
                            $contact->{$column} = $payload[$column];
                        }
                    }

                    if (!$contact->creater_id) {
                        $contact->creater_id = $user->id;
                    }

                    $contact->save();

                    if ($tagIds) {
                        $contact->tags()->syncWithoutDetaching($tagIds);
                    }

                    if ($categoryIds) {
                        $contact->categorys()->syncWithoutDetaching($categoryIds);
                    }

                    if ($isNew) {
                        $result['imported_count']++;
                    } else {
                        $result['updated_count']++;
                    }
                });
            } catch (Throwable $throwable) {
                $result['skipped_count']++;
                $result['errors'][] = [
                    'row' => $rowNumber,
                    'message' => $this->formatErrorMessage($throwable),
                ];
            }
        }

        fclose($handle);

        return $result;
    }

    private function resolveSupportedIndexes(array $headerRow): array
    {
        $indexes = [];

        foreach ($headerRow as $index => $header) {
            $column = trim(Str::lower((string) $header));
            $column = preg_replace('/^\x{FEFF}/u', '', $column);

            if (in_array($column, self::SUPPORTED_COLUMNS, true)) {
                $indexes[$column] = $index;
            }
        }

        return $indexes;
    }

    private function mapRow(array $row, array $supportedIndexes): array
    {
        $payload = array_fill_keys(self::SUPPORTED_COLUMNS, '');

        foreach (self::SUPPORTED_COLUMNS as $column) {
            $index = $supportedIndexes[$column] ?? null;

            if ($index !== null && array_key_exists($index, $row)) {
                $payload[$column] = trim((string) $row[$index]);
            }
        }

        return $payload;
    }

    private function rowIsBlank(array $row): bool
    {
        foreach ($row as $value) {
            if (trim((string) $value) !== '') {
                return false;
            }
        }

        return true;
    }

    private function mappedRowIsBlank(array $payload): bool
    {
        foreach ($payload as $value) {
            if ($value !== '') {
                return false;
            }
        }

        return true;
    }

    private function findExistingContact(array $payload): ?Contact
    {
        if ($payload['email'] !== '') {
            $contact = Contact::where('email', $payload['email'])->first();

            if ($contact) {
                return $contact;
            }
        }

        if ($payload['phone_number'] !== '') {
            $contact = Contact::where('phone_number', $payload['phone_number'])->first();

            if ($contact) {
                return $contact;
            }
        }

        return null;
    }

    private function normalizeSelectionLabels(array $records): array
    {
        $labels = [];

        foreach ($records as $record) {
            $label = null;

            if (is_array($record)) {
                $label = $record['label'] ?? $record['value'] ?? null;
            } elseif (is_object($record)) {
                $label = $record->label ?? $record->value ?? null;
            } elseif (is_string($record)) {
                $label = $record;
            }

            if (is_string($label)) {
                $label = trim($label);

                if ($label !== '') {
                    $labels[] = $label;
                }
            }
        }

        return array_values(array_unique($labels));
    }

    private function resolveTagIds(array $records, int $userId): array
    {
        $tagIds = [];

        foreach ($this->normalizeSelectionLabels($records) as $label) {
            $tag = Tag::where('name', $label)
                ->where('user_id', $userId)
                ->first();

            if (!$tag) {
                $tag = new Tag();
                $tag->name = $label;
                $tag->user_id = $userId;
                $tag->save();
            }

            $tagIds[] = $tag->id;
        }

        return array_values(array_unique($tagIds));
    }

    private function resolveCategoryIds(array $records, int $userId): array
    {
        $categoryIds = [];

        foreach ($this->normalizeSelectionLabels($records) as $label) {
            $category = Category::where('name', $label)
                ->where('user_id', $userId)
                ->first();

            if (!$category) {
                $category = new Category();
                $category->name = $label;
                $category->user_id = $userId;
                $category->save();
            }

            $categoryIds[] = $category->id;
        }

        return array_values(array_unique($categoryIds));
    }

    private function formatErrorMessage(Throwable $throwable): string
    {
        $message = trim($throwable->getMessage());

        return $message !== '' ? $message : 'Failed to import row';
    }
}
