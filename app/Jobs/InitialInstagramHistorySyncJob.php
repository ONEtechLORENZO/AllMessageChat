<?php

namespace App\Jobs;

use App\Models\Account;
use App\Services\MetaIntegrationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class InitialInstagramHistorySyncJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 900;

    public function __construct(
        public int $accountId
    ) {
    }

    public function handle(MetaIntegrationService $metaIntegrationService): void
    {
        $account = Account::query()
            ->where('id', $this->accountId)
            ->where('service', 'instagram')
            ->where('status', 'Active')
            ->first();

        if (! $account) {
            return;
        }

        $metaIntegrationService->runInitialInstagramHistorySync($account);
    }
}
