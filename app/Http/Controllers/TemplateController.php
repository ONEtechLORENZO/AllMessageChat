<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Template;
use App\Models\MessageResponse;
use Illuminate\Support\Facades\Log;
use App\Models\Account;
use App\Models\Message;

class TemplateController extends Controller
{
	public $result = '';
    public $textTemplateFields = ['elementName', 'languageCode', 'category', 'header_type', 'vertical', 'body', 'header_text', 'body_footer', 'buttons', 'example'];
    public $attahmentTemplateFields = ['elementName', 'languageCode', 'category', 'header_type', 'vertical', 'body', 'body_footer', 'example'];


    /**
     *  Submit Template to GupShup
     **/
    public function submitTemplate($data){
        $partnerToken = $this->getPartnerToken();
        $appId = $this->getAppId($partnerToken);
        $appToken = $this->getAppToken($partnerToken, $appId);
        if($appToken ) {
            $this->result = $this->saveTemplate($appToken, $appId, $data); 
        }
        return $this->result;
    }

    /** 
     * Return App Token
     */
    public function getPartnerToken(){
        $username = config('app.partner_username');
        $password = config('app.partner_password');
        $postFields = "email={$username}&password={$password}";
        $endPoint = 'account/login';
        $header = array(
                'Content-Type: application/x-www-form-urlencoded'
                );
        $getAppToken = $this->restApiCall('POST', $endPoint, $header, $postFields);
        $return = '';
        if($getAppToken){
            $return = $getAppToken->token;
        } else {
		$this->result = 'Partner token not generated.';
	}
        return $return;
    }

    /**
     * Return App Id
     */
    public function getAppId($token){
        $appId = '';
        $endPoint = 'account/api/partnerApps';
        $header = array(
                "token: {$token}"
                );
        $getAppList = $this->restApiCall('GET', $endPoint, $header );
        $appList = $getAppList->partnerAppsList;
        dd($appList);
        if($appList && isset($appList[0])){
            $appId = $appList[0]->id;
        } 
	if($appId == '') {
                $this->result = 'App id not generated.';
        }
        return $appId;
    }
    
    /**
     * Return App token
     **/
    public function getAppToken($token , $id){
        $appToken = '';
        $endPoint = "app/{$id}/token";
        $header = array(
                "token: {$token}",
                );
        $getAppToken = $this->restApiCall('GET', $endPoint, $header);
        if($getAppToken && $getAppToken->status == 'success'){
            $appToken = $getAppToken->token->token;
        } else {
                $this->result = 'App token not generated.';
        }
        return $appToken;
    }

    /**
     * Save Template
     **/
    public function saveTemplate($token , $id, $data ){
        $endPoint = "app/{$id}/templates";
        $header = array(
                'Content-Type: application/x-www-form-urlencoded',
                "token: {$token}",
                );
       
        $template = Template::where('account_id', $data['account_id'])
            ->where('id', $data['template_id'])
            ->first();
        
        $buttons = [];
	$buttonArr = $data['data']->buttons;
	if(!is_array($data['data']->buttons)){
		$buttonArr = json_decode($data['data']->buttons);		
	}

        foreach($buttonArr as $button){
            $buttonData = [
                'type' => str_replace(' ', '_',$button['button_type']),
                'text' => $button['button_text'],
                'phone_number' => $button['phone_number'],
                'url' => $button['url'],
            ];
            $buttons[] = (object)$buttonData;
        }

        $postData = array(
                'elementName' => strtolower(str_replace(' ', '_',$template->name)).'_'.mt_rand(1000,9999).'_'.$data['account_id'],
                'languageCode' => 'en_US',
                'category' => strtoupper(str_replace(' ', '_',$template->category)),
                'templateType' => strtoupper($data['data']->header_type),
                'vertical' => $template->category,
                'content' => $data['data']->body,
                'footer' => $data['data']->body_footer,
                'example' => $data['data']->example,
                );

        if($data['file']){
            $uploadFileData = $this->getUploadFile($token , $id, $data['file']);
            $postData = array_merge($postData, $uploadFileData);
        } else {
            $postData['header'] = $data['data']->header_text;
            $postData['buttons'] = json_encode($buttons);
        }       
        $result = $this->restApiCall('POST', $endPoint, $header, http_build_query($postData) );
        $retrun = [ 'staus' => false ];
        if($result->status == 'success'){
            $template->template_uid = $result->template->id;
            $template->type = $result->template->templateType;
            $template->status = 'SUBMITTED'; //result->template->status;
            $template->save();
	    $return = [ 'status' => $result->status , 'template_status' => $result->template->status];
	} else {
		$template->status = $result->message;
		$return = [ 'status' => $result->status , 'template_status' => $result->message];	
	}
	
Log::info(['Template log', $result]);
	// Save response
        $response = new MessageResponse();
        $response->message_id = $result->template->id;
        $response->ref_id = 'SUBMITTED';
        $response->type = 'Template';
        $response->response = base64_encode( serialize($result));
        $response->save();

        return json_encode($result);

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
    }
	
