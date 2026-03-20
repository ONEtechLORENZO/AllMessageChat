<?php

namespace App\Console\Commands;

use App\Models\Account;
use App\Services\GmailService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncGmailAccounts extends Command
{
    protected $signature = 'command:SyncGmailAccounts {--account_id=}';

    protected $description = 'Synchronize linked Gmail inbox and sent messages.';

    public function handle(GmailService $gmailService): int
    {
        $query = Account::query()
            ->where('service', 'email')
            ->where('service_engine', 'gmail_oauth')
            ->where('status', 'Active');

        if ($this->option('account_id')) {
            $query->where('id', (int) $this->option('account_id'));
        }

        $accounts = $query->get();

        foreach ($accounts as $account) {
            try {
                $gmailService->syncAccountSafely($account);
            } catch (\Throwable $e) {
                Log::warning('Gmail sync failed.', [
                    'account_id' => $account->id,
                    'message' => $e->getMessage(),
                ]);
            }
        }

        return self::SUCCESS;
    }
}
