<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Session;
use App\Models\Account;
use App\Models\Company;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class HandleSubscription extends Command
{

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'command:HandleSubscription';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Handle subscription';

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
        $company = Company::first();
        $selectedPlan = $company->plan;
        $accounts = Account::select('service', DB::raw('count(id) as count'))
            ->groupBy('service')
            ->get();
        if(! $accounts || !$selectedPlan){
            return true;
        }

        $accountList = [];
        foreach($accounts as $account){
            $accountList[$account->service] = $account->count;
        }

        $plan = DB::table('plans')
            ->where('plan_id' , $selectedPlan)
            ->first();

        $freeAccount = ($plan->free_accounts) ? $plan->free_accounts : 0;

        $stripe = new \Stripe\StripeClient(config('stripe.stripe_secret'));
        $subscription = $stripe->subscriptions->retrieve($company->subscription_id);
        $subscription_info = [];
        foreach($subscription->items->data as $subscriptionItem) {
            $price_id = $subscriptionItem->price->id;

            $quantity = 0;

            // Set API plan Whatsapp Account count
            if($price_id && ($price_id == config('stripe.api_whatsapp') && $selectedPlan == 'CONVERSATION_API')){
                $quantity = isset($accountList['whatsapp']) ? $accountList['whatsapp'] : 0;
                $quantity = $quantity - $freeAccount;
            }
            //  Set Other plan Whatsapp Account count
            if($price_id && ($price_id == config('stripe.whatsapp') && $selectedPlan != 'CONVERSATION_API')){
                $quantity = isset($accountList['whatsapp']) ? $accountList['whatsapp'] : 0;
                $quantity = $quantity - $freeAccount;
            }

            if($price_id && $price_id == config('stripe.facebook')){
                $quantity = isset($accountList['facebook']) ? $accountList['facebook'] : 0;
            }
            if($price_id && $price_id == config('stripe.instagram')){
                $quantity = isset($accountList['instagram']) ? $accountList['instagram'] : 0;
            }

            if($quantity > 0){
                $subscription_info[] = $stripe->subscriptionItems->createUsageRecord($subscriptionItem->id, [
                    'action' => 'set',
                    'quantity' => $quantity
                ]);
            }
        }
    }
}
