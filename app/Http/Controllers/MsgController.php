<?php

namespace App\Http\Controllers;

use App\Models\Msg;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Auth;
use App\Models\Message;
use App\Models\Account;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Template;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\MessageLogController;
use Illuminate\Support\Str;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use App\Models\Price;
use App\Models\Company;
use App\Models\Wallet;
use App\Models\Filter;
use App\Models\Session;
use App\Models\Setting;
use App\Models\Product;
use App\Models\WhatsAppUsers;
use Carbon\Carbon;
use Cache;
use Illuminate\Pagination\LengthAwarePaginator;
use URL;
use Storage;
use App\Models\ChatListContact;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File; 
use Brick\PhoneNumber\PhoneNumber;
use Brick\PhoneNumber\PhoneNumberParseException;
use App\Models\InteractiveMessage;

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
        $limit = Cache::get('Message' . 'page_limit' . $request->user()->id, 10);
        $user = $request->user();
        $user_id = $user->id;
        $menuBar = $this->fetchMenuBar();

        // Search & Filter
        $search = $request->has('search') && $request->get('search') ? $request->get('search') : '';
        $filterId = $request->has('filter_id') && $request->get('filter_id') ? $request->get('filter_id') : '';
        $filter = $request->has('filter') && $request->get('filter') ? $request->get('filter') : '';
        $useOptimizedListing = !$search && !$filterId && !$filter;

        // List view columns to show
        $list_view_columns = [
            'id' => ['label' => __('Id'), 'type' => 'text'],
            'message' => ['label' => __('Content'), 'type' => 'textarea'],
            'company_name' => ['label' => __('Account name'), 'type' => 'text'],
            'msg_mode' =>['label' => __('Mode'), 'type' => 'text'],
            'sender' =>['label' => __('Sender'), 'type' => 'text'],
            'destination' =>['label' => __('Destination'), 'type' => 'text'],
            'status' => ['label' => __('Status'), 'type' => 'text'],
            'error_response'=> ['label' => 'Error' , 'type' => 'textarea'] ,
            'created_at' => ['label' => __('Date'), 'type' => 'text'],
        ]; 
        
        $searchData = '';
        if($filter) {
            $searchData = json_decode($filter);
        }

        // If filter is selected, we should use the filter conditions
        if($filterId && $filterId != 'All') {
            $filter = Filter::where('id', $filterId)->first();
            if($filter) {
                $searchData = unserialize( base64_decode($filter->condition) );
            }
        }

        $accounts = collect();
        $contacts = collect();

        if ($useOptimizedListing) {
            $messages = $this->getFastMessagePaginator($request, $limit);
            $accountIds = $messages->getCollection()->pluck('account_id')->filter()->unique()->values();
            $contactIds = $messages->getCollection()->pluck('msgable_id')->filter()->unique()->values();

            $accounts = Account::whereIn('id', $accountIds)
                ->get(['id', 'company_name', 'phone_number'])
                ->keyBy('id');

            $contacts = Contact::whereIn('id', $contactIds)
                ->get(['id', 'phone_number', 'facebook_username', 'instagram_username', 'email'])
                ->keyBy('id');
        } else {
            $query_columns = ['msgs.id', 'msgs.service', 'msgs.status', 'error_response', 'msgs.created_at', 'message', 'accounts.company_name', 'accounts.phone_number as account_phone_number', 'contacts.phone_number', 'contacts.facebook_username', 'contacts.instagram_username', 'msg_mode'];
            $query = Msg::select($query_columns)
                ->join('accounts', 'account_id', 'accounts.id')
                ->join('contacts', 'contacts.id', 'msgable_id');

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
                ->paginate($limit)
                ->withQueryString();
        }

        if($search || $filterId) {
            if($search) {
                $url = route(('listMessage'), ['search' => $search]);
            } else {
                $url = route(('listMessage'), ['filter_id' => $filterId]);
            }
            $messages->withPath($url);
        }    

        foreach($messages as $message) {
            if ($useOptimizedListing) {
                $account = $accounts->get($message->account_id);
                $contact = $contacts->get($message->msgable_id);

                $companyName = $account?->company_name ?? '';
                $accountPhoneNumber = $account?->phone_number ?? '';
                $phoneNumber = $contact?->phone_number ?? '';
                $facebookUsername = $contact?->facebook_username ?? '';
                $instagramUsername = $contact?->instagram_username ?? '';
            } else {
                $companyName = $message->company_name;
                $accountPhoneNumber = $message->account_phone_number;
                $phoneNumber = $message->phone_number;
                $facebookUsername = $message->facebook_username;
                $instagramUsername = $message->instagram_username;
            }

            [$sender, $destination] = $this->resolveMessageParties(
                $message->service,
                $message->msg_mode,
                $companyName,
                $accountPhoneNumber,
                $phoneNumber,
                $facebookUsername,
                $instagramUsername
            );

            $messageList[] = [
                'id' => $message->id,
                'company_name' => $companyName,
                'message' => $message->message,
                'error_response' => $message->error_response,
                'status' => ucfirst($message->status),
                'msg_mode' => ucfirst($message->msg_mode),
                'sender' => $sender,
                'destination' => $destination,
                'created_at' => date_format($message->created_at, $this->dateListView),
            ];
        }
        $filterData = $this->getFiltersInfo($user_id, 'Message', false);

        $module = new Msg();
        $messageTranslate = [
            'Messages' => __('Messages'),
            'No Messages yet' => __('No messages sent/received yet for your account(s).')
        ];

        $translator = $this->getTranslations();
        $translator = array_merge($translator , $messageTranslate);

        $data = [
            'singular' => __('Message'),
            'plural' => __('Reports'),
            'module' => 'Message',
            'current_page' => 'Reports', 
            'records' => $messageList,
            'compact_type' => 'condense',
            'list_view_columns' => $list_view_columns,
            'menuBar' => $menuBar,

            'search' => $search,
            'filter' => $filterData,
            'filter_condition' =>$filter,
            'filter_id' => $filterId,

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
                'firstItem' => $messages->firstItem(),
                'lastItem' => $messages->lastItem(),
                'lastPage' => $messages->lastPage(),
                'perPage' => $messages->perPage(),
                'pageLimit' => $limit,
            ],
            
            'translator' => $this->getTranslations(),
            
        ];

        return Inertia::render('Messages/Messages', $data);
    }

    protected function getFastMessagePaginator(Request $request, int $limit): LengthAwarePaginator
    {
        $page = max((int) $request->get('page', 1), 1);
        $baseQuery = Msg::query();
        $total = Cache::remember('messages_total_count', now()->addMinutes(2), function () use ($baseQuery) {
            return (clone $baseQuery)->count();
        });

        $records = (clone $baseQuery)
            ->select(['id', 'service', 'status', 'error_response', 'created_at', 'message', 'account_id', 'msgable_id', 'msg_mode'])
            ->orderBy('id', 'desc')
            ->forPage($page, $limit)
            ->get();

        return new LengthAwarePaginator(
            $records,
            $total,
            $limit,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ]
        );
    }

    protected function resolveMessageParties($service, $msgMode, $companyName, $accountPhoneNumber, $phoneNumber, $facebookUsername, $instagramUsername, $emailAddress = ''): array
    {
        $sender = '';
        $destination = '';

        if($service == 'whatsapp') {
            if($msgMode == 'incoming') {
                $sender = $phoneNumber;
                $destination = $accountPhoneNumber;
            } else {
                $sender = $accountPhoneNumber;
                $destination = $phoneNumber;
            }
        }
        else if($service == 'instagram') {
            if($msgMode == 'incoming') {
                $sender = $instagramUsername;
                $destination = $companyName;
            } else {
                $sender = $companyName;
                $destination = $instagramUsername;
            }
        }
        else if($service == 'facebook') {
            if($msgMode == 'incoming') {
                $sender = $facebookUsername;
                $destination = $companyName;
            } else {
                $sender = $companyName;
                $destination = $facebookUsername;
            }
        }
        else if($service == 'email') {
            if($msgMode == 'incoming') {
                $sender = $emailAddress;
                $destination = $companyName;
            } else {
                $sender = $companyName;
                $destination = $emailAddress;
            }
        }

        return [$sender, $destination];
    }

    /**
     * API Documentation page
     */
    public function apiDocumentation(Request $request)
    {
        $menuBar = $this->fetchMenuBar();
        $translator = $this->getTranslations();

        $company = Company::first();
        if ($company && $company->plan != 'lite') {
            $plan = DB::table('stripe_plans')->where('id', $company->plan)->first();
            if ($plan) {
                $company['plan'] = $plan->name;
            }
        }

        return Inertia::render('Reports/ApiDocumentation', [
            'menuBar' => $menuBar,
            'translator' => $translator,
            'company' => ['currentCompany' => $company],
            'currentCompany' => $company,
            'current_page' => 'API Documentation'
        ]);
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
        $menuBar = $this->fetchMenuBar();

        $recordData = $this->getChatContactList($request);
        $sessions = [];

        if($request->contact_id){

            // Check the contact in category
            $isRecordContainCategory = array_key_exists("contact_id_{$request->contact_id}", $recordData['contact_list']);
            if(!$isRecordContainCategory){
                return Redirect::route('chat_list');
            }

            $selectedContact = $request->contact_id;
            $contactChaneel = ChatListContact::where('user_id', $user->id)->where('contact_id' , $selectedContact )->first();
            $category = ($request->category) ? $request->category : ($contactChaneel ? $contactChaneel->channel : 'whatsapp');
            $messages = $this->getMessageList($request);

            // Check session 
            $condition = [
                'contact_id' => $request->contact_id,
            ];
            $getSessions = Session::where($condition)
                ->where('created_at', '>=', Carbon::now()->subDay())
                ->get();

            foreach($getSessions as $session){
                $sessions[$session->contact_id][$session->account_id] = true; 
            }
        }
        
        $accounts = Account::where(function($query) use ($category) {
                if($category != 'all' && $category != ''){
                    $query->where('service' , $category);
                }
            })
            ->where('status' , 'Active')
            ->get();
        
        foreach($accounts as $account){
            if($account->service == 'email') {
                $accoutList[$account->id] = $account->company_name . ' (' . $account->email . ')';
            } elseif($account->service != 'whatsapp') {
                $accoutList[$account->id] = $account->company_name . "- {$account->fb_page_name}";
            } else {
                $accoutList[$account->id] = $account->company_name;
            }
        }

        $filterData = $this->getFiltersInfo( $user->id, 'Contact', true);

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
            'Write your message!' => __('Write your message!'),
            'Select Contact' => __('Select Contact'),
            'Add a contact' => __('Add a contact'),
            'Add' => __('Add'),
            'Cancel' => __('Cancel'),
        ];
        $translator = array_merge( $translator, $this->getTranslations());

        $templates = $this->getTemplates();
        $products = $this->getProducts();
        $interactiveMessages = $this->getInteractiveMessages();

        $data = [
            'contact_list' => $contactList,
            'account_list' => $accoutList,
            'messages' => $messages,
            'selected_contact' => $selectedContact,
            'templates' => $templates,
            'current_page' => 'Chat',
            'category' => ($category) ? $category : 'whatsapp',
            'translator' => $translator,
            'filter' => $filterData,
            'menuBar' => $menuBar,
            'sessions' => $sessions,
            'products' => $products,
            'interactiveMessages' => $interactiveMessages,
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
        $query->join('contacts', 'contact_id', 'contacts.id');
        if($filterId && $filterId != 'All'){
            $filter = Filter::find($filterId);
            if($filter){
                $searchData = unserialize( base64_decode($filter->condition) );
            }
        }

        if($searchData){
           // $query->join('contacts', 'contact_id', 'contacts.id');
            $query = $this->prepareQuery($searchData , $query, 'contacts');
        }

        if($search){
            $list_view_columns = ['first_name', 'last_name', 'phone_number', 'instagram_username', 'email'];
            
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

        $mode = (isset($_GET['mode'])) ? ($_GET['mode']) : 'unread';
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
      
        $chatListContact = $query->paginate(15);
        
        $contactList = [];
        foreach($chatListContact as $contactId){
            $contact = Contact::find($contactId->contact_id);
            if($contact){
                $name = $contact->first_name . ' ' .$contact->last_name;
                if($name == ' '){
                    if($contact->phone_number){
                        $name = $contact->phone_number;
                    } elseif($contact->instagram_username){
                        $name = $contact->instagram_username;
                    } elseif($contact->facebook_username){
                        $name = $contact->facebook_username;
                    } elseif($contact->email){
                        $name = $contact->email;
                    }
                } 
                $name = trim($name , ' '); 

                $contactList["contact_id_{$contact->id}"] = [
                    'id' => $contact->id,
                    'name' => $name,
                    'number' =>  $contact->phone_number,
                    'insta_id' => $contact->instagram_username,
                    'channel' => $contactId->channel, 
                    'fb_id' => $contact->facebook_username,
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

        if($request->ajax() && $request->fetchContact) {
            $data['status'] = true;
            echo json_encode($data); die;
        }
        return $data;
    }

    /**
     * Return template list
     */
    public function getTemplates()
    {
        $templates = Template::join('messages', 'templates.id', 'template_id')
            ->where('messages.status' , 'APPROVED' )
            ->get(['messages.template_uid', 'account_id', 'body', 'name']);

        return $templates;
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
        $category = ($request->category == 'all') ? ['instagram', 'whatsapp', 'facebook', 'email'] : [$request->category];
        
        $messages = [];
        $account = Account::where('user_id', $user->id)->first();
        $contact = Contact::where('id', $contactId)->first();
        if(!$contact){
            return $messages;
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
                'is_reply' => $message->is_reply,
                'is_mention' => $message->is_mention,
            ];
        }

        return ($messages);
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
            $contact->save();
        }
    }

    /**
     * Handle Insta hooks
     */
    public function incomingFBInsta()
    {
        //log::info(['data' => $_REQUEST]);

        $post_data = file_get_contents("php://input");
        $response = json_decode($post_data, true);
        //Log::info(['Incoming Insta message (or) response ' => $response ]);

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
        //Log::info(['Incoming message (or) response ' => $response ]);

        $data = isset($response['entry'][0]['changes'][0]) ? $response['entry'][0]['changes'][0] : [];
        // Update template status
        if(isset($data['field']) && $data['field'] == 'message_template_status_update'){
            $tempId = $data['value']['message_template_id'];
            $template = Message::where('template_uid', $tempId)
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

                $phone_number_id = $data['value']['metadata']['phone_number_id'];
                $account = Account::where('fb_phone_number_id' , $phone_number_id)->first();
               
                switch ($status){
                    case 'failed':
                        $messageData['status'] = $statusUC;
                        $messageData['error_response'] = $data['value']['statuses']['0']['errors'][0]['title'];
                        if( $data['value']['statuses']['0']['errors'][0]['code'] == 131047 ) {
                            // $user = User::find($account->user_id);
                            // $user->fb_token = '';
                            // $user->save();
                        }
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
                    
                    if(!$account){
                        return true;
                    }
                //    $messageData['policy'] = 'BIC';
                //    $price = $this->handlePrice($data['value']['statuses']['0']['recipient_id'], $data['value']['statuses']['0']['pricing']['category'], $account->user_id);
                //    $this->reduceMessageAmount($price, $message->account_id);
                //    $messageData['amount'] = $price;
                }
                
            } else if( isset($data['value']['contacts']) ){

                $phone_number_id = $data['value']['metadata']['phone_number_id'];
                $account = Account::where('fb_phone_number_id' , $phone_number_id)->first();
                if(!$account){
                    return true;
                }

                $data['id'] = $data['value']['messages'][0]['id'];
                $msgable_id = $this->getInfoUsingContactUniqueId($data['value']['contacts'][0]['wa_id'], 'whatsapp',  $account->user_id, $data['value']['contacts'][0]['profile']['name']);
            
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
                
                $messageData = [
                    'service_id' => $data['id'],
                    'service' => 'whatsapp',
                    'message' => $content,
                    'msg_type' => $type ,
                    'account_id' => $account->id,
                    'msgable_id' => $msgable_id,
                    'msgable_type' => $msgable_type,
                    'policy' => 'UIC',
                    'msg_mode' => 'incoming',
                    'status' => 'received',
                    'is_delivered' => 0,
                    'is_read' => 0
                ];

                if($type != 'text'){
                    $messageData['message'] = $fileData['message'];
                    $messageData = array_merge($messageData, $fileData);
                }

                // $messageData['policy'] = 'UIC';
                // $price = $this->handlePrice($data['value']['messages']['0']['from'], 'business_initiated' , $account->user_id);
                // $this->reduceMessageAmount($price, $account->id);
                // $messageData['amount'] = $price;
            }

           // Log::info(['store Messages function start.', $messageData ]);
            $this->processMessage($messageData);
            //Log::info('Messages stored successfully.');
        }

        //log::info([ 'Incoming message (or) response' => $data ]);
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
            return ;
        }

        $data = isset($response['payload']) ? $response['payload'] : [];

        // For set callback url
        if((isset($data['type']) && $data['type'] == 'user-event' )|| (isset($data['phone']) && $data['phone'] == 'callbackSetPhone' )|| ( isset($data['type']) && $data['type'] == 'sandbox-start' )){
            return ;
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
	    return;
        }

        if($response['type'] == 'template-event'){
            $template = Message::where('template_uid', $data['id'])
                ->first();
            if($template && isset($data['status'])){
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
	return;
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

        $document = '';
        // Attachment handling
        if($attachment) {
            $attachment = $request->file('attachment');
            $extention =  $attachment->getClientOriginalExtension();
            $attachment_name = 'ba_'.time().$extention.'.'.$extention;
            $path = public_path('/uploads/sent_files');
            $attachment->move($path, $attachment_name);
            $mimeType = $request->file('attachment')->getClientMimeType();
            
            $type = explode('/', $mimeType);
            $document = [
                'type' => $type[0], 
                'url' => url('uploads/sent_files/'.$attachment_name),
                'caption' => $request->content,
            ];
            
            if($type[0] == 'image'){
                $docParams = [
                    'previewUrl' => url('uploads/sent_files/'.$attachment_name),
                    'originalUrl' => url('uploads/sent_files/'.$attachment_name),
                ];
            } else {
                $docParams = [
                    'url' => url('uploads/sent_files/'.$attachment_name),
                    'filename' => $request->content,
                ];
            }
            if($type[0] != 'image' && $type[0] != 'video'){
                $document['type'] = ($account->service_engine == 'facebook')? 'document' : 'file';
                unset($document['caption']);
            }
            $document = array_merge($document , $docParams);
         
            //log::info(['Docuemnt data ' => $document ]);
        }
       
        $parent = $this->getInfoUsingContactUniqueId($request->destination, $request->channel, $user->id);

        // Send Message via Email
        if($request->channel == 'email') {
            $subject = $request->email_subject ?: '(no subject)';
            $result = $this->sendEmailMessage($request->content, $request->destination, $account, $subject);

            if(isset($result['messageId']))
                $this->handleMessageResult($request, $account->id, $result);

            return response()->json($result);
        }

        // Send Message to Facebook or Instagram
        if($request->channel == 'instagram' || $request->channel == 'facebook') {
            
            //$response = $msg->sendInstagramMessage($request->content , $request->destination, $account->src_name);
            
            // Get Page token
            $helper = new WhatsAppUsers();
            $pageToken = $helper->getFbPageAccessToken($account);

            $msg = new Msg();
            $response = $msg->sendInstaMessage($request->content, $request->destination, $account->fb_phone_number_id, $pageToken, $document);
         
            $status = 'Send';
            if(isset($response['error'])) {
                $status = 'Failed';
                $request->channel = 'instgram';
                $result['error'] = $response['error']['message'];
            } else {
                $result['messageId'] = $response['message_id'];
            }
          
            $result['status'] = $status;
            
        } else {
            // Send Message to Whatsapp
            $template = ($request->template_id) ? $request->template_id : '';
            $catalog_id = ($request->catalog_id) ? $request->catalog_id : '';
            $template_options = ($request->template_options) ? $request->template_options : '';

            $product_retailer_id = ($request->product_retailer_id && $request->product_retailer_id != 'undefined') ? $request->product_retailer_id : '';
            
            $content = $request->content;
        
            if($template && $template != 'undefined'){
                
                $content = [];
                $message =  Message::join('templates', 'templates.id' , 'template_id')
                    ->where('messages.template_uid', $template)
                    ->where('account_id', $account->id)
                    ->first();
                
                $_POST['content'] = $messageBody = $message->body;
               
               // $message->example = base64_encode( serialize( $message->example) );
                if(base64_decode($message->example, true)) {
                    $sample = ($message->example) ? unserialize( base64_decode( $message->example) ) : [];
                } else if($message->example){
                    $sample = $message->example;
                } else {
                    $sample = [];
                }
                $contact = Contact::find($parent);
                if(is_array($sample)){
                    foreach($sample as $key => $name){
                        $content[] = $this->replaceFieldValue($name, $contact);
                    } 
                    
                    foreach($content as $key => $value){
                        $index = $key + 1;
                        if( strpos($messageBody , "{{".$index."}}") ){
                            $messageBody = str_replace( "{{".$index."}}" , $value , $messageBody );
                        }
                    }   
                    $_POST['content'] = $messageBody;
                } else if($sample){
                    $_POST['content'] = $sample;
                }
            }
            $productData = [];
            if($product_retailer_id){
                $product = Product::where('retailer_id', $product_retailer_id)->first();
                $_POST['content'] = $product->name ." - Product shared";
                $productData = [
                    'type' => 'product',
                //    'body' => ['text' => $product->description],
                    'footer' => ['text' => $product->description],
                    'action' => [
                        'catalog_id' => $catalog_id,
                        'product_retailer_id' => $product_retailer_id,
                    ],
                ];
            }

            $interactiveMessage = [];

            if($template_options && $template_options != 'undefined'){
                if($request->template_type == 'list_option') {
                    $menuData = json_decode($template_options)->menu_data;
                    $options = json_decode($template_options)->list_option;

                    $interactiveMessage = [
                        "type" => "list",
                        'title' => $menuData->title,
                        'body' => $content,
                        'globalButtons' => [["type" => "text", "title" => $menuData->button_title]],
                        'items' => [
                            [
                                "title" => $menuData->title,
                                "subtitle" => $menuData->title,
                                "options" => $options,
                            ]
                        ]
                    ];
                } else {
                    $interactiveMessage = [
                        'type' => $request->template_type,
                        'content' => [
                                'caption' => '',
                                'type' => 'text',
                                'text' => $content,
                            ],
                        'options' => json_decode($template_options),
                    ];
                }
            }
           
            $result = $msg->sendWhatsAppMessage($content , $request->destination, $account , $template, $document, $productData, $interactiveMessage);
            
            if($result['result'] && $result['result']['status'] && $result['result']['status'] != 'error' ){
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
        if($attachment){
            // Store Document 
            $file = file_get_contents($path.'/'.$attachment_name);
            $path = "document/{$account->id}/{$parent}/sent/{$attachment_name}";
            $docId = (new Document)->saveDocument($attachment_name, $mimeType , $file, $parent, 'Contact', $path, '');
            $result['result']['file_path'] = $docId;
            $result['result']['msg_type'] = ($type) ? $type[0] : '';
       
        } else {
            $result['result']['msg_type'] = 'Text';
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

        $_REQUEST['is_sent'] = 'sent';
        $msgable_id = $this->getInfoUsingContactUniqueId($request->destination, $request->channel, $user_id);
        $msgable_type = 'App\Models\Contact';

        $messageData = [
            'service_id' => $data['messageId'],
            'service' => $request->channel,
            'message' => $_POST['content'],
            'account_id' => $accountId,
            'msgable_id' => $msgable_id,
            'msgable_type' => $msgable_type,
            'msg_mode' => 'outgoing',
            'status' => $data['status'],
            'msg_type' => isset($data['result']['msg_type']) ? $data['result']['msg_type'] : 'Text',
            'file_path' => isset($data['result']['file_path']) ? $data['result']['file_path'] : '',
            'template_id' => isset($data['result']['template_id']) ? $data['result']['template_id'] : '',
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

        // Update Session and Price 
       // if(($message->msg_mode == 'outgoing' && $message->status == 'Sent') || $message->msg_mode == 'incoming' ){
       if( $message->msg_mode == 'incoming' ){
            $message = $this->updateMessageSession($message);
        }

        $message->save();
    }

    /**
     * Send an outgoing email through the account's SMTP configuration.
     * Uses Laravel's dynamic mailer transport so each Email account can
     * have its own SMTP credentials without touching config/mail.php.
     */
    public function sendEmailMessage(string $content, string $destination, $account, string $subject = ''): array
    {
        $messageId = 'email_' . uniqid('', true);

        try {
            $mailerKey = 'email_account_' . $account->id;

            // Build a per-account mailer config at runtime
            config([
                "mail.mailers.{$mailerKey}" => [
                    'transport'  => 'smtp',
                    'host'       => $account->smtp_host ?: config('mail.mailers.smtp.host', 'localhost'),
                    'port'       => (int) ($account->smtp_port ?: 587),
                    'encryption' => $account->smtp_encryption ?: 'tls',
                    'username'   => $account->email,
                    'password'   => $account->service_token,
                    'timeout'    => null,
                ],
            ]);

            $fromAddress = $account->email;
            $fromName    = $account->display_name ?: $account->company_name;

            \Mail::mailer($mailerKey)
                ->to($destination)
                ->send(new \App\Mail\EmailChannelMessage($subject, $content, $fromAddress, $fromName));

            return [
                'result'    => ['status' => 'submitted', 'messageId' => $messageId, 'msg_type' => 'Text'],
                'messageId' => $messageId,
                'status'    => 'Queued',
            ];

        } catch (\Exception $e) {
            Log::error('Email channel send failed: ' . $e->getMessage());
            return [
                'result' => ['status' => 'error', 'message' => $e->getMessage()],
                'status' => 'Failed',
                'error'  => $e->getMessage(),
            ];
        }
    }

    /**
     * Return record id using instagram ID
     */
    public function getInfoUsingContactUniqueId($uniqueId, $type, $user_id , $name = '') 
    {
        $phoneNumber = $instagramId = '';
        $field = '';
        if($type == 'whatsapp'){
            $field = 'phone_number';
        } elseif($type == 'instagram'){
            $field = 'instagram_username';
        } elseif($type == 'facebook'){
            $field = 'facebook_username';
        } elseif($type == 'email'){
            $field = 'email';
        } else {
            $field = 'phone_number';
        }

        if(strpos($uniqueId, '+') === false){
            $uniqueId = ($type == 'whatsapp') ? '+'.$uniqueId : $uniqueId;
        }

        $contact = Contact::where($field , $uniqueId)->first();

        if(!$contact) {
            // Create new contact if instagram id is not found
            $contact = new Contact();

            $last_name = isset($_POST['last_name']) ? $_POST['last_name'] : $name;
            $first_name = isset($_POST['first_name']) ? $_POST['first_name'] : $name;

            $contact->last_name = $last_name ;
            $contact->first_name = $first_name ;

            $contact->$field = $uniqueId;
            $contact->creater_id = $user_id;
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

        $user_id = $account->user_id; 


        //log::info(['insta content' => $message_content]);
        // Get Contact information
        $msgable_id = $this->getInfoUsingContactUniqueId($sender_id, 'instagram', $user_id);
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
        //log::info([ 'handle message data: ', $data ]);

        $account = Account::where('phone_number', $_GET['origin'])->first();
        if(!$account){
            //log::info([ 'status' => false , 'message' => 'Invalid account.' ]);
            return;
        }
        $user_id = $account->user_id; 
        $msgable_type = 'App\Models\Contact';

        if ( isset($data['sender']) &&  $_GET['origin'] != $data['sender']['phone']) {
            $msgable_id = $this->getInfoUsingContactUniqueId($data['sender']['phone'], 'whatsapp', $user_id, $data['sender']['name']);
            
            $content = isset($data['payload']['text']) ? $data['payload']['text'] : '';
            $replyTo = $templateId = '';
            if(isset($data['type']) && ($data['type'] == 'list_reply' || $data['type'] == 'button_reply')) {
                $content = $data['payload']['title'];
                if( $data['type'] == 'list_reply' ){
                    $content .= $data['payload']['description'];
                }

                $replyTo = $data['context']['gsId'];
                $message = Msg::where('service_id', $replyTo)->first();
                if($message){
                    $templateId = $message->template_id;
                }
            }

            $content = ( $content == '' && isset($data['payload']['name'])) ? $data['payload']['name'] : $content;
            $countryCode = $data['sender']['country_code'];
            $price = Price::where('country_code', $countryCode)->first();
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
                'policy' => 'UIC',
                'is_delivered' => 0,
                'is_read' => 0,
                'reply_to' => $replyTo,
                'template_id' => $templateId,
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

        //Log::info(['store Messages function start.', $messageData ]);
        $this->processMessage($messageData);
        //Log::info('Messages stored successfully.');
        //return true;
    }

    /**
     * Send WhatsApp message (Function will be called from OneMessage API)
     */
    public function sendAPIMessage(Request $request)
    {
      
        if($request->from_crm){
            $_REQUEST['FROM_CRM'] = true;
        }
        Log::info(['Send message via API' => $_POST ]);

        $current_user = $request->user();
        $account_id = $request->account_number;
        $account = Account::where('id' , $account_id)->orWhere('phone_number', $account_id )->first();

        if(! $account) {
            return response()->json(['status' => false, 'message' => 'Invalid account id'], 400);
        }

        // Validate the request
        if(!$request->content && !$request->template && !$request->template_id) {
            return response()->json(['status' => false, 'message' => 'Content is missing'], 400);
        }

        if(!$request->destination) {
            return response()->json(['status' => false, 'message' => 'Destination is missing'], 400);
        }
        if($account->service == 'instagram'){
            $retuen = $this->sendInstaAPIMessage($request);
            return $retuen;
        }

        if(! $account->src_name) {
            return response()->json(['status' => false, 'message' => 'Invalid account.'], 400);
        }

        $content = $request->content;
        $type = 'Text';
        if($request->template){
            
            $content = [];
            if(is_array($request->template_params)){
                $content = $request->template_params;
            } else {
                $content = json_decode($request->template_params);
            }

            $type = 'Template';
            
            $message =  Message::join('templates', 'templates.id' , 'messages.template_id')
                ->where('messages.template_uid', $request->template)
                ->orWhere('templates.template_uid', $request->template)
                ->first();
            if(!$message) {
                return response()->json(['status' => false, 'message' => 'Template not found.'], 400);
            }

            $messageBody = $message->body;
            if($content && count($content)){
                foreach($content as $key => $value){
                    $index = $key + 1;
                    if( strpos($messageBody , "{{".$index."}}") ){
                        $messageBody = str_replace( "{{".$index."}}" , $value , $messageBody );
                    }
                }   
            }
            $_POST['content'] = $messageBody;
        }

        // Check message type
        $interactiveMessage = [];
        if($request->template_type && $request->template_type == 'interactive') {
            $template = InteractiveMessage::find($request->template_id);
            
            // Update Params with values
            $content = [];
            if(is_array($request->template_params)){
                $content = $request->template_params;
            } else {
                $content = json_decode($request->template_params);
            }
            $messageBody = $template->content;
            if($content && count($content)){
                foreach($content as $key => $value){
                    $index = $key + 1;
                    if( strpos($messageBody , "{{".$index."}}") ){
                        $messageBody = str_replace( "{{".$index."}}" , $value , $messageBody );
                    }
                }   
            }
            $_POST['content'] = $messageBody;

            if(!$template) {
                return response()->json(['status' => false, 'message' => 'Invalid template id.'], 400);
            }
           // dd($template);
            if($template->option_type == 'list_option') {
                $menuData = json_decode($template->options)->menu_data;
                $options = json_decode($template->options)->list_option;

                    $interactiveMessage = [
                        "type" => "list",
                        'title' => $menuData->title,
                        'body' => $messageBody,
                        'globalButtons' => [["type" => "text", "title" => $menuData->button_title]],
                        'items' => [
                            [
                                "title" => $menuData->title,
                                "subtitle" => $menuData->title,
                                "options" => $options,
                            ]
                        ]
                    ];
            } else {
                $interactiveMessage = [
                    'type' => $template->option_type,
                    'content' => [
                            'caption' => '',
                            'type' => 'text',
                            'text' => $messageBody,
                        ],
                    'options' => json_decode($template->options),
                ];
            }
        }

        $attachment = isset($_FILES['attachment']) ? $_FILES['attachment'] : '';
        $document = '';
        
        // Attachment handling
        if($attachment) {
            $content = '';
            $attachment = $request->file('attachment');
           
            $extention =  $attachment->getClientOriginalExtension();
            $attachment_name = 'ba_'.time().$extention.'.'.$extention;
            $path = public_path('/uploads/sent_files');
            $attachment->move($path, $attachment_name);
            $mimeType = $request->file('attachment')->getClientMimeType();
          //  $mimeType = "{$request->attachment_type}/{$extention}";

            $type = explode('/', $mimeType);
            $document = [
                'type' => $type[0], 
                'url' => url('uploads/sent_files/'.$attachment_name),
                'caption' => $request->content,
            ];
            
            if($type[0] == 'image'){
                $docParams = [
                    'previewUrl' => url('uploads/sent_files/'.$attachment_name),
                    'originalUrl' => url('uploads/sent_files/'.$attachment_name),
                ];
            } else {
                $docParams = [
                    'url' => url('uploads/sent_files/'.$attachment_name),
                    'filename' => basename(parse_url($document['url'], PHP_URL_PATH)),
                ];
            }
            if($type[0] != 'image' && $type[0] != 'video'){
                $document['type'] = ($account->service_engine == 'facebook')? 'document' : 'file';
                unset($document['caption']);
            }
            $content = basename(parse_url($document['url'], PHP_URL_PATH));
            $_POST['content'] = $content;
            $document = array_merge($document , $docParams);
        // dd($document);
        }
        $parent = $this->getInfoUsingContactUniqueId($request->destination, 'whatsapp', $current_user->id);

        $msg = new Msg();
        $result = $msg->sendWhatsAppMessage($content, $request->destination, $account , $request->template, $document, '', $interactiveMessage);
        $statusCode = 400;
        if($result['result']['status'] != 'failed' && $result['result']['status'] && $result['result']['status'] != 'error') {
            $statusCode = 200;
            if($result['result']['status'] == 'submitted') {
                $result['status'] = 'Queued';
            }
            $result['result']['msg_type'] = $type;
            
            if($attachment){
                // Store Document 
                $file = file_get_contents($path.'/'.$attachment_name);
                $path = "document/{$account->id}/{$parent}/sent/{$attachment_name}";
                $docId = (new Document)->saveDocument($attachment_name, $mimeType , $file, $parent, 'Contact', $path, '');
                $result['result']['file_path'] = $docId;
                $result['result']['msg_type'] = ($type) ? $type[0] : '';
            }

            $result['messageId'] = $result['result']['messageId'];
            $request->channel = 'whatsapp';

            if($interactiveMessage) {
                $result['result']['template_id'] = $request->template_id;
            }
            $this->handleMessageResult($request, $account->id, $result);
        }
        return response()->json($result['result'], $statusCode);
    }

    /**
     * Handle Pricing 
     * 
     * @param STRING $nummber
     * @param STRING $category
     */
    public function handlePrice($contactId , $category)
    {
        $return = 0;
        $price = '';
        $contact = Contact::find($contactId);  
        if($contact ){
            $countryCode = $contact->country_code;
            if(!$countryCode){
                $number = PhoneNumber::parse($contact->phone_number);
                $countryCode = $number->getCountryCode();
                $contact->country_code = $countryCode;
                $contact->save();
            }
            $price = Price::where('country_code' , $countryCode)->first();
        } 

        if(! $price){
            $price = Price::where('is_default' , 1)->first();
        }

        if( $price){
            if($category == 'UIC'){
                $return = $price->user_initiated;
            } else if($category == 'BIC'){
                $return = $price->business_initiated;
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
    public function reduceMessageAmount($price)
    {
        DB::beginTransaction();
        
        $wallet = Wallet::lockForUpdate()->first();
        if($wallet){
            $balance_amount = ($wallet->balance_amount - $price);
            $wallet->balance_amount = $balance_amount;
            $wallet->save();
        }
        DB::commit();
        // Auto Top-up 
        if($wallet && $wallet->balance_amount < 1){
            $this->autoTopUp();
        }
    }

    /**
     * Update message session
     */
    public function updateMessageSession($msg)
    {
        $price = 0;
        $policy = '';
        $updateSession = false;
        if($msg->msg_mode == 'outgoing' && $msg->status == 'Sent'){
            $updateSession = true;
            $policy = 'BIC';
        } else if($msg->msg_mode == 'incoming'){
            $updateSession = true;
            $policy = 'UIC';
        }

        if($updateSession){
            $condition = [
                'account_id' => $msg->account_id,
                'contact_id' => $msg->msgable_id,
            ];
            $session = Session::where($condition)
                ->where('created_at', '>=', Carbon::now()->subDay())
                ->first();
    
            if(! $session){

                if($msg->service == 'whatsapp'){
                    $price = $this->handlePrice( $msg->msgable_id, $policy);
                } 
                $sessions = Session::where($condition)->count();

                if($sessions < 1000) {
                    if($msg->service == 'whatsapp'){
                        $price = config('stripe.wp_msg_price');
                    } 
                } else {
                    if($msg->service == 'whatsapp'){
                        $price = $price + config('stripe.wp_msg_price');
                    } else if($msg->service == 'facebook'){
                        $price = config('stripe.fb_msg_price');
                    } else if($msg->service == 'instagram'){
                        $price = config('stripe.ig_msg_price');
                    } 
                }


                $this->reduceMessageAmount($price);
                $msg->amount = $price;
                $msg->policy = $policy;

                // Create Session 
                DB::beginTransaction();
                $session = new Session();
                $session->account_id = $msg->account_id;
                $session->contact_id = $msg->msgable_id;
                $session->policy = $policy;
                $session->amount = $price;
                $session->uuid = Str::uuid()->toString();
                $session->save();
                DB::commit();
            } else if(!$msg->amount && $msg->amount == 0){
                $msg->amount = 0;
                $msg->policy = 'FEP';
            }
            $msg->session_id = $session->uuid;
        }
        return $msg;
    }


    /**
     * Auto Top-up 
     */
    public function autoTopUp()
    {
        $autoTopup = Setting::get();
        $autoTopUpSetup = [];
        foreach($autoTopup as $metedata){
            $autoTopUpSetup[$metedata->meta_key] = $metedata->meta_value;
        }
        if( isset($autoTopUpSetup['auto_topup_status']) && $autoTopUpSetup['auto_topup_status'] == 'ON' && isset($autoTopUpSetup['auto_topup_value'])){
    
            $selectedTopUp = $autoTopUpSetup['auto_topup_value'];
          
            $company = Company::first();
            $stripe = new \Stripe\StripeClient(config('stripe.stripe_secret'));
            $subscription = $stripe->subscriptions->retrieve($company->subscription_id);
            $subscription_info = [];
            foreach($subscription->items->data as $subscriptionItem) {
                $price_id = $subscriptionItem->price->id;
                $quantity = 0;
        
                if($price_id && ($price_id == config("stripe.top_up_{$selectedTopUp}") )){
                    $quantity = 1;
                }
            
                if($quantity > 0){
                    $subscription_info[] = $stripe->subscriptionItems->createUsageRecord($subscriptionItem->id, [
                        'action' => 'set',
                        'quantity' => $quantity
                    ]);
                }
            }
            $wallet = Wallet::lockForUpdate()->first();
            $wallet->balance_amount = $selectedTopUp + $wallet->balance_amount;
            $wallet->save();
        }
    }

    public function resetWalletBalance(Request $request) {
    
        $wallet = Wallet::first();
        $wallet->balance_amount = 0;
        $wallet->save();

        return response()->json(['status' => 'Success', 'message' => 'Reset the wallet Balance'], 200);
    }

    /**
     * Send Instagram message (Function will be called from OneMessage API)
     */
    public function sendInstaAPIMessage($request)
    {
        $user = $request->user();
        $account_id = $request->account_number;
        $account = Account::where('id' , $account_id)->orWhere('phone_number', $account_id )->first();
        $access_token = $account->fb_token;
        $pageId = $account->fb_phone_number_id;
        if(!$access_token){
            return response()->json(['status' => false, 'message' => 'Access token not generated.'], 400);
        } 
        if(!$pageId){
            return response()->json(['status' => false, 'message' => 'This account has not connected to any page.'], 400);
        }

        $helper = new WhatsAppUsers();
        $pageToken = $helper->getFbPageAccessToken($account);
       
        $msg = new Msg();
        $result = $msg->sendInstaMessage($request->content, $request->destination, $pageId, $pageToken);
       // $statusCode = 400;
        if(isset($result['error'])) {
                $result['status'] = 'Failed';
                $result['result']['msg_type'] = 'TEXT';
                $request->channel = 'instgram';
        } else {
            $result['status'] = 'Sent';
            $result['messageId'] = $result['message_id'];
        }
        $this->handleMessageResult($request, $account->id, $result);

        return response()->json($result, 200);

    }

    /**
     * Handle FB & Insta Msgs
     */
    public function fbInstaMsgHandler(Request $request)
    {
        $post = file_get_contents('php://input');
        //log::info(['facebook incoming message handle' => $post]);
        $account = Account::find($request->account);
        if(! $account) {
            return response()->json(['status' => false, 'message' => 'Invalid account.'], 400);
        }

        if($request->is_delete){
            $message = Msg::where('service_id', $request->messageId)->first();
            $message->delete();
            return response()->json(['status' => true, 'message' => 'Message stored successfully.'], 200);
        }
        
        if($request->status == 'Read' && ($request->service == 'instagram' || $request->service == 'facebook')) {
            return false;
        }
       
        $fileUrl = '';
        $isAttachment = '';
        if($request->reply_to){
            $fileUrl = $request->reply_to;
            $isAttachment = true; 
        }
        if($request->story_mention){
            $fileUrl = $request->story_mention;
            $isAttachment = true; 
        }
        if($request->attachment_type && $request->attachment){
            $fileUrl = $request->attachment;
            $isAttachment = true; 
        }

        $contactServiceId = ($request->type == 'incoming') ? $request->sender : $request->recipient;
        $status = ($request->type == 'incoming') ? 'Received' : $request->status;
      
        if($request->service != 'whatsapp') {
            $field = ($request->service == 'instagram') ?  'instagram_username' : 'facebook_username';
            $contact = Contact::where( $field, $contactServiceId)->first();
        } else {
            $field = 'phone_number';
            $contactServiceId = '+'.$contactServiceId;
            $contact = Contact::where('phone_number', $contactServiceId )
                ->orWhere('whatsapp_number', $contactServiceId)
                ->first();
        }

        $messagableId = ''; 
        if(! $contact){
            if($request->service != 'whatsapp'){
                $facebookData = new WhatsAppUsers();
                $contactData = $facebookData->getServiceUserInfo($contactServiceId, $account);
            
               // log::info(['contact_data' => $contactData]);
                $contact = new Contact();
                if($contactData['status']){
                    if($request->service == 'instagram'){
                        $name = isset($contactData['contact_data']['name']) ? explode(' ', $contactData['contact_data']['name']) : ['', $contactData['contact_data']['username']];
                        $lastName = $name[1];
                        $firstName = $name[0];
                    } else {
                        $lastName = isset($contactData['contact_data']['last_name']) ? $contactData['contact_data']['last_name'] : '';
                        $firstName = isset($contactData['contact_data']['first_name']) ? $contactData['contact_data']['first_name'] : '';
                    }
                    $contact->last_name = $lastName;
                    $contact->first_name = $firstName;
                }
            } else {
                $contact->last_name = $request->name;
            }
            $contact->$field = $contactServiceId;
            $contact->creater_id = 1;
           
            $contact->save();
        }
        $msgable_type = 'App\Models\Contact';
        $messagableId = $contact->id; 
 
        $messageData = [
            'service_id' => $request->messageId,
            'service' => $request->service,
            'account_id' => $request->account,
            'msgable_id' => $messagableId,
            'msgable_type' => $msgable_type,
            'msg_mode' => $request->type,
            'status' => $status,
            'msg_type' => ($fileUrl) ? 'story' : 'Text',
            'file_path' => $fileUrl,
            'is_delivered' => ($request->status == 'Delivered') ? true : false,
            'is_read' => ($request->status == 'Read') ? true : false,
        ];
        if($request->type == 'incoming' && $request->service == 'whatsapp'){
            $messageData['message'] = $request->message;
        } else if($request->service != 'whatsapp') {
            $messageData['message'] = $request->message;
        }
        if($status == 'Failed') {
            $messageData['error_response'] = $request->error_msg;
        }

        $msgType = 'story';
        if($request->story_type == 'reply_to' ){
            $messageData['is_reply'] = true;
        }
        if($request->story_type == 'story_mention' ){
            $messageData['is_mention'] = true;
        }
        if($request->story_type == 'story_mentiond' ){
            $messageData['is_expired'] = true;
        }
        if($request->attachment_type && $request->attachment){
            $msgType = $request->attachment_type;
        }
        $mediaType = '';
        // Handle whatsapp media file
        if($request->media_id){
            $url = config('app.fb.api_url');
            $response = Http::get($url."/". $request->media_id."?access_token={$account->fb_token}");
            $response_body = json_decode($response->body(), true);
            
            if(isset($response_body['url'])) {
                $fileUrl = $response_body['url'];
                $isAttachment = true;
                $mediaType = $request->media_type;
                $msgType = explode('/', $mediaType)[0];
            }
        }
      
        if($isAttachment){
            $document = new Document();
            $filePath = $document->storeDocument($mediaType, $fileUrl , $messagableId , $account);

            $messageData['msg_type'] = $msgType;
            $messageData['file_path'] = $filePath;
        }
          
        $this->processMessage($messageData);

        $chatList = ChatListContact::where(['contact_id' => $messagableId , 'channel' => $request->service ])->first();
        if(! $chatList){
            $chatList = new ChatListContact();
            $chatList->contact_id = $messagableId;
            $chatList->channel = $request->service;
            $chatList->user_id = 1;
        }
        $chatList->unread = true;
        $chatList->save();
        return response()->json(['status' => true, 'message' => 'Message stored successfully.'], 200);
    }

    /**
     * Return product list
     */
    public function getProducts() {

        $query = Product::select('products.id', 'products.name', 'products.retailer_id', 'catalogs.catalog_id as catalog_id');
        $query->where('products.catalog_id', '!=', NULL);
        $query->leftjoin('catalogs', 'catalogs.id', 'products.catalog_id');

        $products = $query->limit(5)->get();

        return $products;
    }

    /**
     * Return Interactive messages list
     */
    public function getInteractiveMessages(){
        $interactiveMessages = InteractiveMessage::where('is_active', true)->get();
       
        return $interactiveMessages;
    }
}
