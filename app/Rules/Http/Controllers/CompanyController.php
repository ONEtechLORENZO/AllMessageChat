<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Company;
use App\Models\UserInvite;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Models\Price;
use App\Models\Wallet;
use App\Models\Msg;
use App\Models\Plan;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Cache;
use Mail;
use App\Models\Session;
use DB;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Account;
use App\Models\Automation;
use Schema;
use Illuminate\Support\Facades\Http;

class CompanyController extends Controller
{

    public $list_view_columns = [
        'name' => ['label' => 'Name', 'type' => 'text'],
        'company_address' =>  ['label' => 'Address', 'type' => 'text'],
        'company_country' =>  ['label' => 'Country', 'type' => 'text'],
        'email' => ['label' =>'Email', 'type' => 'email'],
        'currency' => ['label' =>'Currency', 'type' => 'text'],
        'plan' => ['label' =>'Plan', 'type' => 'text'],       
    ];

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {      
        $module = new Company();
        $currentUser = $request->user();
        
        $columnlist = Cache::get('Company'.'_selected_column_list_'. $request->user()->id);       
        $listViewData = $this->listView($request, $module, $this->list_view_columns);
        $moduleData = [
            'singular' => 'Company',
            'plural' => 'Workspaces',
            'module' => 'Company',
            'current_user' => $request->user(),
            'current_page' => 'Company', 
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
                'select_field'=>true,
            ],
            'translator' => Controller::getTranslations(),
        ];

        $data = array_merge($moduleData, $listViewData);
        
        return Inertia::render('Company/List', $data);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
    
        $request->validate([
            'name' => 'required|max:255',
        ]);

        $company = Company::firstOrNew(['id' => $request->id]);

        $company->name = $request->name;
        $company->address_line_1 = $request->address_line_1;
        $company->address_line_2 = $request->address_line_2;
        $company->city = $request->city;
        $company->state = $request->state;
        $company->country = $request->country;

        $company->currency = $request->get('currency');
        $company->time_zone = $request->get('time_zone');
        $company->company_address = $request->get('company_address');
        $company->company_country = $request->get('company_country');
        $company->company_vat_id = $request->get('company_vat_id');
        $company->codice_destinatario = $request->get('codice_destinatario');
        $company->email = $request->get('email');

        $company->save();
        if(!$request->id){
            DB::table('company_user')->insert([
                'user_id' => $request->user()->id,
                'company_id' => $company->id
            ]);
        }
        if(($request->user()->role == 'global_admin') && ($request->is('admin/*')))
             return Redirect::route('detail_global_Company', $company->id );
        else
             return Redirect::route('detailCompany', $company->id );
       //return Redirect::route('dashboard');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $company = Company::find($id);
        $users = $company->user;

        // Check user can access the record
        $access = $this->checkPermissin($id, $user);
        if(!$access && $user->role != 'global_admin'){
            abort('401');
        }
        $wallet = Wallet::where('company_id', $id)->first();
        
        $balance = 0.00;
        if($wallet) {
            $balance = $wallet->balance_amount;
        }
       
        $companyId = Cache::get('selected_company_'. $user->id);
        //get current company details
        $currentCompany =  Company::where('id', $companyId)->first();

        // Get message amount deduction
        $messageDeduction = (new UserController)->getMsgAmountDeduction($user->id);
        $paymentMethods = (new UserController)->getPaymentMethods($request , 'direct');

        $stripe_public_key = config('stripe.stripe_key');
        $headers = $this->getModuleHeader(1 , 'Company');   

        $account_id = [];
        $accounts = Account::where('company_id',$id)->get();
        
        foreach($accounts as $account) {
            $account_id[] = $account->id;
        } 

        if($company) {
            $user_count = $users->count();
            $user_id = [];

            foreach($users as $company_User) {
                $user_id[] = $company_User->id;
            } 
            
            $last_signUp = User::whereIn('id',$user_id)->max('user_login');
            
            $company['last_signUp'] = $last_signUp;
            $company['users'] = $user_count;
        }

        $plan = Plan::find($company->plan);
        
        if($plan) {
            $plan['payment_method'] = $company->payment_method;
            $plan['monthly_consumption'] =  $this->monthlyConsumptin($account_id, $companyId);
        }
        
        // GET Company msg revenue data
        $revenue_data = $this->getRevenueData($account_id);

