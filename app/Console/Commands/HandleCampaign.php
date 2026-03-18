<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\CampaignExecutionService;

class HandleCampaign extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'command:HandleCampaign';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'handle campaign scheduling';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(CampaignExecutionService $campaignExecutionService)
    {
        $campaignExecutionService->runDueCampaigns();

        return self::SUCCESS;
    }
}
