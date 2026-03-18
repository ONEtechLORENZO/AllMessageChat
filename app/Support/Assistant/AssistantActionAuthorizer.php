<?php

namespace App\Support\Assistant;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class AssistantActionAuthorizer
{
    public function authorize(?User $user, string $action, string $module, mixed $subject = null, array $context = []): array
    {
        if (!$user?->id) {
            return $this->failure('permission_denied', 'You must be signed in to perform that action.');
        }

        $account = $context['account'] ?? null;
        if ($account instanceof Account && (int) $account->user_id !== (int) $user->id) {
            return $this->failure('ownership_failed', 'That account is not owned by the current user.');
        }

        if (!$subject instanceof Model) {
            return $this->success();
        }

        if ($subject->getAttribute('user_id') !== null && (int) $subject->getAttribute('user_id') !== (int) $user->id) {
            return $this->failure('ownership_failed', 'That record is not owned by the current user.');
        }

        if ($subject->getAttribute('created_by') !== null) {
            $allowedUserIds = array_filter([
                (int) $subject->getAttribute('created_by'),
                (int) ($subject->getAttribute('assigned_to') ?? 0),
            ]);

            if ($allowedUserIds !== [] && !in_array((int) $user->id, $allowedUserIds, true)) {
                return $this->failure('permission_denied', 'You do not have permission to modify that record.');
            }
        }

        if ($subject->getAttribute('company_id') !== null) {
            $selectedCompany = Cache::get('selected_company_' . $user->id);
            if ($selectedCompany && (int) $subject->getAttribute('company_id') !== (int) $selectedCompany) {
                return $this->failure('ownership_failed', 'That record is outside the current workspace.');
            }
        }

        if ($subject->getAttribute('account_id') !== null) {
            $account = Account::query()->find($subject->getAttribute('account_id'));
            if ($account && (int) $account->user_id !== (int) $user->id) {
                return $this->failure('ownership_failed', 'That record belongs to an account outside the current user.');
            }
        }

        return $this->success();
    }

    private function success(): array
    {
        return [
            'ok' => true,
            'error_code' => null,
            'message' => '',
            'missing_fields' => [],
            'validation_errors' => [],
            'confirmation_required' => false,
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
            'confirmation_required' => false,
        ];
    }
}
