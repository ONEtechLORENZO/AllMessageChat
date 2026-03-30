<?php

namespace App\Console\Commands;

use App\Jobs\SyncInstagramMessagesJob;
use App\Models\Account;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncInstagramMessages extends Command
{
    protected $signature = 'command:SyncInstagramMessages {--account_id=}';

    protected $description = 'Synchronize Instagram conversations for connected Instagram accounts, including Instagram Login connections.';

    public function handle(): int
    {
        $query = Account::query()
            ->where('service', 'instagram')
            ->where('status', 'Active')
            ->where('connection_status', 'connected')
            ->whereNotNull('instagram_account_id');

        if ($this->option('account_id')) {
            $query->where('id', (int) $this->option('account_id'));
        }

        $accounts = $query->get();

        foreach ($accounts as $account) {
            try {
                SyncInstagramMessagesJob::dispatchSync((int) $account->id, true);
            } catch (\Throwable $e) {
                Log::warning('Instagram sync failed.', [
                    'account_id' => $account->id,
                    'message' => $e->getMessage(),
                ]);
            }
        }

        return self::SUCCESS;
    }
}
