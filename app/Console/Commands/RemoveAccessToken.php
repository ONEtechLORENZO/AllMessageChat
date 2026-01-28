<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class RemoveAccessToken extends Command
{

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'command:RemoveAccessToken';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove access token';

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
        $minutes  = Carbon::now()->subMinutes( 5 );
        DB::table('company_access_token')->where('created_at', '<=', $minutes)->delete();
    }
}