        $data = [
            'record' => $company,
            'current_user' => $user,
            'users' => $users,
            'headers' => $headers,
            'name' => $user->name,
            'balance' => $balance,
            'role' => $user->role,
            'message_deduction' => $messageDeduction,
            'paymentMethods' => $paymentMethods,
            'stripe_public_key' => $stripe_public_key,
            'currentPlan' => $currentCompany,
            'revenue_data' => $revenue_data,
            'companyPlan' => $plan,
            'translator' => [
                'Detail' => __('Detail'),
                'Notes' => __('Notes'),
                'Edit'  =>__('Edit'),
                'Wallet' => __('Wallet'),
                'Hi' => __('Hi'),
                'Acitivies' => __('Acitivies'),
                'Welcome to your Wallet' => __('Welcome to your Wallet'),
                'Here you can see your payments, change your payment method and get your invoices.' => __('Here you can see your payments, change your payment method and get your invoices.'),
                'Available Balance' => __('Available Balance'),
                'Add Balance' => __('Add Balance'),
                'This Month' => __('This Month'),
                'Total Spent' => __('Total Spent'),
                'Business Initiated Chat' => __('Business Initiated Chat'),
                'User Initiated Chat' => __('User Initiated Chat'),
                'Free Entry Point Chats' => __('Free Entry Point Chats'),
                'Messages' => __('Messages'),
                'Your Payment Method' => __('Your Payment Method'),
                'Add a Payment Method' => __('Add a Payment Method'),
                'See Transactions History' => __('See Transactions History'),
                'See Details' => __('See Details'),
                'Download your VAT Invoices' => __('Download your VAT Invoices'),'Go to Invoices'=>__('Go to Invoices'),
                'Recharge your account'=> __('Recharge your account'),'Cancel'=> __('Cancel'),'Enter the amount' => __('Enter the amount')
                ]
        ];
        return Inertia::render('Company/Detail', $data);       
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $company = Company::findOrFail($id);
        echo json_encode(['record' => $company]);
        die;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request,$id)
    {
        $company = Company::find($id);
        Schema::disableForeignKeyConstraints();
        if ($company->delete()) {
            Log::info('Company deleted.');
            Schema::enableForeignKeyConstraints();
         }
        //if(($request->user()->role == 'global_admin') && ($request->is('admin/*')))
            return Redirect::route('listCompany');
        //  else
        //     return Redirect::route('listAdminCompany');
        
    }

    /**
     * Send invite users via mail
     */
    public function sendInvitation(Request $request)
    {
        $emailAddress = [];
        $user = $request->user();
        $company = Company::first();

        foreach($request->email as $email){
            $emailAddress = $email['value'];
            $emailAddress = filter_var($emailAddress, FILTER_SANITIZE_EMAIL);

            if (filter_var($emailAddress, FILTER_VALIDATE_EMAIL)) {
                
                $uuid = Str::uuid()->toString();
                $url = url('/') . '/user-invite?unique_id='.$uuid;
                $data = [
                    'url' => $url,
                    'name' => $company->name
                ];

                Mail::send('InviteUser', $data, function($message) use($emailAddress) {
                    $message->to($emailAddress)->subject
                    ('User invitation ');
                });
                
                $userInvite = new UserInvite();
                $userInvite->email = $emailAddress;
                $userInvite->user_id = $user->id;
                $userInvite->unique_id = $uuid;
                $userInvite->save();
            }
        }
        echo json_encode(['result' => 'success']); die;
    }

    /**
     * Set Base company to the user data
     */
    public function setBaseCompany(Request $request)
    {
        $companyId = $request->company_id;
        Cache::put('selected_company_'. $request->user()->id  , $companyId);
       
        return Redirect::to(url()->previous());
    }
    public function showColumn(Request $request,$module)
    {
        $columnList = $request->columns; 
        $customHeader = [];

        if($module == 'Contact') {
            $customHeader = ['widget_tag', 'widget_list'];   // Check to you want to view this header in list view
            foreach($columnList as $name =>$field) {
                foreach($customHeader as $index => $header) {
                    if($header == $name) {
                        unset($customHeader[$index]);
                    }
                    unset($columnList[$header]);
                }            
            }
        }

        Cache::put($module.'_custom_column_list_'.$request->user()->id, $customHeader);
        Cache::put($module.'_selected_column_list_'. $request->user()->id  , $columnList);              
        return Redirect::to(url()->previous());
    }


    /**
     * Check permission to user can access the record
     */
    public function checkPermissin( $recordId , $user)
    {
        $companyId = Cache::get('selected_company_'.$user->id);
        $userCompanies = $user->company;
        $return = false; 
        foreach($userCompanies as $company){
            if($company->id == $recordId ){
                $return = true;
            }
        }
        return $return;
    }

    public function saveWorkspace(Request $request) {
        
        $request->validate([
            'name' => 'required|max:255',
            'currency' => 'required',
            'time_zone' => 'required'
        ]);

        $company = new Company;

        $company->name = $request->name;
        $company->currency = $request->currency['value'];
        $company->time_zone = $request->time_zone['value'];
        $company->save();

       if($request->user()){
            DB::table('company_user')->insert([
                'user_id' => $request->user()->id,
                'company_id' => $company->id
            ]);
       }

       if($company->id){
          Cache::put('selected_company_'. $request->user()->id  , $company->id);
       }

       Cache::put('user_steps_status_'. $request->user()->id , 3 );

       return response()->json(['status' => true, 'company_id' => $company->id]);
    }

    public function billingInformation(Request $request) {
        
        $user_id = $request->user()->id;
        $currentUser = User::find($user_id);
        $currentCompany = Company::first();
        
        $company = $request->company;
        $user = $request->user;

        $companyFields = [
            'company_country', 'company_vat_id', 'company_address', 'email', 'city', 'state', 'country', 'codice_destinatario','organization', 'phone_number'
        ];

        $userFields = ['first_name', 'last_name', 'name'];

        foreach($userFields as $field) {
            $currentUser->$field = $user[$field];
            if($field == 'name') {
                $currentUser->$field = $user['first_name'].' '.$user['last_name'];
            }

        }

        foreach($companyFields as $field) {
            $currentCompany->$field = $company[$field];
        }

        $currentUser->save();
        $currentCompany->save();

        return response()->json(['status' => true]);
    }

    public function paymentMethod(Request $request) {
        
        if($request->id) {

            $company = Company::findOrFail($request->id);

            $company->payment_method = $request->method;
            $company->save();
        if(($request->user()->role == 'global_admin') && ($request->is('admin/*')))
             return Redirect::route('detail_global_Company', ['id' => $request->id] );
        else
            return Redirect::route('detailCompany', ['id' => $request->id]);
        }
    }

    public function workspaceActivities(Request $request) {

        $account_id = [];
        $accounts = Account::get();
        
        foreach($accounts as $account) {
            $account_id[] = $account->id;
        } 

        $workspace = Company::first();

        if($workspace) {

            $users = User::get();
            $user_id = [];

            foreach($users as $user) {
                $user_id[] = $user->user_id;
            } 
            
            $last_signUp = User::whereIn('id',$user_id)->max('user_login');
            
            $workspace['last_signUp'] = $last_signUp;
            $workspace['users'] = count($user_id);
        }

        $plan = Plan::find($workspace->plan);
        
        if($plan) {
            $plan['payment_method'] = $workspace->payment_method;
            $plan['monthly_consumption'] =  $this->monthlyConsumptin($account_id, $company_id);
        }
        
        // GET Company msg revenue data
        $revenue_data = $this->getRevenueData($account_id);

        return Inertia::render('Company/WorkspaceActivities', [
            'workspace' => $workspace,
            'plan' => $plan,
            'revenue' => $revenue_data
        ]);
    }

    public function getRevenueData($account_id) {

        $query = Msg::whereIn('account_id', $account_id);

        $fields = ['last_month' => 1, 'last_three_month' => 3, 'last_one_year' => 12, 'life_time' => 0];    
  
        foreach($fields as $key => $month) {
            
            $clone[$key] = clone $query;

            if($month != 0) {
                $avg = $clone[$key]->where('msgs.created_at', '>=', now()->startOfMonth()->subMonth($month))->avg('msgs.amount');
            } else {
                $avg = $clone[$key]->avg('msgs.amount');
            }

            if(!$avg) {
                $return[$key] = '0';
            } else {
                $return[$key] = number_format($avg , 4, '.', '');
            }
        }

        return $return; 
    }

    public function monthlyConsumptin($account_id, $company_id)
    {
        $messages = Msg::whereIn('account_id',$account_id)->count();
        $automations = Automation::where('company_id', $company_id)->count();

        $average = $messages + $automations;
        
        return $average;
    }

    /**
     * Return company list based on User
     */
    public function getCompanies(Request $request)
    {
        $userId = $request->parent;
        $company_id = Cache::get('selected_company_'.$request->user()->id);
        $companyList = [];
        $user = User::find($userId);
        $companies = $user->company;
        foreach($companies as $company){
            if($request->user()->id != $userId && $company_id != $company->id){ 
                $companyList[] = $company; 
            }
        }
        return response()->json(['status' => true , 'companies' => $companyList]);
    }

    /**
     * Unlink company to the user  
     */
    public function unlinkCompany(Request $request)
    {
        $condition = [
            'user_id' => $request->user,
            'company_id' => $request->company
        ];
        DB::table('company_user')->where($condition)->delete();

        return Redirect::route('show_Users');
    }

    /**
     * Return company data
     */
    public function getCompanyDetail(Request $request , $id)
    {
        $company = Company::find($id);
        $planid = $company->plan;

        $plan = Plan::find($planid);
        $planName = $plan->name;
        return response()->json(['status' => true , 'plan' => $planName]);
    }

    /**
     * Send company access key to admin mail
     */
    public function sendCompanyKeyToAdmin(Request $request)
    {
        $company = Company::where('id', 1)->first();
        $emailAddress = config('app.admin_email');

        if($company && $emailAddress){

            $accessCode = Str::uuid()->toString();
            $data['url'] = url("/login-admin-user") . "?access_code={$accessCode}";
     
            // Mail::send('ImpersonateCompany', $data, function($message) use($emailAddress) {
            //     $message->to($emailAddress)->subject
            //     ('Login Company admin ');
            // });

            // Store token 
            DB::table('company_access_token')->insert(['token' => $accessCode, 'created_at' => Carbon::now()]);
           
            $result = ['status' => 'Success', 'message' => 'Check admin email to access the company', 'token' => $accessCode];
        } else {

            $result = [ 'status' => 'Failed', 'message' => 'You cannot access that company'];
        }

        return response()->json($result);
    }

    public function updatePaymentMethod(Request $request) {
        
        $company = Company::first();
        $method = $request->method;
        
        $subscription_id = $company->subscription_id;

        $stripe = new \Stripe\StripeClient(config('stripe.stripe_secret'));

        if($method == 'Postpaid') {
            $data = [
                'billing_cycle_anchor' => 'now', // Send invoice immediately
                'collection_method' => 'send_invoice', // Change the mode
                'days_until_due' => 30,
            ];
        } else {
            $data = ['collection_method' => 'charge_automatically'];
        }

        try {
            $subscription = $stripe->subscriptions->update($subscription_id, $data);
        }
        catch(\Exception $e) {
            // Log the issue
            Log::info( ['Payment method change issue' => $e->getMessage()]);
            return response()->json(['status' => false,'message' => $e->getMessage()]);
        }

        $company->payment_method = $method;
        $company->save();

        return response()->json(['status' => 'Success', 'message' => 'You can be successfully changed the paymethod of this workspace.' ]);
    }

    public function workspaceInformation (Request $request) {

        $company = Company::first();

        $company->time_zone = $request->time_zone['value'];
        $company->currency= $request->currency['value'];

        $company->save();

        return response()->json(['status' => true]);
    }

    /**
     * Change service engine of hole social profile
     */
    public function changeServiceEngine(Request $request)
    {
        $company = Company::first();

        $company->service_engine = $request->service_engine;
        $company->save();

        return response()->json(['status' => true]);
    }

    public function updatePostLimit(Request $request)
    {
        $company = Company::first();
        $company->amount_limit = $request->limit;
        $company->save();

        return response()->json(['status' => true]);
    }

    /**
     * Return Session Data
     */
    public function getSessionsData(Request $request)
    {

        $sessions = Session::select(DB::raw('count(id) as `data`'),DB::raw("DATE_FORMAT(created_at, '%m') month"))
            ->where('created_at', '>=', Carbon::now()->subMonth(2))
            ->get();
            
        $sessionArr = [ 'current_month' => 0, 'last_month' => 0];
        $currentMonth = date('m');
        foreach($sessions as $session ) {
            if($session['month'] == $currentMonth) {
                $sessionArr['current_month'] = $session['data'];
            } else {
                $sessionArr['last_month'] = $session['data'];
            }
        }

        return response()->json(['status' => true, 'sessions' => $sessionArr]);
    }
}