    /** 
     * Create template
     **/
    function createTemplate(Request $request){
        $token = str_replace('Bearer ', '',$_SERVER['HTTP_AUTHORIZATION']);
        $account = Account::where('api_token', $token)->first();
        $response = ['status' => '128', 'message' => 'User permission denied'];
        $postFields = array_keys($_POST);
        dd($account);
        if($account){
            $account_id = $account->id;
            $status = true;
            $return = '';
            if( $request->header_type && strtoupper($request->header_type) == 'TEXT'){
                foreach($this->textTemplateFields as $field){
                    //    if( ($request->$field || $field == 'buttons' ) ){
                    if( in_array($field, $postFields) && ($request->$field || $field == 'buttons' ) ){
                        if($field == 'elementName'){
                            // $request->$field = strtolower(str_replace(' ', '_', $request->$field)).'_'.rand ( 1000 , 9999 );
                        }
                        if($field == 'category' || $field == 'vertical' || $field == 'header_type'){
                            //            $request->$field = strtoupper(str_replace(' ', '_', $request->$field));
                        }
                        if($field == 'buttons'){
                            $request->$field = json_decode($request->$field);
                            if(is_array($request->$field)){
                                $request->$field = json_encode($request->$field);
                            } else {
                                $status = false;
                                $statusCode = 400;
                                $message = "{$field} field is not an array";
                                $result = 'Bad Request';
                            }
                        }
                        $templateData[$field] = $request->$field;
                    } else {
                        $status = false;
                        $statusCode = 400;
                        $message = "{$field} field is empty";
                        $result = 'Bad Request';
                    }
                }
            } else {

            }
            if(!$status){
                $return = (['status' =>  $status, 'status_code' => $statusCode, 'result' => $result, 'message' => $message ]);
            } else {

		  $template = new Template();
            //$template = Template::find(42);
            
                $template->name = $request->get('elementName');
                $template->category = $request->get('category');
                $template->languages = [$request->get('languageCode')];
                $template->status = 'DRAFT';
                $template->account_id = $account_id;
                $template->save();
                $template_id = $template->id;
            
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
                $message->attach_file = isset($attachFilePath['url'])? $attachFilePath['url'] : '';
                $message->example = $request->get('example');
                $message->save();

                //$template_id = 42;

                $attachFilePath = '';
                if($request->file('attach_file')) {
                    $file = $request->file('attach_file') ;
                    $fileName = $file->getClientOriginalName() ;
                    $destinationPath = public_path().'/attach_files' ;
                    $file->move($destinationPath,$fileName);
                    $attachFilePath = ['url' => asset('attach_files/'.$fileName), 'path' => $destinationPath.'/'.$fileName];
                }
               
                $return = $this->submitTemplate(['account_id' => $account_id, 'template_id' => $template_id, 'data' => $request, 'file' => $attachFilePath]);
            }
        } else {
            $return = json_encode(['status' =>  false, 'status_code' => 400, 'message' => 'Invalid format' ]);
        }
        dd($return);
    }

    /**
     * Return Templates
     */
    public function getTemplates(Request $request)
    {
    $apiUrl = str_replace('msg', 'template/list/', config('app.api_url'));
    $apiUrl .=  config('app.src_name');
    $templates = '';
    $curl = curl_init();
    curl_setopt_array($curl, array(
            CURLOPT_URL => $apiUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_HTTPHEADER => array(
                'Content-Type: application/x-www-form-urlencoded',
                'apikey: ' . config('app.apiKey'),
            ),
        ));
        $response = curl_exec($curl);
        curl_close($curl);
        if ($response) {
            $result = json_decode($response);
            $templates = ($result->templates);
        }
        echo json_encode($templates);
    }
}
