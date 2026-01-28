<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Session;

class ResetSessionValue extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'command:ResetSessionValue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset the sessions on every month';

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
    public function handle()
    {
        //$sessions = Session::truncate();
    }
}
