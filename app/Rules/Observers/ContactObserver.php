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
        
        $this->set_Service_Subscription($contact);            
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
      if($contact->wasChanged('status'))
      {
         $this->set_Service_Subscription($contact);
      }
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


    //set service_subscription_status

    public function set_Service_Subscription($contact)
    {
        $subscription_status=$contact->status;

        if($subscription_status=='subscribed')
        {
            $services = Service::all();
            foreach($services as $service)
             {
                $contact->services()->save($service);
             }
        }
        if($subscription_status=='unsubscribed')
        {
            $unsub_service=Serviceable::find([$contact->id],['serviceable_id']);

            if($unsub_service)  
                {
                    Serviceable::where('serviceable_id', $contact->id)->delete();
                }
        }
    }

    /**
     * Run flow actions
     */
    public function runFlowActions($contact , $mode)
    {
        
        $user_id = $contact->creater_id;
        $companyId = Cache::get('selected_company_' . $user_id);
        $automations = Automation::where('company_id', $companyId)
            ->where('trigger_mode', $mode)
            ->where('status', true)
            ->get();
        
        foreach($automations as $automation){
            unset($_REQUEST['isFlowAction']); // Reset the flow action
            
            $flow = json_decode($automation->flow);
            $result = $automation->getFlowResult($flow , $contact );
        }
    }
}
