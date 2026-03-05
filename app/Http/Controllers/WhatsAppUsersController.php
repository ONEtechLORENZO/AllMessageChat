<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use App\Models\Account;
use App\Models\Contact;
use App\Models\Session;
use App\Models\WhatsAppUsers;
use Facebook\Facebook;
use App\Models\Setting;
use App\Models\FaceBookAppToken;
use Carbon\Carbon;
use App\Http\Controllers\TemplateController;

class WhatsAppUsersController extends Controller
{ 
    /**
     * Make a User Opt-In
     */
    public function userOptIn(Request $request, $account_id)
    {
        $account = Account::find($account_id);

        if(! $account) {
            return response()->json(['status' => false, 'message' => 'Invalid account id'], 400);
        }
        if(! $account->src_name) {
            return response()->json(['status' => false, 'message' => 'Invalid account.'], 400);
        }
        if(! $request->number) {
            return response()->json(['status' => false, 'message' => 'User number param missing .'], 405);
        }

        $checkOptIn = (new WhatsAppUsers)->checkUserOptin($request->number , $account->src_name);
        if(! $checkOptIn){
            return response()->json(['status' => false, 'message' => 'Invalid user'], 405);
        } else {
            return response()->json(['status' => false, 'message' => 'User accepted'], 200);
        }
    }

    /**
     * Connect FaceBook
     */
    public function connectFaceBook(Request $request, $service)
    {
      session(['service' => $service]);
   
      return redirect()->away("https://admin.onemessage.chat/connect-facebook?service={$service}&domain=".$request->getHttpHost());

    }
    
    /**
     * Store FB User token
     */
    public function storeUserToken(Request $request , $app_name, $token)
    {
        $userId = $this->getFBUserId($token);
        $service = session('service');

        if($service == 'product'){
            $businessList = $this->getBusinessId($userId , $token);
            $metaData = [
                'is_fb_connect' => $token,
                'fb_busness_list' => $businessList,
            ];

            foreach($metaData as $key => $value){
                $userTokenData = Setting::where('meta_key', $key)->first();
                if(! $userTokenData){
                    $userTokenData = new Setting();
                }
                $userTokenData->meta_key = $key;
                $userTokenData->meta_value = base64_encode(serialize($value));
                $userTokenData->save();
            }
            
            return redirect()->route('wallet_subscription', ['tab' => 'settings']);

        } elseif ($service == 'whatsapp') {
            $pages = $this->getBusinessNumbers($userId, $token);
        } else if ($service == 'fb_token') {
            $businessList = $this->getBusinessId($userId , $token);

            $fbToken = FaceBookAppToken::where('user_id', $userId)->first();
            if(!$fbToken) {
                $fbToken = new FaceBookAppToken();
            }

            $fbToken->name = $app_name;
            $fbToken->user_id = $userId;
            $fbToken->token = $token;
            $fbToken->business_name = $businessList;
            $fbToken->save();

            return redirect()->route('listCatalog', ['fbToken' => $fbToken->id]);
            
        } else {
            $pages = $this->getPagesList($userId , $token);
        }
       
        $account = new Account();
        $account->company_name = $app_name;
        $account->service = $service;
        $account->status = 'Draft';
        $account->user_id = $request->user()->id;
        $account->fb_token = $token;
        $account->service_engine = 'facebook';
        $account->fb_user_id = $userId;
        $account->fb_meta_data = base64_encode( serialize($pages));
        $account->save();

        return redirect()->route('edit_account', $account->id);

    }

    /**
     * Return FaceBook user Id
     */
    public function getFBUserId($token)
    {
        $version = config('app.fb.app_graph_version');
        $url = "https://graph.facebook.com/{$version}/me?access_token={$token}";
        $response = Http::get($url);
        $response_body = json_decode($response->body(), true);

        $userId = $response_body['id'];
        return $userId;
    }

    /**
     * Retrun business id
     */
    public function getBusinessId($userId , $token)
    {
        $version = config('app.fb.app_graph_version');
        $url = "https://graph.facebook.com/{$version}/{$userId}/businesses?access_token={$token}";
        $response = Http::get($url);
        $response_body = json_decode($response->body(), true);
        $businessList = [];
        if(isset($response_body['data'])) {
            foreach($response_body['data'] as $data) {
                $businessList[$data['id']] = $data['name'];
            }
        }
        return $businessList;
    }

