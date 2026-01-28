<?php

namespace App\Http\Middleware;

use DB;
use Cache;
use Closure;
use Inertia\Inertia;
use App\Models\Field;
use App\Models\Company;
use App\Models\Campaign;
use App\Models\Contact;
use App\Models\Account;
use App\Models\Automation;
use App\Models\Tag;
use App\Models\Category;
use App\Models\Order;
use App\Models\Opportunity;
use App\Models\Plan;
use Illuminate\Http\Request;

class PlanRestriction 
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        $company = Company::first();
        $access = true;

        $message = "Please update your plan";
        $plan = Plan::where('plan_id', $company->plan)->first();

        if($plan) {
           
            if($request->is('organization*')) {
              $access = $plan->crm_organizations;
            }

            if($request->is('lead*')) {
                $access = $plan->crm_leads;
            }

            if($request->is('contact*')) {
                $access = $plan->crm_contacts;
            }

            if($request->is('field/store')) {
                $access = $plan->crm_custom_fields;
            }

            if($request->is('campaign*')) {
                $access = $plan->campaigns;
            }

            if($request->is('chat')) {
                $access = $plan->chat_conversation;
            }

            if($request->is('order*')) {
                $access = $plan->sale_orders;

                if($access == 'true' || $access != 'false') {
                    return $next($request);
                }
            }

            if($request->is('opportuni*')) {
                $access = $plan->crm_deals;
            }

            if($request->is('product*')) {
                $access = $plan->product_category;

                if($access == 'true' || $access != 'false') {
                    return $next($request);
                }
            }

            if($request->is('automation*')) {
                $access = $plan->workflows;

                if($access == 'true') {
                    $balance = $plan->workflow_operations;
                    $access = $this->balanceAutomation($balance);
                }
            }

            if($request->is('field*')) {
                $access = true;
                
                $related_module = [
                    'lead' => $plan->crm_leads,
                    'contact' => $plan->crm_contacts,
                    'organization' => $plan->crm_organizations,
                    'order' => $plan->sale_orders
                ];
                
                foreach($related_module as $module => $relate) {
                    if($relate == 'false' && $access) {
                        $access = false;
                    }
                }
            }

            if($request->is('tag*') || $request->is('list*')) {
                $access = true;
                
                $related_module = [
                    'lead' => $plan->crm_leads,
                    'contact' => $plan->crm_contacts,
                ];

                foreach($related_module as $module => $relate) {
                    if($relate == 'false' && $access) {
                        $access = false;
                    }
                }
            }
        }

        if($access == 'true' || $access === true) {
            return $next($request);
        }

        session(['message' => $message]);
        return redirect('/');
    }

    public function balanceAutomation($balance) {
          
        $automation = Automation::count(); // GET total count of automation creation
        
        if($balance >= $automation) {
            return true;
        }

        return false;
    }
}
