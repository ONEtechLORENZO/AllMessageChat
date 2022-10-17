<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Models\Account;
use App\Models\Contact;
use App\Models\Msg;
use App\Models\Company;
use App\Observers\AccountObserver;
use App\Observers\ContactObserver;
use App\Observers\CompanyObserver;
use App\Observers\MsgObserver;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        Account::observe(AccountObserver::class);
        Contact::observe(ContactObserver::class);
        Company::observe(CompanyObserver::class);
        Msg::observe(MsgObserver::class);
    }
}
