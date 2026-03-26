<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Facebook\Facebook;
use App\Http\Controllers\TemplateController;

class WhatsAppUsers extends Model
{
    use HasFactory;

    /**
     * Check user Opt-in
     */
    public function checkUserOptin($number , $accountId)
    {
        $opt_in = WhatsAppUsers::where('number' , $number)->first();
        Log::info('Check user already Opt-in?');
	if(!$opt_in){
		$templateController = new TemplateController();
		$templateController->account_id = $accountId;
		$partnerToken = $templateController->getPartnerToken();
		$appId = $templateController->getAppId($partnerToken);
		$appToken = $templateController->getAppToken($partnerToken, $appId);
		
		$url = config('app.partner_url');
		$endpoint = $url . "app/{$appId}/optin";

		$curl = curl_init();

		curl_setopt_array($curl, array(
			CURLOPT_URL => $endpoint,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_ENCODING => '',
			CURLOPT_MAXREDIRS => 10,
			CURLOPT_TIMEOUT => 0,
			CURLOPT_FOLLOWLOCATION => true,
			CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
			CURLOPT_CUSTOMREQUEST => 'PUT',
			CURLOPT_POSTFIELDS => 'phone='.$number,
			CURLOPT_HTTPHEADER => array(
				'Authorization: '.$appToken,
				'Content-Type: application/x-www-form-urlencoded'
			),
		));

		$response = curl_exec($curl);
		Log::info(['Optin Status', $response]);
		
		$response = json_decode($response, true);
		curl_close($curl);

		if(isset($response['status']) && $response['status'] == 'success') {
			WhatsAppUsers::insert([
				'number' => $number,
				'status' => 'Active'
			]);
			return true;
			Log::info('User Opt-in success');
		} else {
			Log::info('User Opt-in error');
			return false;
		}
	}
	return true;
    }
    
    /**
     * Return long term user access token
     */
    /*
    public function getLongTermAccessToken($account)
    {
        $appId = config('app.fb.app_id');
        $appSecret = config('app.fb.app_secret');
        $url = "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id={$appId}&client_secret={$appSecret}&fb_exchange_token={$account->fb_token}";
        try{

            $response = Http::get($url);
            $response_body = json_decode($response->body(), true);
       
            if(isset($response_body['error'])) {
                $access_token = $response_body['access_token'];
                $account->fb_token = $access_token;
                $account->save();
            }
            $result = $response_body;
        } catch( Exception $e){
            $result = (['status' => false, 'message' => $e->getMessage()]);
        }
    }
    */

    /**
     * Return page token
     */
    public function getFbPageAccessToken($account)
    {
        // Got the app's access token from below call
        // https://developers.facebook.com/docs/facebook-login/guides/access-tokens/#apptokens
        $appId = (string) config('app.meta.app_id');
        $appSecret = (string) config('app.meta.app_secret');
        $app_access_token = ($appId && $appSecret) ? "{$appId}|{$appSecret}" : '';

        $access_token = $account->fb_token; // Facebook user access token
        $pageId = $account->fb_phone_number_id;
        $version = config('app.meta.graph_version');
        $pageAccessToken = $account->page_token; // Facebook page access token
        $pagesList = [];

        if (! empty($account->fb_meta_data)) {
            $decodedPages = base64_decode((string) $account->fb_meta_data, true);
            if ($decodedPages !== false) {
                $pagesList = @unserialize($decodedPages, ['allowed_classes' => false]);
                $pagesList = is_array($pagesList) ? $pagesList : [];
            }
        }

        if($pageAccessToken) {
            return $pageAccessToken;
        }

        if (! empty($pagesList[$pageId]['token'])) {
            $pageAccessToken = $pagesList[$pageId]['token'];
            $account->page_token = $pageAccessToken;
            $account->save();

            return $pageAccessToken;
        } else if( $pageId && $access_token ) {
            $url = "https://graph.facebook.com/{$version}/{$pageId}?fields=access_token&access_token={$access_token}";

            try {
                $response = Http::get($url);
                $response_body = json_decode($response->body(), true);
                if(isset($response_body['error'])){
                    $result = (['status' => false, 'message' => $response_body['error']['message']]);
                } else {
                    $pageAccessToken = $response_body['access_token'];
                    
                    // Store the access token for future use
                    $account->page_token = $pageAccessToken;
                    $account->save();

                    $result = (['status' => true, 'token' => $response_body['access_token']]);
                    return $pageAccessToken;
                }
            } catch( Exception $e){
                $result = (['status' => false, 'message' => $e->getMessage()]);
            }
        }
        Log::info($result);
        return $pageAccessToken;
    }

