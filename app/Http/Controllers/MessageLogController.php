<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Auth;
use App\Models\MessageLog;
use App\Models\IncomingUrl;
use App\Models\Msg;
use App\Models\MessageResponse;
use App\Models\Account;
use App\Models\User;
use App\Models\Template;
use App\Models\Message;
use App\Models\Contact;
use Illuminate\Support\Facades\Log;
use DateTime;

class MessageLogController extends Controller
{
    /**
     * Message log List view
     */
    public function list(Request $request)
    {
        $limit = 10;
        $condition = '';
        $user = Auth::user();
        if (isset($_GET['key'])) {
            $condition = $request->get('key');
        }

        $messageLogs = MessageLog::select('direction', 'message_logs.created_at', 'display_name', 'content', 'sender', 'destinations', 'message_logs.status')
            ->rightJoin('accounts', 'accounts.id', 'account_id')
            ->orderBy('message_logs.id', 'desc')
            ->where('message_logs.user_id', $user->id)
            ->where(function ($query) use ($condition) {
                if ($condition != '') {
                    $query->where('content',  'like', '%' . $condition . '%');
                    $query->orWhere('message_logs.status', 'like', '%' . $condition . '%');
                }
            })
            ->paginate($limit);

        $totalMessages = $messageLogs->total();

        $name = $user->name;
        $currentPage = (isset($_GET['page'])) ? $_GET['page'] : 1;

        return Inertia::render('Messages/List', [
            'messages' => $messageLogs,
            'user_name' => $name,
            'currentPage' => $currentPage,
            'totalMessages' => $totalMessages,
            'limit' => $limit,
        ]);
    }
    
    public function contact(Request $request)
    {
        return Inertia::render('Messages/Contact');
    }

    /**
     * Search Keyword  
     */
    public function searchContent(Request $request)
    {
        $limit = 10;
        $keyWord = $request->get('key');

        //      DB::enableQueryLog();
        $messageLogs = MessageLog::select('direction', 'message_logs.created_at', 'display_name', 'content', 'sender', 'destinations', 'message_logs.status')
            ->rightJoin('accounts', 'accounts.id', 'account_id')
            ->orderBy('message_logs.id', 'desc')
            //    ->where('message_logs.user_id', $user->id)
            ->where(function ($query) use ($keyWord) {
                if ($keyWord['messageContent']) {
                    $query->where('content',  'like', '%' . $keyWord['messageContent'] . '%');
                    $query->orWhere('destinations', 'like', '%' . $keyWord['messageContent'] . '%');
                }
            })
            ->where(function ($query) use ($keyWord) {
                if ($keyWord['messageDirection']) {
                    $query->where('direction', $keyWord['messageDirection']);
                }
                if ($keyWord['messageStatus']) {
                    $query->where('message_logs.status', $keyWord['messageStatus']);
                }
            })
            ->paginate($limit);

        $return = [
            'messages' => $messageLogs,
            'currentPage' => $messageLogs->currentPage(),
            'totalMessages' => $messageLogs->total(),
            'limit' => $limit,
        ];
        echo json_encode($return);
        die;
    }

    /**
     * Handle incoming request coming from Gupshup service
     */
    public function incoming()
    {
        // Receive data from Gupshup
        $post_data = file_get_contents("php://input");
        $data = json_decode($post_data, true);

        // If call is coming to set the URL
        if(isset($_GET['botname']) && isset($_GET['channel'])) {
            parse_str($_GET, $parsed_data);
            log::info(print_r($parsed_data, true));
            return true;
        }

        /**
         * Calls coming from Instagram are not JSON encoded. 
         * If post data is available and decoded value is empty, parse the string and check
         */
        if($post_data && !$data) {
            parse_str($post_data, $parsed_data);
            $parsed_data['account_id'] = $_GET['account_id']; // Setting account ID from the callback
            log::info($parsed_data);
            log::info(print_r($_GET, true));
            if($parsed_data['channel'] == 'instagram') {
                $this->handleInstagramMessage($parsed_data);
            }
            return true;
        }
        
        log::info($post_data);
       // return false;
       // log::info(print_r($data, true));

        $response = $data; 
        $data = $data['payload'];
        $data['source'] = $_GET['origin'];

        // For set callback url
        if((isset($data['type']) && $data['type'] == 'user-event' )|| (isset($data['phone']) && $data['phone'] == 'callbackSetPhone' )|| ( isset($data['type']) && $data['type'] == 'sandbox-start' )){
            return true;
        }
        Log::info('Incoming response process start.');
    	$eventType = 'Message';
        if($response['type'] == 'template-event'){
		    $eventType = 'Template';
            log::info(['template response', $data]);
            $template = Template::where('template_uid', $data['gsId'])
                ->first();
		
	        $status = $data['status'];
            if($data['status'] != 'rejected'){
                $template->status = strtoupper($data['status']);
            } else {
                $template->status = strtoupper($data['status']). ' ( Reason: '.$data['rejectedReason']. ' )';
            }
            $template->save();
        } else {
           
            if ( isset($data['sender']) &&  config('app.origin') != $data['sender']['phone']) {
                $this->incomingMessageResponse($data);
            } else {
                
                if(!isset($data['gsId'])){
                    return true;
                }
                $status = 'Queued';
                $is_delivered = $is_read = 0;
                $messageLog = MessageLog::where('messageId', $data['gsId'])->first();
                if (isset($data['type']) && str_contains($data['type'], 'failed')) {
                    $status = 'Failed';
                } else if(isset($data['type']) && $data['type'] == 'sent'){
                    $status = 'Sent';
                }
                else if(isset($data['type']) && $data['type'] == 'delivered'){
                    $status = 'Delivered';
                    $is_delivered = 1;
                }
                else if(isset($data['type']) && $data['type'] == 'read'){
                    $status = 'Read';
                    $is_read = 1;
                }
                $messageLog->status = $status;
                $messageLog->save();

                $messageData = [
                    'service_id' =>  $data['gsId'],
                    'status' => $status,
                    'is_delivered' => $is_delivered,
                    'is_read' => $is_read
                ];
                $this->processMessage($messageData);
                Log::info('Update message successfully.');
            }
		//	$data['id'] = $data['gsId'];
	    }
        if(isset($data['gsId'])){
            $response = MessageResponse::where('message_id', $data['gsId'])->first();
            $response->ref_id = $status; 
            $response->response = base64_encode( serialize( $post_data ));
            $response->save();
            Log::info('Save message Log successfully.') ;
        }
    }

