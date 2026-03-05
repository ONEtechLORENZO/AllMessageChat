<?php

namespace App\Observers;

use App\Models\Wallet;
use App\Models\Company;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class WalletObserver
{
    /**
     * Handle the Wallet "created" event.
     *
     * @param  \App\Models\Wallet  $wallet
     * @return void
     */
    public function created(Wallet $wallet)
    {
        $this->updateWalletAmount();
    }

    /**
     * Handle the Wallet "updated" event.
     *
     * @param  \App\Models\Wallet  $wallet
     * @return void
     */
    public function updated(Wallet $wallet)
    {
        $this->updateWalletAmount();
    }

    /**
     * Handle the Wallet "deleted" event.
     *
     * @param  \App\Models\Wallet  $wallet
     * @return void
     */
    public function deleted(Wallet $wallet)
    {
        //
    }

    /**
     * Handle the Wallet "restored" event.
     *
     * @param  \App\Models\Wallet  $wallet
     * @return void
     */
    public function restored(Wallet $wallet)
    {
        //
    }

    /**
     * Handle the Wallet "force deleted" event.
     *
     * @param  \App\Models\Wallet  $wallet
     * @return void
     */
    public function forceDeleted(Wallet $wallet)
    {
        //
    }

    public function updateWalletAmount() {

        $wallet = Wallet::first();
        $wallet['user_company'] = Company::first();
    
        //$url = 'http://localhost:8001/api/update-wallet-balance';
        $url = config('app.admin_api_url')."/api/update-wallet-balance";  // Api url for create
        $headers = ['api-key' => config('app.admin_api_key')]; 

        // $response = Http::withHeaders($headers)->post($url, ['wallet' => $wallet]); // Send API call to update wallet Balance
        // $result = $response->body();

        // Log::info(['Wallet Balance update response ' => $result]);
    }
}
