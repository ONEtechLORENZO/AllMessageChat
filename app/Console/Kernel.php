<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        //
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('command:HandleImport')->everyMinute();
        $schedule->command('command:HandleCampaign')->everyMinute();
        $schedule->command('command:HandleSubscription')->daily();
        $schedule->command('command:RemoveAccessToken')->everyMinute();
        $schedule->command('command:HandleCatalogProduct')->everyMinute();
        $schedule->command('command:ResetSessionValue')->monthlyOn(1, '00:00');
	$schedule->command('command:HandleDocumentStorage')->daily();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
