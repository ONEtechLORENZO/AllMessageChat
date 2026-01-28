<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Template;
use App\Models\MessageResponse;
use Illuminate\Support\Facades\Log;
use App\Models\Message;
use App\Models\Account;
use App\Models\Document;
use App\Models\MessageButton;
use App\Models\User;
use App\Models\Company;
use Illuminate\Support\Facades\Http;

class TemplateController extends Controller
{
	public $result = '';

    public $account_id = '';

    public $textTemplateFields = ['elementName', 'languageCode', 'category', 'header_type', 'vertical', 'body', 'header_text', 'body_footer', 'buttons', 'example'];

    /**
     * Submit Template to Gupshup
     **/
    public function submitTemplate($data)
    {
        
        if(isset($data['account_id'])){
            $this->account_id = $data['account_id'];
            $account = Account::find($data['account_id']);
        }
        if($account->service_engine == 'facebook'){
            $user = User::find($account->user_id);
            $template = Template::find($data['template_id']);

            $endPoint = config('app.fb.api_url');
            $endPoint .= $account->fb_whatsapp_account_id . '/message_templates' ;
            $headers = [
                'Authorization' => 'Bearer '. $account->fb_token,
                'Content-Type' => 'application/json',
            ];

            $components = [];
            if($data['data']->body){
                $body = ['type' => 'BODY', 'text' => $data['data']->body];
                if($data['data']->get('sample_value')){
                    $samples = array_values($data['data']->get('sample_value'));
                    $body['example'] = (['body_text' => [$samples]]);
                }
                $components[] = json_encode($body);
            }
           // dd($components);
            if($data['data']->header_text){
                $components[] = json_encode(['type' => 'HEADER', 'format' => 'TEXT', 'text' => $data['data']->header_text]);
            }
            if($data['data']->body_footer){
                $components[] = json_encode(['type' => 'FOOTER', 'text' => $data['data']->body_footer]);
            }
            if($data['data']->buttons){
                $buttonObj = [];
                foreach($data['data']->buttons as $button){
                   $buttonItem = [];
                    if($button['button_type'] == 'Quick Reply'){
                        $buttonItem = [
                            'type' => 'QUICK_REPLY',
                            'text' => $button['button_text']
                        ];
                    }
                    if($button['button_type'] == 'Call to Action'){
                        if($button['action'] == 'call_phone_number'){
                            $buttonItem = [
                                'type' => 'PHONE_NUMBER',
                                'text' => $button['button_text'],
                                'phone_number' => $button['phone_number']
                            ];
                        } else if( 'visit_website' == $button['action'] ){
                            $buttonItem = [
                                'type' => 'URL',
                                'text' => $button['button_text'],
                                'url' => $button['url']
                            ];
                            if($button['url_type'] != 'Static'){
                                $buttonItem['example'] = [$button['url']];
                            }
                        }
                    }
                    if($buttonItem){
                        $buttonObj[] = $buttonItem;
                    }
                }
                if($buttonObj){
                    $components[] = json_encode(['type' => 'BUTTONS', 'buttons' => $buttonObj]);
                }
            }
 
            if($data['file']) {
                $fileMimeType = mime_content_type($data['file']['path']);
                $type = '';
                if(strstr($fileMimeType, "video/")){
                    $type = 'VIDEO';
                }else if(strstr($fileMimeType, "image/")){
                    $type = 'IMAGE';
                } else {
                    $type = 'DOCUMENT';
                }

                $fileUrl = $this->uploadAttachmentToFacebook($account , $data['file'], $fileMimeType);

                $components[] = json_encode([
                    'type' => 'HEADER',
                    'format' => $type,
                    'example' => (['header_handle' => [$fileUrl]]),

                ]); 
            }

            if($data['data']->language == 'en'){
                $tempLanguage = 'en_US';
            } else if($data['data']->language == 'pt') {
                $tempLanguage = 'pt_BR';
            } else {
                $tempLanguage = $data['data']->language;
            }

            $postData = [
                'category' => $template->category,
                'components' => $components,
                'name' => strtolower(str_replace( ' ', '_', $template->name)),
                'language' => $tempLanguage,
            ];   

            log::info(['Template post data' => $postData , 'endpoint' => $endPoint]);
            $response = Http::withHeaders($headers)->post($endPoint, ($postData))->json();
            Log::info(["Template submitted => ", $response]);

            // store template id
            if(isset($response['id'])){
                $messageObj = Message::where(['template_id' => $template->id , 'language' => $data['data']->language])->first(); 
                $messageObj->template_uid = $response['id'];
                $template->type = 'text';
                $messageObj->status = 'SUBMITTED';
                $messageObj->save();

                // Upate Admin Portal 
                $this->updateAdminSectionTemplate( $response['id'] );
                
                $return = ['status' => true, 'template_id' => $response['id'], 'template_status' => 'SUBMITTED'];
            } else {
                $message = isset($response['error']['error_user_title']) ? $response['error']['error_user_title'] : $response['error']['message'] ;
                $return = ['status' => 'failed' , 'message' => $message];
            }
            return $return;

        } else {
            $partnerToken = $this->getPartnerToken();
            if(!$partnerToken) {
                return ['status' => 'failed', 'message' => $this->result, 'status_code' => 404];
            }

            $appId = $this->getAppId($partnerToken);
            if(!$appId) {
                return ['status' => 'failed', 'message' => $this->result, 'status_code' => 404];
            }

            $appToken = $this->getAppToken($partnerToken, $appId);
            if($appToken) {
                $response = $this->applyTemplate($appToken, $appId, $data);
                return $response;
            }
            else {
                return ['status' => 'failed', 'message' => $this->result, 'status_code' => 404];
            }
        }
    }

