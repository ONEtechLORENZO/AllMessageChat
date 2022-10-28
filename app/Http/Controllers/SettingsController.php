<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\OutgoingServerConfig;
use App\Models\MailToAddress;
use App\Models\Company;
use App\Models\Field;
use App\Models\User;
use App\Models\Plan;
use App\Models\Account;
use App\Models\Template;
use App\Models\Order;
use App\Models\Opportunity;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;

use Cache;
use DB;

class SettingsController extends Controller
{
    /**
     * Settings  - Initially open SMTP configuration
     */
    public function settings(Request $request)
    {
        $user = auth()->user();
        $id = $user->id;

        $smtpConfigData = OutgoingServerConfig::where('user_id', $id)->first();
        if ($smtpConfigData)
            $smtpConfigData->password = unserialize(base64_decode($smtpConfigData->password));

        return Inertia::render('Admin/Settings/OutgoingServer', ['smtpData' => $smtpConfigData]);
    }
    /**
     * Settings  - To mail address configuration
     */
    public function toMail(Request $request)
    {
        $user_id = auth()->user()->id;
        $toAddress = MailToAddress::where('user_id', $user_id)->first();

        return Inertia::render('Admin/Settings/ToAddress', ['toMailData' => $toAddress]);
    }

    /**
     * Save SMTP configuration
     */
    public function saveOutgoingServerData(Request $request)
    {
        $user = auth()->user();
        $id = $user->id;

        $request->validate([
            'from_name' => 'required|max:255',
            'from_email' => 'required|max:255',
            'server_name' => 'required|max:255',
            'user_name' => 'required|max:255',
            'password' => 'required|min:8',
            'port_num' => 'required|integer',
            'port_type' => 'required|max:255',
        ]);

        $smtpConfig = OutgoingServerConfig::where('user_id', $id)->first();
        if ($smtpConfig == null)
            $smtpConfig = new OutgoingServerConfig();

        $smtpConfig->user_id = $id;
        $smtpConfig->from_name = $request->get('from_name');
        $smtpConfig->from_email = $request->get('from_email');
        $smtpConfig->server_name = $request->get('server_name');
        $smtpConfig->user_name = $request->get('user_name');
        $smtpConfig->password = base64_encode(serialize($request->get('password')));
        $smtpConfig->port_num = $request->get('port_num');
        $smtpConfig->port_type = $request->get('port_type');

        $smtpConfig->save();
        return Redirect::route('settings')->with('success', 'Outgoing settings saved successfully.');;
    }

    /**
     * Save To address
     */
    public function saveToAddressData(Request $request)
    {
        $user_id = auth()->user()->id;
        $request->validate([
            'to_name' => 'required|max:255',
            'to_email' => 'required|max:255|email',
        ]);

        $toAddress = MailToAddress::where('user_id', $user_id)->first();
        if ($toAddress == null)
            $toAddress = new MailToAddress();

        $toAddress->to_name = $request->get('to_name');
        $toAddress->to_email = $request->get('to_email');
        $toAddress->user_id = $user_id;

        $toAddress->save();
        return Redirect::route('to_mail');
    }

    public function walletSubscription(Request $request)
    {    
        $userCompany = $this->UserCompanyDetail($request);

        $companyId = Cache::get('selected_company_' . $request->user()->id);

        // GET Account records
        $accounts = Account::where('company_id', $companyId)->get(); 

        $columns = [
            'name' => [ 'label' => ' Name' , 'type' => 'text'],
            'email' =>  [ 'label' => 'Email' , 'type' => 'text'],
            'role' => [ 'label' => 'Role' , 'type' => 'text'],
            'status' =>  [ 'label' => 'Status' , 'type' => 'checkbox'],
            'created_at' =>  [ 'label' => 'Created at' , 'type' => 'datetime'],
        ];

        $module = new User();
        
        // GET Company related Users
        $userList = $this->listView($request, $module, $columns);

        $moduleData = [
            'singular' => 'User',
            'plural' => 'Users',
            'module' => 'User',
            'add_link' => ( $request->user()->role == 'global_admin' ) ?  route('create_global_user') : route('create_user'),
            'edit_link' => 'editUser',
            'add_button_text' => 'Add User',
            'current_page' => 'Users',
            'current_user' => $request->user(),
            // Actions
            'actions' => [
                'create' => true,
                'detail' => true,
                'edit' => true,
                'delete' => true,
                'export' => false,
                'import' => false,
                'search' => true,
                'filter' => false,
                'invite_user' => true,
                'select_field'=>true

            ],
            'accounts' => $accounts,
            'company' => $userCompany,
            'show_header' => false
        ];        

        $data = array_merge($moduleData, $userList);

        return Inertia::render('Subscription/index', $data);
    }

