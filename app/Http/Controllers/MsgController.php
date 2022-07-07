<?php

namespace App\Http\Controllers;

use App\Models\Msg;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Auth;
use App\Models\Account;
use App\Models\Contact;
use App\Http\Controllers\MessageLogController;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class MsgController extends Controller
{
    public $dateChatView = 'g:i A | M j, Y ';
    public $dateListView = 'd-m-Y h:m:s ';
    public $limit = 10;

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
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
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Msg  $msg
     * @return \Illuminate\Http\Response
     */
    public function show(Msg $msg)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Msg  $msg
     * @return \Illuminate\Http\Response
     */
    public function edit(Msg $msg)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Msg  $msg
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Msg $msg)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Msg  $msg
     * @return \Illuminate\Http\Response
     */
    public function destroy(Msg $msg)
    {
        //
    }

    /**
     * List message list
     */
    public function messageList(Request $request)
    {
        $limit = $this->limit;
        $user = $request->user();
        $messageList = [];
        $messages = Msg::select('message', 'accounts.company_name', 'accounts.phone_number as account_number', 'msgs.status', 'contacts.phone_number as contact_number', 'msg_mode', 'msgs.created_at' )
            ->leftJoin('accounts', 'account_id', 'accounts.id')
            ->leftJoin('contacts', 'contacts.id', 'msgable_id')
            ->where('accounts.user_id', $user->id)
            ->orderBy('msgs.id', 'desc')
            ->paginate($limit);

        $start = isset($_GET['page']) ? (($_GET['page'] - 1 )* $limit) : 0 ;
        foreach($messages as $message){
            if($message->msg_mode == 'incoming'){
                $sender = $message->contact_number;
                $destination = $message->account_number;
            } else {
                $sender = $message->account_number;
                $destination = $message->contact_number;
            }
            $start ++;
            $messageList[] = [
                'id' => $start,
                'account_name' => $message->company_name,
                'content' => $message->message,
                'status' => ucfirst($message->status),
                'mode' => ucfirst($message->msg_mode),
                'sender' => $sender,
                'destination' => $destination,
                'date' => date_format( $message->created_at , $this->dateListView),
            ];
            
        }

        $totalMessages = $messages->total();
        $currentPage = (isset($_GET['page'])) ? $_GET['page'] : 1;

        return Inertia::render('Messages/Messages', [
            'messsage_list' => $messageList,
            'currentPage' => $currentPage,
            'totalMessages' => $totalMessages,
            'limit' => $limit,
        ]);

    }

    /**
     * Show chart (Contacts conversation)
     */
    public function ChatList(Request $request)
    {
        $limit = $this->limit;
        $condition = $selectedContact = $category = '';
        $contactList = $messages = [];
        $user = $request->user();
        $contacts = Contact::where('user_id', $user->id )->get();
        foreach($contacts as $contact){
            $name = $contact->first_name . ' ' .$contact->last_name;
            if($name == ' '){
                $name = ($contact->phone_number != '') ? $contact->phone_number : $contact->instagram_id;
            } 
            $name = trim($name , ' '); 

            $contactList[$contact->id] = [
                'id' => $contact->id,
                'name' => $name,
                'number' => ($contact->phone_number != '') ? $contact->phone_number : $contact->instagram_id 
            ];
        }
        if($request->contact_id){
            $selectedContact = $request->contact_id;
            $category = $request->category;
            $messages = $this->getMessageList($request);        
        }

        return Inertia::render('Messages/ChatList', [
            'contact_list' => $contactList,
            'messages' => $messages,
            'selected_contact' => $selectedContact,
            'category' => ($category) ? $category : 'whatsapp'

        ]);
    }

    /**
     * Return contact conversation history
     */
    public function getMessageList(Request $request)
    {
        $user = $request->user();
        $contactId = $request->contact_id;
        $category = $request->category;
       
        $messages = [];
        $account = Account::where('user_id', $user->id)->first();
        $contact = Contact::where('user_id', $user->id)
            ->where('id', $contactId)
            ->first();
        if(!$contact){
            return ( $messages);
        }
        foreach($contact->messages->where('service', $request->category) as $message){
            $messages[] = [
                'content' => $message->message,
                'date' => date_format( $message->created_at , $this->dateChatView),
                'mode' => $message->msg_mode
            ];
        }
        return ( $messages);
    }


    /**
     * Handle incoming request coming from Gupshup service
     */
    public function incoming()
    {
        // Receive data from Gupshup
        $post_data = file_get_contents("php://input");
        $response = json_decode($post_data, true);
        $data = $response['payload'];

        log::info([ 'Incoming message (or) response' => $post_data]);

        // For set callback url
        if((isset($data['type']) && $data['type'] == 'user-event' )|| (isset($data['phone']) && $data['phone'] == 'callbackSetPhone' )|| ( isset($data['type']) && $data['type'] == 'sandbox-start' )){
            return true;
        }

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
            $this->handleWhatsAppMessage( $data);
        }


    }

    /**
     * Send the content to the contact
     */
    public function sendMessage(Request $request)
    {
        $user = $request->user();
        $account = Account::where('user_id', $user->id)->first();
        $msg = new Msg();
        if($request->chennal == 'instagram'){
           
          //  $response = $msg->sendInstagramMessage($request->content , $request->destination);
            $response = '';
            $status = 'Failed';
            if($response) {
                $status = 'Send';
            }
            
            $result['status'] = $status;
            $result['messageId'] = uniqid().'_'.date('ymdhis');
        } else {
            $result = $msg->sendWhatsAppMessage($request->content , $request->destination, $account );
            if($result['result']['status'] == 'submitted'){
                $result['status'] = 'Queued';
            }
           
            $result['messageId'] = $result['result']['messageId'];
        }
        $this->handleMessageResult($request, $account->id, $result);
        echo json_encode($result);
    }

    /**
     * Process message result 
     */
    public function handleMessageResult(Request $request, $accountId , $data)
    {
        $user_id = $this->getUserIdUsingAccountId($accountId);
        $msgable_id = $this->getInfoUsingContactUniqueId($request->destination, $request->chennal, $user_id);
        $msgable_type = 'App\Models\Contact';
        $messageData = [
            'service_id' => $data['messageId'],
            'service' => $request->chennal,
            'message' => $request->content,
            'account_id' => $accountId,
            'msgable_id' => $msgable_id,
            'msgable_type' => $msgable_type,
            'msg_mode' => 'outgoing',
            'status' => $data['status'],
            'is_delivered' => 0,
            'is_read' => 0
        ];
        Log::info('store Messages function start.');
        $this->processMessage($messageData);
        Log::info('Messages stored successfully.');
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
     * Return record id using instagram ID
     */
    public function getInfoUsingContactUniqueId($uniqueId, $type, $user_id , $name = '') 
    {
        $phoneNumber = $instagramId = '';
        $field = ($type == 'whatsapp') ? 'phone_number' : 'instagram_id';

        $contact = Contact::where($field , $uniqueId)
            ->where('user_id', $user_id)
            ->first();

        if(!$contact) {
            // Create new contact if instagram id is not found
            $contact = new Contact();
            $contact->last_name = $name;
            $contact->$field = $uniqueId;
            $contact->user_id = $user_id;
            $contact->save();
        }

        return $contact->id;
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
        $msgable_id = $this->getInfoUsingContactUniqueId($sender_id, 'instagram', $user_id);
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
     * Handle WhatsApp Message
     */
    public function handleWhatsAppMessage($data)
    {
        $account = Account::where('phone_number', $_GET['origin'])->first();
        $user_id = $this->getUserIdUsingAccountId($account->id);
        $msgable_type = 'App\Models\Contact';

        if ( isset($data['sender']) &&  $_GET['origin'] != $data['sender']['phone']) {
            $msgable_id = $this->getInfoUsingContactUniqueId($data['sender']['phone'], 'whatsapp', $user_id, $data['sender']['name']);
            $messageData = [
                'service_id' => $data['id'],
                'service' => 'whatsapp',
                'message' => $data['payload']['text'],
                'account_id' => $account->id,
                'msgable_id' => $msgable_id,
                'msgable_type' => $msgable_type,
                'msg_mode' => 'incoming',
                'status' => 'received',
                'is_delivered' => 0,
                'is_read' => 0
            ];
        } else {
            if(!isset($data['gsId'])){
                return false;
            }
            $is_delivered = $is_read = 0;
            $status = 'Sent';
            if (isset($data['type']) && str_contains($data['type'], 'failed')) {
                $status = 'Failed';
            } else if(isset($data['type']) && $data['type'] == 'sent'){
                $status = 'Sent';
            }
            else if(isset($data['type']) && $data['type'] == 'delivered'){
                $is_delivered = 1;
            }
            else if(isset($data['type']) && $data['type'] == 'read'){
                $is_read = 1;
            }
            $messageData = [
                'service_id' => $data['gsId'],
                'status' => $status,
                'is_delivered' => $is_delivered,
                'is_read' => $is_read
            ];
        }
        
        Log::info(['store Messages function start.', $messageData ]);
        $this->processMessage($messageData);
        Log::info('Messages stored successfully.');
        return true;
    }

    /**
     * Hand WhatsApp API send message
     */
    public function sendAPIMessage(Request $request, $account_id)
    {
        $account = Account::find($account_id);
        if($account) {
            $user = User::find($account->user_id);
            $token = str_replace('Bearer ', '',$_SERVER['HTTP_AUTHORIZATION']);
            if($token != $user->api_token){
                echo json_encode(['status' => 'failed', 'message' => 'invalid api token']);die;
            }
        } else {
            echo json_encode(['status' => 'failed', 'message' => 'invalid account id']);die;
        }
        $msg = new Msg();
        $result = $msg->sendWhatsAppMessage($request->content , $request->destination, $account );
        
        if($result['result']['status'] == 'submitted'){
            $result['status'] = 'Queued';
        }
        $result['messageId'] = $result['result']['messageId'];
        $request->chennal = 'whatsapp';
        $this->handleMessageResult($request, $account->id, $result);
        echo json_encode($result['result']);
    }
}