    /**
     * Upload FB media for template
     */
    public function uploadAttachmentToFacebook($account, $file, $fileMimeType)
    {
        $endPoint = config('app.fb.api_url');
        $endPoint .= $account->fb_phone_number_id . '/media' ;
        $headers = [
            'Authorization' => 'Bearer '. $account->fb_token,
            'Content-Type' => 'application/json',
        ];

        // Resumable Upload
        $sessionUrl = config('app.fb.api_url') . config('app.fb.app_id') ."/uploads";
        $sessionData = [
            'file_length' => $_FILES['attach_file']['size'],
            'file_type' => $_FILES['attach_file']['type'],
            'access_token' => $account->fb_token,
        ];
     
        $getSessionId = Http::post($sessionUrl, $sessionData)->json();
        $sessionId = $getSessionId['id'];

        // Upload file
        $uploadFileUrl = config('app.fb.api_url') ."{$sessionId}";
     
        $curl = curl_init();
        
        curl_setopt_array($curl, array(
            CURLOPT_URL => $uploadFileUrl, 
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => file_get_contents($file['path']),
            CURLOPT_HTTPHEADER => array(
                'Authorization: OAuth '.$account->fb_token,
                'file_offset: 0',
                'Content-Type: '. $_FILES['attach_file']['type']
              ),
        ));
        
        $response = curl_exec($curl);
        $result = json_decode($response, true);
        curl_close($curl);
       //echo $response;
        return $result['h'];

        // $file =  new \CURLFILE($file['path'], $fileMimeType);
        // $postData = [
        //     'messaging_product' => 'whatsapp',
        //     'file' => $file,
        //     'type' => trim($fileMimeType),
        // ];

        /*
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => $endPoint,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => $postData,
            CURLOPT_HTTPHEADER => array(
                'Authorization: Bearer '.$account->fb_token
            ),
        ));

        $response = curl_exec($curl);
        curl_close($curl);
        $result = json_decode($response, true);
        return $result['id'];
        */
        // $getMediaEndpoint = config('app.fb.api_url').$result['id']."?access_token=".$account->fb_token;
        // $response = Http::get($getMediaEndpoint)->json();
        // log::info(['upload file response' => $response]);
        // return $response['url'];
    }