    public function UserCompanyDetail($request){
        
        $user_id = $request->user()->id;
        $company_id = Cache::get('selected_company_'.$user_id);

        // Get current company details
        $currentCompany =  Company::where('id', $company_id)->first();
        
        // Get related company details
        $userCompany = DB::table('company_user')->where('user_id', $user_id)->get('company_id');

        foreach($userCompany as $company){
            $company =  Company::where('id', $company->company_id)->first();
            if($company) {
                $related_company[$company['id']] = $company['name'];
            }
        }
        
        // Get Company Subscription Plan name
        if($currentCompany->plan != 'lite') {
            $plan = DB::table('stripe_plans')->where('id', $currentCompany->plan)->first();

            if($plan){
                $currentCompany['plan'] = $plan->name;
            }
        }
    
        return $return = [
              'currentCompany' => $currentCompany,
              'relatedCompany' => $related_company
        ];
    }

    public function CurrentCompany(Request $request){
        
        $company = $this->UserCompanyDetail($request);

        return response()->json($company);
        
    }

    public function changeCompany(Request $request, $id){
        
        if($id){
            Cache::put('selected_company_'. $request->user()->id  , $id);
        }
    }

    /**
     * Update User Subscription
     */
    public function updateSubscription(Request $request, $user_id = '')
    {
        if(!$user_id) {
            $user_id = $request->user()->id;
        }

        $flag = false;
        $company_id = Cache::get('selected_company_' . $user_id);

        // Get current company details
        $currentCompany =  Company::where('id', $company_id)->first();

        //Check the company has assign any custom plan
        $customPlan = DB::table('plan_workspaces')->where('company_id', $company_id)->first();
       
        // Get all Plan details
        $plan_record = DB::table('plans')->where('default_plan', 'true')->get(); 

        $plans = [];

        foreach ($plan_record as $record) {
            // Insert current plan currency type and payment interval time
            $plan = Plan::find($record->id);
            if(isset($plan)){
                $record->period = $plan->billing_period;
                $record->currency = $plan->currency;
                $plans[$record->plan] = $record;
            }
        }

        // If the company has custom plan, change the plan records
        if($customPlan) {
            $customSubscription = DB::table('plans')->where('plan_id', $customPlan->plan_id)->get();
           
            foreach ($customSubscription as $subscription){
                $plans[$subscription->plan] = $subscription;
                $flag = true;
            }
            
            if($flag) {
                unset($plans['enterprise']);
            }
        }

        return Inertia::render('Subscription/subscription', ['current_plan' => $currentCompany->plan, 'user_id' => $user_id, 'plans' => $plans]);
    }

    public function saveCompany(Request $request)
    { 
        $user_id = $request->user()->id;
        $company_id = Cache::get('selected_company_'.$user_id);
        $fields = Field::where('module_name', 'Company')->get();
        
        $company = Company::findOrFail($company_id);
      
        if($company){
            foreach($fields as $field){
                $name = $field->field_name;
                if($request->has($name)){
                    $company->$name = $request->$name;
                    $company->save();
                }
            }
        }

        return Redirect::route('wallet_subscription');
    }

