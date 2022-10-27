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
        $flag = true;
        $message = "Please update your plan";
        $company_id = Cache::get('selected_company_' . $request->user()->id);

        $plans = $this->currentCompanyPlan($request);
       
        if($plans) {

            if($request->is('tag*') || $request->is('list*'))  //Check Tag & List model
            {
                $plan = $plans->lists_tags;
                
                if($plan == 'false'){

                    $flag = false;
                } else if($request->is('tag/store')) {

                    $module = new Tag();
                    $flag = $this->checkPlanBalance($plan, $module, $company_id);
                } else if($request->is('list/store')) {

                    $module = new Category();
                    $flag = $this->checkPlanBalance($plan, $module, $company_id);
                }
            }  
            
            if($request->is('campaign*'))  // Check Campaign model
            {
                $plan = $plans->campaigns;

                if($plan == 'false') {

                    $flag = false;
                } else if($request->is('campaign/store')) {

                    $module = new Campaign();
                    $flag = $this->checkPlanBalance($plan, $module, $company_id);
                }
            }

            if($request->is('contact*')) // Check Contact model
            {
                $plan = $plans->contacts;

                if($plan == 'false') {

                    $flag = false;
                } else if($request->is('contact/store')) {

                    $module = new Contact();
                    $flag = $this->checkPlanBalance($plan, $module, $company_id);
                }
            }
       
            if($request->is('field/store'))  // Check Custom field
            {
                $plan = $plans->custom_fields;

                if($plan == 'false') {
                    $flag = false;
                } else {

                    $module = new Field();
                    $flag = $this->checkPlanBalance($plan, $module, $company_id);
                }
            }

            if($request->is('automation*'))  // Check Automation model
            {
                $plan = $plans->workflow;

                if($plan == 'false') {
                    $flag = false;
                } else if($request->is('automation/store')){

                    $module = new Automation();
                    $flag = $this->checkPlanBalance($plan, $module, $company_id);
                }
            }

            if($request->is('opportuni*')) //Check Opportuntiy model
            {
                $plan = $plans->opportunities;
                
                if($plan == 'false') {
                    $flag = false;
                } else if($request->is('opportunity/store')) {

                    $module = new Opportunity();
                    $flag = $this->checkPlanBalance($plan, $module, $company_id);
                }
            }

            if($request->is('order*'))   // Check Order model
            {
                $plan = $plans->orders;

                if($plan == 'false') {
                    
                    $flag = false;
                } else if($request->is('order/store')) {

                    $module = new Order();
                    $flag = $this->checkPlanBalance($plan, $module, $company_id);
                }
            }

            if($request->is('api/*'))    // API call check
            {
                $plan = $plans->lead_webhook;

                if($plan == 'false') {
                    $flag = false;
                }
            }

            if($request->is('user/registration'))
            {
                $plan = $plans->users;
                
                $totalUsers = DB::table('company_user')->where('company_id', $company_id)->count();
                
                if($plan <= $totalUsers) {
                    $flag = false;
                    $message = 'You can not create a new user, Please update your plan';
                }
                
            }
        }

        if(!$flag) {
            return $this->redirect($request, $message);
        }

        return $next($request);
    }

    public function currentCompanyPlan($request) {
        
        $user = $request->user();
        $company_id = Cache::get('selected_company_' . $user->id);

        if($company_id) {
            $company = Company::find($company_id);
        
            // Get company plan details
            $companyPlan = DB::table('plans')->where('plan_id', $company->plan)->get();
    
            $currentPlan = '';
    
            foreach($companyPlan as $company) {
                $currentPlan = $company;
            }
    
            return $currentPlan;
        } 

        return false;
    }

    public function checkPlanBalance($balance, $module, $company_id) {

        $check = true;
       
        if($balance != 'true') {
            $query = $module::where('company_id', $company_id);
            
            if($module->getTable() == 'fields') {
                $query->where('is_custom', '1');
            }
            $count = $query->count();

            if($balance <= $count) {
                $check = false;
            }
        }
        
        return $check;
    }

    public function redirect ($request, $message) {
        $user = $request->user();        
        $user_id = $user->id;
        $companyId = Cache::get('selected_company_' . $user_id);

        $query = Account::select('company_name', 'service', 'accounts.id', 'accounts.status')
                    ->where('company_id', $companyId);

        $accounts = $query->get();
        
        return Inertia::render('Dashboard', [
            'accounts' => $accounts,
            'users' =>$user,
            'translator' => [
                'Dashboard'=>__('Dashboard'),
                'Create a new social profile'=>__('Create a new social profile'),
                'Business profiles'=>__('Business profiles'),
                'No profile'=>__('No profile'),
                'Get started by creating a new social profile.'=>__('Get started by creating a new social profile.'),
                'Click here to create a new social profile'=>__('Click here to create a new social profile'),
                'Confirm to Delete' =>  __('Confirm to Delete'),
                'Are you sure to do this?' => __('Are you sure to do this?'),
                'Yes' =>__('Yes'),
                'No' =>__('No'),  
            ],
            'message' => $message,      
        ]);
    }
}
