<?php

namespace App\Http\Controllers;

use App\Models\Msg;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Auth;
use App\Models\Account;
use App\Models\Contact;
use App\Models\Template;
use App\Http\Controllers\MessageLogController;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use App\Models\Price;
use App\Models\Wallet;
use App\Models\Filter;
use Cache;
use App\Models\ChatListContact;
use Illuminate\Support\Facades\DB;

class MsgController extends Controller
{
    public $dateChatView = 'g:i A | M j, Y';

    public $dateListView = 'd-m-Y h:m:s';

    public $limit = 15;

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
     * Message list view
     */
    public function messageList(Request $request)
    {
        $messageList = [];
        $limit = $this->limit;
        $user = $request->user();

        // List view columns to show
        $list_view_columns = [
            'id' => ['label' => __('Id'), 'type' => 'text'],
            'content' => ['label' => __('Content'), 'type' => 'text'],
            'account_name' => ['label' => __('Account name'), 'type' => 'text'],
            'mode' =>['label' => __('Mode'), 'type' => 'text'],
            'sender' =>['label' => __('Sender'), 'type' => 'text'],
            'destination' =>['label' => __('Destination'), 'type' => 'text'],
            'status' => ['label' => __('Status'), 'type' => 'text'],
            'date' => ['label' => __('Date'), 'type' => 'text'],
        ]; 
        
        $query_columns = ['msgs.id', 'msgs.service', 'msgs.status', 'msgs.created_at', 'message', 'accounts.company_name', 'accounts.phone_number as account_phone_number', 'accounts.company_name', 'contacts.phone_number', 'contacts.instagram_id', 'msg_mode'];
        $messages = Msg::select($query_columns)
            ->join('accounts', 'account_id', 'accounts.id')
            ->join('contacts', 'contacts.id', 'msgable_id')
            ->where('accounts.user_id', $user->id)
            ->orderBy('msgs.id', 'desc')
            ->paginate($limit);

        foreach($messages as $message) {
            if($message->service == 'whatsapp') {
                if($message->msg_mode == 'incoming') {
                    $sender = $message->phone_number;
                    $destination = $message->account_phone_number;
                } else {
                    $sender = $message->account_phone_number;
                    $destination = $message->phone_number;
                }
            }
            else if($message->service == 'instagram') {
                if($message->msg_mode == 'incoming') {
                    $sender = $message->instagram_id;
                    $destination = $message->company_name;
                } else {
                    $sender = $message->company_name;
                    $destination = $message->instagram_id;
                }
            }

            $messageList[] = [
                'id' => $message->id,
                'account_name' => $message->company_name,
                'content' => $message->message,
                'status' => ucfirst($message->status),
                'mode' => ucfirst($message->msg_mode),
                'sender' => $sender,
                'destination' => $destination,
                'date' => date_format($message->created_at, $this->dateListView),
            ];
        }

        $module = new Msg();
     
        $data = [
            'singular' => __('Message'),
            'plural' => __('Messages'),
            'module' => 'Message',
            'current_page' => 'Messages', 
            'records' => $messageList,
            'compact_type' => 'condense',
            'list_view_columns' => $list_view_columns,

            // Actions
            'actions' => [
                'create' => false,
                'detail' => false,
                'edit' => false,
                'delete' => false,
                'export' => false,
                'import' => false,
                'search' => false,
                'filter' => false,
            ],

            'paginator' => [
                'firstPageUrl' => $messages->url(1),
                'previousPageUrl' => $messages->previousPageUrl(),
                'nextPageUrl' => $messages->nextPageUrl(),
                'lastPageUrl' => $messages->url($messages->lastPage()),  
                'currentPage' => $messages->currentPage(),
                'total' => $messages->total(),
                'count' => $messages->count(),
                'lastPage' => $messages->lastPage(),
                'perPage' => $messages->perPage(),
            ],
            
            'translator' => [
                'Messages' => __('Messages'),
                'No Messages yet' => __('No messages sent/received yet for your account(s).'),
                'Search' => __('Search'),
                'No records' => __('No records')
            ]
        ];
        
       
        return Inertia::render('Messages/Messages', $data);
    }

