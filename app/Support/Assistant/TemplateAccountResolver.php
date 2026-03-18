<?php

namespace App\Support\Assistant;

use App\Models\Account;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class TemplateAccountResolver
{
    public function resolve(?User $user, array $fields, ?Collection $accounts = null): array
    {
        if (!$user?->id) {
            return $this->failure('permission_denied', 'You must be signed in to select a template account.');
        }

        $accounts = $accounts ?? Account::query()
            ->where('user_id', $user->id)
            ->select('id', 'company_name', 'service', 'user_id')
            ->orderBy('company_name')
            ->get();

        if ($accounts->isEmpty()) {
            return $this->failure('not_found', 'There are no connected accounts available for this user.');
        }

        $requestedId = (int) ($fields['account_id'] ?? 0);
        $requestedName = trim((string) ($fields['account_name'] ?? $fields['workspace_name'] ?? ''));
        $requestedProfile = trim((string) ($fields['selected_profile_or_null'] ?? ''));

        $account = null;
        if ($requestedId > 0) {
            $account = $accounts->firstWhere('id', $requestedId);
        }

        if (!$account) {
            $query = Str::lower(trim($requestedName !== '' ? $requestedName : $requestedProfile));
            if ($query !== '') {
                $account = $accounts->first(function ($candidate) use ($query) {
                    return Str::contains(Str::lower($candidate->company_name), $query)
                        || Str::contains(Str::lower((string) $candidate->service), $query);
                });
            }
        }

        if (!$account && $accounts->count() === 1) {
            $account = $accounts->first();
        }

        if (!$account) {
            return [
                'ok' => false,
                'error_code' => 'missing_fields',
                'message' => 'I still need the template account or profile to continue.',
                'missing_fields' => ['account_id'],
                'validation_errors' => [],
                'ownership_status' => 'missing',
                'account' => null,
            ];
        }

        if ((int) $account->user_id !== (int) $user->id) {
            return [
                'ok' => false,
                'error_code' => 'ownership_failed',
                'message' => 'That account is not owned by the current user.',
                'missing_fields' => [],
                'validation_errors' => [],
                'ownership_status' => 'forbidden',
                'account' => null,
            ];
        }

        return [
            'ok' => true,
            'error_code' => null,
            'message' => '',
            'missing_fields' => [],
            'validation_errors' => [],
            'ownership_status' => 'owned',
            'account' => $account,
        ];
    }

    private function failure(string $errorCode, string $message): array
    {
        return [
            'ok' => false,
            'error_code' => $errorCode,
            'message' => $message,
            'missing_fields' => [],
            'validation_errors' => [],
            'ownership_status' => 'unknown',
            'account' => null,
        ];
    }
}
