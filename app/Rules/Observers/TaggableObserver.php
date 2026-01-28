<?php

namespace App\Observers;

use App\Models\Taggable;
use App\Models\Contact;
use App\Models\Automation;
use Cache;
use Log;

class TaggableObserver
{
    /**
     * Handle the Taggable "created" event.
     *
     * @param  \App\Models\Taggable  $taggable
     * @return void
     */
    public function created(Taggable $taggable)
    {
        Log::info('tedt');
        $contact = Contact::find($taggable->taggable_id);
        $user_id = $contact->user_id;
        $companyId = Cache::get('selected_company_' . $user_id);
        $automations = Automation::where('company_id', $companyId)
            ->where('trigger_mode', 'contact_tag_related')
            ->get();
        
        foreach($automations as $automation){
            $flow = json_decode($automation->flow);
            $result = $automation->getFlowResult($flow , $contact );
        }
    }

    /**
     * Handle the Taggable "updated" event.
     *
     * @param  \App\Models\Taggable  $taggable
     * @return void
     */
    public function updated(Taggable $taggable)
    {
     
    }

    /**
     * Handle the Taggable "deleted" event.
     *
     * @param  \App\Models\Taggable  $taggable
     * @return void
     */
    public function deleted(Taggable $taggable)
    {
        //
    }

    /**
     * Handle the Taggable "restored" event.
     *
     * @param  \App\Models\Taggable  $taggable
     * @return void
     */
    public function restored(Taggable $taggable)
    {
        //
    }

    /**
     * Handle the Taggable "force deleted" event.
     *
     * @param  \App\Models\Taggable  $taggable
     * @return void
     */
    public function forceDeleted(Taggable $taggable)
    {
        //
    }
}