    /**
     * Update Subscription Plan. This function can be triggered by normal user and global admin.
     */
    public function SubscriptionPlan(Request $request, $plan)
    {    
        $flag = false;
        $user_id = $request->get('user_id');
        $stripe = '';

        // If Logged in user and passed user is different, check logged in user is global admin
        if($user_id != $request->user()->id) {
            // Check whether user is global admin
            if($request->user()->role != 'global_admin') {
                abort(401);
            }
        }
        
        $company_id = Cache::get('selected_company_' . $user_id);
        
        // Get current company
        $company = Company::findOrFail($company_id);
        
        if($plan) {
            $stripe = DB::table('stripe_plans')->where('id', $plan)->first();
        }
        
        if($company && $plan && $stripe) {
            /** 
             * Create/Update Subscription.
             * If exception occurs, plan update will be skipped.
             **/ 
            //$plan_id = config('stripe.stripe_' . $plan);
            $plan_id = $stripe->price_id;
            
            if($plan_id) {
                $user = User::find($user_id);
                // Get Default Payment Method or Use the first Payment Method
                $paymentMethod = $user->defaultPaymentMethod();
              
                if(!$paymentMethod) {
                    $paymentMethods = $user->paymentMethods();
                    if(count($paymentMethods) > 0) {
                        $paymentMethod = $paymentMethods[0];
                    }
                }
              
                if($paymentMethod) {
                    // Create new Subscription
                    if(!$company->subscription_id) {
                        $paymentMethodId = $paymentMethod->id;
                  
                        // New Subscription
                        try {
                            $subscription = $user->newSubscription('default', $plan_id)->create($paymentMethodId);
                            $company->subscription_id = $subscription->stripe_id;
                            $flag = true;
                        }
                        catch(\Exception $e) {
                            // Log the issue
                            Log::info( ['Subscription not created' => $e->getMessage()]);
                            return redirect()->back()->withErrors(['message' => $e->getMessage()]);
                        }

                    }
                    else {
                        // Update Subscription
                        try {
                            $user->subscription('default')->swap($plan_id);
                            $flag = true;
                        }
                        catch(\Exception $e) {
                            // Log the issue
                            Log::info( ['Subscription not created' => $e->getMessage()]);
                            return redirect()->back()->withErrors(['message' => $e->getMessage()]);
                        }
                    }
                }
            }

            if($flag) {
                $company->plan = $plan;
                $company->save();
            }
        }
        
        if($request->is_register_step){
            Cache::put('user_steps_status_'. $request->user()->id , 6 );
            return response()->json(['status' => true]);
        }

        // Redirect to the Subscription page if global admin is changing
        if($user_id != $request->user()->id && $request->user()->role == 'global_admin') {
            return Redirect::route('updateUserSubscription', ['user_id' => $user_id]);    
        }

        return Redirect::route('wallet_subscription');
    }

    public function getPlanDetails (Request $request) {

        $company_id = Cache::get('selected_company_' . $request->user()->id);

        $planRecords = DB::table('plans')->where('plan_id')->get();
         
        $plans = [];
        $flag = false;

        foreach ($planRecords as $record) {
            $plans[$record->plan] = $record;
        }

        // Check the company has assign any custom plan
        $customPlan = DB::table('plan_workspaces')->where('company_id', $company_id)->first();
       
        // If the company has custom plan, change the plan records
        if($customPlan) {
            $customSubscription = DB::table('plans')->where('plan_id', $customPlan->plan_id)->get();
            
            foreach ($customSubscription as $subscription) {
                $plans[$subscription->plan] = $subscription;
                $flag = true;
            }

            if($flag){
                unset($plans['enterprise']);
            }
        }

        return Inertia::render('Subscription/plan',['plans' => $plans]);
    }

    public function saveSubscriptionChange (Request $request) {
        
        if($request->id) {
            $plan = DB::table('plans')
                        ->where('id', $request->id)
                        ->update([$request->name => $request->value]);
            
            return Redirect::route('plan_editor');                   
        }
    }

