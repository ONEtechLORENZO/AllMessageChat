<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Auth;
use App\Models\MessageLog;
use App\Models\IncomingUrl;
use App\Models\MessageResponse;
use App\Models\Account;
use App\Models\Template;
use DateTime;
use DB;

class MessageLogController extends Controller
{
    private $apiKey = 'UfJj3x7ECaPvRyxDqjU4B6rNyTfV05aV';
    private $token = 'Basic djZWc3o1WkM6VUpIaGNkRE4zdkNUUjhmOQ==';
    private $origin = "+447797882221";
    private $platFormId = 'COMMON_API';
    private $platFormParentId = '19408';

    /**
     * Message log List view
     */
    public function list( Request $request )
    {
        $limit = 10;
        $condition = '';
        $user = Auth::user();
        if(isset($_GET['key'])){
            $condition = $request->get('key');
        }

        $messageLogs = MessageLog::select( 'direction' , 'message_logs.created_at' , 'display_name' , 'content' , 'sender' , 'destinations' , 'message_logs.status' )
                        ->rightJoin('accounts' , 'accounts.id' , 'account_id')
                        ->orderBy('message_logs.id' , 'desc')
                        ->where('message_logs.user_id' , $user->id )
                        ->where( function($query) use ( $condition ) { 
                            if( $condition != ''){
                                $query->where('content' ,  'like', '%' . $condition . '%' );
                                $query->orWhere('message_logs.status' , 'like', '%' . $condition . '%' );
                            }
                        })
                        ->paginate($limit);
                            
        $totalMessages = $messageLogs->total();
       
        $name = $user->name;
        $currentPage = (isset($_GET['page'])) ? $_GET['page'] : 1 ;
        
        return Inertia::render('Messages/List', [ 
            'messages' => $messageLogs, 
            'user_name' => $name, 
            'currentPage' => $currentPage,
            'totalMessages' => $totalMessages,
            'limit' => $limit,
       ]);
    }

    /**
     * Search Keyword  
     */
    public function searchContent(Request $request){
        $limit = 10;
        $keyWord = $request->get('key');
       
 //      DB::enableQueryLog();
        $messageLogs = MessageLog::select( 'direction' , 'message_logs.created_at' , 'display_name' , 'content' , 'sender' , 'destinations' , 'message_logs.status' )
                        ->rightJoin('accounts' , 'accounts.id' , 'account_id')
                        ->orderBy('message_logs.id' , 'desc')
                        ->where('message_logs.user_id' , $user->id )
                        ->where( function($query) use ( $keyWord ) {
                            if($keyWord['messageContent']){
                                $query->where('content' ,  'like', '%' . $keyWord['messageContent'] . '%' );
                                $query->orWhere('destinations' , 'like', '%' . $keyWord['messageContent'] . '%' );
                            }
                        })
                        ->where( function($query) use ( $keyWord ) {
                            if($keyWord['messageDirection']){
                                $query->where('direction' , $keyWord['messageDirection'] );
                            }
                            if($keyWord['messageStatus']){
                                $query->where('message_logs.status' , $keyWord['messageStatus'] );
                            }
                        })    
                        ->paginate($limit);
       
        $return = [
            'messages' => $messageLogs,
            'currentPage' => $messageLogs->currentPage(),
            'totalMessages' => $messageLogs->total(),
            'limit' => $limit,
       ];
       echo json_encode($return); die;
    } 

    /**
     * Set Destination for message
     */
    public function destination( Request $request)
      {
          return Inertia::render('Messages/Destination', [ 'messages' => [] ]);
      }  

    /**
     * Message Configuration
     */
    public function messageConfig(){
        
        $post_data = file_get_contents("php://input");
        $data = json_decode($post_data);
        
    error_log( print_r( 'Incoming Response' , true) );
    error_log( print_r( $post_data , true) );

        if( isset($data->destination) && $this->origin == $data->destination ) {
            $this->incomingMessageResponse($data);
        } else {

            $messageLog = MessageLog::where('messageId' , $data->messageId )->first();

            if (isset($data->resultDescription) && str_contains( $data->resultDescription , 'Message failed')) { 
                $messageLog->status = 'Failed';
            }else{
                $messageLog->status = 'Delivered';
            }
            $messageLog->type = $data->messageType;
            $messageLog->save ();
            
            $response = new MessageResponse();
            $response->message_id = $data->messageId;
            $response->ref_id = $data->refId;
            $response->type = $data->messageType;
            $response->response = $data->resultDescription;
            $response->save();
        }

        // Update CRM Record
    }