    /**
     * Login and return app token of OneMessage
     */
    public function getPartnerToken()
    {
        $username = config('app.partner_username');
        $password = config('app.partner_password');

        $postFields = ['email' => $username , 'password' => $password ];
        $endPoint = 'account/login';

       // $header = array('Content-Type: application/x-www-form-urlencoded');
        $getAppToken = $this->restApiCall('POST', $endPoint, [], $postFields);
       
        $return = '';
        if(isset($getAppToken['token'])) {
            $return = $getAppToken['token'];
        } else {
		    $this->result = 'Error occured while generating partner token';
	    }
        return $return;
    }

    /**
     * Check whether App name is related to the partner account. If so, return App Id
     */
    public function getAppId($token)
    {
        $appId = '';
        $endPoint = 'account/api/partnerApps';
        $header = array('token' => $token);

        $getAppList = $this->restApiCall('GET', $endPoint, $header);

        if(isset($getAppList['status']) && $getAppList['status'] == 'error'){
            $this->result = $getAppList['message'];
        } else if(isset($getAppList['partnerAppsList'])){
            $appList = $getAppList['partnerAppsList'];
            if(count($appList) == 0 ){
                $this->result = 'App not linked on partner.'; 
            }

            $account = Account::find($this->account_id);
            foreach($appList as $app) {
                if($account->src_name == $app['name']) {
                    $appId = $app['id'];
                } else {
                    $this->result = 'Invalid APP Name.';  // Might be Invalid partner token
                }
            }
        } else {
            $this->result = 'Unknown APP Name.';
        }
        return $appId;
    }
    
    /**
     * Return App token using Partner token and App ID
     **/
    public function getAppToken($token, $id)
    {
        $appToken = '';
        $endPoint = "app/{$id}/token";
        $header = array("token" => $token);
        $getAppToken = $this->restApiCall('GET', $endPoint, $header);
        if($getAppToken && $getAppToken['status'] == 'success') {
            $appToken = $getAppToken['token']['token'];
        } else {
            $this->result = 'Error occured while generating App token.';
        }
        return $appToken;
    }