    /**
     * Show chart (Contacts conversation)
     */
    public function ChatList(Request $request)
    {
        $limit = $this->limit;
        $contactFields = ['contacts.id' , 'contacts.first_name', 'contacts.last_name', 'contacts.phone_number', 'contacts.instagram_id' ];
        $condition = $selectedContact = '';
        $category = ($request->category) ? $request->category : '';
        $contactList = $messages = $accoutList= [];
        $user = $request->user();

        $companyId = Cache::get('selected_company_'. $user->id);

        if($request->contact_id){
            $selectedContact = $request->contact_id;
            $contactChaneel = ChatListContact::where('user_id', $user->id)->where('contact_id' , $selectedContact )->first();
            $category = ($request->category) ? $request->category : $contactChaneel->channel;
            $messages = $this->getMessageList($request);        
        }
        $accounts = Account::where('user_id', $user->id )
            ->where(function($query) use ($category) {
                if($category != 'all' && $category != ''){
                    $query->where('service' , $category);
                }
            })
            ->get();
        
        foreach($accounts as $account){
            $accoutList[$account->id] = $account->company_name;
        }

        $recordData = $this->getChatContactList($request);
        $filterData = $this->getFiltersInfo($companyId, $user->id, 'Contact', true);

        $translator = [
            'Your Profile' => __('Your Profile'),
            'Settings' => __('Settings'),
            'Sign out' => __('Sign out'),
            'All Chats' => __('All Chats'),
            'Unread' => __('Unread'),
            'Archive' => __('Archive'),
            'Add Column' => __('Add Column'),
            'New Message' => __('New Message'),
            'Conversation not start yet.'  => __('Conversation not start yet.'),
            'View notifications'  => __('View notifications'),
            'Junior Developer' => __('Junior Developer'),
            'All Channel' => __('All Channel'),
            'Account list' => __('Account list'),
            'Write your message!' => __('Write your message!')
        ];
        $translator = array_merge( $translator, $this->getTranslations());
    
        $data = [
            'contact_list' => $contactList,
            'account_list' => $accoutList,
            'messages' => $messages,
            'selected_contact' => $selectedContact,
            'current_page' => 'Chat',
            'category' => ($category) ? $category : 'all',
            'translator' => $translator,
            'filter' => $filterData,
        ];
        $data = array_merge($data, $recordData);
        return Inertia::render('Messages/ChatList', $data);
    }

    /**
     * Return chat contact list
     */
    public function getChatContactList($request)
    {
        $user = $request->user();
        $search = $request->has('search') && $request->get('search') ? $request->get('search') : '';
        $filter = $request->has('filter') && $request->get('filter') ? $request->get('filter') : '';
        $filterId = $request->has('filter_id') && $request->get('filter_id') ? $request->get('filter_id') : '';
        $searchData = ($filter)? json_decode($filter) : '';
        $query = ChatListContact::where('chat_list_contacts.user_id', $user->id );
        
        if($filterId && $filterId != 'All'){
            $filter = Filter::find($filterId);
            if($filter){
                $searchData = unserialize( base64_decode($filter->condition) );
            }
        }

        if($searchData){
            $query->join('contacts', 'contact_id', 'contacts.id');
            $query = $this->prepareQuery($searchData , $query, 'contacts');
        }

        if($search){
            $list_view_columns = ['first_name', 'last_name', 'phone_number', 'instagram_id', 'email'];
            $query->join('contacts', 'contact_id', 'contacts.id');
            $query->where(function ($query) use ($search, $list_view_columns) {  
                foreach($list_view_columns as $field_name) {
                    if($field_name != 'tag' && $field_name != 'list')
                        $query->orWhere($field_name, 'like', '%' . $search . '%');
                }
            });
        }

        // get count of categories
        $unreadCountQuery = clone $query;
        $unreadCount = $unreadCountQuery->where('unread' , true )->count();
        $archiveQuery = clone $query;
        $archiveCount = $archiveQuery->where('is_archive' , true )->count();
        $totalQuery = clone $query;
        $totalCount = $totalQuery->count();
        $otherCount = ($archiveCount - $unreadCount);
      
        $totalCount = $totalCount - abs($otherCount);
        $recordCounts = [ 'all' => $totalCount, 'unread' => $unreadCount , 'archived' => $archiveCount];

        $mode = (isset($_GET['mode'])) ? ($_GET['mode']) : 'all';
        if($mode && $mode == 'archived'){
            $query->where('is_archive' , true);
        } else if($mode && $mode == 'unread'){
            $query->where('unread' , true);
        } else {
            $query->where(function ($query)  {  
                $query->whereNull('is_archive')->orWhere('is_archive' , 0);
            });
            $query->where(function ($query)  {  
                $query->whereNull('unread')->orWhere('unread' , 0);
            });
        }
        $query->orderBy('chat_list_contacts.updated_at', 'desc');
      
        $chatListContact = $query->get();

        $contactList = [];
        foreach($chatListContact as $contactId){
            $contact = Contact::find($contactId->contact_id);
            if($contact){
                $name = $contact->first_name . ' ' .$contact->last_name;
                if($name == ' '){
                    $name = ($contact->phone_number != '') ? $contact->phone_number : $contact->instagram_id;
                } 
                $name = trim($name , ' '); 

                $contactList[$contact->id] = [
                    'id' => $contact->id,
                    'name' => $name,
                    'number' =>  $contact->phone_number,
                    'insta_id' => $contact->instagram_id,
                    'channel' => $contactId->channel, 
                ];
            }
        }
        $data = [
            'contact_list' => $contactList,
            'filter_id' => $filterId,
            'search' => $search,
            'mode' => $mode,
            'counts' => $recordCounts,
        ];
    
        return $data;
    }