    public function sendMessageResponse($data)
    {
        $postData = [];
        $messageId = $data->id;
        $messageLog = MessageLog::where('messageId', $messageId)->first();
        if ($messageLog) {
            Log::info('Message send to CRM process start');
            $date = new DateTime();
            $postData['reference'] = $messageLog->refId;
            $postData['messageContext'] = $messageLog->content;
            $postData['from'] = ['number' => $messageLog->sender, 'name' => $messageLog->sender];
            $postData['to'] = ['number' => json_decode($messageLog->destinations)[0]];
            $postData['message'] = ['text' => $messageLog->content, 'media' => ['mediaUri' => '', 'contentType' => $messageLog->type, 'title' => '']];
            $postData['custom'] = (object)[];
            $postData['groupings'] = ['', '', ''];
            $postData['time'] = $date->format('Y-m-d H:i:s');
            $postData['timeUtc'] = $date->format('Y-m-d\TH:i:s');
            $postData['channel'] = 'WhatsApp';

            error_log(print_r('Send Message Response - ' . $messageLog->content, true));

            $callBackUrl = IncomingUrl::where('account_id', $messageLog->account_id)->first();
            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => $callBackUrl->incoming_url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode($postData),
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    'operation: login',
                    'username: '. config('app.crmUserName'),
                    'accessKey: '. config('app.crmAccessKey')
                ),
            ));

            $response = curl_exec($curl);
            curl_close($curl);
            Log::info('Message send to CRM process done.');
            return $response;
        }
    }

    /**
     * Store incoming message response
     */
    public function incomingMessageResponse($data)
    {
        if (config('app.origin') != $data['sender']['phone']) {

            $getAccount = Account::where('phone_number', $data['source'])->first();
            $accountId = $getAccount->id;
            $user_id = $getAccount->user_id;

            $messageLog = MessageLog::where('messageId', $data['id'])->first();
            if (!$messageLog) {
                $messageLog = new MessageLog();
            }
            Log::info('Store incoming messages start');
            $messageLog->direction = 'In';
            $messageLog->channel = 'whatsapp';
            $messageLog->type = $data['type'];
            $messageLog->content = $data['payload']['text'];
            $messageLog->sender = $data['sender']['phone'];
            $messageLog->status = 'Incoming';
            $messageLog->user_id = $user_id;
//            $messageLog->refId = $data->route->refId;
            $messageLog->messageId = $data['id'];
            $messageLog->destinations = $data['source'] ;//json_encode(array($data->destination));
            $messageLog->country = $data['sender']['country_code'];
            $messageLog->account_id = ($accountId) ? $accountId : '' ;
            $messageLog->save();
            Log::info('Incoming messages stored successfully.');

             // Store Data
            $user_id = $this->getUserIdUsingAccountId($accountId);
            // Get Contact information
            $msgable_id = $this->getInfoUsingWhatsAppId($data['sender']['phone'], $user_id, $data['sender']['name']);
        //    $receiver_id = $this->getInfoUsingWhatsAppId($data['source'], $user_id);
            $msgable_type = 'App\Models\Contact';

            $messageData = [
                'service_id' => $data['id'],
                'service' => 'whatsapp',
                'message' => $data['payload']['text'],
                'account_id' => $accountId,
                'msgable_id' => $msgable_id,
                'msgable_type' => $msgable_type,
                'msg_mode' => 'incoming',
                'status' => 'received',
                'is_delivered' => 0,
                'is_read' => 0
            ];

            Log::info('store Messages function start.');
            $this->processMessage($messageData);
            Log::info('Messages stored successfully.');
            return true;
        }
    }

    /**
     * Save Message log
     */
    public function saveMessageLog($data)
    {
        $id = Auth::id();
        $accountId = '';
        if (isset($_POST['account_id'])) {
            $accountId = $_POST['account_id'];
        }

        Log::info('Store outgoing messages start');
        log::info($data);
        $messageLog = new MessageLog();
        $messageLog->account_id = $accountId;
        $messageLog->channel = 'WhatsApp';
        $messageLog->content = isset($data['subject']) ? $data['subject'] : '';
        $messageLog->direction = 'Out';
        $messageLog->sender = $data['source'];
        $messageLog->country = 'India';
        $messageLog->status = 'Queued';
        $messageLog->user_id = $id;
        $messageLog->refId = $data['refId'];
        $messageLog->messageId = $data['result']->messageId;
        $messageLog->destinations = ($data['destination']);
        $messageLog->save();
        Log::info('Outgoing messages stored successfully.');

        // Store Data
        $user_id = $this->getUserIdUsingAccountId($accountId);
        // Get Contact information
       // $msgable_id = $this->getInfoUsingWhatsAppId($data['source'], $user_id);
        $msgable_id = $this->getInfoUsingWhatsAppId($data['destination'], $user_id);
        $msgable_type = 'App\Models\Contact';

        // Create new message
        $messageData = [
            'service_id' => $data['result']->messageId,
            'service' => 'whatsapp',
            'message' => isset($data['subject']) ? $data['subject'] : '',
            'account_id' => $accountId,
            'msgable_id' => $msgable_id,
        //    'receiver_id' => $receiver_id,
            'msgable_type' => $msgable_type,
            'msg_mode' => 'outgoing',
            'status' => 'Queued',
            'is_delivered' => 0,
            'is_read' => 0
        ];
        Log::info('store Messages function start.');
        $this->processMessage($messageData);
        Log::info('Messages stored successfully.');

	// Save response
	$response = new MessageResponse();
	$response->message_id = $data['result']->messageId;
	$response->ref_id = 'Queued';
        $response->type = 'Message';
	$response->response = base64_encode( serialize( $data['result'] ));
	$response->save();

        return true;
    }

    /**
     * Send Messages using API from CRM
     */
    public function sendMessage(Request $request, $account_id, $mode = '')
    {
        //$data['authorization'] = config('app.token');
        $data['apiKey'] = config('app.apiKey');
        $_POST['account_id'] = $account_id;
        $account = Account::find($account_id);
        if($mode == ''){
            if($account){
                $user = User::find($account->user_id);
                $token = str_replace('Bearer ', '',$_SERVER['HTTP_AUTHORIZATION']);
                if($token != $user->api_token){
                    echo json_encode(['status' => 'failed', 'message' => 'invalid api token']);die;
                }
            } else {
                echo json_encode(['status' => 'failed', 'message' => 'invalid account id']);die;
            }
        }

        $data['priority'] = 'NORMAL';
        $data['source'] = $account->phone_number; 
        $data['destination'] = $request->get('destination');
        $data['subject'] = $request->get('content');
        $data['refId'] = mt_rand(10000000, 99999999);
        $data['srcName'] = config('app.src_name'); 
        
        $content = [
            "type" => "text",
            "text" => $request->get('content')
        ];
        $message = urlencode(json_encode($content));

        log::info('Sent text message using GupShup - start');
        // Post message to Whatsapp with linkmobility
     //   dd($data);
        $curl = curl_init();
        curl_setopt_array($curl, array(
                    CURLOPT_URL => config('app.api_url'),
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => '',
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 0,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => 'POST',
                    CURLOPT_POSTFIELDS => 'channel=whatsapp&source='.$data['source'].'&destination='.$data['destination'].'&src.name='.config('app.src_name').'&message='.$message,
                    CURLOPT_HTTPHEADER => array(
                        'Content-Type: application/x-www-form-urlencoded',
                        'apikey: '. $data['apiKey']
                        ),
                    ));

        $response = curl_exec($curl);
    ///    dd($response);
        curl_close($curl);
        if ($response) {
            $result = json_decode($response);
            $data['result'] = $result;
            $this->saveMessageLog($data);
        }
        Log::info('Message send successfully.');
        echo json_encode($result);
        die;
    }

    /**
     * Send message with template
     */
    public function sendTemplateMessage(Request $request)
    {

        Log::info('Send message Template using link mobiliity');

        $url = str_replace('msg', 'template/msg', config('app.api_url'));

        $data['apiKey'] = config('app.apiKey');
        $data['source'] = $_POST['account_number']; //config('app.origin');
        $data['destination'] = ($_POST['destination']);
        $data['subject'] = $_POST['content'];
        $data['refId'] = mt_rand(10000000, 99999999);
        $data['srcName'] = config('app.src_name');

        $template = Template::where('template_uid', $_POST['template'])->first();
        $message = Message::where('template_id', $template->id)
            ->where('language', $template->languages[0])
            ->first();

        $type = strtolower($template->type);

        $client = new \GuzzleHttp\Client();
        $headers = [
            'apikey' => $data['apiKey'],
            'Content-Type' => 'application/x-www-form-urlencoded'
        ];
        $template = ['id' => $_POST['template'], "params"=> ["Testing"], 'text' => $_POST['content'] ];
        $message = ['type' => $type,  $type => ['link' => $message->attach_file ]];
        $options = [
            'form_params' => [
                'source' => '390236755409',
                'destination' => '919994269535',
                'template' => json_encode($template),
                'message' => json_encode($message)
            ]
        ];

        $request = new \GuzzleHttp\Psr7\Request('POST', 'http://api.gupshup.io/sm/api/v1/template/msg', $headers);
        $res = $client->sendAsync($request, $options)->wait();
        $response = $res->getBody()->getContents();

        if ($response) {
            $result = json_decode($response);
            $data['result'] = $result;
            $this->saveMessageLog($data);
        }
        
        Log::info('Send template successfully.');
        echo json_encode($result);
        die;
    }

    /** 
     * Return templates list
     */
    public function getTemplates(Request $request)
    {
    /*
        $user = $request->user();
        $getTemplates = Template::leftJoin('accounts', 'accounts.id', 'account_id')
            ->leftJoin('messages', 'template_id', 'templates.id')
            ->where('user_id', $user->id)
            ->get();
    */

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
                //'Authorization: ' . $data['authorization'],
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

    /**
     * Handle instagram message
     */
    public function handleInstagramMessage($data)
    {
        $bot_name = $data['botname'];
        $sender_info = json_decode($data['senderobj'], true);
        $message_info = json_decode($data['messageobj'], true);
        $message_context = json_decode($data['contextobj'], true);

        // Sender information
        if($sender_info['channeltype'] == 'instagram') {
            $sender_id = $sender_info['channelid'];
        } 

        if($message_info['type'] == 'txt') {
            $message_content = $message_info['text'];
            $message_id = $message_info['id'];
        }

        $account_id = $data['account_id'];
        $user_id = $this->getUserIdUsingAccountId($account_id);

        // Get Contact information
        $msgable_id = $this->getInfoUsingInstagramId($sender_id, $user_id);
        $msgable_type = 'App\Models\Contact';

        // Create new message
        $messageData = [
            'service_id' => $message_id,
            'service' => 'instagram',
            'message' => $message_content,
            'account_id' => $account_id,
            'msgable_id' => $msgable_id,
            'msgable_type' => $msgable_type,
            'msg_mode' => 'incoming',
            'status' => 'received',
            'is_delivered' => 0,
            'is_read' => 0
        ];
        $this->processMessage($messageData);
    }

    /**
     * Save Message 
     */
    public function processMessage($data)
    {
        $message = Msg::where('service_id', $data['service_id'])->first();
        if(!$message){
            $message = new Msg();
        }
        foreach($data as $field => $value){
            $message->$field = $value;
        }
        $message->save();
    }

    /**
     * Return user id using account id
     */
    public function getUserIdUsingAccountId($account_id)
    {
        $account = Account::find($account_id);
        if($account) {
            return $account->user_id;
        }
        return false;
    }

    /**
     * Return record id using instagram ID
     */
    public function getInfoUsingInstagramId($instagram_id, $user_id)
    {
        $contact = Contact::where('instagram_id', $instagram_id)
            ->where('user_id', $user_id)
            ->first();

        if(!$contact) {
            // Create new contact if instagram id is not found
            $contact = new Contact();
            $contact->instagram_id = $instagram_id;
            $contact->user_id = $user_id;
            $contact->save();
        }

        return $contact->id;
    }

    /**
     * Return record id using whatsapp number 
     */
    public function getInfoUsingWhatsAppId($phone_number, $user_id , $name = '')
    {
        $contact = Contact::where('phone_number', $phone_number)
            ->where('user_id', $user_id)
            ->first();

        if(!$contact) {
            // Create new contact if instagram id is not found
            $contact = new Contact();
            $contact->last_name = $name;
            $contact->phone_number = $phone_number;
            $contact->user_id = $user_id;
            $contact->save();
        }

        return $contact->id;
    }
}