    /**
     * Return Fetched User data 
     */
    public function getServiceUserInfo( $userId, $account )
    {

        $pageToken = $this->getFbPageAccessToken($account);
        $result = ['status' => false, 'message' => 'Invalid page token'];
        if($pageToken){
            $version = config('app.meta.graph_version');
            $url = "https://graph.facebook.com/{$version}/{$userId}?access_token={$pageToken}";
            //echo $url;
            try{
                $response = Http::get($url);
                $response_body = json_decode($response->body(), true);
                $result = (['status' => true, 'contact_data' => $response_body]);
            } catch( Exception $e){
                $result = (['status' => false, 'message' => $e->getMessage()]);
                log::info(['stats' =>$result ]);
            }

        }
        return $result;
    }

    /**
     * Return facebook page linked accounts
     */
    public function getLinkedAccounts($pageId , $account)
    {
        $account->fb_phone_number_id = $pageId;
        $pageToken = $this->getFbPageAccessToken($account);
        $result = ['status' => false, 'message' => 'Invalid page token'];
       
        if($pageToken){
            //$fb = $this->connectFb();
            $version = config('app.meta.graph_version');
            $url = "https://graph.facebook.com/{$version}/{$pageId}?fields=connected_instagram_account&access_token={$pageToken}";
            try{
                $response = Http::get($url);
                $response_body = json_decode($response->body(), true);
                if(isset($response_body['error'])){
                        $result = (['status' => false, 'message' => $response_body['error']['message']]);
                    } else {
                       
                        $instaId = isset($response_body['connected_instagram_account']['id'] ) ? $response_body['connected_instagram_account']['id'] : '';

                        if($instaId){
                            // Get Instagram user data
                            $url = "https://graph.facebook.com/{$version}/{$instaId}?fields=username,name&access_token={$pageToken}";
                            try{
                                $response = Http::get($url);
                                $response_body = json_decode($response->body(), true);

                                if(isset($response_body['error'])){
                                    $result = (['status' => false, 'message' => $response_body['error']['message']]);
                                } else {
                                    $instaAccountData[$response_body['id']] = "{$response_body['name']} ({$response_body['username']})";
                                    $result =(['status' => true, 'data' => $instaAccountData]);
                                }
                            } catch( Exception $e){
                                $result = (['status' => false, 'message' => $e->getMessage()]);
                            }
                        }
                    }
            } catch( Exception $e){
                $result = (['status' => false, 'message' => $e->getMessage()]);
            }
        }
        return $result;
    }

    /**
     * Subscripe page for trigger webhook
     */
    public function subscripe($account)
    {
        $pagesList = unserialize( base64_decode($account->fb_meta_data) );
        $pageId = $account->fb_phone_number_id;
        $pageToken = $account->page_token ?: ($pagesList[$pageId]['token'] ?? '');

        if($pageToken){
            $version = config('app.meta.graph_version');
            // message_echoes is required to receive outbound messages sent directly
            // from the Facebook Page inbox, not only inbound customer messages.
            $url = "https://graph.facebook.com/{$version}/{$pageId}/subscribed_apps?subscribed_fields=messages,message_echoes,message_reads,message_deliveries,messaging_postbacks&access_token={$pageToken}";
            try{
                $response = Http::post($url);
                $result = json_decode($response->body(), true);
                
            } catch( Exception $e){
                $result = (['status' => false, 'message' => $e->getMessage()]);
            }
            
            Log::info(['Subscripe App result' => $result]);
        }
    }

    /**
     * Return Facebook meta data object
     */
    public function connectFB($var = null)
    {
        $return = new Facebook([
            'app_id' => config('app.meta.app_id'),
            'app_secret' => config('app.meta.app_secret'),
            'default_graph_version' => config('app.meta.graph_version'),
        ]);
        return $return;
    }
}
