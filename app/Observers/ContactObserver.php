<?php

namespace App\Observers;

use App\Models\Contact;
use App\Models\Serviceable;
use App\Models\Service;
use App\Models\Automation;
use Cache;

class ContactObserver
{
    /**
     * Handle the Contact "created" event.
     *
     * @param  \App\Models\Contact  $contact
     * @return void
     */
    public function created(Contact $contact)
    {
        $this->runFlowActions($contact , 'contact_created');
    }

    /**
     * Handle the Contact "updated" event.
     *
     * @param  \App\Models\Contact  $contact
     * @return void
     */
    public function updated(Contact $contact)
    {
      //  $this->runFlowActions($contact , 'contact_created');
    }

    /**
     * Handle the Contact "deleted" event.
     *
     * @param  \App\Models\Contact  $contact
     * @return void
     */
    public function deleted(Contact $contact)
    {
        //
    }

    /**
     * Handle the Contact "restored" event.
     *
     * @param  \App\Models\Contact  $contact
     * @return void
     */
    public function restored(Contact $contact)
    {
        //
    }

    /**
     * Handle the Contact "force deleted" event.
     *
     * @param  \App\Models\Contact  $contact
     * @return void
     */
    public function forceDeleted(Contact $contact)
    {
        //
    }

    /**
     * Run flow actions
     */
    public function runFlowActions($contact , $mode)
    {
        
        $user_id = $contact->user_id;
        $companyId = Cache::get('selected_company_' . $user_id);
        $automations = Automation::where('company_id', $companyId)
            ->where('trigger_mode', $mode)
            ->get();
        
        foreach($automations as $automation){
            $flow = json_decode($automation->flow);
            $result = $automation->getFlowResult($flow , $contact );
        }
    }
}