    /**
     * Return FB Pages 
     */
    public function getPagesList($userId , $token)
    {
        $pages = [];
        $version = config('app.fb.app_graph_version');
        $url = "https://graph.facebook.com/{$version}/{$userId}/accounts?access_token={$token}";
        $response = Http::get($url);
        $response_body = json_decode($response->body(), true);
        $dataArr = $response_body['data'];
        foreach($dataArr as $page) {
            $pages[$page['id']] = [ 'name' => $page['name'], 'token' => $page['access_token']];
        }
        return $pages;
    }

    /**
     * Return business account phone number list
     */
    public function getBusinessNumbers($userId, $token)
    {
        $accounts = [];

        $version = config('app.fb.app_graph_version');
        $url = "https://graph.facebook.com/{$version}/{$userId}/businesses?fields=owned_whatsapp_business_accounts{id,name,phone_numbers},name&access_token={$token}";

        $response = Http::get($url);
        $response_body = json_decode($response->body(), true);
       
        if(isset($response_body['data'])) {
            foreach($response_body['data'] as $business){
                $whatsappAccount = [];
                if( isset($business['owned_whatsapp_business_accounts']['data'])) {
                    foreach($business['owned_whatsapp_business_accounts']['data'] as $account){
                        $id = isset($account['phone_numbers']['data'][0]['id']) ? $account['phone_numbers']['data'][0]['id'] : '';
                        if($id) {
                            $whatsappAccount[$id] = [ 'name' => $account['name'] , 'waba_id' => $account['id']];
                        }
                    }
                }
                $accounts[$business['id']] = ['name' => $business['name'], 'whatsapp_account' => $whatsappAccount];
            }
        }
     
        return $accounts;
    }

    /**
     * Connect FB & Return FB object 
     */
    public function connectFB()
    {
        $fb = new Facebook([
            'app_id' => config('app.fb.app_id'),
            'app_secret' => config('app.fb.app_secret'),
            'default_graph_version' => config('app.fb.app_graph_version'),
            ]);

        return $fb;
    }

    /**
     * Return Gupshup user active status
     */
    public function checkGupshupStatus($account_id, $contactNumber)
    {
        $templateController = new TemplateController();
        $templateController->account_id = $account_id;

        $partnerToken = $templateController->getPartnerToken();
        if(!$partnerToken) {
            return false;
        }

        $appId = $templateController->getAppId($partnerToken);
        if(!$appId) {
            return false;
        }

        $url = 'https://api.gupshup.io/wa/app/'.$appId.'/optin/status?phoneNumber=' . $contactNumber;
        $headers = [
            'Accept' => 'application/json',
            'apikey' => config('app.apiKey')
        ];
    
        $response = Http::asForm()->withHeaders($headers)->get($url);
        $response_body = json_decode($response->body(), true);
        $status = (isset($response_body['users']) && isset($response_body['users']['active']) && $response_body['users']['active'] ) ? true : false; 

        if($status){
            return ['status' => true , 'session_start_time' => $response_body['users']['lastMessageSentTs']];
        } else {
            return ['status' => false];
        }
        die;
    }

     /**
     * Return contact chat status is Active Or Not
     */
    public function checkActiveStatus($account_id, $contactNumber)
    {
        if(strpos($contactNumber, '+') === false){
            $contact_number = '+'.$contactNumber;
        }

        // Check contact is exist 
        $contact = Contact::where('phone_number' , $contact_number)->first();
        if(!$contact){
            return response()->json(['status' => false, 'message' => 'There is no contact given number '], 200);
        }

        // Check account is exist 
        $account = Account::find($account_id);
        if(!$account){
            return response()->json(['status' => false, 'message' => 'There is no social profile given id '], 200);
        }

        $condition = [
            'contact_id' => $contact->id,
            'account_id' => $account_id,
        ];

        $session = Session::where($condition)
            ->where('created_at', '>=', Carbon::now()->subDay())
            ->first();
        
        $status = $this->checkGupshupStatus($account_id , $contactNumber);

        if($status['status']) {
            return response()->json(['status' => true, 'session_status' => 'active' , 'session_start_time' => $status['session_start_time']], 200);
        } else {
            return response()->json(['status' => false, 'session_status' => 'inactive'], 200);
        }
    }
}