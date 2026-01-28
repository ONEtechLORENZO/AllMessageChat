<?php

namespace App\Observers;

use Auth;
use Mail;
use App\Models\Account;
use App\Models\User;
use App\Models\Template;
use App\Models\Company;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\TemplateController;

class AccountObserver
{
    /**
     * Handle the Account "created" event.
     *
     * @param  \App\Models\Account  $account
     * @return void
     */
    public function created(Account $account)
    {   
        $currendUser = User::find(Auth::id());
        $emailAddress = config('app.log_email');
        $emailAddress = filter_var($emailAddress, FILTER_SANITIZE_EMAIL);

        $data = [
            'data' => $account,
            'url' => url('/')
        ];

        if($emailAddress){
            // Mail::send('account',$data, function($message) use ($emailAddress){
            //     $message->to($emailAddress)->subject
            //     ('Welcome');
            // });
        } 

        // Upate to Admin
//        $this->updateSocialProfileToAdmin($account , 'create');
    }

    /**
     * Handle the Account "updated" event.
     *
     * @param  \App\Models\Account  $account
     * @return void
     */
    public function updated(Account $account)
    {
	    if($account->service == 'instagram') {
		    Account::creatNewBot($account);
	    }
	    // Upate to Admin
	    //       $this->updateSocialProfileToAdmin($account , 'update');

    }

    /**
     * Handle the Account "deleted" event.
     *
     * @param  \App\Models\Account  $account
     * @return void
     */
    public function deleted(Account $account)
    {
        $this->updateSocialProfileToAdmin($account , 'delete');
    }

    /**
     * Handle the Account "restored" event.
     *
     * @param  \App\Models\Account  $account
     * @return void
     */
    public function restored(Account $account)
    {
        //
    }

    /**
     * Handle the Account "force deleted" event.
     *
     * @param  \App\Models\Account  $account
     * @return void
     */
    public function forceDeleted(Account $account)
    {
        //
    }
    /**
     * Update Social Profile to Admin
     */
    public function updateSocialProfileToAdmin($account , $mode)
    {
        $account['user_company'] = Company::first();

        $url = config('app.admin_api_url')."/api/{$mode}-social-profile";  // Api url for create
        $headers = ['api-key' => config('app.admin_api_key')]; 
       
        $response = Http::withHeaders($headers)->post($url, ['account' => $account]); // Send API call to create a social profile
        $result = $response->body();

        Log::info(['Social profile creation response ' => $result]);
    }
}