    public function sendMessageResponse($data){
        $postData = [];
        $messageId = $data->messageId;

        $messageLog = MessageLog::where('messageId' , $messageId )->first();
        if($messageLog){
            $date = new DateTime();
            $postData['reference'] = $messageLog->refId;
            $postData['messageContext'] = $messageLog->content;
            $postData['from'] = [ 'number' => $messageLog->sender , 'name' => $messageLog->sender ];
            $postData['to'] = [ 'number' => json_decode( $messageLog->destinations )[0]  ];
            $postData['message'] = [ 'text' => $messageLog->content , 'media' => ['mediaUri' => '', 'contentType' => $messageLog->type , 'title' => '' ]  ];
            $postData['custom'] = (object)[];
            $postData['groupings'] = ['', '', ''];
            $postData['time'] = $date->format('Y-m-d H:i:s');
            $postData['timeUtc'] = $date->format('Y-m-d\TH:i:s');
            $postData['channel'] = 'WhatsApp';

    error_log( print_r( 'Send Message Response - '. $messageLog->content , true) );

       $callBackUrl = IncomingUrl::where('account_id' , $messageLog->account_id)->first(); 
       $curl = curl_init();
       curl_setopt_array($curl, array(
            //       CURLOPT_URL => 'https://demo.blackant.io/incoming/test.php', 
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
                       'username: admin',
                       'accessKey: KFI7IDWsrLV4iMW'
                       ),
                   ));

       $response = curl_exec($curl);
       curl_close($curl);
       return $response;
        }

    }

    /**
     * Store incoming message response
     */
    public function incomingMessageResponse($data){

        if( $this->origin == $data->destination ) {
            
                $getAccount = Account::where('phone_number' , $data->destination )->first();
                $accountId = $getAccount->id;
                $user_id = $getAccount->user_id;            

            
            $messageLog = MessageLog::where('messageId' , $data->messageId )->first();
            if(! $messageLog){
                $messageLog = new MessageLog();
            }
            $messageLog->direction = 'In';
            $messageLog->channel = $data->content->type;
            $messageLog->type = $data->content->message->contentType;
            $messageLog->content = $data->content->message->text;
            $messageLog->sender = $data->source;
            $messageLog->status = 'Incoming';
            $messageLog->user_id = $user_id;
            $messageLog->refId = $data->route->refId;
            $messageLog->messageId = $data->messageId;
            $messageLog->destinations = json_encode( array($data->destination) );
            $messageLog->country = '';
            $messageLog->account_id = $accountId;
            $messageLog->save();
            return true;
        }
    } 

    /**
     * Save Message log
     */
    public function saveMessageLog( $data )
    {
            $id = Auth::id();
            $accountId = '';
            if(isset($_POST['account_number'])){
                $getAccount = Account::where('phone_number' , $_POST['account_number'] )->first();
                $accountId = $getAccount->id;
            }
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
            $messageLog->messageId = $data['result']->messageIds[0]; 
            $messageLog->destinations = json_encode($data['destinations']); 
            $messageLog->save();    

//            $this->sendMessageResponse($messageLog);
        return true; 
    }        

    /**
     * Send Messages using API from CRM
     */
    public function sendMessage(Request $request){
/*
        $_POST['account_number'] = '+447797882221';
        $_POST['destination'] = '+919994269535';
        $_POST['content'] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do elusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis ute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
*/
   
        $data['authorization'] = $this->token;
        $data['apiKey'] = $this->apiKey;
        
        $data['platFormId'] = $this->platFormId;
        $data['platFormParentId'] = $this->platFormParentId; 
        $data['priority'] = 'NORMAL';
        $data['source'] = $_POST['account_number'];
        $data['destinations'] = array( $_POST['destination']);
        $data['subject'] = $_POST['content'];
        $data['refId'] = mt_rand(10000000,99999999);

        // Post message to Whatsapp with linkmobility
        $curl = curl_init();
        curl_setopt_array($curl, array(
                    CURLOPT_URL => 'https://n-eu.linkmobility.io/whatsapp-message/messages',
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => '',
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 0,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => 'POST',
                    CURLOPT_POSTFIELDS =>'{
                    "platformId":"'.$data['platFormId'].'",
                    "platformPartnerId":"'.$data['platFormParentId'].'",
                    "priority":"'.$data['priority'].'",
                    "eventReportGates":[
                    "zxMLiFn6"
                    ],
                    "refId":"'.$data['refId'].'",
                    "source":"'.$data['source'].'",
                    "destinations":'.json_encode($data['destinations']).' ,
                    "messages":[
                    {
                        "type":"text",
                        "previewUrl": false,
                        "text": {
                            "body": "'.$data['subject'].'"
                        }
                    }]
                    }',
                    CURLOPT_HTTPHEADER => array(
                            'x-api-key: '.$data['apiKey'],
                            'Authorization: '.$data['authorization'],
                            'Content-Type: application/json'
                            ),
                    ));

        $response = curl_exec($curl);
        curl_close($curl);
        
        if( $response ){
            $result = json_decode($response);
            $data['result'] = $result;
            $this->saveMessageLog($data);
        }
        echo json_encode($result); die;
    }

    /**
     * Send message with template
     */
    public function sendTemplateMessage( Request $request ){
        
        if(isset($_POST['account_number'])) {
            $getAccount = Account::where('phone_number' , $_POST['account_number'] )->first();
            $account_id = $getAccount->id;
        }
        $template_id = $_POST['template'];
        $template = Template::where('account_id', $account_id)
            ->where('id', $template_id)
            ->where('account_id', $account_id)
            ->first();

        $data['authorization'] = $this->token;
        $data['apiKey'] = $this->apiKey;

        $data['platFormId'] = $this->platFormId;
        $data['platFormParentId'] = $this->platFormParentId;
        $data['priority'] = 'NORMAL';
        $data['source'] = $_POST['account_number'];
        $data['destinations'] = array( $_POST['destination']);
        $data['refId'] = mt_rand(10000000,99999999);

        $data['name_space'] = $template->template_name_space; //'80343e40_4c1a_4173_aac7_87b5593c3439';
        $data['temp_name'] = $template->template_name; //"customer_test";
        $curl = curl_init();
        curl_setopt_array($curl, array(
                    CURLOPT_URL => 'https://n-eu.linkmobility.io/whatsapp-message/messages',
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => '',
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 0,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => 'POST',
                    CURLOPT_POSTFIELDS =>'{

                    "platformId":"'.$data['platFormId'].'",
                    "platformPartnerId":"'.$data['platFormParentId'].'",
                    "priority":"'.$data['priority'].'",
                    "eventReportGates":[
                    "zxMLiFn6"
                    ],
                    "refId":"'.$data['refId'].'",
                    "source":"'.$data['source'].'",
                    "destinations":'.json_encode($data['destinations']).' ,

                    "messages": [
                    {
                    "type": "template",
                    "template": {
                        "namespace": "'.$data['name_space'].'",
                        "name": "'.$data['temp_name'].'",
                        "language": {
                            "code": "en"
                        }
                    }
                    }
                    ]
                    }',
                    CURLOPT_HTTPHEADER => array(
                            'Content-Type: application/json',
                            'x-api-key: '.$data['apiKey'],
                            'Authorization: '.$data['authorization'],
                            ),
                    ));

        $response = curl_exec($curl);
        curl_close($curl);
        if( $response ){
            $result = json_decode($response);
            $data['result'] = $result;
            $this->saveMessageLog($data);
        }
        echo json_encode($result); die;

    }

    /**
     * Send Template Message with Image
     */ 
    public function sendImageTemplateMessages(Request $request){

        $_POST['account_number'] = $this->origin;
        $_POST['destination'] = '+919994269535';

        if(isset($_POST['account_number'])) {
            $getAccount = Account::where('phone_number' , $_POST['account_number'] )->first();
            $account_id = $getAccount->id;
        }

        $data['authorization'] = $this->token;
        $data['apiKey'] = $this->apiKey;

        $data['platFormId'] = $this->platFormId;
        $data['platFormParentId'] = $this->platFormParentId;
        $data['priority'] = 'NORMAL';
        $data['source'] = $_POST['account_number'];
        $data['destinations'] = array( $_POST['destination']);
        $data['refId'] = mt_rand(10000000,99999999);

        $data['name_space'] = '80343e40_4c1a_4173_aac7_87b5593c3439';
        $data['temp_name'] = 'image_template';
        $curl = curl_init();
        curl_setopt_array($curl, array(
                    CURLOPT_URL => 'https://n-eu.linkmobility.io/whatsapp-message/messages',
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => '',
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 0,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => 'POST',
                    CURLOPT_POSTFIELDS =>'
{
    "platformId": "COMMON_API",
    "platformPartnerId": 19408,
    "priority": "NORMAL",
    "refId": "Ba_Test002",
    "source": "+447797882221",
    "destinations": [
        "+919994269535"
    ],
    "messages": [
        {
            "type":"template",
            "template":{
                "namespace":"80343e40_4c1a_4173_aac7_87b5593c3439",
                "name":"image_template",
                "language":{
                    "code":"en"
                },
                "components":[
                    {
                        "type":"header",
                        "parameters":[
                            {
                            "type":"image",
                            "image": {
                                    "link": "https://demo.blackant.io/gio/video.mp4"
                                }
                            }
                        ]
                    }
                ]
            }
        }
    ]
}
                   ',
                    CURLOPT_HTTPHEADER => array(
                            'Content-Type: application/json',
                            'x-api-key: '.$data['apiKey'],
                            'Authorization: '.$data['authorization'],
                            ),
                    ));

        $response = curl_exec($curl);
        curl_close($curl);
        if( $response ){
            $result = json_decode($response);
            $data['result'] = $result;
            $this->saveMessageLog($data);
        }
        echo json_encode($result); die;

    }
    
    /** 
     * Return templates list
     */
    public function getTemplates( Request $request ){
        $user = $request->user();
        $getTemplates = Template::leftJoin('accounts' , 'accounts.id' , 'account_id')
            ->where('user_id' , $user->id)
            ->get();
        
        echo json_encode( $getTemplates );
    }
}