    /**
     * Apply Template
     **/
    public function applyTemplate($token, $id, $data)
    {
        $endPoint = "app/{$id}/templates";
        $header = [
            "token" => $token,
        ];
      
       $body = $data['data']->body;
       $example = isset($data['data']->example) ? $data['data']->example : $body ;

        if($data['data']->sample_value){
            foreach($data['data']->sample_value as $key => $value ){
                $value = str_replace('{{' , '' , $value);
                $value = str_replace('}}' , '' , $value);
                $example = str_replace('{{'.$key.'}}' , '['.$value.']' , $example);
            }
        }

       // dd( $body, $example);
        $template = Template::where('account_id', $data['account_id'])
            ->where('id', $data['template_id'])
            ->first();

        /*
        $buttons = [];
        $buttonArr = $data['data']->buttons;
        if(!is_array($data['data']->buttons)) {
            $buttonArr = json_decode($data['data']->buttons);		
        }

        foreach($buttonArr as $button) {
            if(!is_array($button)) {
                $button = ((array) $button);
            }
            if(isset($button['id'])){
                $buttonData = [
                    'type' => str_replace(' ', '_', $button['button_type']),
                    'text' => $button['button_text'],
                    'phone_number' => isset($button['phone_number']) ? $button['phone_number']: '',
                    'url' => isset($button['url']) ? $button['url'] : '',
                ];
                $buttons[] = (object) $buttonData;
            }
        }
        if(!$buttons){
           $buttons[] = (object)[];
        }
        */
        $buttonObj = [];
        if($data['data']->buttons && is_array($data['data']->buttons)){
            foreach($data['data']->buttons as $button){
                if( !is_array($button) || !isset($button['button_type'])) {
                    continue;
                }

                $buttonItem = [];
                if($button['button_type'] == 'Quick Reply'){
                    $buttonItem = [
                        'type' => 'QUICK_REPLY',
                        'text' => $button['button_text']
                    ];
                }
                if($button['button_type'] == 'Call to Action'){
                    if($button['action'] == 'call_phone_number'){
                        $buttonItem = [
                            'type' => 'PHONE_NUMBER',
                            'text' => $button['button_text'],
                            'phone_number' => $button['phone_number']
                        ];
                    } else if( 'visit_website' == $button['action'] ){
                        $buttonItem = [
                            'type' => 'URL',
                            'text' => $button['button_text'],
                            'url' => $button['url']
                        ];
                        if($button['url_type'] != 'Static'){
                            $buttonItem['example'] = [$button['url']];
                        }
                    }
                }
                if($buttonItem){
                    $buttonObj[] = $buttonItem;
                }
            }
        }
       
        if($data['data']->language == 'en' || $data['data']->languageCode == 'en'){
            $tempLanguage = 'en_US';
            $language = 'en';
        } else if($data['data']->language == 'pt') {
            $tempLanguage = 'pt_BR';
            $language = 'pt';
        } else {
            $tempLanguage = $data['data']->language;
            $language = $data['data']->language;
        }
       
        // Orignal
        $postData = [
            'elementName' => strtolower(str_replace(' ', '_', $template->name)),
            'languageCode' => $tempLanguage,
            'category' => strtoupper(str_replace(' ', '_',$template->category)),
            'templateType' => strtoupper($data['data']->header_type),
            'vertical' => 'TEXT', // strtoupper(str_replace(' ', '_',$template->category)),
            'content' =>  $body,
            'footer' => $data['data']->body_footer,
            'example' => $example,
            'enableSample' => true,
            'allowTemplateCategoryChange' => false,
            'codeExpirationMinutes' => 1,
            'addSecurityRecommendation' => true,
           
        ];

        if($data['file']) {
            $uploadFileData = $this->getUploadFile($token, $id, $data['file']);
            $postData = array_merge($postData, $uploadFileData);
        } else {
            $postData['header'] = $data['data']->header_text;
            $postData['exampleHeader'] = $data['data']->header_text;
            $postData['buttons'] = json_encode($buttonObj);
        }
        
       // log::info(['Template post data' => ($postData), 'header' => $header , 'url' => $endPoint]);
        log::info(['Template post data' => ($postData)]);
     //  dd(($postData));
        $result = $this->restApiCall('POST', $endPoint, $header, ($postData));
        log::info(['temmplatew result' => $result]);
        
        $messageObj = Message::where(['template_id' => $template->id , 'language' => $language])->first(); 
        if($result['status'] == 'success') {

                 
            $messageObj->template_uid = $result['template']['id'];
        //    $template->type = $result['template']['templateType'];
            $messageObj->status = 'SUBMITTED';
            $messageObj->save();

            // Upate Admin Portal 
            $this->updateAdminSectionTemplate($result['template']['id']);

            // $template->template_uid = $result['template']['id'];
            // $template->type = $result['template']['templateType'];
            // $template->status = 'SUBMITTED'; //result->template->status;
            // $template->save();
            $return = ['status' => $result['status'], 'template_id' => $result['template']['id'], 'template_status' => $result['template']['status']];
        } else {
            $messageObj->status = $result['message'];
            $messageObj->save();

            //$template->save();
            $return = ['status' => $result['status'], 'template_status' => $result['message']];
            return $return;
        }
        
        // TODO Why are we storing the message response? We are using Msg model now. Is it needed?
        // Msg model - Used for store the conversation, not log
        $response = new MessageResponse();
        $response->message_id = $result['template']['id'];
        $response->ref_id = 'SUBMITTED';
        $response->type = 'Template';
        $response->response = base64_encode(serialize($result));
        $response->save();

        return $return;
    }

