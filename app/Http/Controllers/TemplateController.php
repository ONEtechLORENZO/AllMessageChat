<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Template;
use App\Models\MessageResponse;
use Illuminate\Support\Facades\Log;
use App\Models\Account;
use App\Models\Message;
use App\Models\User;
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
            $template = Template::find($data['template_id']);

            $endPoint = config('app.fb.api_url');
            $endPoint .= $account->fb_whatsapp_account_id . '/message_templates' ;
            $headers = [
                'Authorization' => 'Bearer '. $account->service_token,
                'Content-Type' => 'application/json',
            ];

            $components = [];
            if($data['data']->body){
                $components[] = json_encode(['type' => 'BODY', 'text' => $data['data']->body]);
            }
            if($data['data']->header_text){
                $components[] = json_encode(['type' => 'HEADER', 'format' => 'TEXT', 'text' => $data['data']->header_text]);
            }
            if($data['data']->body_footer){
                $components[] = json_encode(['type' => 'FOOTER', 'text' => $data['data']->body_footer]);
            }

            $postData = [
                'category' => $template->category,
                'components' => $components,
                'name' => strtolower(str_replace( ' ', '_', $template->name)),
                'language' => 'en_US',
            ];   
            
            $response = Http::withHeaders($headers)->post($endPoint, ($postData))->json();

            // store template id
            if(isset($response['id'])){
                $template->template_uid = $response['id'];
                $template->type = 'text';
                $template->status = 'SUBMITTED';
                $template->save();
                $return = ['status' => true, 'template_id' => $response['id'], 'template_status' => 'SUBMITTED'];
            } else {
                $return = ['status' => 'failed' , 'message' => $response['error']['error_user_title']];
            }
            return $return;

        } else {
            $partnerToken = $this->getPartnerToken();
            if(!$partnerToken) {
                return ['status' => 'failed', 'message' => $this->result];
            }

            $appId = $this->getAppId($partnerToken);
            if(!$appId) {
                return ['status' => 'failed', 'message' => $this->result];
            }

            $appToken = $this->getAppToken($partnerToken, $appId);
            if($appToken) {
                $response = $this->applyTemplate($appToken, $appId, $data);
                return $response;
            }
            else {
                return ['status' => 'failed', 'message' => $this->result];
            }
        }
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
            $account = Account::find($this->account_id);
            foreach($appList as $app) {
                if($account->src_name == $app['name']) {
                    $appId = $app['id'];
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
       
        $template = Template::where('account_id', $data['account_id'])
            ->where('id', $data['template_id'])
            ->first();
        
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

        // Orignal
        $postData = [
            'elementName' => strtolower(str_replace(' ', '_', $template->name)) . '_' . mt_rand(1000,9999) . '_' . $data['account_id'],
            'languageCode' => 'en_US',
            'category' => strtoupper(str_replace(' ', '_',$template->category)),
            'templateType' => strtoupper($data['data']->header_type),
            'vertical' => strtoupper(str_replace(' ', '_',$template->category)),
            'content' => $data['data']->body,
            'footer' => $data['data']->body_footer,
            'example' => $data['data']->example,
        ];

        if($data['file']) {
            $uploadFileData = $this->getUploadFile($token, $id, $data['file']);
            $postData = array_merge($postData, $uploadFileData);
        } else {
            $postData['header'] = $data['data']->header_text;
            $postData['buttons'] = ($buttons);
        }
     
        $result = $this->restApiCall('POST', $endPoint, $header, ($postData));
        if($result['status'] == 'success') {
            $template->template_uid = $result['template']['id'];
            $template->type = $result['template']['templateType'];
            $template->status = 'SUBMITTED'; //result->template->status;
            $template->save();
            $return = ['status' => $result['status'], 'template_id' => $result['template']['id'], 'template_status' => $result['template']['status']];
        } else {
            $template->status = $result['message'];
            $template->save();
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
            'file' => '@"'.$path['url'].'"',
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
        $getFileId = $this->restApiCall('POST', $endPoint, $header, $postData ); 
        $fileId = $getFileId->handleId->message;
      
        $templatePostData = [
            'templateType' => $type,
            'appId' => $id, 
            'exampleMedia' => $fileId,
            'enableSample' => 'true',
        ];
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
        if($account) {
            // Check whether current user can access this account
            if($current_user->id != $account->user_id) {
                return response()->json(['status' => 'failed', 'message' => 'Invalid API token']);
            }
        } else {
            return response()->json(['status' => 'failed', 'message' => 'Invalid account id']);
        }
        
        // Setting the account id 
        $this->account_id = $account_id;
        // Getting the post keys to validate the POST (Comparing the keys)
        $postFields = array_keys($_POST);
        if(count($postFields) == 0) {
            return response()->json(['status' => 'failed', 'message' => 'Please pass the form data']);
        }

        $return = '';
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
                        $request->$field = json_decode($request->$field);
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
        }
        else {
            return response()->json(['status' => 'failed', 'message' => 'Unknown header type.']);
        }

        if($status === false) {
            $return = ['status' => 'failed', 'status_code' => $statusCode, 'result' => $result, 'message' => $message];
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

            $attachFilePath = '';
            if($request->file('attach_file')) {
                $file = $request->file('attach_file');
                $fileName = $file->getClientOriginalName();
                $destinationPath = public_path() . '/attach_files';
                $file->move($destinationPath, $fileName);
                $attachFilePath = ['url' => asset('attach_files/' . $fileName), 'path' => $destinationPath . '/' . $fileName];
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
        return response()->json($return);
    }

    /**
     * Return Templates
     */
    public function getTemplates(Request $request, $account_id)
    {
        $current_user = $request->user();
        $account = Account::find($account_id);
        if($account) {
            // Check whether current user can access this account
            if($current_user->id != $account->user_id) {
                return response()->json(['status' => 'failed', 'message' => 'Invalid API token']);
            }
        } else {
            return response()->json(['status' => 'failed', 'message' => 'Invalid account id']);
        }

        $template = new Template();
        $result = $template->fetchTemplates($account->src_name);
        return response()->json($result);
    }
}