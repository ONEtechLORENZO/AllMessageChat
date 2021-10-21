<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Auth;
use App\Models\MessageLog;
use App\Models\IncomingUrl;
use App\Models\MessageResponse;
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
        if(isset($_GET['key'])){
            $condition = $request->get('key');
        }

        $messageLogs = MessageLog::orderBy('id' , 'desc')
                        ->where( function($query) use ( $condition ) { 
                            if( $condition != ''){
                                $query->where('content' ,  'like', '%' . $condition . '%' );
                                $query->orWhere('status' , 'like', '%' . $condition . '%' );
                            }
                        })
                        ->paginate($limit);
                            
        $totalMessages = $messageLogs->total();
       
        $user = Auth::user();
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
        $messageLogs = MessageLog::orderBy('id' , 'desc')
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
                                $query->where('status' , $keyWord['messageStatus'] );
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
        
        if( isset($data->destination) && $this->origin == $data->destination ) {
            $this->incomingMessageResponse($data);
        }

        $messageLog = MessageLog::where('messageId' , $data->messageId )->first();
        if (str_contains( $data->resultDescription , 'Message failed')) { 
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
        
        // Update CRM Record
        $this->sendMessageResponse($data);
        
//        error_log(print_r( $data , true));

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

error_log( print_r( 'Send Message Response' , true) );
error_log( print_r( json_encode($postData) , true) );

       $callBackUrl = IncomingUrl::where('account_id' , $messageLog->account_id)->first(); 
       $curl = curl_init();
       curl_setopt_array($curl, array(
                   //CURLOPT_URL => 'https://demo.blackant.io/gio/gio-whatsapp/public/incoming-cm', //$callBackUrl->incoming_url,
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
            $id = Auth::id();
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
            $messageLog->user_id = $id;
            $messageLog->refId = $data->route->refId;
            $messageLog->messageId = $data->messageId;
            $messageLog->destinations = json_encode( array($data->destination) );
            $messageLog->country = '';
       $messageLog->account_id = 1;
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
            $messageLog = new MessageLog();
            $messageLog->account_id = 1;
            $messageLog->channel = 'WhatsApp';
            $messageLog->content = $data['subject'];
            $messageLog->direction = 'Out';
            $messageLog->sender = $data['source'];
            $messageLog->country = 'India';
            $messageLog->status = 'Queued'; 
            $messageLog->user_id = $id; 
            $messageLog->refId = $data['refId']; 
            $messageLog->messageId = $data['result']->messageIds[0]; 
            $messageLog->destinations = json_encode($data['destinations']); 
            $messageLog->save();    

            $this->sendMessageResponse($messageLog);
        return true; 
    }        

    /**
     * Send Messages using API from CRM
     */
    public function sendMessage(Request $request){
    
        $data['authorization'] = $this->token;
        $data['apiKey'] = $this->apiKey;
        
        $data['platFormId'] = $this->platFormId;
        $data['platFormParentId'] = $this->platFormParentId; 
        $data['priority'] = 'NORMAL';
        $data['source'] = $this->origin;
        $data['destinations'] = array( $_POST['destination']);
        $data['subject'] = $_POST['content'];
        $data['refId'] = mt_rand(10000000,99999999);

//error_log( print_R( json_encode($data), true));

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

    
}