    /**
     * Upload File
     **/
    public function getUploadFile($token , $id, $path){
        $endPoint = "app/{$id}/upload/media";
        $rootPath = url('/'); //app_path();
        $storagePath = storage_path('app');
        $fileMimeType = mime_content_type("{$path['path']}");
        $header = array(
                "Authorization: {$token}",
                );
        $postData = [
            'file' => "@'".$path['url']."'",
            'file_type' => $fileMimeType
        ];

        $type = '';
        if(strstr($fileMimeType, "video/")){
            $type = 'VIDEO';
        }else if(strstr($fileMimeType, "image/")){
            $type = 'IMAGE';
        } else {
            $type = 'DOCUMENT';
        }
     
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => 'https://partner.gupshup.io/partner/'.$endPoint,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => $postData,
            CURLOPT_HTTPHEADER => array(
                'Authorization: '.$token
            ),
        ));

        $response = curl_exec($curl);
        curl_close($curl);
        $responseBody = json_decode($response, true);
        $templatePostData = [];
        if($responseBody && $responseBody['status'] = 'success') {
            $templatePostData = [
                'templateType' => $type,
                'appId' => $id, 
                'exampleMedia' => $responseBody['handleId']['message'],
                'enableSample' => 'true',
            ];
        }
       return $templatePostData;
    } 

    /**
     * cURL request 
     *
     * @param $method string
     * @param $header array
     * @param $data array
     */
    public function restApiCall($method, $endPoint, $header = [], $postFields = '' ){

        $template = new Template();
        $url = config('app.partner_url').$endPoint;
        $result = $template->submitData($url, $method, $header, $postFields);
        return ($result);
        /*
        dd($result);
        $curl = curl_init();

        curl_setopt_array($curl, array(
                    CURLOPT_URL => config('app.partner_url').$endPoint,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => '',
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 0,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => $method,
                    CURLOPT_POSTFIELDS => $postFields,
                    CURLOPT_HTTPHEADER => $header,
                    ));

        $response = curl_exec($curl);

        curl_close($curl);
        return json_decode($response);
        */
    }
	
    /** 
     * Create WhatsApp template (Function will be triggered from OneMessage API)
     **/
    function createWhatsAppTemplateViaAPI(Request $request, $account_id)
    {
        $current_user = $request->user();
        $account = Account::find($account_id);

        if(!$account) {
            return response()->json(['status' => false, 'message' => 'Invalid account id'], 400);
        }
       
        // Setting the account id 
        $this->account_id = $account_id;
        // Getting the post keys to validate the POST (Comparing the keys)
        $postFields = array_keys($_POST);
        if(count($postFields) == 0) {
            return response()->json(['status' => false, 'message' => 'Please pass the form data', 400]);
        }

        $return = '';
        $attachFilePath = '';
        $status = true;
        // Validate the request
        if($request->header_type && strtoupper($request->header_type) == 'TEXT') {
            foreach($this->textTemplateFields as $field) {
                // Check whether form data fields passed by user are valid fields and it has values. 
                // Button field can have empty values
                if(in_array($field, $postFields) 
                    && ($request->$field || $field == 'buttons')) {
                    // Process button field
                    if($field == 'buttons' && $request->$field) {
                        //$request->$field = json_decode($request->$field);
                        if(is_array($request->$field)) {
                            $request->$field = json_encode($request->$field);
                        } else {
                            $status = false;
                            $statusCode = 400;
                            $message = "{$field} field is not an array";
                            $result = 'Bad Request';
                            continue;
                        }
                    }
                    $templateData[$field] = $request->$field;
                } else {
                    $status = false;
                    $statusCode = 400;
                    $message = "{$field} field is empty";
                    $result = 'Bad Request';
                    continue;
                }
            }
        } else if($request->header_type && in_array(strtoupper($request->header_type) , ['IMAGE' , 'DOCUMENT', 'VIDEO'])) {
            
            if($request->file('attach_file')) {
                $file = $request->file('attach_file');
                $fileName = $file->getClientOriginalName();
                $destinationPath = public_path() . '/attach_files';
                $file->move($destinationPath, $fileName);
                $attachFilePath = ['url' => asset('attach_files/' . $fileName), 'path' => $destinationPath . '/' . $fileName];
            } else {
                $status = false;
                $statusCode = 400;
                $message = "Attachment file missing";
                $result = 'Bad Request';
            }
        }
        else {
            return response()->json(['status' => false, 'message' => 'Unknown header type.'], 400);
        }

        if($status === false) {
            $return = ['status' => false, 'status_code' => $statusCode, 'result' => $result, 'message' => $message];
        } else {
            // Create new DRAFT template
            $template = new Template();
            $template->name = $request->get('elementName');
            $template->category = $request->get('category');
            $template->languages = [$request->get('languageCode')];
            $template->status = 'DRAFT';
            $template->account_id = $account_id;
            $template->save();

            $template_id = $template->id;
        
            // Create new Template Message
            $message = new Message();
            $message->header_type = $request->get('header_type');
            if ($message->header_type == 'text') {
                $message->header_content = $request->get('header_text');
            } else {
                $message->header_content = '';
            }
            
            $message->body = $request->get('body');
            $message->footer_content = $request->get('body_footer');
            $message->template_id = $template_id;
            $message->language = $request->get('languageCode');
            $message->attach_file = isset($attachFilePath['url']) ? $attachFilePath['url'] : '';
            $message->example = $request->get('example');
            $message->save();

            $return = $this->submitTemplate(['account_id' => $account_id, 'template_id' => $template_id, 'data' => $request, 'file' => $attachFilePath]);
            Log::info($return);
        }
        $statusCode = 200;
        if(isset($return['status_code'])){
            $statusCode = $return['status_code'];
            unset($return['status_code']);
        }
        return response()->json($return , $statusCode);
    }

    /**
     * Return Templates
     */
    public function getTemplates(Request $request, $account_id)
    {
        $current_user = $request->user();
        $account = Account::find($account_id);
       
        if(! $account) {
            return response()->json(['status' => false, 'message' => 'Invalid account id']);
        }
        $template = new Template();
        $result = $template->fetchGupshupTemplates($account->src_name);
        return response()->json($result);
    }

    /**
     * Sync Templates
     */
    public function syncTemplate(Request $request)
    {
      
        $condition['service'] = 'whatsapp';
        
        if(isset($_GET['account'])) {
          $condition['id'] = $_GET['account']; 
        }
        try{
            $accounts = Account::where('status' , 'Active')
                ->where($condition)
                ->get();
          
            $template = new Template();
            foreach($accounts as $account){
                if($account->service_engine != 'facebook') {
                    $templates = $template->fetchGupshupTemplates($account->src_name);
                    if(isset($templates['status']) && $templates['status'] == 'success') {
                        foreach($templates['templates'] as $templateData){
                            if($templateData['status'] == 'APPROVED'){
                                $template = Template::where('template_uid' , $templateData['id'])->where('account_id', $account->id)->first();

                                if(!$template){
                                
                                    $template = new Template();
                                    $template->name = $templateData['elementName'];
                                    $template->account_id = $account->id;
                                    $template->template_name = $templateData['elementName'];
                                    $template->template_name_space = $templateData['namespace'];
                                    $template->category = $templateData['category'];
                                    $template->languages = [$templateData['languageCode']];
                                    $template->status = 'APPROVED';
                                    $template->template_uid = $templateData['id'];
                                    $template->type = strtolower($templateData['templateType']);
                                    $template->created_by = $request->user()->id;
                                    $template->save();

                                    $message = new Message();
                                    $message->template_id = $template->id;
                                    $message->body = $templateData['data'];
                                    $message->template_uid = $templateData['id'];
                                    $message->status = 'APPROVED';
                                    $message->header_type = strtolower($templateData['templateType']);
                                    $message->language = $templateData['languageCode'];
                                    $message->save();

                                    $templateEntireData = json_decode($templateData['containerMeta']);
                                    if(isset($templateEntireData->buttons) ) {
                                  
                                        // Save Template buttons
                                        foreach($templateEntireData->buttons as $button){
                                            $button = ((array)($button));
                                            $buttonObj = new MessageButton();
                                            $buttonObj->button_type = $button['type'];
                                            $buttonObj->body = $button['text'];

                                            if ($buttonObj->button_type == 'Call to Action') {
                                                $buttonObj->action = $button['action'];
                                                if ($buttonObj->action == 'call_phone_number') {
                                                    $buttonObj->body = $button['text'];
                                                    $buttonObj->phone_number = $button['phone_number'];
                                                } else {
                                                // $buttonObj->body = '';
                                                    $buttonObj->phone_number = '';
                                                }
                        
                                                if ($buttonObj->action == 'visit_website') {
                                                    $buttonObj->url_type = $button['url_type'];
                                                    $buttonObj->url = $button['url'];
                                                } else {
                                                    $buttonObj->url_type = '';
                                                    $buttonObj->url = '';
                                                }
                                            } else if($buttonObj->button_type == 'URL') {
                                                $buttonObj->button_type = 'Call to Action';
                                                $buttonObj->action = 'visit_website';
                                                $buttonObj->url = $button['url'];
                                                $buttonObj->url_type = 'Static';
                                            } else if($buttonObj->button_type == 'QUICK_REPLY') {
                                                $buttonObj->button_type = 'Quick Reply';
                                                $buttonObj->body= $button['text'];
                                            } else {
                                                $buttonObj->action = '';
                                                $buttonObj->phone_number = '';
                                                $buttonObj->url_type = '';
                                                $buttonObj->url = '';
                                            }
                                            $buttonObj->message_id = $message->id;
                                            $buttonObj->save();
                                        }

                                    }
                                }

                            }
                        }
                    }
                } else {
                    $templateList = $template->fetchFacebookTemplates($account);
                    foreach($templateList as $templateData){
                        if($templateData['status'] == 'APPROVED') {
                            $template = Template::where('name' , $templateData['name'])->where('account_id', $account->id)->first();
                            
                            $attachment = '';
                            $templateContent = $buttons =  [];
                            $templateContent['type'] = 'text';
                            foreach($templateData['components'] as $component){
                                if($component['type'] == 'HEADER') {
                                    $templateContent['type'] = isset($component['format']) ? $component['format'] : 'text';
                                }
                                $content = isset($component['text']) ? $component['text'] : ''; 
                                if(!$content){
                                    if( isset($component['format']) && isset($component[$component['format']])){
                                        $content = ($component[strtolower($component['format'])]);
                                    } elseif(isset($component['format']) && isset($component['example'])) {
                                        $content = '';
                                        $attachment = ($component['example']['header_handle'][0]) ? $component['example']['header_handle'][0] : '';
                                    } 
                                }
                                if($component['type'] == 'BUTTONS'){
                                    $buttons = $component['buttons'];
                                }
                                $templateContent[$component['type']] = $content;
                            }

                            if(!$template) {
                                $template = new Template();
                                $template->name = $templateData['name'];
                                $template->account_id = $account->id;
                                $template->template_name = $templateData['name'];
                                $template->template_name_space = $templateData['name'];
                                $template->category = $templateData['category'];
                                $template->languages = [$templateData['language']];
                                $template->status = 'APPROVED';
                            //    $template->template_uid = $templateData['id'];
                                $template->type = isset($templateData['type']) ? strtolower($templateData['type']) : strtolower($templateContent['type']) ;
                                $template->created_by = $request->user()->id;
                                $template->save();
                            } 

                            $message = Message::where([
                                    'template_id' => $template->id,
                                    'template_uid' => $templateData['id'],
                                    'language' => $templateData['language'],
                                ])
                                ->first();

                            if(!$message) {

                                // Update template language
                                $templateLanguages = $template->languages;
                                if($templateData['language'] == 'en_US'){
                                    $templateData['language'] = 'en';
                                } else if($templateData['language'] == 'pt_BR') {
                                    $templateData['language'] = 'pt';   
                                }
                                if(! in_array( $templateData['language'], $templateLanguages)) {
                                    $templateLanguages[] = $templateData['language'];
                                    $template->languages = $templateLanguages;
                                    $template->save();
                                }

                                // Save media 
                                $documentId = '';
                                if($attachment && $template->id){
                                    $name = $templateData['name']."_".time();
                                    $type = $templateContent['type'];
                                    if($type == 'IMAGE') {
                                        $type = 'image/jpeg';
                                        $name .= '.jpeg';
                                    } else if($type == 'VIDEO'){
                                        $type = 'video/mp4';
                                        $name .= '.mp4';
                                    } else {
                                        $type = $type."/ " ;
                                    }

                                    if ($file = @file_get_contents($attachment) !== false) {
                                        $file = file_get_contents($attachment);
                                    }
                                    $path = "document/{$account->id}/{$template->id}/{$name}";
                                    $document = new Document();
                                    $documentId = $document->saveDocument($name, $type , $file, $template->id, 'Template', $path, $attachment);
                                }

                                // Save template content  
                                $message = new Message();
                                $message->template_id = $template->id;
                                $message->template_uid = $templateData['id'];
                                $message->status = 'APPROVED';
                                $message->body = isset($templateContent['BODY']) ? $templateContent['BODY'] : '';
                                $message->header_content = isset($templateContent['HEADER']) ? $templateContent['HEADER'] : '';
                                $message->footer_content = isset($templateContent['FOOTER']) ? $templateContent['FOOTER'] : '';
                                $message->header_type = isset($templateContent['type']) ? strtolower($templateContent['type']) : 'text';
                                $message->language = $templateData['language'];
                                $message->attach_file = ($documentId) ? $documentId : '';
                                $message->save();

                                // Save Template buttons
                                foreach($buttons as $button){
                                    $buttonObj = new MessageButton();
                                    $buttonObj->button_type = $button['type'];
                                    $buttonObj->body = $button['text'];

                                    if ($buttonObj->button_type == 'Call to Action') {
                                        $buttonObj->action = $button['action'];
                                        if ($buttonObj->action == 'call_phone_number') {
                                            $buttonObj->body = $button['text'];
                                            $buttonObj->phone_number = $button['phone_number'];
                                        } else {
                                           // $buttonObj->body = '';
                                            $buttonObj->phone_number = '';
                                        }
                
                                        if ($buttonObj->action == 'visit_website') {
                                            $buttonObj->url_type = $button['url_type'];
                                            $buttonObj->url = $button['url'];
                                        } else {
                                            $buttonObj->url_type = '';
                                            $buttonObj->url = '';
                                        }
                                    } else if($buttonObj->button_type == 'URL') {
                                        $buttonObj->button_type = 'Call to Action';
                                        $buttonObj->action = 'visit_website';
                                        $buttonObj->url = $button['url'];
                                        $buttonObj->url_type = 'Static';
                                    } else if($buttonObj->button_type == 'QUICK_REPLY') {
                                        $buttonObj->button_type = 'Quick Reply';
                                        $buttonObj->body= $button['text'];
                                    } else {
                                        $buttonObj->action = '';
                                        $buttonObj->phone_number = '';
                                        $buttonObj->url_type = '';
                                        $buttonObj->url = '';
                                    }
                                    $buttonObj->message_id = $message->id;
                                    $buttonObj->save();
                                }
                               
                            }
                        }
                    }
                }
            }
            $templates = Template::where('account_id', $account->id)->get();
            $response = ['status' => true, 'message' => 'Template synced successfully' , 'templates' => $templates];
        } catch (Exception $e){
            $response = ['status' => false, 'message' => $e->getMessage()];
        }
        
        return response()->json($response);
    }

    
    /**
     * Update Admin section social profile templates
     */
    public function updateAdminSectionTemplate($templateId)
    {
        $company = Company::first();
        $postData['company_name'] = $company->name;
        $postData['template_id'] = $templateId;

        $url = config('app.admin_api_url')."/api/create-social-profile-template";  // Api url creation
        $headers = ['api-key' => config('app.admin_api_key')]; 
       
        $response = Http::withHeaders($headers)->post($url, $postData ); // Send API call to create a social profile template
        $result = $response->body();
    }

    /**
     * Update template status
     */
    public function updateTemplateStatus(Request $request)
    {
        $message = Message::where('template_uid' , $request->template_id )->first(); 
        
        $message->status = $request->tempStatus;
        if($request->tempStatus == 'REJECTED'){
            $message->error_reason = $request->reason;    
        }
        $message->save();

        $response = ['status' => true, 'message' => 'Template status updated successfully'];
        return response()->json($response);
    }
}
