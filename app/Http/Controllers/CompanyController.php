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
use Cache;
use Mail;
use DB;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class CompanyController extends Controller
{

    public $list_view_columns = [
        'name' => ['label' => 'Name', 'type' => 'text'],
        'company_address' =>  ['label' => 'Address', 'type' => 'text'],
        'company_country' =>  ['label' => 'Country', 'type' => 'text'],
        'email' => ['label' =>'Email', 'type' => 'text'],
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
        
        $columnlist=Cache::get('Company'.'selected_column_list_'. $request->user()->id);       
        $listViewData = $this->listView($request, $module, $this->list_view_columns);
        $moduleData = [
            'singular' => 'Company',
            'plural' => 'Workspaces',
            'module' => 'Company',
            'current_user' => $request->user(),
            'current_page' => 'Company', 
            // Actions
            'actions' => [
              //  'create' => true,
                'detail' => true,
              //  'edit' => true,
              //  'delete' => true,
                'export' => false,
                'import' => false,
                'search' => true,
                'filter' => false,
                'select_field'=>true,
            ],
            'translator' => [],
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
       // return Redirect::route('detailCompany', $company->id );
       return Redirect::route('dashboard');
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
        $wallet = Wallet::where('user_id', $user->id)->first();
        
        $balance = 0.00;
        if($wallet) {
            $balance = $wallet->balance_amount;
        }
       
        $companyId = Cache::get('selected_company_'. $user->id);
        //get current company details
        $currentCompany =  Company::where('id', $companyId)->first();
        // Get message amount deduction
        $messageDeduction = []; //(new UserController)->getAmountDeduction($user->id);
        $paymentMethods = []; //(new UserController)->getPaymentMethods($request , 'direct');

        $stripe_public_key = config('stripe.stripe_key');
        $headers = $this->getModuleHeader(1 , 'Company');        
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
            'translator' => [
                'Detail' => __('Detail'),
                'Notes' => __('Notes'),
                'Edit'  =>__('Edit'),
                'Wallet' => __('Wallet'),
                'Hi' => __('Hi'),
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
    public function destroy($id)
    {
        $company = Company::find($id);
        $company->delete();
        return Redirect::route('listCompany');
    }

    /**
     * Send invite users via mail
     */
    public function sendInvitation(Request $request)
    {
        $emailAddress = [];
        $user = $request->user();
        $company = $user->company[0];

        foreach($request->email as $email){
            $emailAddress = $email['value'];
            $emailAddress = filter_var($emailAddress, FILTER_SANITIZE_EMAIL);

            if (filter_var($emailAddress, FILTER_VALIDATE_EMAIL)) {
                
                $uuid = Str::uuid()->toString();
                $url = url('/') . '/user-invite?unique_id='.$uuid;
                $data['url'] = $url;

                Mail::send('InviteUser', $data, function($message) use($emailAddress) {
                    $message->to($emailAddress)->subject
                    ('User invitation ');
                });
                
                $userInvite = new UserInvite();
                $userInvite->email = $emailAddress;
                $userInvite->user_id = $user->id;
                $userInvite->company_id = $company->id;
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
        Cache::put($module.'selected_column_list_'. $request->user()->id  , $columnList);              
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
        $company->currency = $request->currency;
        $company->time_zone = $request->time_zone;
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
        
        $company_id = $request->company_id;

        $company = Company::findOrFail($company_id);

        if($company) {
            $company->company_country = $request->company_country;
            $company->company_address = $request->company_address;
            $company->company_vat_id = $request->company_vat_id;
            $company->email = $request->email;
            $company->save();
        }

        Cache::put('user_steps_status_'. $request->user_id, 4 );

        return response()->json(['status' => true]);
    }

    public function paymentMethod(Request $request) {
        
        if($request->id) {

            $company = Company::findOrFail($request->id);

            $company->payment_method = $request->method;
            $company->save();

            return Redirect::route('detailCompany', ['id' => $request->id]);
        }
    }
}
