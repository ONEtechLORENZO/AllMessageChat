<?php

namespace App\Observers;

use App\Models\Company;
use App\Models\User;
use App\Models\Wallet;
use Auth;
use Log;

class CompanyObserver
{
    /**
     * Handle the Company "created" event.
     *
     * @param  \App\Models\Company  $company
     * @return void
     */
    public function created(Company $company)
    {
        // Create user in Stripe
        $this->createStripeCustomer($company);

        $user_id = Auth::id();
        $user = User::find($user_id);
        
        if($user){
            $wallet = new Wallet;

            $wallet->balance_amount = 1;
            $wallet->user_id = $user_id;
            $wallet->company_id = $company->id;
            
            $wallet->save();
        }
    }

    /**
     * Handle the Company "updated" event.
     *
     * @param  \App\Models\Company  $company
     * @return void
     */
    public function updated(Company $company)
    {
        //
    }

    /**
     * Handle the Company "deleted" event.
     *
     * @param  \App\Models\Company  $company
     * @return void
     */
    public function deleted(Company $company)
    {
        //
    }

    /**
     * Handle the Company "restored" event.
     *
     * @param  \App\Models\Company  $company
     * @return void
     */
    public function restored(Company $company)
    {
        //
    }

    /**
     * Handle the Company "force deleted" event.
     *
     * @param  \App\Models\Company  $company
     * @return void
     */
    public function forceDeleted(Company $company)
    {
        //
    }

    /**
     * Create stripe customer 
     */
    public function createStripeCustomer(Company $company, $mode = '')
    {
        $secretId = config('stripe.stripe_secret');
        $stripe = new \Stripe\StripeClient($secretId);
        
        if(!$mode) {
            $result = $stripe->customers->create([
                'description' => $company->name,
            ]);
        } 
        else if($mode == 'update') {
            $result = $stripe->customers->update(
                $company->stripe_id,
                []
            );
        }
        
        /*$company->stripe_id = $result->id;
        $_REQUEST['is_stripe_action'] = true;
        $company->save();*/
        return true;
    }
}
