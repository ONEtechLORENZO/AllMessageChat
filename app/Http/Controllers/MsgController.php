<?php

namespace App\Http\Controllers;

use App\Models\Msg;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Auth;
use App\Models\Account;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Template;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\MessageLogController;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use App\Models\Price;
use App\Models\Wallet;
use App\Models\Filter;
use Cache;
use URL;
use Storage;
use App\Models\ChatListContact;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File; 

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
        $user_id = $user->id;

        // Get company selected by the user.
        $companyId = Cache::get('selected_company_'. $user->id);

        // Search & Filter
        $search = $request->has('search') && $request->get('search') ? $request->get('search') : '';
        $filterId = $request->has('filter_id') && $request->get('filter_id') ? $request->get('filter_id') : '';
        $filter = $request->has('filter') && $request->get('filter') ? $request->get('filter') : '';

        // List view columns to show
        $list_view_columns = [
            'id' => ['label' => __('Id'), 'type' => 'text'],
            'message' => ['label' => __('Content'), 'type' => 'text'],
            'company_name' => ['label' => __('Account name'), 'type' => 'text'],
            'msg_mode' =>['label' => __('Mode'), 'type' => 'text'],
            'sender' =>['label' => __('Sender'), 'type' => 'text'],
            'destination' =>['label' => __('Destination'), 'type' => 'text'],
            'status' => ['label' => __('Status'), 'type' => 'text'],
            'created_at' => ['label' => __('Date'), 'type' => 'text'],
        ]; 
        
        $query_columns = ['msgs.id', 'msgs.service', 'msgs.status', 'msgs.created_at', 'message', 'accounts.company_name', 'accounts.phone_number as account_phone_number', 'accounts.company_name', 'contacts.phone_number', 'contacts.instagram_username', 'msg_mode'];
        $query = Msg::select($query_columns)
            ->join('accounts', 'account_id', 'accounts.id')
            ->join('contacts', 'contacts.id', 'msgable_id')
            ->where('accounts.user_id', $user->id);


        $searchData = '';
        if($filter) {
            $searchData = json_decode($filter);
        }

        // If filter is selected, we should use the filter conditions
        if($filterId && $filterId != 'All') {
            $filter = Filter::where('id', $filterId)->where('company_id', $companyId)->first();
            if($filter) {
                $searchData = unserialize( base64_decode($filter->condition) );
            }
        }

        if($search) {
            $query->where(function ($query) use ($search, $list_view_columns) {  
                foreach($list_view_columns as $field_name => $field_info) {

                    if($field_name == 'company_name'){
                        
                        $query->orWhere('accounts.company_name', 'like', '%' . $search . '%');
                        
                    } elseif($field_name  == 'sender') {
                        $query->orWhere('contacts.phone_number', 'like', '%' . $search . '%');
                        $query->orWhere('accounts.phone_number', 'like', '%' . $search . '%');
                    } elseif($field_name  == 'destination') {
                    } else {
                        $field_name = "msgs.{$field_name}";
                        $query->orWhere($field_name, 'like', '%' . $search . '%');
                    }
                }    
            });
        } 
        $query = ($searchData) ? $this->prepareQuery($searchData, $query, 'msgs') : $query;

        $messages = $query->orderBy('msgs.id', 'desc')
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
                    $sender = $message->instagram_username;
                    $destination = $message->company_name;
                } else {
                    $sender = $message->company_name;
                    $destination = $message->instagram_username;
                }
            }

            $messageList[] = [
                'id' => $message->id,
                'company_name' => $message->company_name,
                'message' => $message->message,
                'status' => ucfirst($message->status),
                'msg_mode' => ucfirst($message->msg_mode),
                'sender' => $sender,
                'destination' => $destination,
                'created_at' => date_format($message->created_at, $this->dateListView),
            ];
        }
        $filterData = $this->getFiltersInfo($companyId, $user_id, 'Message', false);

        $module = new Msg();
        $messageTranslate = [
            'Messages' => __('Messages'),
            'No Messages yet' => __('No messages sent/received yet for your account(s).')
        ];

        $translator = $this->getTranslations();
        $translator = array_merge($translator , $messageTranslate);

        $data = [
            'singular' => __('Report'),
            'plural' => __('Reports'),
            'module' => 'Message',
            'current_page' => 'Messages', 
            'records' => $messageList,
            'compact_type' => 'condense',
            'list_view_columns' => $list_view_columns,

            'search' => $search,
            'filter' => $filterData,

            // Actions
            'actions' => [
                'create' => false,
                'detail' => false,
                'edit' => false,
                'delete' => false,
                'export' => true,
                'import' => false,
                'search' => true,
                'filter' => true,
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
            
            'translator' => $this->getTranslations(),
            
        ];
        
       
        return Inertia::render('Messages/Messages', $data);
    }

    /**
     * Show chart (Contacts conversation)
     */
    public function ChatList(Request $request)
    {
        $limit = $this->limit;
        $contactFields = ['contacts.id' , 'contacts.first_name', 'contacts.last_name', 'contacts.phone_number', 'contacts.instagram_username' ];
        $condition = $selectedContact = '';
        $category = ($request->category) ? $request->category : '';
        $contactList = $messages = $accoutList= [];
        $user = $request->user();

        $companyId = Cache::get('selected_company_'. $user->id);
        $recordData = $this->getChatContactList($request);

        if($request->contact_id){

            // Check the contact in category
            $isRecordContainCategory = array_key_exists($request->contact_id, $recordData['contact_list']);
            if(!$isRecordContainCategory){
                return Redirect::route('chat_list');
            }

            $selectedContact = $request->contact_id;
            $contactChaneel = ChatListContact::where('user_id', $user->id)->where('contact_id' , $selectedContact )->first();
            $category = ($request->category) ? $request->category : $contactChaneel->channel;
            $messages = $this->getMessageList($request);
        }
        
        $accounts = Account::where('company_id', $companyId )
            ->where(function($query) use ($category) {
                if($category != 'all' && $category != ''){
                    $query->where('service' , $category);
                }
            })
            ->get();
        
        foreach($accounts as $account){
            $accoutList[$account->id] = $account->company_name;
        }

        $filterData = $this->getFiltersInfo($companyId, $user->id, 'Contact', true);

        $translator = [
            'Your Profile' => __('Your Profile'),
            'Settings' => __('Settings'),
            'Sign out' => __('Sign out'),
            'All Chats' => __('All Chats'),
            'Unread' => __('Unread'),
            'Archive' => __('Archived'),
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
        $templates = $this->getTemplates($companyId);

        $data = [
            'contact_list' => $contactList,
            'account_list' => $accoutList,
            'messages' => $messages,
            'selected_contact' => $selectedContact,
            'templates' => $templates,
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
            $list_view_columns = ['first_name', 'last_name', 'phone_number', 'instagram_username', 'email'];
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
                    $name = ($contact->phone_number != '') ? $contact->phone_number : $contact->instagram_username;
                } 
                $name = trim($name , ' '); 

                $contactList[$contact->id] = [
                    'id' => $contact->id,
                    'name' => $name,
                    'number' =>  $contact->phone_number,
                    'insta_id' => $contact->instagram_username,
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
     * Return template list
     */
    public function getTemplates($companyId)
    {
        $templates = Template::join('messages', 'templates.id', 'template_id')
            ->where('company_id', $companyId)
            ->where('status' , 'APPROVED' )
            ->get(['template_uid', 'account_id', 'body', 'name']);
        
        return $templates;
    }

    /**
     * Return contact conversation history
     */
    public function getMessageList(Request $request)
    {
        $user = $request->user();
        $contactId = $request->contact_id;
        $companyId = Cache::get('selected_company_'. $user->id);
        // Update Channel
        $this->updateChatChannel($user->id , $contactId, $request->category); 
        $category = ($request->category == 'all') ?['instagram', 'whatsapp'] : [$request->category] ;
        
        $messages = [];
        $account = Account::where('user_id', $user->id)->first();
        $contact = Contact::where('company_id', $companyId)
            ->where('id', $contactId)
            ->first();
        if(!$contact){
            return ( $messages);
        }
        foreach($contact->messages->whereIn('service', $category) as $message){
            $messages[] = [
                'content' => $message->message,
                'type' => $message->msg_type,
                'path' => ($message->file_path),
                'status' => $message->status,
                'date' => date_format( $message->created_at , $this->dateChatView),
                'mode' => $message->msg_mode,
                'category' => $message->service,
                'error' => $message->error_response,
                'delivered' => $message->is_delivered,
                'read' => $message->is_read,
            ];
        }
       // dd($messages);
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
     * Handle FB webhook
     */
	public function incomingFBWhatsApp() 
    {
        $verification_token = config('app.fb.verification_code');
        if(isset($_GET['hub_mode']) && $_GET['hub_mode'] == 'subscribe' && $_GET['hub_verify_token'] == $verification_token) {
            return $_GET['hub_challenge'];
        }

        $post_data = file_get_contents("php://input");
        $response = json_decode($post_data, true);

        $data = isset($response['entry'][0]['changes'][0]) ? $response['entry'][0]['changes'][0] : [];
        
        Log::info(['Incoming message (or) response ' => $data ]);

        // Update template status
        if(isset($data['field']) && $data['field'] == 'message_template_status_update'){
            $tempId = $data['value']['message_template_id'];
            $template = Template::where('template_uid', $tempId)
                ->first();
            if($template){
                $status = strtoupper($data['value']['event']);
                if($status == 'REJECTED'){
                    $status = $status. ' ( Reason: '.$data['value']['reason']. ' )';
                }
                $template->status = $status;
                $template->save();
            }
        }
        if( isset($data['field']) && $data['field'] == 'messages'){
            if(isset($data['value']['statuses']) && isset($data['value']['statuses']['0']['id']) ) {
                $serviceId = $data['value']['statuses']['0']['id'];

                $messageData['service_id'] = $serviceId;
                $message = Msg::where('service_id', $serviceId)->first();

                if(!$message){
                    return false;
                }
                $status = $data['value']['statuses']['0']['status'];
                $statusUC = strtoupper($status);
                
               
                switch ($status){
                    case 'failed':
                        $messageData['status'] = $statusUC;
                        $messageData['error_response'] = '';
                        break;

                    case 'sent':
                        $messageData['status'] = $statusUC;
                        break;
                    
                    case 'delivered':
                        $messageData['is_delivered'] = true;
                        break;

                    case 'read':
                        $messageData['is_read'] = true;
                        break;
                }

                if($status == 'sent' && isset($data['value']['statuses']['0']['pricing'])){
                    $phone_number_id = $data['value']['metadata']['phone_number_id'];
                    $account = Account::where('fb_phone_number_id' , $phone_number_id)->first();
                    if(!$account){
                        return true;
                    }
                    $messageData['policy'] = $data['value']['statuses']['0']['pricing']['category'];
                    $price = $this->handlePrice($data['value']['statuses']['0']['recipient_id'], $data['value']['statuses']['0']['pricing']['category'], $account->user_id);
                    $this->reduceMessageAmount($price, $message->account_id);
                    $messageData['amount'] = $price;
                }
                
            } else if( isset($data['value']['contacts']) ){

                $phone_number_id = $data['value']['metadata']['phone_number_id'];
                $account = Account::where('fb_phone_number_id' , $phone_number_id)->first();
                if(!$account){
                    return true;
                }

                $data['id'] = $data['value']['messages'][0]['id'];
                $msgable_id = $this->getInfoUsingContactUniqueId($data['value']['contacts'][0]['wa_id'], 'whatsapp', $account->company_id,  $account->user_id, $data['value']['contacts'][0]['profile']['name']);
            
                $content = isset($data['value']['messages'][0]['text']['body']) ? $data['value']['messages'][0]['text']['body'] : '';
                // $content = ( $content == '' && isset($data['payload']['name'])) ? $data['payload']['name'] : $content;
                $msgable_type = 'App\Models\Contact';
                $type = $data['value']['messages'][0]['type'];
                $is_media = false;
                if($type != 'text'){
                    $is_media = true;
                    $document = new Document();
                    $fileData = $document->storeFBDocument( $account , $msgable_id , $data['value']['messages'][0][$type] );
                }
                log::info(['msg type' => $type]);

                $messageData = [
                    'service_id' => $data['id'],
                    'service' => 'whatsapp',
                    'message' => $content,
                    'msg_type' => $type ,
                    'account_id' => $account->id,
                    'msgable_id' => $msgable_id,
                    'msgable_type' => $msgable_type,
                    'msg_mode' => 'incoming',
                    'status' => 'received',
                    'is_delivered' => 0,
                    'is_read' => 0
                ];

                if($type != 'text'){
                    $messageData['message'] = $fileData['message'];
                    $messageData = array_merge($messageData, $fileData);
                }

                $messageData['policy'] = 'business_initiated';
                $price = $this->handlePrice($data['value']['messages']['0']['from'], 'business_initiated' , $account->user_id);
                $this->reduceMessageAmount($price, $account->id);
                $messageData['amount'] = $price;
            }

            Log::info(['store Messages function start.', $messageData ]);
            $this->processMessage($messageData);
            Log::info('Messages stored successfully.');
        }

        log::info([ 'Incoming message (or) response' => $data ]);
        return true;
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
        $attachment = isset($_FILES['attachment']) ? $_FILES['attachment'] : '';

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
           
            $template = ($request->template_id) ? $request->template_id : '';
            $document = '';
            if($attachment){
              //  $path = $request->file('attachment')->store('sent_files');

                $attachment = $request->file('attachment');
                $extention =  $attachment->getClientOriginalExtension();
                $attachment_name = 'ba_'.time().$extention.'.'.$extention;
                $path = public_path('/uploads/sent_files');
                $attachment->move($path, $attachment_name);
                $mimeType = $request->file('attachment')->getClientMimeType();
                
                $type = explode('/', $mimeType);
                $document = [
                    'type' => $type[0], 
                    'caption' => $request->content,
                    'file_url' => url('uploads/sent_files/'.$attachment_name),
                ];
            }
           
            log::info(['Docuemnt data ' => $document ]);

            $result = $msg->sendWhatsAppMessage($request->content , $request->destination, $account , $template, $document);
            if($attachment){
                // Store Document 
                $file = file_get_contents($path.'/'.$attachment_name);
                $parent = $this->getInfoUsingContactUniqueId($request->destination, $request->channel, $account->company_id, $user->id);
                $docId = (new Document)->saveDocument($mimeType , $file, $parent, $account, 'sent');
                $result['result']['file_path'] = $docId;

                // Delete public storage file
               // File::delete($path.'/'.$attachment_name);
            }

            if($result['result'] &&  $result['result']['status'] != 'error' ){
                if( $result['result']['status'] == 'submitted'){
                    $result['status'] = 'Queued';
                }
                $result['messageId'] = $result['result']['messageId'];
            } else {
                $result['status'] = 'Failed';
                $error = isset($result['result']['error']) ? ($result['result']['error']) : ($result['result']['message']);
                $result['error'] = $error ? $error : 'Please check the configuration';
            }
        }
        if(isset($result['messageId']))
            $this->handleMessageResult($request, $account->id, $result);

        return response()->json($result);
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
            'msg_type' => isset($data['result']['msg_type']) ? $data['result']['msg_type'] : '',
            'file_path' => isset($data['result']['file_path']) ? $data['result']['file_path'] : '',
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
        $field = ($type == 'whatsapp') ? 'phone_number' : 'instagram_username';

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
        log::info([ 'handle message data: ', $data ]);

        $account = Account::where('phone_number', $_GET['origin'])->first();
        $companyId = $account->company_id;

        $user_id = $account->user_id; 
        $msgable_type = 'App\Models\Contact';

        if ( isset($data['sender']) &&  $_GET['origin'] != $data['sender']['phone']) {
            $msgable_id = $this->getInfoUsingContactUniqueId($data['sender']['phone'], 'whatsapp', $companyId, $user_id, $data['sender']['name']);
            
            $content = isset($data['payload']['text']) ? $data['payload']['text'] : '';
            $content = ( $content == '' && isset($data['payload']['name'])) ? $data['payload']['name'] : $content;

            $messageData = [
                'service_id' => $data['id'],
                'service' => 'whatsapp',
                'message' => $content,
                'msg_type' => isset($data['payload']['text']) ? 'text' : '',
                'account_id' => $account->id,
                'msgable_id' => $msgable_id,
                'msgable_type' => $msgable_type,
                'msg_mode' => 'incoming',
                'status' => 'received',
                'is_delivered' => 0,
                'is_read' => 0
            ];
            if(isset($data['payload']['contentType'])){
                // Store document
                $document = new Document();
                $filePath = $document->storeDocument( $data['payload']['contentType'], $data['payload']['url'] , $msgable_id , $account);
        
                $type = explode('/' , $data['payload']['contentType']);
                $messageData['msg_type'] = $type[0];
                $messageData['message'] = isset($data['payload']['caption']) ?  $data['payload']['caption'] : '';
                $messageData['file_path'] = $filePath;
            }
        } else {
            
            $serviceId = isset($data['gsId']) ? $data['gsId'] : '';
            $serviceId = ($serviceId == '' && isset($data['id'])) ? $data['id'] : $serviceId;
            if(! $serviceId)
                return false;

            $messageData['service_id'] = $serviceId;
            $message = Msg::where('service_id', $serviceId)->first();
            if(!$message){
                return false;
            }

            $is_delivered = $is_read = 0;
            $status = 'Sent';
            if (isset($data['type']) && str_contains($data['type'], 'failed')) {
                $messageData['status'] = 'Failed';
                $messageData['error_response'] = $data['payload']['reason'];
            } else if(isset($data['type']) && $data['type'] == 'sent'){
                $messageData['status'] = 'Sent';
            }
            else if(isset($data['type']) && $data['type'] == 'delivered'){
                $messageData['is_delivered'] = 1;
            }
            else if(isset($data['type']) && $data['type'] == 'read'){
                $messageData['is_read'] = 1;
            }
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
    public function sendAPIMessage(Request $request)
    {
        if($request->from_crm){
            $_REQUEST['FROM_CRM'] = true;
        }
        $current_user = $request->user();
        $account_id = $request->account_number;
        $account = Account::where('id' , $account_id)->orWhere('phone_number', $account_id )->first();
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
        $return = 0;
        $number = '+'.$number ;
        $price = '';
        $companyId = Cache::get('selected_company_'. $user_id);
        $contact = Contact::where('phone_number' , $number)
            ->where('company_id', $companyId)
            ->first();
        if($contact ){
            $price = Price::where('country_code' , $contact->country_code)->first();
        } 

        if(! $price){
            $price = Price::where('is_default' , 1)->first();
        }

        if( $price){
            if($category == 'UIC'){
                $return = $price->user_initiated;
            } else if($category == 'BIC'){
                $return = $price->business_initiated;
            } else {
                $return = $price->message;
            }
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
