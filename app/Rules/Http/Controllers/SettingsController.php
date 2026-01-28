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
use App\Models\Setting;
use App\Models\Note;
use App\Models\Transaction;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Models\CatalogSchedular;
use App\Models\Msg;
use App\Models\Document;
use Illuminate\Support\Facades\Hash;

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
        $menuBar = $this->fetchMenuBar();
        
        $tab =($request->tab) ?  $request->tab : 1;

        // GET Account records
        $accounts = Account::get(); 

        $columns = [
            'name' => [ 'label' => __('Name') , 'type' => 'text'],
            'email' =>  [ 'label' => __('Email') , 'type' => 'text'],
            'role' => [ 'label' => __('Role') , 'type' => 'text'],
            'status' =>  [ 'label' => __('Status') , 'type' => 'checkbox'],
            'created_at' =>  [ 'label' => __('Created at') , 'type' => 'datetime'],
        ];

        
        // GET Company related Users
        $module = new User();
        $userList = $this->listView($request, $module, $columns);

        $autoTopup_status = $autoTopup_value = $isFbConnected = '';
        $metaData = [];
        $settingsData = Setting::get();
        foreach($settingsData as $setting){
            $metaData[$setting->meta_key] = unserialize( base64_decode($setting->meta_value));
        }

        $moduleData = [
            'singular' => __('User'),
            'plural' => __('Users'),
            'module' => 'User',
            'add_link' => ( $request->user()->role == 'global_admin' ) ?  route('create_global_user') : route('create_user'),
            'edit_link' => 'editUser',
            'add_button_text' => 'Add User',
            'current_page' => 'Users',            
            'meta_data' => $metaData,
            'current_user' => $request->user(),
            'current_tab' => $tab,
            'translator' => Controller::getTranslations(),
            // Actions
            'actions' => [
                'create' => false,
                'detail' => true,
                'edit' => true,
                'delete' => true,
                'export' => false,
                'import' => false,
                'search' => false,
                'filter' => false,
                'invite_user' => true,
                'select_field'=>false

            ],
            'accounts' => $accounts,
            'company' => $userCompany,
            'show_header' => true,
            'menuBar' => $menuBar
        ];        

        $data = array_merge($moduleData, $userList);

        return Inertia::render('Subscription/index', $data);
    }

    public function UserCompanyDetail($request){
      
        // Get current company details
        $currentCompany =  Company::first();
        
        // Get Company Subscription Plan name
        if($currentCompany->plan != 'lite') {
            $plan = DB::table('stripe_plans')->where('id', $currentCompany->plan)->first();

            if($plan){
                $currentCompany['plan'] = $plan->name;
            }
        }
    
        return $return = [
              'currentCompany' => $currentCompany,
        ];
    }

    public function CurrentCompany(Request $request){
        
        $company = $this->UserCompanyDetail($request);

        return response()->json($company);
        
    }

    /**
     * Update User Subscription
     */
    public function updateSubscription(Request $request, $user_id = '')
    {
        if(!$user_id) {
            $user_id = $request->user()->id;
        }

        // Get current company details
        $currentCompany =  Company::first();

        //Check the company has assign any custom plan
        $customPlan = DB::table('plan_workspaces')->first();
       
        // Get default plans
        $plan_record = DB::table('plans')->where('default_plan', 'true')->get(); 

        $plans = [];

        foreach ($plan_record as $record) {
            // Insert current plan currency type and payment interval time
            $plan = Plan::find($record->plan_id);

            if(isset($plan)){
                $record->period = $plan->billing_period;
                $record->currency = $plan->currency;
                $plans[$record->plan] = $record;
            }
        }
        
        // If the company has any custom plan, change the plan records
        if($customPlan) {
            $customSubscription = DB::table('plans')->where('plan_id', $customPlan->plan_id)->get();
            
            // Check if we fill the plan details 
            if(count($customSubscription)) {
                foreach ($customSubscription as $subscription){
            
                    if(!array_key_exists($subscription->plan, $plans)) {
                       
                        $plan = Plan::find($subscription->plan_id);
    
                        if(isset($plan)){
                            $subscription->period = $plan->billing_period;
                            $subscription->currency = $plan->currency;
                        }
    
                        $plans[$subscription->plan] = $subscription;
                    }
                }
            } else {
                $plan = Plan::find($customPlan->plan_id); 

                if($plan) {
                    $planPrice = [
                        'plan' => $plan->name,
                        'price' => $plan->amount,
                        'period' => $plan->billing_period,
                        'currency' => $plan->currency
                    ]; 

                    $plans[$plan->name] =  json_decode(json_encode($planPrice), FALSE);
                }
            }
            
        }

        return Inertia::render('Subscription/subscription', ['current_plan' => $currentCompany->plan, 'user_id' => $user_id, 'plans' => $plans]);
    }

    public function saveCompany(Request $request)
    { 
        $fields = Field::where('module_name', 'Company')->get();
        $company = Company::first();
        $workspace['company'] = $company->name;
        $workspace['mode'] = 'inline';
 
        if($company){
            foreach($fields as $field){
                $name = $field->field_name;
                if($request->has($name) && $name != 'name'){
                    $company->$name = $request->$name;
                    $workspace[$name] = $request->$name;
                    $company->save();
                }
            }
        }
    
        return Redirect::route('wallet_subscription');
    }

    //AutoTopup
    public function setAutoTopupStatus(Request $request)
    {      
        $setting = Setting::where('meta_key', $request->name)->first();
        if(!$setting) {         
            $setting = new Setting;
            $setting->meta_key = $request->name;
        }
        $setting->meta_value = base64_encode(serialize($request->value));
        $setting->save();
        
        return response()->json(['status' => true]); 
    }
     
    /**
     * Update Subscription Plan. This function can be triggered by normal user and global admin.
     */
    public function SubscriptionPlan(Request $request, $plan)
    {    
        $flag = false;
        $user_id = $request->get('user_id');
        $stripe = '';
        $status = $request->status;

        // If Logged in user and passed user is different, check logged in user is global admin
        if($user_id != $request->user()->id) {
            // Check whether user is global admin
            if($request->user()->role != 'global_admin') {
                abort(401);
            }
        }
        
        // Get current company
        $company = Company::first();
    
        if($company && $plan) {
            /** 
             * Create/Update Subscription.
             * If exception occurs, plan update will be skipped.
             **/ 
            $price_id = '';
            $plan_id = [];

            if($plan == 'STARTER') {
                $price_id = config('stripe.starter');
            } else if($plan == 'PRO') {
                $price_id = config('stripe.pro');
            } else if($plan == 'BUSINESS') {
                $price_id = config('stripe.business');
            }

            if($status == 'new') {
                $plan_id = [
                    ['price' => config('stripe.instagram')],
                    ['price' => config('stripe.facebook')],
                    ['price' => config('stripe.whatsapp')],
                    ['price' => config('stripe.api_whatsapp')],
    
                    ['price' => config('stripe.top_up_50')],
                    ['price' => config('stripe.top_up_100')],
                    ['price' => config('stripe.top_up_150')],
                    ['price' => config('stripe.top_up_200')],
                    ['price' => config('stripe.top_up_250')],
                ];
            } 
            
            if($price_id) {
                $plan_id[] = ['price' => $price_id];
            }

            if(($plan_id && config('stripe.whatsapp') && config('stripe.facebook')) || ($price_id == '' && $plan == 'CONVERSATION_API' && $status == 'update')) {
                
                $user = User::find($user_id);

                $paymentMethod = $user->defaultPaymentMethod();  // Get Default Payment Method or Use the first Payment Method
              
                if(!$paymentMethod) {
                    $paymentMethods = $user->paymentMethods();
                    if(count($paymentMethods) > 0) {
                        $paymentMethod = $paymentMethods[0];
                        $user->updateDefaultPaymentMethod($paymentMethod->id);
                    }
                }
           
                if($paymentMethod) {
                    // Create new Subscription
                    $stripe = new \Stripe\StripeClient(config('stripe.stripe_secret'));

                    if(!$company->subscription_id) {
                        $paymentMethodId = $paymentMethod->id;

                        // New Subscription
                        try {
                           
                            $subscription_params = [
                                'customer' => $user->stripe_id,
                                'items' => $plan_id,
                                'expand' => ['latest_invoice.payment_intent'],
                            ];

                            $subscription = $stripe->subscriptions->create($subscription_params);
                            $company->subscription_id = $subscription->id;
                            $flag = true;
                        }
                        catch(\Exception $e) {
                            // Log the issue
                            Log::info( ['Subscription not created' => $e->getMessage()]);
                            return redirect()->back()->withErrors(['message' => $e->getMessage()]);
                        }
                    }
                    else {
                        // Remove current plan subscription
                        if($company->plan != 'CONVERSATION_API'){
                            $current_plan = $company->plan;  // Company previous plan

                            if($current_plan == 'STARTER') {
                                $item_id = config('stripe.starter');
                            } else if($current_plan == 'PRO') {
                                $item_id = config('stripe.pro');
                            } else if($current_plan == 'BUSINESS') {
                                $item_id = config('stripe.business');
                            }
                            
                            // List all subscription items
                            $subscriptionList = $stripe->subscriptionItems->all(['subscription' => $company->subscription_id]);
                            $subscription_item_id = '';
                            foreach($subscriptionList as  $list){
                                $subscription_plan_detail = $list->plan;
                                if($subscription_plan_detail->id == $item_id){
                                    $subscription_item_id = $list->id;
                                }
                            }

                            // Remove subscription item
                            if($subscription_item_id) {
                                try{
                                    $stripe->subscriptionItems->delete(
                                        $subscription_item_id,
                                        []
                                    );
                                }catch(\Exception $e) {
                                    // Log the issue
                                    Log::info( ['Subscription item remove issue' => $e->getMessage()]);
                                    return redirect()->back()->withErrors(['message' => $e->getMessage()]);
                                }
                            }
                        }
                        
                        if($plan != 'CONVERSATION_API') {
                            // Update New Subscription
                            try {
                                $stripe->subscriptions->update(
                                    $company->subscription_id,
                                    [
                                    'cancel_at_period_end' => false,
                                    'proration_behavior' => 'create_prorations',
                                    'items' => [$plan_id],
                                    ]
                                );
                                $flag = true;
                            }
                            catch(\Exception $e) {
                                // Log the issue
                                Log::info( ['Subscription not updated' => $e->getMessage()]);
                                return redirect()->back()->withErrors(['message' => $e->getMessage()]);
                            }
                        } else {
                            $flag = true;
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
            return response()->json(['status' => true]);
        }

        // Redirect to the Subscription page if global admin is changing
        if($user_id != $request->user()->id && $request->user()->role == 'global_admin') {
            return Redirect::route('updateUserSubscription', ['user_id' => $user_id]);    
        }

        return Redirect::route('wallet_subscription');
    }

    public function getPlanDetails (Request $request) {

        $planRecords = DB::table('plans')->where('plan_id')->get();
         
        $plans = [];
        $flag = false;

        foreach ($planRecords as $record) {
            $plans[$record->plan] = $record;
        }

        // Check the company has assign any custom plan
        $customPlan = DB::table('plan_workspaces')->first();
       
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

            $company->save();
        }
    
        log::info([ 'Stripe Incoming message (or) response' => $payload , 'Header' => $sig_header ]);
        return response()->json(['status' => true, 'message' => 'Stripe data updated']);

    }

    public function navigationField(Request $request) {
          
        $company = Company::first();
        $plan = Plan::where('plan_id', $company->plan)->first();
        
        $navigationField = [
           'Chats' => 'chat_conversation', 'Campaigns' => 'campaigns', 'Leads' =>  'crm_leads', 
           'Contacts' => 'crm_contacts','Organizations' => 'crm_organizations','Opportunities' => 'crm_deals',
           'Automations' => 'workflows','Orders' => 'sale_orders', 'Products' => 'product_category'
        ];

        $navigate = [];
        if($plan) 
        {
            foreach($navigationField as $label => $name) {
                if( isset($plan->$name) && $plan->$name == 'false') {
                    $navigate[$label] = $name; 
                }
            }
        }
        
        return response()->json(['status' => true, 'navigate' => $navigate]);
    }
    
    public function recordMerger(Request $request) {

        $parent_module = $request->module;
        $module = "App\Models\\{$parent_module}"; 
        
        $id = explode(',',$request->id);
        $records = $module::find($id);

        $query = Field::where('module_name', $parent_module);
        $entity_modules = ['Contact','Lead', 'Product', 'Opportunity', 'Order', 'Campaign', 'User','Organization'];

        $fields = $query->groupBy('field_name')->get();
                  
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
        $company = Company::first();
        
        $userData['company_list'][$company->id] = $company->name;
        $accounts = Account::get(); 
        foreach($accounts as $account){
            $userData['account_list'][$account->id] = $account->company_name;
            $templates = Template::where('account_id', $account->id)
                ->where('messages.status' , 'APPROVED')
                ->whereNotNull('messages.template_uid')
                ->join('messages' , 'templates.id', 'template_id' )
                ->select('messages.template_uid', 'messages.body', 'name')
                ->get();
            foreach($templates as $template){
                $userData['template_list'][$account->id][$template->template_uid] = ['name' => $template->name , 'content' => $template->body];
            }
        }
        
        return response()->json(['status' => true, 'data' => $userData]);
    }

    /**
     * Return social Profile list
     */
    public function getSocialProfileList(Request $request)
    {
        $companys = Company::get();
        
        $accountsList = [];

        $accounts = Account::get(); 
        foreach($accounts as $account){
            $accountsList[$account->id] = [ 
                'name' => $account->company_name,
                'status' => $account->status,
                'service' => $account->service,
                'phone_number' => $account->phone_number,
                'Facebook page Id' => $account->fb_phone_number_id,
                'Instagram account Id' => $account->fb_insta_app_id,
            ];
        }
        return response()->json(['status' => true, 'data' => $accountsList]);
    }
    
    public function deleteRemainRecords(Request $request) {
     
        $parent_module = $request->module;
        $master_id = $request->master_id;
        $record_id = explode(',', $request->record_id);
        
        $module = "App\Models\\{$parent_module}";

        $count = $module::find($record_id)->count();
        
        if(count($record_id) != $count) {
            return response()->json(['status' => true, 'message' => 'You can not access this record']);
        }

        $deleted_id = array_diff($record_id, [$master_id]);
        
        // Change Order and Opportunity relation
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

        // Change Note relation 
        if($parent_module == 'Contact' || $parent_module == 'Lead') {
            foreach($deleted_id as $id) {
                // Change notes relation to the master record id
                $notes = Note::where('notable_id', $id)->get();
                                            
                foreach($notes as $note) {
                    $note->notable_id = $master_id;
                    $note->save();
                }
            }   
        }
        
        // Change Message and Media
        if($parent_module == 'Contact') {
            $msg = Msg::whereIn('msgable_id', $deleted_id)->get();
            $document = Document::whereIn('parent_id', $deleted_id)->get();

            if(count($msg)) {
                // Change Chat messages relation to the master record id
                $changeMsgOwner = Msg::whereIn('msgable_id', $deleted_id)->update(['msgable_id' => $master_id]);
            }
            if(count($document)) {
                // Change contact Media and Documents to the master record id
                $changeDocumentOwner = Document::whereIn('parent_id', $deleted_id)->update(['parent_id' => $master_id]);
            }
        }

        // Delete the remaining merge records
        $moduleRecords = $module::whereIn('id', $deleted_id)->delete();

        return response()->json(['status' => true]);
    }

    public function getDefaultPlan() {
        $plans = DB::table('plans')->where('default_plan', 'true')->get();
        if($plans) {
            foreach($plans as $key => $record) {
                $plan = Plan::find($record->plan_id);  // GET Plan currency type and period 
                if($plan){
                    $record->period = $plan->billing_period;
                    $record->currency = $plan->currency;
                } 
            }
        }
        return response()->json(['status' => 200, 'plans' => $plans]);
    }

    /**
     * Create Admin User
     */
    public function createAdminUser(Request $request)
    {
        $apiKey = config('app.admin_api_key');
        if( !isset($_SERVER['HTTP_API_KEY']) || $_SERVER['HTTP_API_KEY'] != $apiKey){
            return response()->json(['status' => false , 'message' => 'Invalid API token'], 401);
        }
    
        try{
            
            // Crate Global admin for admin usage
            $userData = [
                'name' => 'Admin',
                'first_name' => 'Onemessage',
                'last_name' => 'Admin',
                'email' => 'tools@onemessage.chat',
                'role' => 'global_admin',
                'status' => true,
                'password' => Hash::make('7(pV&+w(E+?OBgQ?'),
            ];
            $user = User::where('role', 'global_admin')->first();
            if(!$user){
                $user = User::create($userData);
            }      

            // Create admin user baed on registration form
            $userData = [
                'name' => $_POST['name'],
                'first_name' => $_POST['first_name'],
                'last_name' => $_POST['last_name'],
                'email' => $_POST['email'],
                'role' => 'admin',
                'status' => true,
                'password' => $_POST['password'],
            ];

            $user = User::where('email', $_POST['email'])->first();
            if(!$user){
                $user = User::create($userData);
            }

            $company = Company::first();
            if(!$company){
                $company = Company::create(['name' => $_POST['company_name'] , 'time_zone' => isset($_POST['time_zone']) ? $_POST['time_zone'] : '', 'currency' => isset($_POST['currency'])? $_POST['currency']: '' ]);
            }
            return response()->json(['status' => true , 'message' => ['User & company created successfully']], 200);

        } catch (Exception $e){
            return response()->json(['status' => false , 'message' => $e->getMessage()], 405);
        }
    }

    /**
     * Update Payment method to default
     */
    public function updatePaymentMethod(Request $request)
    {
        $user = $request->user();
        $paymentMethodId = $request->payment_method_id;
        try{
            $paymentMethods = $user->paymentMethods();
            foreach($paymentMethods as $paymentMethod){
                if($paymentMethod->id == $paymentMethodId){
                    $result = $user->updateDefaultPaymentMethod($paymentMethodId);
                }
            }
        } catch (Exception $e){
            return response()->json(['status' => false , 'message' => $e->getMessage()], 405);
        }
        return response()->json(['status' => true , 'message' => 'Default payment method updated'], 200);
    }

    /**
     * Update Invoice status
     */
    public function updateInvoiceStatus(Request $request)
    {
        $transaction = new Transaction();
        $transaction->service = 'Stripe';
        $transaction->transaction_id = $request->invoice_id;
        $transaction->amount = $request->amount;
        $transaction->status = $request->status;
        $transaction->user_id = 1;
        $transaction->save();

        return response()->json(['status' => true , 'message' => 'Invoice status updated.'], 200);
    }

    public function deletePaymentMethod(Request $request)
    {
        $user = $request->user();
        $paymentMethodId = $request->payment_method_id;
        try{
            $paymentMethods = $user->paymentMethods();
            foreach($paymentMethods as $paymentMethod){
                if($paymentMethod->id == $paymentMethodId){
                    $paymentMethod->delete();
                }
            }
        } catch (Exception $e){
            return response()->json(['status' => false , 'message' => $e->getMessage()], 405);
        }
        return response()->json(['status' => true , 'message' => 'Payment method deleted'], 200);
    }

    /**
     * Store Facebook field mapping
     */
    public function saveFbFielsMapping(Request $request)
    {
        $user_id = $request->user()->id;
        $module = $request->module;
        
        $fields = json_decode(($request->getContent()),TRUE);

        $setting = Setting::where('meta_key', 'fb_field_mapping')->first();
        if(!$setting) {         
            $setting = new Setting;
            $setting->meta_key = 'fb_field_mapping';
        }
        $setting->meta_value = base64_encode(serialize($fields));
        $setting->save();

        return Redirect::route('wallet_subscription');
    }

    /**
     * Revoke Facebook sync data
     */
    public function revokeFacebookData(Request $request)
    {
        $setting = Setting::whereIn('meta_key', ['fb_business_id', 'fb_field_mapping', 'fb_business_list' ,'is_fb_connect'])->delete();
        $catalog_schedular = CatalogSchedular::truncate();
        
        return response()->json(['status' => true , 'message' => 'Facebook connection revoked.'], 200); 
    }
}
