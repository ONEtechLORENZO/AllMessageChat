<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\OutgoingServerConfig;
use App\Models\MailToAddress;
use App\Models\Company;
use App\Models\Field;
use App\Models\User;
use Illuminate\Support\Facades\Redirect;

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

        return Inertia::render('Subscription/index', [
            'company' => $userCompany
        ]);
    }

    public function UserCompanyDetail($request){
        
        $user_id = $request->user()->id;
        $company_id = Cache::get('selected_company_'.$user_id);

        //get current company details
        $currentCompany =  Company::where('id', $company_id)->first();

        //get related company details
        $userCompany = DB::table('company_user')->where('user_id', $user_id)->get('company_id');
        
        foreach($userCompany as $company){
            $company =  Company::where('id', $company->company_id)->first();
            $related_company[$company['id']] = $company['name'];
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

        $company_id = Cache::get('selected_company_' . $user_id);

        // Get current company details
        $currentCompany =  Company::where('id', $company_id)->first();

        return Inertia::render('Subscription/subscription', ['plan' => $currentCompany->plan, 'user_id' => $user_id]);
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
      
        if($company && $plan) {
            /** 
             * Create/Update Subscription.
             * If exception occurs, plan update will be skipped.
             **/ 
            $plan_id = config('stripe.stripe_' . $plan);
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
                            $company->subscription_id = $subscription->id;
                            $flag = true;
                        }
                        catch(\Exception $e) {
                            // Log the issue

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

                        }
                    }
                }
            }

            if($flag) {
                $company->plan = $plan;
                $company->save();
            }
        }

        // Redirect to the Subscription page if global admin is changing
        if($user_id != $request->user()->id && $request->user()->role == 'global_admin') {
            return Redirect::route('updateUserSubscription', ['user_id' => $user_id]);    
        }
        return Redirect::route('wallet_subscription');
    }
}