    /**
     * Update payment method
     */
    public function updatePayment(Request $request)
    {
        $endpoint_secret = config('stripe.stripe_webhook');
        $payload = file_get_contents("php://input");
        $sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'];
        log::info([ 'Stripe Incoming message (or) response' =>  $payload ]);
        
        $event = null;

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload, $sig_header, $endpoint_secret
            );
        } catch(\UnexpectedValueException $e) {
            log::info([ 'Invalid payload' =>  $e->getMessage()]);

            // Invalid payload
            http_response_code(400);
            exit();
        } catch(\Stripe\Exception\SignatureVerificationException $e) {
            log::info([ 'Invalid signature' =>  $e->getMessage()]);

            // Invalid signature
            http_response_code(400);
            exit();
        }

        $invoice = $event->data->object;
        $order_id = $invoice->metadata->woocommerce_order_id;
        $subscription_id = $invoice->subscription;

        $company = Company::where('subscription_id' , $subscription_id )->first();
        if($company){
            switch ($event->type) {
                case 'invoice.paid':

                    $status = 'completed';
                    break;
                case 'invoice.payment_failed':
                
                    $status = 'failed';
                    break;
            }
            // Update the order status
            if($company->status != $status)
                $company->status = $status;

        }
        $company->save();
        log::info([ 'Stripe Incoming message (or) response' => $post_data , 'Payload' => $payload , 'Header' => $sig_header ]);
    }

    public function navigationField(Request $request) {
        
        $plan = $this->currentCompanyPlan($request);
          
        $navigationField = [
           'Contacts' => 'contacts','Tags' =>  'lists_tags', 'Lists' => 'lists_tags','Campaigns' => 'campaigns','Automations' => 'workflow','Opportunities' => 'opportunities','Orders' => 'orders',
        ];

        $navigate = [];

        if($plan) 
        {
            foreach($navigationField as $label => $name) {
                if($plan->$name == 'false') {
                    $navigate[$label] = $name; 
                }
            }
        }
        
        return response()->json(['status' => true, 'navigate' => $navigate]);
    }
    
    public function recordMerger(Request $request) {

        $parent_module = $request->module;
        $module = "App\Models\\{$parent_module}"; 
        $company_id = Cache::get('selected_company_' . $request->user()->id);      
        
        $id = explode(',',$request->id);
        $records = $module::find($id)->where('company_id', $company_id);

        $query = Field::where('module_name', $parent_module);
        $entity_modules = ['Contact','Lead', 'Product', 'Opportunity', 'Order', 'Campaign', 'User','Organization'];

        if(in_array($parent_module, $entity_modules)) {
            $query->where('company_id', $company_id);
        }

        $fields = $query->get();
                  
        if($fields) {
            foreach($fields as $field) {
                if($field['field_type'] == 'relate') {

                    $field_name = $field['field_name'];
                    $relateModule = $field['options']['module'];

                    $module = "App\Models\\{$relateModule}";  // Related module

                    foreach($records as $record) {
                        $related = $module::where('id', $record->$field_name)->first(); // Related record details

                        if($related) {
                           $record[$field_name] =  [ 'label' => $related['name'], 'value' => $related['id'], 'module' => 'Organization'];
                        }
                    }
                }
            }
        }          

        return Inertia::render('RecordMerger', [
            'module' => $parent_module,
            'records' => $records,
            'fields' => $fields,
            'record_id' => $id
        ]);
    }

    /**
     * Return user based company & company based accounts
     */
    public function fetchUserAccountData(Request $request)
    {
        $user = $request->user();
        $userData = [];
       // $companyList = $accountList = $templateList = [];
        $companys = $user->company;
        
        foreach($companys as $company){
            $userData['company_list'][$company->id] = $company->name;
            $accounts = Account::where('company_id', $company->id)->get(); 
            foreach($accounts as $account){
                $userData['account_list'][$account->id] = $account->company_name;
                $templates = Template::where('account_id', $account->id)->get();
                foreach($templates as $template){
                    $userData['template_list'][$account->id][$template->template_uid] = $template->name;
                }
            }
        }
        return response()->json(['status' => true, 'data' => $userData]);
    }
    
    public function deleteRemainRecords(Request $request) {
        
        $parent_module = "Contact";
        $master_id = $request->master_id;
        $record_id = explode(',', $request->record_id);
        
        $company_id = Cache::get('selected_company_' . $request->user()->id);      
        $module = "App\Models\\{$parent_module}";

        $count = $module::find($record_id)->where('company_id', $company_id)->count();
        
        if(count($record_id) != $count) {
            return response()->json(['status' => true, 'message' => 'You can not access this record']);
        }

        $deleted_id = array_diff($record_id, [$master_id]);
        
        if($parent_module == 'Contact') {
            foreach($deleted_id as $id) {

                // Change Order relation to master record id
                $order = Order::where('contact', $id)->first();
                if($order) {
                    $order->contact = $master_id;
                    $order->save();
                }
                
                // Change Opportunity relation to master record id
                $opportunity = Opportunity::where('contact_id', $id)->first();
                if($opportunity) {
                    $opportunity->contact_id = $master_id;
                    $opportunity->save();
                }
            }
        }
        
        // Delete the remaining merge records
        $moduleRecords = $module::where('id',$deleted_id)
                        ->where('company_id', $company_id) 
                        ->delete();
        
        return response()->json(['status' => true]);
    }
}