    /**
     * Return contact conversation history
     */
    public function getMessageList(Request $request)
    {
        $user = $request->user();
        $contactId = $request->contact_id;
        // Update Channel
        $this->updateChatChannel($user->id , $contactId, $request->category); 
        $category = ($request->category == 'all') ?['instagram', 'whatsapp'] : [$request->category] ;
        
        $messages = [];
        $account = Account::where('user_id', $user->id)->first();
        $contact = Contact::where('user_id', $user->id)
            ->where('id', $contactId)
            ->first();
        if(!$contact){
            return ( $messages);
        }
        foreach($contact->messages->whereIn('service', $category) as $message){
            $messages[] = [
                'content' => $message->message,
                'status' => $message->status,
                'date' => date_format( $message->created_at , $this->dateChatView),
                'mode' => $message->msg_mode,
                'category' => $message->service,
            ];
        }
        return ( $messages);
    }

    /**
     * Update chat Channel
     */
    public function updateChatChannel($user_id , $contact_id, $channel)
    {
        $contact = ChatListContact::where('user_id', $user_id)->where('contact_id' , $contact_id )->first();
        if($contact){
            $contact->channel = $channel;
            $contact->unread = false;
        }
        $contact->save();
    }

    /**
     * Handle incoming request coming from Gupshup service
     */
    public function incoming()
    {
        // Receive data from Gupshup
        $post_data = file_get_contents("php://input");
        $response = json_decode($post_data, true);
        log::info([ 'Incoming message (or) response' => $post_data]);

        // If call is coming to set the URL
        if(isset($_GET['botname']) && isset($_GET['channel'])) {
            parse_str($_GET, $parsed_data);
            return true;
        }

        $data = isset($response['payload']) ? $response['payload'] : [];

        // For set callback url
        if((isset($data['type']) && $data['type'] == 'user-event' )|| (isset($data['phone']) && $data['phone'] == 'callbackSetPhone' )|| ( isset($data['type']) && $data['type'] == 'sandbox-start' )){
            return true;
        }

        /**
         * Calls coming from Instagram are not JSON encoded. 
         * If post data is available and decoded value is empty, parse the string and check
         */
        if($post_data && !$data) {
            parse_str($post_data, $parsed_data);
            $parsed_data['account_id'] = $_GET['account_id']; // Setting account ID from the callback
            if($parsed_data['channel'] == 'instagram') {
                $this->handleInstagramMessage($parsed_data);
            }
            return true;
        }

        if($response['type'] == 'template-event'){
            $template = Template::where('template_uid', $data['id'])
                ->first();
            if($template){
                $status = strtoupper($data['status']);
                if($data['status'] == 'rejected'){
                    $status = strtoupper($data['status']). ' ( Reason: '.$data['rejectedReason']. ' )';
                }
                $template->status = $status;
                $template->save();
            }
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
        $account = Account::find($request->account_id);
        $msg = new Msg();
       
        if($request->channel == 'instagram'){
            // TODO Get correct account based on instagram id
            
            $response = $msg->sendInstagramMessage($request->content , $request->destination, $account->src_name);
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
        $account = Account::find($accountId);
        $user_id = $account->user_id;
        $companyId = $account->company_id;

        $_REQUEST['is_sent'] = 'sent';
        $msgable_id = $this->getInfoUsingContactUniqueId($request->destination, $request->channel, $companyId, $user_id);
        $msgable_type = 'App\Models\Contact';
        $messageData = [
            'service_id' => $data['messageId'],
            'service' => $request->channel,
            'message' => $request->content,
            'account_id' => $accountId,
            'msgable_id' => $msgable_id,
            'msgable_type' => $msgable_type,
            'msg_mode' => 'outgoing',
            'status' => $data['status'],
            'is_delivered' => 0,
            'is_read' => 0
        ];

        $this->processMessage($messageData);
    }

    /**
     * Add/Update Message model
     */
    public function processMessage($data)
    {
        $message = Msg::where('service_id', $data['service_id'])->first();
        if(!$message) {
            $message = new Msg();
        }

        foreach($data as $field => $value) {
            $message->$field = $value;
        }
        $message->save();
    }

    /**
     * Return record id using instagram ID
     */
    public function getInfoUsingContactUniqueId($uniqueId, $type, $companyId, $user_id , $name = '') 
    {
        $phoneNumber = $instagramId = '';
        $field = ($type == 'whatsapp') ? 'phone_number' : 'instagram_id';

        if(strpos($uniqueId, '+') === false){
            $uniqueId = ($type == 'whatsapp') ? '+'.$uniqueId : $uniqueId;
        }

        $contact = Contact::where($field , $uniqueId)
            ->where('company_id', $companyId)
            ->first();

        if(!$contact) {
            // Create new contact if instagram id is not found
            $contact = new Contact();
            $contact->last_name = $name;
            $contact->$field = $uniqueId;
            $contact->user_id = $user_id;
            $contact->company_id = $companyId;
            $contact->save();
        }

        // Update contact last update time
        $chatContact = ChatListContact::where('contact_id', $contact->id)->where('user_id', $user_id )->first();
        Log::info([
            'user' => $user_id,
            'conotat' => $contact->id
        ]);

        if(! $chatContact){
            $chatContact = new ChatListContact();
            $chatContact->contact_id = $contact->id;
            $chatContact->user_id = $user_id;
            $chatContact->channel = $type;
        }
        
        if(isset($_REQUEST['is_sent']) && $_REQUEST['is_sent'] == 'sent'){
            $chatContact->unread = false;
        } else {
            $chatContact->unread = true;
        }
       
        $chatContact->save();
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
        $account = Account::find($account_id);

        $companyId = $account->company_id;
        $user_id = $account->user_id; 


        log::info(['insta content' => $message_content]);
        // Get Contact information
        $msgable_id = $this->getInfoUsingContactUniqueId($sender_id, 'instagram', $companyId, $user_id);
        $msgable_type = 'App\Models\Contact';
        
        // TODO Need to get instagram profile information when creating new Contact - https://documenter.getpostman.com/view/12788798/UzBtkNQb#b38d5004-215b-41d8-a993-8bf47be3199b

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
        $companyId = $account->company_id;

        $user_id = $account->user_id; 
        $msgable_type = 'App\Models\Contact';

        if ( isset($data['sender']) &&  $_GET['origin'] != $data['sender']['phone']) {
            $msgable_id = $this->getInfoUsingContactUniqueId($data['sender']['phone'], 'whatsapp', $companyId, $user_id, $data['sender']['name']);
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
            $message = Msg::where('service_id', $data['gsId'])->first();
            if(!$message){
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
        if(isset($data['pricing'])){
            $messageData['policy'] = $data['pricing']['category'];
            $price = $this->handlePrice($data['destination'], $data['pricing']['category'] ,$user_id);
            if($message->status != 'Sent'){
                $this->reduceMessageAmount($price, $message->account_id);
            }
            $messageData['amount'] = $price;
        }
        
        
        Log::info(['store Messages function start.', $messageData ]);
        $this->processMessage($messageData);
        Log::info('Messages stored successfully.');
        return true;
    }

    /**
     * Send WhatsApp message (Function will be called from OneMessage API)
     */
    public function sendAPIMessage(Request $request, $account_id)
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

        // Validate the request
        if(!$request->content && !$request->template) {
            return response()->json(['status' => 'failed', 'message' => 'Content is missing']);
        }

        if(!$request->destination) {
            return response()->json(['status' => 'failed', 'message' => 'Destination is missing']);
        }

        $msg = new Msg();
        $result = $msg->sendWhatsAppMessage($request->content, $request->destination, $account);
        if($result['result']['status'] == 'submitted') {
            $result['status'] = 'Queued';
        }

        $result['messageId'] = $result['result']['messageId'];
        $request->channel = 'whatsapp';
        $this->handleMessageResult($request, $account->id, $result);
        return response()->json($result['result']);
    }

    /**
     * Handle Pricing 
     * 
     * @param STRING $nummber
     * @param STRING $category
     */
    public function handlePrice($number , $category, $user_id)
    {
        $return = '';
        $number = '+'.$number ;
        $price = '';
        $contact = Contact::where('phone_number' , $number)
            ->where('user_id', $user_id)
            ->first();
        if($contact ){
            $price = Price::where('country_code' , $contact->country_code)->first();
        } 

        if(! $price){
            $price = Price::where('is_default' , 1)->first();
        }

        if($category == 'UIC'){
            $return = $price->user_initiated;
        } else if($category == 'BIC'){
            $return = $price->business_initiated;
        } else {
            $return = $price->message;
        }
        return $return;
    }

    /**
     * Reduce message cost on wallet
     * 
     * @param FLOAT $price
     * @param INTEGER $account_id
     */
    public function reduceMessageAmount($price, $account_id)
    {
        DB::beginTransaction();
        $user_id = $this->getUserIdUsingAccountId($account_id);
        $wallet = Wallet::where('user_id', $user_id)->lockForUpdate()->first();
       
        if($wallet){
            $balance_amount = ($wallet->balance_amount - $price);
            $wallet->balance_amount = $balance_amount;
            $wallet->save();
            //DB::update("update wallets set balance_amount = {$balance_amount} where user_id = {$user_id}");
        }
        DB::commit();
    }
}
