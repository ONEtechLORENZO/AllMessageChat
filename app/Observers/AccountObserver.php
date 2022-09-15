<?php

namespace App\Observers;

use Auth;
use Mail;
use App\Models\Account;
use App\Models\User;
use Illuminate\Support\Facades\Log;

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
        $emailAddress = 'rajkumar@blackant.io';
        $emailAddress = filter_var($emailAddress, FILTER_SANITIZE_EMAIL);

        $data = [
            'data' => $account
        ];

        if($emailAddress){
            Mail::send('account',$data, function($message) use ($emailAddress){
                $message->to($emailAddress)->subject
                ('Welcome');
            });
        } 
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
    }

    /**
     * Handle the Account "deleted" event.
     *
     * @param  \App\Models\Account  $account
     * @return void
     */
    public function deleted(Account $account)
    {
        //
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
}
