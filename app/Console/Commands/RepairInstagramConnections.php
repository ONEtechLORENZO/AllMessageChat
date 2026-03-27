<?php

namespace App\Console\Commands;

use App\Models\Account;
use App\Services\MetaIntegrationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RepairInstagramConnections extends Command
{
    protected $signature = 'command:RepairInstagramConnections {--account_id=}';

    protected $description = 'Repair stored Instagram connection state for page-linked Instagram accounts.';

    public function handle(MetaIntegrationService $metaIntegrationService): int
    {
        $query = Account::query()->where('service', 'instagram');

        if ($this->option('account_id')) {
            $query->where('id', (int) $this->option('account_id'));
        }

        $accounts = $query->get();

        foreach ($accounts as $account) {
            try {
                $metaIntegrationService->buildInstagramSetupPayload($account, true);
            } catch (\Throwable $e) {
                Log::warning('Instagram repair failed.', [
                    'account_id' => $account->id,
                    'message' => $e->getMessage(),
                ]);
            }
        }

        return self::SUCCESS;
    }
}
