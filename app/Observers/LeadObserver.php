<?php

namespace App\Observers;

use App\Models\Lead;

class LeadObserver
{
    /**
     * Handle the Lead "created" event.
     *
     * @param  \App\Models\Lead  $lead
     * @return void
     */
    public function created(Lead $lead)
    {
        $this->runFlowActions($lead , 'lead_created');
    }

    /**
     * Handle the Lead "updated" event.
     *
     * @param  \App\Models\Lead  $lead
     * @return void
     */
    public function updated(Lead $lead)
    {
        $this->runFlowActions($contact , 'lead_updated');
    }

    /**
     * Handle the Lead "deleted" event.
     *
     * @param  \App\Models\Lead  $lead
     * @return void
     */
    public function deleted(Lead $lead)
    {
        //
    }

    /**
     * Handle the Lead "restored" event.
     *
     * @param  \App\Models\Lead  $lead
     * @return void
     */
    public function restored(Lead $lead)
    {
        //
    }

    /**
     * Handle the Lead "force deleted" event.
     *
     * @param  \App\Models\Lead  $lead
     * @return void
     */
    public function forceDeleted(Lead $lead)
    {
        //
    }

    /**
     * Run flow actions
     */
    public function runFlowActions($lead , $mode)
    {
        
        $user_id = $lead->creater_id;
        $companyId = Cache::get('selected_company_' . $user_id);
        $automations = Automation::where('company_id', $companyId)
            ->where('trigger_mode', $mode)
            ->where('status', true)
            ->get();
        
        foreach($automations as $automation){
            dd($automation);
            unset($_REQUEST['isFlowAction']); // Reset the flow action
            
            $flow = json_decode($automation->flow);
            $result = $automation->getFlowResult($flow , $contact );
        }
    }
}
