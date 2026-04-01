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
use Illuminate\Support\Facades\Schema;
use Brick\PhoneNumber\PhoneNumber;
use Brick\PhoneNumber\PhoneNumberParseException;
use App\Models\InteractiveMessage;
use App\Jobs\SyncInstagramMessagesJob;
use App\Services\GmailService;
use App\Services\MetaIntegrationService;
use App\Services\Templates\TemplateAdapterException;
use App\Services\Templates\TemplateRenderService;

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
            'msg_mode' => ['label' => __('Mode'), 'type' => 'text'],
            'sender' => ['label' => __('Sender'), 'type' => 'text'],
            'destination' => ['label' => __('Destination'), 'type' => 'text'],
            'status' => ['label' => __('Status'), 'type' => 'text'],
            'error_response' => ['label' => 'Error', 'type' => 'textarea'],
            'created_at' => ['label' => __('Date'), 'type' => 'text'],
        ];

        $searchData = '';
        if ($filter) {
            $searchData = json_decode($filter);
        }

        // If filter is selected, we should use the filter conditions
        if ($filterId && $filterId != 'All') {
            $filter = Filter::where('id', $filterId)->first();
            if ($filter) {
                $searchData = unserialize(base64_decode($filter->condition));
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

            if ($search) {
                $query->where(function ($query) use ($search, $list_view_columns) {
                    foreach ($list_view_columns as $field_name => $field_info) {

                        if ($field_name == 'company_name') {
                            $query->orWhere('accounts.company_name', 'like', '%' . $search . '%');
                        } elseif ($field_name  == 'sender') {
                            $query->orWhere('contacts.phone_number', 'like', '%' . $search . '%');
                            $query->orWhere('accounts.phone_number', 'like', '%' . $search . '%');
                        } elseif ($field_name  == 'destination') {
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

        if ($search || $filterId) {
            if ($search) {
                $url = route(('listMessage'), ['search' => $search]);
            } else {
                $url = route(('listMessage'), ['filter_id' => $filterId]);
            }
            $messages->withPath($url);
        }

        foreach ($messages as $message) {
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
        $translator = array_merge($translator, $messageTranslate);

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
            'filter_condition' => $filter,
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

        if ($service == 'whatsapp') {
            if ($msgMode == 'incoming') {
                $sender = $phoneNumber;
                $destination = $accountPhoneNumber;
            } else {
                $sender = $accountPhoneNumber;
                $destination = $phoneNumber;
            }
        } else if ($service == 'instagram') {
            if ($msgMode == 'incoming') {
                $sender = $instagramUsername;
                $destination = $companyName;
            } else {
                $sender = $companyName;
                $destination = $instagramUsername;
            }
        } else if ($service == 'facebook') {
            if ($msgMode == 'incoming') {
                $sender = $facebookUsername;
                $destination = $companyName;
            } else {
                $sender = $companyName;
                $destination = $facebookUsername;
            }
        } else if ($service == 'email') {
            if ($msgMode == 'incoming') {
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
        $contactFields = ['contacts.id', 'contacts.first_name', 'contacts.last_name', 'contacts.phone_number', 'contacts.instagram_username'];
        $condition = $selectedContact = '';
        $category = ($request->category) ? $request->category : '';
        $contactList = $messages = $accoutList = [];
        $user = $request->user();
        $shouldHydrateInitialContactList = $request->boolean('fetchContact') || $request->filled('contact_id');
        $recordData = $shouldHydrateInitialContactList
            ? $this->getChatContactList($request)
            : [
                'contact_list' => [],
                'filter_id' => $request->get('filter_id', ''),
                'search' => $request->get('search', ''),
                'mode' => (string) $request->get('mode', 'all'),
                'has_more' => true,
                'page' => 1,
                'counts' => ['all' => 0, 'unread' => 0, 'archived' => 0],
            ];
        [$accoutList, $accountMeta] = $this->buildChatAccountCollections($user->id, $category);

        if ($request->boolean('fetchContact')) {
            return response()->json([
                'status' => true,
                'contact_list' => $recordData['contact_list'] ?? [],
                'account_meta' => $accountMeta,
                'counts' => $recordData['counts'] ?? ['all' => 0, 'unread' => 0, 'archived' => 0],
                'has_more' => $recordData['has_more'] ?? false,
                'page' => $recordData['page'] ?? (int) $request->get('page', 1),
            ]);
        }

        $menuBar = $this->fetchMenuBar();
        $sessions = [];
        if ($request->contact_id) {
            $isRecordContainCategory = array_key_exists("contact_id_{$request->contact_id}", $recordData['contact_list']);
            if ($isRecordContainCategory) {
                $selectedContact = $request->contact_id;
                $contactChaneel = ChatListContact::where('user_id', $user->id)
                    ->where('id', $selectedContact)
                    ->first();
                $category = ($request->category) ? $request->category : ($contactChaneel ? $contactChaneel->channel : 'whatsapp');
                $messages = $this->getMessageList($request);
                if ($contactChaneel && $contactChaneel->channel !== 'email') {
                    $condition = ['contact_id' => $contactChaneel->contact_id];
                    $getSessions = Session::where($condition)->where('created_at', '>=', Carbon::now()->subDay())->get();
                    foreach ($getSessions as $session) {
                        $sessions[$contactChaneel->id][$session->account_id] = true;
                    }
                }
            }
        }
        $filterData = $this->getFiltersInfo($user->id, 'Contact', true);
        $translator = ['Your Profile' => __('Your Profile'), 'Settings' => __('Settings'), 'Sign out' => __('Sign out'), 'All Chats' => __('All Chats'), 'Unread' => __('Unread'), 'Archive' => __('Archived'), 'Add Column' => __('Add Column'), 'New Message' => __('New Message'), 'Conversation not start yet.' => __('Conversation not start yet.'), 'View notifications' => __('View notifications'), 'Junior Developer' => __('Junior Developer'), 'All Channel' => __('All Channel'), 'Account list' => __('Account list'), 'Write your message!' => __('Write your message!'), 'Select Contact' => __('Select Contact'), 'Add a contact' => __('Add a contact'), 'Add' => __('Add'), 'Cancel' => __('Cancel'), 'No conversations found for this channel.' => __('No conversations found for this channel.'), 'No account connected for this channel.' => __('No account connected for this channel.'), 'No WhatsApp account connected. Connect one WhatsApp account to use this channel.' => __('No WhatsApp account connected. Connect one WhatsApp account to use this channel.'), 'No Instagram account connected. This workspace supports one Instagram account per social profile.' => __('No Instagram account connected. This workspace supports one Instagram account per social profile.'), 'No Facebook account connected. This workspace supports one Facebook account per social profile.' => __('No Facebook account connected. This workspace supports one Facebook account per social profile.'), 'No Email account connected. Connect one Email account to use this channel.' => __('No Email account connected. Connect one Email account to use this channel.'),];
        $translator = array_merge($translator, $this->getTranslations());
        $templates = $this->getTemplates();
        $products = $this->getProducts();
        $interactiveMessages = $this->getInteractiveMessages();
        $data = ['contact_list' => $contactList, 'account_list' => $accoutList, 'account_meta' => $accountMeta, 'messages' => $messages, 'selected_contact' => $selectedContact, 'templates' => $templates, 'current_page' => 'Chat', 'category' => ($category) ? $category : 'whatsapp', 'translator' => $translator, 'filter' => $filterData, 'menuBar' => $menuBar, 'sessions' => $sessions, 'products' => $products, 'interactiveMessages' => $interactiveMessages, 'has_channel_account' => count($accoutList) > 0,];
        $data = array_merge($data, $recordData);
        return Inertia::render('Messages/ChatList', $data);
    }

    protected function buildChatAccountCollections(int $userId, string $category = ''): array
    {
        $accountList = [];
        $accountMeta = [];

        $accounts = Account::where('user_id', $userId)->where(function ($query) use ($category) {
            if ($category != 'all' && $category != '') {
                $query->where('service', $category);
            }
        })->where('status', 'Active')->get();

        foreach ($accounts as $account) {
            $meta = $this->buildChatAccountMeta($account);
            $accountList[$account->id] = $meta['label'];
            $accountMeta[$account->id] = $meta;
        }

        return [$accountList, $accountMeta];
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
        $selectedCategory = $request->has('category') && $request->get('category') ? $request->get('category') : 'whatsapp';
        $page = max((int) $request->get('page', 1), 1);
        $mode = (string) $request->get('mode', 'all');

        if (in_array($selectedCategory, ['whatsapp', 'facebook', 'instagram'], true)) {
            $this->backfillConversationMetadataForService($user->id, $selectedCategory);
        }

        if (in_array($selectedCategory, ['all', 'whatsapp', 'facebook', 'instagram'], true)) {
            $this->collapseDuplicateChatListContacts($user->id, $selectedCategory);
        }

        if (
            $selectedCategory !== 'all'
            && !Account::where('user_id', $user->id)
                ->where('service', $selectedCategory)
                ->where('status', 'Active')
                ->exists()
        ) {
            $emptyData = [
                'contact_list' => [],
                'filter_id' => $filterId,
                'search' => $search,
                'mode' => $mode,
                'has_more' => false,
                'page' => $page,
                'counts' => ['all' => 0, 'unread' => 0, 'archived' => 0],
            ];

            if ($request->ajax() && $request->fetchContact) {
                $emptyData['status'] = true;
                echo json_encode($emptyData);
                die;
            }

            return $emptyData;
        }

        $searchData = ($filter) ? json_decode($filter) : '';
        $query = ChatListContact::query()
            ->where('chat_list_contacts.user_id', $user->id)
            ->join('contacts', 'contact_id', 'contacts.id')
            ->select('chat_list_contacts.*', 'contacts.first_name', 'contacts.last_name', 'contacts.phone_number', 'contacts.instagram_username', 'contacts.facebook_username', 'contacts.email as contact_email')
            ->addSelect([
                'last_message_preview' => Msg::query()
                    ->selectRaw("COALESCE(NULLIF(body_text, ''), NULLIF(message, ''))")
                    ->whereColumn('msgs.id', 'chat_list_contacts.last_msg_id')
                    ->limit(1),
            ]);

        if ($selectedCategory !== 'all') {
            $query->where('chat_list_contacts.channel', $selectedCategory);
        }

        if ($selectedCategory === 'whatsapp') {
            $this->applyWhatsAppContactNumberFilter($query);
        }

        if ($selectedCategory === 'email') {
            $query->where(function ($conversationQuery) {
                $conversationQuery->whereNotNull('chat_list_contacts.gmail_thread_id')
                    ->orWhereNotNull('chat_list_contacts.last_msg_id')
                    ->orWhereNotNull('chat_list_contacts.last_message_at');
            });
        } elseif ($selectedCategory === 'all') {
            $query->where(function ($conversationQuery) {
                $conversationQuery->whereNotNull('chat_list_contacts.gmail_thread_id')
                    ->orWhereNotNull('chat_list_contacts.last_msg_id')
                    ->orWhereNotNull('chat_list_contacts.last_message_at');
            });
        } else {
            $query->where(function ($conversationQuery) {
                $conversationQuery->whereNotNull('chat_list_contacts.last_msg_id')
                    ->orWhereNotNull('chat_list_contacts.last_message_at')
                    ->orWhere('chat_list_contacts.unread', true)
                    ->orWhere('chat_list_contacts.unread_count', '>', 0);
            });
        }

        if ($filterId && $filterId != 'All') {
            $filter = Filter::find($filterId);
            if ($filter) {
                $searchData = unserialize(base64_decode($filter->condition));
            }
        }

        if ($searchData) {
            if ($this->chatFilterUsesOnlyRelationFields($searchData)) {
                $query = $this->applyChatRelationFilters($query, $searchData);
            } else {
                $query = $this->prepareQuery($searchData, $query, 'contacts');
            }
        }

        if ($search) {
            $list_view_columns = ['first_name', 'last_name', 'phone_number', 'instagram_username', 'email'];

            $query->where(function ($query) use ($search, $list_view_columns) {
                foreach ($list_view_columns as $field_name) {
                    if ($field_name != 'tag' && $field_name != 'list')
                        $query->orWhere($field_name, 'like', '%' . $search . '%');
                }
            });
        }

        // get count of categories
        $hasUnreadScope = function ($q) {
            $q->where('chat_list_contacts.unread', true)
                ->orWhere('chat_list_contacts.unread_count', '>', 0);
        };

        $countQuery = ChatListContact::query()
            ->where('chat_list_contacts.user_id', $user->id);

        if ($selectedCategory !== 'all') {
            $countQuery->where('chat_list_contacts.channel', $selectedCategory);
        }

        if ($selectedCategory === 'whatsapp') {
            $countQuery->join('contacts', 'contact_id', 'contacts.id');
            $this->applyWhatsAppContactNumberFilter($countQuery);
        }

        if ($selectedCategory === 'email' || $selectedCategory === 'all') {
            $countQuery->where(function ($conversationQuery) {
                $conversationQuery->whereNotNull('chat_list_contacts.gmail_thread_id')
                    ->orWhereNotNull('chat_list_contacts.last_msg_id')
                    ->orWhereNotNull('chat_list_contacts.last_message_at');
            });
        } else {
            $countQuery->where(function ($conversationQuery) {
                $conversationQuery->whereNotNull('chat_list_contacts.last_msg_id')
                    ->orWhereNotNull('chat_list_contacts.last_message_at')
                    ->orWhere('chat_list_contacts.unread', true)
                    ->orWhere('chat_list_contacts.unread_count', '>', 0);
            });
        }

        $allCount = (clone $countQuery)->count();
        $unreadCount = (clone $countQuery)->where($hasUnreadScope)->count();

        if (
            $mode === 'unread'
            && $unreadCount === 0
            && $allCount > 0
            && in_array($selectedCategory, ['whatsapp', 'facebook', 'instagram'], true)
        ) {
            $mode = 'all';
        }

        $recordCounts = ['all' => $allCount, 'unread' => $unreadCount, 'archived' => 0];

        if ($mode == 'unread') {
            $query->where($hasUnreadScope);
        }
        $query->orderByRaw('COALESCE(chat_list_contacts.last_message_at, chat_list_contacts.updated_at) desc');

        $chatListContact = $query->simplePaginate(15, ['*'], 'page', $page);

        $contactList = [];
        foreach ($chatListContact as $conversation) {
            $name = trim(($conversation->first_name ?: '') . ' ' . ($conversation->last_name ?: ' '));
            if ($conversation->channel === 'email') {
                $name = (string) ($conversation->email_address ?: $conversation->contact_email);
            } else {
                $name = trim(($conversation->first_name ?: '') . ' ' . ($conversation->last_name ?: ' '));
            }

            if (trim($name) === '') {
                if ($conversation->phone_number) {
                    $name = $conversation->phone_number;
                } elseif ($conversation->instagram_username) {
                    $name = $conversation->instagram_username;
                } elseif ($conversation->facebook_username) {
                    $name = $conversation->facebook_username;
                } elseif ($conversation->email_address ?: $conversation->contact_email) {
                    $name = (string) ($conversation->email_address ?: $conversation->contact_email);
                }
            }

            $contactList["contact_id_{$conversation->id}"] = [
                'id' => $conversation->id,
                'contact_id' => $conversation->contact_id,
                'account_id' => $conversation->account_id,
                'name' => trim($name),
                'number' => $conversation->phone_number,
                'insta_id' => $conversation->instagram_username,
                'channel' => $conversation->channel,
                'fb_id' => $conversation->facebook_username,
                'email' => (string) ($conversation->email_address ?: $conversation->contact_email ?: ''),
                'subject' => (string) ($conversation->email_subject ?: ''),
                'preview' => Str::limit(trim((string) ($conversation->last_message_preview ?: '')), 140),
                'unread_count' => (int) ($conversation->unread_count ?? ($conversation->unread ? 1 : 0)),
                'last_message_at' => optional($conversation->last_message_at)->toIso8601String(),
            ];
        }

        $data = [
            'contact_list' => $contactList,
            'filter_id' => $filterId,
            'search' => $search,
            'mode' => $mode,
            'has_more' => $chatListContact->hasMorePages(),
            'page' => $page,
            'counts' => $recordCounts,
        ];

        if ($request->ajax() && $request->fetchContact) {
            $data['status'] = true;
            echo json_encode($data);
            die;
        }
        return $data;
    }

    protected function getWhatsAppContactNumberColumn(): string
    {
        if (Schema::hasColumn('contacts', 'whatsapp_number')) {
            return 'whatsapp_number';
        }

        return 'phone_number';
    }

    protected function applyWhatsAppContactNumberFilter($query): void
    {
        $hasWhatsappNumberColumn = Schema::hasColumn('contacts', 'whatsapp_number');
        $hasPhoneNumberColumn = Schema::hasColumn('contacts', 'phone_number');

        $query->where(function ($contactQuery) use ($hasWhatsappNumberColumn, $hasPhoneNumberColumn) {
            if ($hasWhatsappNumberColumn) {
                $contactQuery->whereNotNull('contacts.whatsapp_number')
                    ->where('contacts.whatsapp_number', '!=', '');
            }

            if ($hasPhoneNumberColumn) {
                $method = $hasWhatsappNumberColumn ? 'orWhere' : 'where';

                $contactQuery->{$method}(function ($phoneQuery) {
                    $phoneQuery->whereNotNull('contacts.phone_number')
                        ->where('contacts.phone_number', '!=', '');
                });
            }
        });
    }

    protected function collapseDuplicateChatListContacts(int $userId, string $service): void
    {
        $channels = $service === 'all'
            ? ['whatsapp', 'facebook', 'instagram']
            : [$service];

        if ($channels === ['email']) {
            return;
        }

        $duplicateGroups = ChatListContact::query()
            ->select('contact_id', 'account_id', 'channel', DB::raw('COUNT(*) as duplicate_count'))
            ->where('user_id', $userId)
            ->whereIn('channel', $channels)
            ->whereNotNull('contact_id')
            ->groupBy('contact_id', 'account_id', 'channel')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicateGroups as $group) {
            $this->mergeDuplicateConversationGroup(
                $userId,
                (string) $group->channel,
                (int) $group->contact_id,
                $group->account_id !== null ? (int) $group->account_id : null
            );
        }
    }

    protected function mergeDuplicateConversationGroup(
        int $userId,
        string $channel,
        int $contactId,
        ?int $accountId = null
    ): ?ChatListContact {
        $conversationQuery = ChatListContact::query()
            ->where('user_id', $userId)
            ->where('channel', $channel)
            ->where('contact_id', $contactId);

        if ($accountId === null) {
            $conversationQuery->whereNull('account_id');
        } else {
            $conversationQuery->where('account_id', $accountId);
        }

        $conversations = $conversationQuery
            ->orderByRaw('COALESCE(last_message_at, updated_at, created_at) desc')
            ->orderByDesc('id')
            ->get();

        if ($conversations->count() <= 1) {
            return $conversations->first();
        }

        $primaryConversation = $conversations->first();
        $duplicateConversationIds = $conversations->slice(1)->pluck('id')->values()->all();
        $latestConversationAt = $conversations->pluck('last_message_at')->filter()->sortDesc()->first();

        $primaryConversation->account_id = $primaryConversation->account_id
            ?: $conversations->pluck('account_id')->filter()->first();
        $primaryConversation->last_msg_id = $primaryConversation->last_msg_id
            ?: $conversations->pluck('last_msg_id')->filter()->first();
        $primaryConversation->unread_count = (int) $conversations->max(function ($conversation) {
            return (int) ($conversation->unread_count ?? 0);
        });
        $primaryConversation->unread = $conversations->contains(function ($conversation) {
            return (bool) $conversation->unread || (int) ($conversation->unread_count ?? 0) > 0;
        });

        if ($latestConversationAt) {
            $primaryConversation->last_message_at = $latestConversationAt;
        }

        $primaryConversation->save();

        if ($duplicateConversationIds !== []) {
            Msg::whereIn('chat_list_contact_id', $duplicateConversationIds)
                ->update(['chat_list_contact_id' => $primaryConversation->id]);

            ChatListContact::whereIn('id', $duplicateConversationIds)->delete();
        }

        return $primaryConversation;
    }

    protected function backfillConversationMetadataForService(int $userId, string $service): void
    {
        $cacheKey = sprintf('chat-conversation-backfill:%s:%d', $service, $userId);

        if (Cache::has($cacheKey)) {
            return;
        }

        $accountIds = Account::query()
            ->where('user_id', $userId)
            ->where('service', $service)
            ->where('status', 'Active')
            ->pluck('id');

        if ($accountIds->isEmpty()) {
            return;
        }

        $hasStaleRows = ChatListContact::query()
            ->where('user_id', $userId)
            ->where('channel', $service)
            ->where(function ($query) {
                $query->whereNull('account_id')
                    ->orWhereNull('last_msg_id')
                    ->orWhereNull('last_message_at');
            })
            ->exists();

        if (! $hasStaleRows) {
            Cache::put($cacheKey, true, now()->addMinutes(10));
            return;
        }

        $latestMessages = Msg::query()
            ->selectRaw('account_id, msgable_id, MAX(id) as last_msg_id')
            ->where('service', $service)
            ->whereIn('account_id', $accountIds)
            ->where('msgable_type', Contact::class)
            ->whereNotNull('msgable_id')
            ->groupBy('account_id', 'msgable_id');

        $unreadMessages = Msg::query()
            ->selectRaw('account_id, msgable_id, COUNT(*) as unread_count')
            ->where('service', $service)
            ->whereIn('account_id', $accountIds)
            ->where('msgable_type', Contact::class)
            ->whereNotNull('msgable_id')
            ->where('msg_mode', 'incoming')
            ->where(function ($query) {
                $query->where('is_read', false)->orWhereNull('is_read');
            })
            ->groupBy('account_id', 'msgable_id');

        DB::query()
            ->fromSub($latestMessages, 'latest_messages')
            ->join('msgs as last_msg', 'last_msg.id', '=', 'latest_messages.last_msg_id')
            ->leftJoinSub($unreadMessages, 'unread_messages', function ($join) {
                $join->on('unread_messages.account_id', '=', 'latest_messages.account_id')
                    ->on('unread_messages.msgable_id', '=', 'latest_messages.msgable_id');
            })
            ->join('chat_list_contacts as existing_contacts', function ($join) use ($service, $userId) {
                $join->on('existing_contacts.contact_id', '=', 'latest_messages.msgable_id')
                    ->where('existing_contacts.channel', '=', $service)
                    ->where('existing_contacts.user_id', '=', $userId);
            })
            ->where(function ($query) {
                $query->whereNull('existing_contacts.account_id')
                    ->orWhere('existing_contacts.account_id', '=', DB::raw('latest_messages.account_id'));
            })
            ->where(function ($query) {
                $query->whereNull('existing_contacts.last_msg_id')
                    ->orWhereNull('existing_contacts.last_message_at')
                    ->orWhereNull('existing_contacts.account_id');
            })
            ->selectRaw('existing_contacts.id as conversation_id, latest_messages.account_id, latest_messages.last_msg_id, COALESCE(last_msg.received_at, last_msg.sent_at, last_msg.created_at) as last_message_at, COALESCE(unread_messages.unread_count, 0) as unread_count')
            ->orderBy('existing_contacts.id')
            ->chunk(1000, function ($rows) {
                $payload = [];

                foreach ($rows as $row) {
                    $payload[] = [
                        'id' => $row->conversation_id,
                        'account_id' => $row->account_id,
                        'last_msg_id' => $row->last_msg_id,
                        'last_message_at' => $row->last_message_at,
                        'unread' => (int) $row->unread_count > 0,
                        'unread_count' => (int) $row->unread_count,
                    ];
                }

                if ($payload !== []) {
                    ChatListContact::upsert(
                        $payload,
                        ['id'],
                        ['account_id', 'last_msg_id', 'last_message_at', 'unread', 'unread_count']
                    );
                }
            }, 'existing_contacts.id');

        Cache::put($cacheKey, true, now()->addMinutes(10));
    }

    protected function ensureConversationIndexForService(int $userId, string $service): void
    {
        if ($service !== 'whatsapp') {
            return;
        }

        $cacheKey = sprintf('chat-conversation-index:%s:%d', $service, $userId);

        if (Cache::has($cacheKey)) {
            return;
        }

        $accountIds = Account::query()
            ->where('user_id', $userId)
            ->where('service', $service)
            ->pluck('id');

        if ($accountIds->isEmpty()) {
            return;
        }

        $hasConversationRows = ChatListContact::query()
            ->where('user_id', $userId)
            ->where('channel', $service)
            ->whereIn('account_id', $accountIds)
            ->exists();

        if ($hasConversationRows) {
            Cache::put($cacheKey, true, now()->addMinutes(5));
            return;
        }

        $latestMessages = Msg::query()
            ->selectRaw('account_id, msgable_id, MAX(id) as last_msg_id')
            ->where('service', $service)
            ->whereIn('account_id', $accountIds)
            ->where('msgable_type', Contact::class)
            ->whereNotNull('msgable_id')
            ->groupBy('account_id', 'msgable_id');

        $unreadMessages = Msg::query()
            ->selectRaw('account_id, msgable_id, COUNT(*) as unread_count')
            ->where('service', $service)
            ->whereIn('account_id', $accountIds)
            ->where('msgable_type', Contact::class)
            ->whereNotNull('msgable_id')
            ->where('msg_mode', 'incoming')
            ->where(function ($query) {
                $query->where('is_read', false)->orWhereNull('is_read');
            })
            ->groupBy('account_id', 'msgable_id');

        DB::query()
            ->fromSub($latestMessages, 'latest_messages')
            ->join('accounts', 'accounts.id', '=', 'latest_messages.account_id')
            ->join('msgs as last_msg', 'last_msg.id', '=', 'latest_messages.last_msg_id')
            ->leftJoinSub($unreadMessages, 'unread_messages', function ($join) {
                $join->on('unread_messages.account_id', '=', 'latest_messages.account_id')
                    ->on('unread_messages.msgable_id', '=', 'latest_messages.msgable_id');
            })
            ->leftJoin('chat_list_contacts as existing_contacts', function ($join) use ($service, $userId) {
                $join->on('existing_contacts.account_id', '=', 'latest_messages.account_id')
                    ->on('existing_contacts.contact_id', '=', 'latest_messages.msgable_id')
                    ->where('existing_contacts.channel', '=', $service)
                    ->where('existing_contacts.user_id', '=', $userId);
            })
            ->whereNull('existing_contacts.id')
            ->where('accounts.user_id', $userId)
            ->where('accounts.service', $service)
            ->orderBy('latest_messages.account_id')
            ->orderBy('latest_messages.msgable_id')
            ->chunk(1000, function ($rows) use ($service) {
                $payload = [];

                foreach ($rows as $row) {
                    $payload[] = [
                        'contact_id' => $row->msgable_id,
                        'account_id' => $row->account_id,
                        'channel' => $service,
                        'last_msg_id' => $row->last_msg_id,
                        'user_id' => $row->user_id,
                        'unread' => (int) ($row->unread_count ?? 0) > 0,
                        'unread_count' => (int) ($row->unread_count ?? 0),
                        'last_message_at' => $row->last_message_at,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                if ($payload !== []) {
                    ChatListContact::insert($payload);
                }
            }, 'latest_messages.last_msg_id');

        Cache::put($cacheKey, true, now()->addMinutes(5));
    }

    protected function chatFilterUsesOnlyRelationFields($searchData): bool
    {
        if (!is_iterable($searchData)) {
            return false;
        }

        $hasRelationCondition = false;

        foreach ($searchData as $groupConditions) {
            foreach ((array) $groupConditions as $conditions) {
                foreach ((array) $conditions as $condition) {
                    $fieldName = data_get($condition, 'field_name');
                    $fieldType = data_get($condition, 'field_type');

                    if (!$fieldName) {
                        continue;
                    }

                    if (
                        !in_array($fieldName, ['tag_relation', 'list_relation', 'tag', 'list'], true)
                        && $fieldType !== 'tag'
                    ) {
                        return false;
                    }

                    $hasRelationCondition = true;
                }
            }
        }

        return $hasRelationCondition;
    }

    protected function applyChatRelationFilters($query, $searchData)
    {
        $groupCount = 0;

        foreach ($searchData as $groupConditions) {
            foreach ((array) $groupConditions as $groupOperator => $conditions) {
                $groupOperator = ($groupCount === 0) ? '' : $groupOperator;
                $groupCount++;

                if ($groupOperator === 'OR') {
                    $query->orWhere(function ($groupQuery) use ($conditions) {
                        $this->applyChatRelationConditionGroup($groupQuery, (array) $conditions);
                    });
                } else {
                    $query->where(function ($groupQuery) use ($conditions) {
                        $this->applyChatRelationConditionGroup($groupQuery, (array) $conditions);
                    });
                }
            }
        }

        return $query;
    }

    protected function applyChatRelationConditionGroup($query, array $conditions): void
    {
        foreach ($conditions as $index => $condition) {
            $fieldName = data_get($condition, 'field_name');
            $fieldType = data_get($condition, 'field_type');

            if (
                !in_array($fieldName, ['tag_relation', 'list_relation', 'tag', 'list'], true)
                && $fieldType !== 'tag'
            ) {
                continue;
            }

            $operator = $index > 0
                ? data_get($conditions[$index - 1] ?? null, 'condition_operator', 'AND')
                : 'AND';

            $values = collect(data_get($condition, 'condition_value', []))
                ->filter(fn ($value) => filled($value))
                ->map(fn ($value) => (int) $value)
                ->filter(fn ($value) => $value > 0)
                ->values()
                ->all();

            $isTagField = in_array($fieldName, ['tag_relation', 'tag'], true);
            $relationTable = $isTagField ? 'taggables' : 'categorables';
            $relationIdColumn = $isTagField ? 'tag_id' : 'category_id';
            $relationTypeColumn = $isTagField ? 'taggable_type' : 'categorable_type';
            $relationContactColumn = $isTagField ? 'taggable_id' : 'categorable_id';

            $callback = function ($relationQuery) use (
                $relationTable,
                $relationIdColumn,
                $relationTypeColumn,
                $relationContactColumn,
                $values
            ) {
                $relationQuery->select(DB::raw(1))
                    ->from($relationTable)
                    ->whereColumn("{$relationTable}.{$relationContactColumn}", 'contacts.id')
                    ->where("{$relationTable}.{$relationTypeColumn}", Contact::class);

                if (!empty($values)) {
                    $relationQuery->whereIn("{$relationTable}.{$relationIdColumn}", $values);
                }
            };

            if ($operator === 'OR') {
                if (!empty($values)) {
                    $query->orWhereExists($callback);
                } else {
                    $query->orWhereNotExists($callback);
                }
            } else {
                if (!empty($values)) {
                    $query->whereExists($callback);
                } else {
                    $query->whereNotExists($callback);
                }
            }
        }
    }

    protected function syncGmailChatAccounts(int $userId, string $category): void
    {
        if (! in_array($category, ['email', 'all'], true)) {
            return;
        }

        $accounts = Account::query()
            ->where('user_id', $userId)
            ->where('service', 'email')
            ->where('service_engine', 'gmail_oauth')
            ->where('status', 'Active')
            ->get();

        if ($accounts->isEmpty()) {
            return;
        }

        $gmailService = app(GmailService::class);

        foreach ($accounts as $account) {
            try {
                $gmailService->deduplicateAccountConversations($account);
            } catch (\Throwable $e) {
                Log::warning('Unable to deduplicate Gmail conversations for chat list.', [
                    'account_id' => $account->id,
                    'message' => $e->getMessage(),
                ]);
            }

            if ($account->sync_last_at && $account->sync_last_at->gt(now()->subMinute())) {
                continue;
            }

            try {
                $gmailService->syncAccountSafely($account, 25);
            } catch (\Throwable $e) {
                Log::warning('Unable to refresh Gmail conversations for chat list.', [
                    'account_id' => $account->id,
                    'message' => $e->getMessage(),
                ]);
            }
        }
    }

    protected function syncFacebookChatAccounts(int $userId, string $category): void
    {
        if (! in_array($category, ['facebook', 'all'], true)) {
            return;
        }

        $accounts = Account::query()
            ->where('user_id', $userId)
            ->where('service', 'facebook')
            ->where('status', 'Active')
            ->whereNotNull('fb_phone_number_id')
            ->get();

        if ($accounts->isEmpty()) {
            return;
        }

        foreach ($accounts as $account) {
            if ($account->sync_last_at && $account->sync_last_at->gt(now()->subSeconds(30))) {
                continue;
            }

            try {
                $this->ensureFacebookWebhookSubscription($account);
                $this->syncFacebookAccountConversations($account, 15, 50);
                $account->sync_last_at = now();
                $account->save();
            } catch (\Throwable $e) {
                Log::warning('Unable to refresh Facebook conversations for chat list.', [
                    'account_id' => $account->id,
                    'message' => $e->getMessage(),
                ]);
            }
        }
    }

    protected function syncSocialChatAccounts(int $userId, string $category): void
    {
        if (! in_array($category, ['facebook', 'all'], true)) {
            return;
        }

        $services = $category === 'all' ? ['facebook'] : [$category];

        $accounts = Account::query()
            ->where('user_id', $userId)
            ->where('status', 'Active')
            ->whereIn('service', $services)
            ->get();

        if ($accounts->isEmpty()) {
            return;
        }

        $metaIntegrationService = app(MetaIntegrationService::class);
        $staleCutoff = now()->subMinutes(2);

        foreach ($accounts as $account) {
            if ($account->sync_last_at && $account->sync_last_at->gt($staleCutoff)) {
                continue;
            }

            try {
                $metaIntegrationService->syncHistoricalChatsIfNeeded($account, true);
            } catch (\Throwable $e) {
                Log::warning('Unable to refresh social conversations for chat list.', [
                    'account_id' => $account->id,
                    'service' => $account->service,
                    'message' => $e->getMessage(),
                ]);
            }
        }
    }

    protected function ensureFacebookWebhookSubscription(Account $account): void
    {
        if ($account->service !== 'facebook' || empty($account->fb_phone_number_id)) {
            return;
        }

        try {
            (new WhatsAppUsers())->subscripe($account);
        } catch (\Throwable $e) {
            Log::warning('Unable to subscribe Facebook page for webhooks.', [
                'account_id' => $account->id,
                'message' => $e->getMessage(),
            ]);
        }
    }

    protected function syncFacebookAccountConversations(Account $account, int $conversationLimit = 15, int $messageLimit = 50): void
    {
        $pageId = (string) ($account->fb_phone_number_id ?? '');
        $pageToken = (string) ($account->page_token ?: '');

        if ($pageId === '') {
            return;
        }

        if ($pageToken === '') {
            $pageToken = (string) ((new WhatsAppUsers())->getFbPageAccessToken($account) ?: '');
        }

        if ($pageToken === '') {
            throw new \RuntimeException('Missing Facebook page token.');
        }

        $conversationPayload = $this->facebookGraphGet("/{$pageId}/conversations", [
            'platform' => 'messenger',
            'fields' => 'id,updated_time,message_count,unread_count,participants{id,name}',
            'limit' => $conversationLimit,
        ], $pageToken);

        foreach ((array) ($conversationPayload['data'] ?? []) as $conversation) {
            $conversationId = (string) ($conversation['id'] ?? '');
            if ($conversationId === '') {
                continue;
            }

            $participants = [];
            foreach ((array) data_get($conversation, 'participants.data', []) as $participant) {
                $participantId = (string) ($participant['id'] ?? '');
                if ($participantId === '') {
                    continue;
                }

                $participants[$participantId] = (string) ($participant['name'] ?? '');
            }

            $messagesPayload = $this->facebookGraphGet("/{$conversationId}/messages", [
                'fields' => 'id,message,created_time,from,to,attachments',
                'limit' => $messageLimit,
            ], $pageToken);

            $messages = collect((array) ($messagesPayload['data'] ?? []))
                ->sortBy(function (array $message) {
                    return (string) ($message['created_time'] ?? '');
                })
                ->values();

            foreach ($messages as $message) {
                $this->ingestFacebookConversationMessage($account, $participants, (array) $message);
            }
        }
    }

    protected function facebookGraphGet(string $path, array $query, string $token): array
    {
        $response = Http::timeout(20)
            ->retry(2, 250)
            ->get(sprintf(
                'https://graph.facebook.com/%s%s',
                config('app.meta.graph_version'),
                $path
            ), array_merge($query, [
                'access_token' => $token,
            ]))
            ->throw()
            ->json();

        return is_array($response) ? $response : [];
    }

    protected function ingestFacebookConversationMessage(Account $account, array $participants, array $message): void
    {
        $pageId = (string) ($account->fb_phone_number_id ?? '');
        $messageId = (string) ($message['id'] ?? '');
        $fromId = (string) data_get($message, 'from.id', '');
        $fromName = (string) data_get($message, 'from.name', '');

        if ($pageId === '' || $messageId === '' || $fromId === '') {
            return;
        }

        $isOutgoing = $fromId === $pageId;
        $counterpartyId = $isOutgoing
            ? $this->extractFacebookCounterpartyId($message, $pageId, $participants)
            : $fromId;

        if ($counterpartyId === '') {
            return;
        }

        $counterpartyName = $participants[$counterpartyId]
            ?? ($isOutgoing ? '' : $fromName);

        $payload = [
            'account' => $account->id,
            'service' => 'facebook',
            'type' => $isOutgoing ? 'outgoing' : 'incoming',
            'status' => $isOutgoing ? 'Sent' : 'Received',
            'messageId' => $messageId,
            'sender' => $isOutgoing ? $pageId : $counterpartyId,
            'recipient' => $isOutgoing ? $counterpartyId : $pageId,
            'message' => (string) ($message['message'] ?? ''),
            'occurred_at' => (string) ($message['created_time'] ?? ''),
            // Historical imports should not mark outgoing Facebook messages as
            // read. Read receipts must come from real Messenger webhook events.
            'is_read' => $isOutgoing ? false : true,
        ];

        $attachment = collect((array) data_get($message, 'attachments.data', []))->first();
        if (is_array($attachment)) {
            $payload['attachment_type'] = (string) ($attachment['type'] ?? '');
            $payload['attachment'] = (string) data_get(
                $attachment,
                'image_data.url',
                data_get($attachment, 'video_data.url', data_get($attachment, 'file_url', data_get($attachment, 'payload.url', '')))
            );
        }

        $previousIsSent = $_REQUEST['is_sent'] ?? null;
        $previousFirstName = $_POST['first_name'] ?? null;
        $previousLastName = $_POST['last_name'] ?? null;

        $_REQUEST['is_sent'] = $isOutgoing ? 'sent' : 'received';
        $_POST['first_name'] = $counterpartyName;
        $_POST['last_name'] = '';

        try {
            $this->fbInstaMsgHandler(new Request($payload));
        } finally {
            if ($previousIsSent === null) {
                unset($_REQUEST['is_sent']);
            } else {
                $_REQUEST['is_sent'] = $previousIsSent;
            }

            if ($previousFirstName === null) {
                unset($_POST['first_name']);
            } else {
                $_POST['first_name'] = $previousFirstName;
            }

            if ($previousLastName === null) {
                unset($_POST['last_name']);
            } else {
                $_POST['last_name'] = $previousLastName;
            }
        }
    }

    protected function extractFacebookCounterpartyId(array $message, string $pageId, array $participants): string
    {
        foreach ((array) data_get($message, 'to.data', []) as $recipient) {
            $recipientId = (string) ($recipient['id'] ?? '');
            if ($recipientId !== '' && $recipientId !== $pageId) {
                return $recipientId;
            }
        }

        foreach (array_keys($participants) as $participantId) {
            if ((string) $participantId !== $pageId) {
                return (string) $participantId;
            }
        }

        return '';
    }

    public function syncEmailAccount(Request $request, GmailService $gmailService)
    {
        $user = $request->user();
        $accountId = (int) $request->input('account_id');

        $account = Account::query()
            ->where('id', $accountId)
            ->where('user_id', $user->id)
            ->where('service', 'email')
            ->where('service_engine', 'gmail_oauth')
            ->where('status', 'Active')
            ->first();

        if (! $account) {
            return response()->json([
                'status' => false,
                'message' => 'Email account not found.',
            ], 404);
        }

        try {
            $result = $gmailService->syncAccountSafely($account, 25);
            $account->refresh();
        } catch (\Throwable $e) {
            Log::warning('Manual Gmail sync failed.', [
                'account_id' => $accountId,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Unable to sync Gmail right now.',
            ], 422);
        }

        return response()->json([
            'status' => true,
            'processed' => (int) ($result['processed'] ?? 0),
            'locked' => (bool) ($result['locked'] ?? false),
            'account' => $this->buildChatAccountMeta($account),
        ]);
    }

    public function syncFacebookAccount(Request $request)
    {
        $user = $request->user();
        $accountId = (int) $request->input('account_id');

        $account = Account::query()
            ->where('id', $accountId)
            ->where('user_id', $user->id)
            ->where('service', 'facebook')
            ->where('status', 'Active')
            ->first();

        if (! $account) {
            return response()->json([
                'status' => false,
                'message' => 'Facebook account not found.',
            ], 404);
        }

        if ($account->sync_last_at && $account->sync_last_at->gt(now()->subSeconds(30))) {
            return response()->json([
                'status' => true,
                'processed' => 0,
                'locked' => true,
                'account' => $this->buildChatAccountMeta($account),
            ]);
        }

        try {
            $this->ensureFacebookWebhookSubscription($account);
            $this->syncFacebookAccountConversations($account, 25, 75);
            $account->sync_last_at = now();
            $account->save();
            $account->refresh();
        } catch (\Throwable $e) {
            Log::warning('Manual Facebook sync failed.', [
                'account_id' => $accountId,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Unable to sync Facebook right now.',
            ], 422);
        }

        return response()->json([
            'status' => true,
            'processed' => 1,
            'locked' => false,
            'account' => $this->buildChatAccountMeta($account),
        ]);
    }

    protected function buildChatAccountMeta(Account $account): array
    {
        if ($account->service === 'email') {
            $label = $account->company_name . ' (' . $account->email . ')';
        } elseif ($account->service !== 'whatsapp') {
            $label = $account->company_name . "- {$account->fb_page_name}";
        } else {
            $label = $account->company_name;
        }

        return [
            'id' => $account->id,
            'label' => $label,
            'service' => $account->service,
            'service_engine' => $account->service_engine,
            'last_sync_at' => optional($account->sync_last_at)->toIso8601String(),
        ];
    }

    protected function getPrimaryContactEmail(Contact $contact): string
    {
        if (!empty($contact->email)) {
            return (string) $contact->email;
        }

        return (string) collect($contact->emails ?? [])
            ->pluck('emails')
            ->filter()
            ->first();
    }

    /**
     * Return template list
     */
    public function getTemplates()
    {
        $templateRenderService = app(TemplateRenderService::class);
        $messageTemplates = Template::join('messages', 'templates.id', '=', 'messages.template_id')
            ->where('messages.status', 'APPROVED')
            ->get([
                'templates.id',
                'messages.template_uid',
                'templates.account_id',
                'messages.body',
                'templates.name',
                'templates.service',
                'templates.category',
                'templates.email_subject',
                'templates.type',
            ]);

        $emailTemplates = Template::query()
            ->where(function ($query) {
                $query->where('templates.service', 'email')
                    ->orWhere('templates.category', 'EMAIL');
            })
            ->where('templates.status', 'APPROVED')
            ->get([
                'templates.id as template_uid',
                'templates.id',
                'templates.account_id',
                DB::raw("COALESCE(NULLIF(templates.text_body, ''), NULLIF(templates.html_body, ''), '') as body"),
                'templates.name',
                'templates.service',
                'templates.category',
                'templates.email_subject',
                'templates.type',
            ]);

        $socialTemplates = Template::query()
            ->whereIn('templates.service', ['facebook', 'instagram'])
            ->whereNotNull('templates.payload_json')
            ->where('templates.status', 'active')
            ->where('templates.is_active', true)
            ->get([
                'templates.id',
                'templates.account_id',
                'templates.name',
                'templates.service',
                'templates.category',
                'templates.email_subject',
                'templates.type',
                'templates.payload_json',
                'templates.variables_json',
            ])
            ->map(function (Template $template) use ($templateRenderService) {
                return (object) [
                    'id' => $template->id,
                    'template_uid' => $template->id,
                    'account_id' => $template->account_id,
                    'body' => $templateRenderService->resolvePreviewText($template),
                    'name' => $template->name,
                    'service' => $template->service,
                    'category' => $template->category,
                    'email_subject' => $template->email_subject,
                    'type' => $template->type,
                    'is_internal_template' => true,
                    'variables_json' => $template->variables_json,
                ];
            });

        return $messageTemplates->concat($emailTemplates)->concat($socialTemplates)->values();
    }

    protected function resolveInternalSocialTemplate(Account $account, $templateReference, string $channel): ?Template
    {
        if (! $templateReference || $templateReference === 'undefined') {
            return null;
        }

        return Template::where('account_id', $account->id)
            ->where('service', $channel)
            ->where('id', $templateReference)
            ->whereNotNull('payload_json')
            ->first();
    }

    /**
     * Return contact conversation history
     */
    public function getMessageList(Request $request)
    {
        $user = $request->user();
        $conversationId = (int) $request->contact_id;
        $conversation = $this->findConversationForUser($user->id, $conversationId);

        if (! $conversation) {
            return [];
        }

        // Update Channel
        $this->updateChatChannel($user->id, $conversationId, $request->category);
        $category = ($request->category == 'all') ? ['instagram', 'whatsapp', 'facebook', 'email'] : [$request->category];
        $messages = $this->buildConversationMessages($conversation, $category);

        if ($conversation->channel === 'email') {
            $conversation->unread = false;
            $conversation->unread_count = 0;
            $conversation->save();

            Msg::where('chat_list_contact_id', $conversation->id)
                ->where('service', 'email')
                ->where('msg_mode', 'incoming')
                ->update(['is_read' => true]);
        }

        return $messages;
    }

    public function getInstagramConversationMessages(
        Request $request,
        ChatListContact $conversation,
        MetaIntegrationService $metaIntegrationService
    ) {
        $user = $request->user();

        if ((int) $conversation->user_id !== (int) $user->id) {
            abort(404);
        }

        if ($conversation->channel !== 'instagram') {
            return response()->json([
                'message' => 'Conversation is not an Instagram conversation.',
            ], 422);
        }

        $account = Account::query()
            ->where('id', $conversation->account_id)
            ->where('user_id', $user->id)
            ->where('service', 'instagram')
            ->first();

        if (! $account) {
            return response()->json([
                'message' => 'Instagram account not found.',
            ], 404);
        }

        if (
            (string) ($account->connection_status ?? '') !== 'connected'
            || empty($account->instagram_account_id)
        ) {
            return response()->json([
                'message' => 'Instagram account setup is incomplete.',
            ], 422);
        }

        $contact = Contact::find($conversation->contact_id);
        if (! $contact) {
            return response()->json([
                'message' => 'Instagram contact not found.',
            ], 404);
        }

        try {
            $metaIntegrationService->syncInstagramConversationMessages($account, $contact);
        } catch (\Throwable $e) {
            Log::warning('Unable to sync Instagram conversation messages.', [
                'conversation_id' => $conversation->id,
                'account_id' => $account->id,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Unable to sync Instagram conversation right now.',
            ], 422);
        }

        return response()->json(
            $this->buildConversationMessages($conversation, ['instagram'])
        );
    }

    protected function findConversationForUser(int $userId, int $conversationId): ?ChatListContact
    {
        return ChatListContact::where('user_id', $userId)
            ->where('id', $conversationId)
            ->first();
    }

    protected function buildConversationMessages(ChatListContact $conversation, array $category): array
    {
        $messages = [];

        if ($conversation->channel === 'email') {
            $messageCollection = Msg::where('chat_list_contact_id', $conversation->id)
                ->where('service', 'email')
                ->orderByRaw('COALESCE(received_at, sent_at, created_at) asc')
                ->get();
        } else {
            $serviceScope = ($conversation->channel && $conversation->channel !== 'all')
                ? [$conversation->channel]
                : $category;

            $linkedMessageQuery = Msg::query()
                ->where('chat_list_contact_id', $conversation->id)
                ->whereIn('service', $serviceScope);

            if ($linkedMessageQuery->exists()) {
                $messageCollection = $linkedMessageQuery
                    ->orderByRaw('COALESCE(received_at, sent_at, created_at) asc')
                    ->get();
            } else {
                $messageCollection = Msg::query()
                    ->whereNull('chat_list_contact_id')
                    ->where('msgable_id', $conversation->contact_id)
                    ->where('msgable_type', Contact::class)
                    ->whereIn('service', $serviceScope)
                    ->when($conversation->account_id, function ($query) use ($conversation) {
                        $query->where('account_id', $conversation->account_id);
                    })
                    ->orderByRaw('COALESCE(received_at, sent_at, created_at) asc')
                    ->get();
            }
        }

        foreach ($messageCollection as $message) {
            $messages[] = [
                'content' => $message->body_text ?: $message->message,
                'type' => $message->msg_type,
                'path' => ($message->file_path),
                'status' => $message->status,
                'date' => date_format(($message->received_at ?: $message->sent_at ?: $message->created_at), $this->dateChatView),
                'mode' => $message->msg_mode,
                'category' => $message->service,
                'error' => $message->error_response,
                'delivered' => $message->is_delivered,
                'read' => $message->is_read,
                'is_reply' => $message->is_reply,
                'is_mention' => $message->is_mention,
                'email_subject' => $message->email_subject,
                'sender_email' => $message->sender_email,
                'recipient_to' => $message->recipient_to ?? [],
                'recipient_cc' => $message->recipient_cc ?? [],
                'recipient_bcc' => $message->recipient_bcc ?? [],
            ];
        }

        return $messages;
    }

    /**
     * Update chat Channel
     */
    public function updateChatChannel($user_id, $conversation_id, $channel)
    {
        $contact = ChatListContact::where('user_id', $user_id)->where('id', $conversation_id)->first();
        if ($contact) {
            if ($contact->channel !== 'email' && $channel && $channel !== 'all') {
                $contact->channel = $channel;
            }
            $contact->unread = false;
            if ($contact->channel !== 'email') {
                $contact->unread_count = 0;
            }
            $contact->save();
        }
    }

    /**
     * Handle Insta hooks
     */
    public function incomingFBInsta()
    {
        $verification_token = config('app.fb.verification_code');
        if (
            isset($_GET['hub_mode'])
            && $_GET['hub_mode'] == 'subscribe'
            && $_GET['hub_verify_token'] == $verification_token
        ) {
            return $_GET['hub_challenge'];
        }

        $post_data = file_get_contents("php://input");
        $response = json_decode($post_data, true);
        Log::info(['Incoming Meta messenger payload' => $response]);

        return response()->json(['status' => true]);
    }

    /**
     * Handle FB webhook
     */
    public function incomingFBWhatsApp()
    {
        $verification_token = config('app.fb.verification_code');
        if (isset($_GET['hub_mode']) && $_GET['hub_mode'] == 'subscribe' && $_GET['hub_verify_token'] == $verification_token) {
            return $_GET['hub_challenge'];
        }

        $post_data = file_get_contents("php://input");
        $response = json_decode($post_data, true);
        //Log::info(['Incoming message (or) response ' => $response ]);

        $data = isset($response['entry'][0]['changes'][0]) ? $response['entry'][0]['changes'][0] : [];
        // Update template status
        if (isset($data['field']) && $data['field'] == 'message_template_status_update') {
            $tempId = $data['value']['message_template_id'];
            $template = Message::where('template_uid', $tempId)
                ->first();
            if ($template) {
                $status = strtoupper($data['value']['event']);
                if ($status == 'REJECTED') {
                    $status = $status . ' ( Reason: ' . $data['value']['reason'] . ' )';
                }
                $template->status = $status;
                $template->save();
            }
        }
        if (isset($data['field']) && $data['field'] == 'messages') {
            if (isset($data['value']['statuses']) && isset($data['value']['statuses']['0']['id'])) {
                $serviceId = $data['value']['statuses']['0']['id'];

                $messageData['service_id'] = $serviceId;
                $message = Msg::where('service_id', $serviceId)->first();

                if (!$message) {
                    return false;
                }
                $status = $data['value']['statuses']['0']['status'];
                $statusUC = strtoupper($status);

                $phone_number_id = $data['value']['metadata']['phone_number_id'];
                $account = Account::where('fb_phone_number_id', $phone_number_id)->first();

                switch ($status) {
                    case 'failed':
                        $messageData['status'] = $statusUC;
                        $messageData['error_response'] = $data['value']['statuses']['0']['errors'][0]['title'];
                        if ($data['value']['statuses']['0']['errors'][0]['code'] == 131047) {
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

                if ($status == 'sent' && isset($data['value']['statuses']['0']['pricing'])) {

                    if (!$account) {
                        return true;
                    }
                    //    $messageData['policy'] = 'BIC';
                    //    $price = $this->handlePrice($data['value']['statuses']['0']['recipient_id'], $data['value']['statuses']['0']['pricing']['category'], $account->user_id);
                    //    $this->reduceMessageAmount($price, $message->account_id);
                    //    $messageData['amount'] = $price;
                }
            } else if (isset($data['value']['contacts'])) {

                $phone_number_id = $data['value']['metadata']['phone_number_id'];
                $account = Account::where('fb_phone_number_id', $phone_number_id)->first();
                if (!$account) {
                    return true;
                }

                $data['id'] = $data['value']['messages'][0]['id'];
                $msgable_id = $this->getInfoUsingContactUniqueId($data['value']['contacts'][0]['wa_id'], 'whatsapp',  $account->user_id, $data['value']['contacts'][0]['profile']['name']);

                $content = isset($data['value']['messages'][0]['text']['body']) ? $data['value']['messages'][0]['text']['body'] : '';
                // $content = ( $content == '' && isset($data['payload']['name'])) ? $data['payload']['name'] : $content;
                $msgable_type = 'App\Models\Contact';
                $type = $data['value']['messages'][0]['type'];
                $is_media = false;
                if ($type != 'text') {
                    $is_media = true;
                    $document = new Document();
                    $fileData = $document->storeFBDocument($account, $msgable_id, $data['value']['messages'][0][$type]);
                }

                $messageData = [
                    'service_id' => $data['id'],
                    'service' => 'whatsapp',
                    'message' => $content,
                    'msg_type' => $type,
                    'account_id' => $account->id,
                    'msgable_id' => $msgable_id,
                    'msgable_type' => $msgable_type,
                    'policy' => 'UIC',
                    'msg_mode' => 'incoming',
                    'status' => 'received',
                    'is_delivered' => 0,
                    'is_read' => 0
                ];

                if ($type != 'text') {
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
        log::info(['Incoming message (or) response' => $post_data]);
        // If call is coming to set the URL
        if (isset($_GET['botname']) && isset($_GET['channel'])) {
            parse_str($_GET, $parsed_data);
            return;
        }

        $data = isset($response['payload']) ? $response['payload'] : [];

        // For set callback url
        if ((isset($data['type']) && $data['type'] == 'user-event') || (isset($data['phone']) && $data['phone'] == 'callbackSetPhone') || (isset($data['type']) && $data['type'] == 'sandbox-start')) {
            return;
        }

        /**
         * Calls coming from Instagram are not JSON encoded. 
         * If post data is available and decoded value is empty, parse the string and check
         */
        if ($post_data && !$data) {
            parse_str($post_data, $parsed_data);
            $parsed_data['account_id'] = $_GET['account_id']; // Setting account ID from the callback
            if ($parsed_data['channel'] == 'instagram') {
                $this->handleInstagramMessage($parsed_data);
            }
            return;
        }

        if ($response['type'] == 'template-event') {
            $template = Message::where('template_uid', $data['id'])
                ->first();
            if ($template && isset($data['status'])) {
                $status = strtoupper($data['status']);
                if ($data['status'] == 'rejected') {
                    $status = strtoupper($data['status']) . ' ( Reason: ' . $data['rejectedReason'] . ' )';
                }
                $template->status = $status;
                $template->save();
            }
        } else {
            $this->handleWhatsAppMessage($data);
        }
        return;
    }

    /**
     * Send the content to the contact
     */
    public function sendMessage(Request $request, GmailService $gmailService)
    {
        $user = $request->user();
        $account = Account::find($request->account_id);
        $msg = new Msg();
        $attachment = isset($_FILES['attachment']) ? $_FILES['attachment'] : '';

        $document = '';
        // Attachment handling
        if ($request->hasFile('attachment')) {
            $attachment = $request->file('attachment');
            $extention =  $attachment->getClientOriginalExtension();
            $attachment_name = 'ba_' . time() . $extention . '.' . $extention;
            $attachment_name = 'ba_' . time() . '.' . $extention;
            $path = public_path('/uploads/sent_files');
            $attachment->move($path, $attachment_name);
            $mimeType = $request->file('attachment')->getClientMimeType();

            $type = explode('/', $mimeType);
            $document = [
                'type' => $type[0],
                'url' => url('uploads/sent_files/' . $attachment_name),
                'caption' => $request->content,
            ];

            if ($type[0] == 'image') {
                $docParams = [
                    'previewUrl' => url('uploads/sent_files/' . $attachment_name),
                    'originalUrl' => url('uploads/sent_files/' . $attachment_name),
                ];
            } else {
                $docParams = [
                    'url' => url('uploads/sent_files/' . $attachment_name),
                    'filename' => $request->content,
                ];
            }
            if ($type[0] != 'image' && $type[0] != 'video') {
                $document['type'] = ($account->service_engine == 'facebook') ? 'document' : 'file';
                unset($document['caption']);
            }
            $document = array_merge($document, $docParams);

            //log::info(['Docuemnt data ' => $document ]);
        }

        // Send Message via Email
        if ($request->channel == 'email') {
            $conversation = ChatListContact::where('id', (int) $request->input('conversation_id'))
                ->where('user_id', $user->id)
                ->first();

            $latestEmailMessage = $conversation
                ? Msg::where('chat_list_contact_id', $conversation->id)
                    ->where('service', 'email')
                    ->orderByDesc('received_at')
                    ->orderByDesc('sent_at')
                    ->orderByDesc('created_at')
                    ->first()
                : null;

            $subject = trim((string) ($request->email_subject ?: $conversation?->email_subject ?: '(no subject)'));

            try {
                $sendResult = $gmailService->sendMessage($account, [
                    'to' => [$request->destination],
                    'subject' => $subject,
                    'text_body' => (string) $request->content,
                    'html_body' => nl2br(e((string) $request->content)),
                    'thread_id' => $conversation?->gmail_thread_id ?: $latestEmailMessage?->gmail_thread_id,
                    'in_reply_to' => $latestEmailMessage?->internet_message_id,
                    'references_header' => $latestEmailMessage?->references_header ?: $latestEmailMessage?->internet_message_id,
                ]);

                return response()->json([
                    'status' => 'Sent',
                    'messageId' => optional($sendResult['message'])->gmail_message_id,
                ]);
            } catch (\Throwable $e) {
                Log::warning('Email send failed.', [
                    'account_id' => $account?->id,
                    'message' => $e->getMessage(),
                ]);

                return response()->json([
                    'status' => 'Failed',
                    'error' => 'Unable to send email right now.',
                ], 422);
            }
        }

        $parent = $this->getInfoUsingContactUniqueId($request->destination, $request->channel, $user->id);
        $contact = $parent ? Contact::find($parent) : null;

        // Send Message to Facebook or Instagram
        if ($request->channel == 'instagram' || $request->channel == 'facebook') {

            //$response = $msg->sendInstagramMessage($request->content , $request->destination, $account->src_name);

            // Get Page token
            $helper = new WhatsAppUsers();
            $pageId = $account->fb_phone_number_id;
            $pageToken = $helper->getFbPageAccessToken($account);
            $internalTemplate = $this->resolveInternalSocialTemplate($account, $request->template_id, (string) $request->channel);
            $renderedTemplate = null;

            if ($internalTemplate) {
                try {
                    $renderedTemplate = app(TemplateRenderService::class)->renderForContact($internalTemplate, $contact);
                } catch (TemplateAdapterException $e) {
                    return response()->json([
                        'status' => 'Failed',
                        'error' => $e->getMessage(),
                    ], 422);
                }
            }

            if ($request->channel == 'instagram') {
                $instagramStatus = (string) ($account->connection_status ?? '');
                $instagramAccountId = (string) ($account->instagram_account_id ?? '');
                $connectionModel = (string) ($account->connection_model ?? '');

                if ($connectionModel === 'instagram_login') {
                    if ($instagramStatus !== 'connected' || $instagramAccountId === '') {
                        return response()->json([
                            'status' => 'Failed',
                            'error' => 'Instagram setup is incomplete. Reconnect Instagram to continue.',
                        ], 422);
                    }

                    try {
                        $response = app(MetaIntegrationService::class)->sendInstagramMessage(
                            $account,
                            (string) $request->destination,
                            $renderedTemplate ?: (string) $request->content,
                            is_array($document ?? null) ? $document : []
                        );
                    } catch (\Throwable $e) {
                        return response()->json([
                            'status' => 'Failed',
                            'error' => $e->getMessage(),
                        ], 422);
                    }
                } else {
                    $pageId = $account->meta_page_id ?: $account->fb_phone_number_id;
                    $pageToken = $account->meta_page_token ?: $pageToken;

                    if ($instagramStatus !== 'connected' || $instagramAccountId === '' || $pageId === '' || $pageToken === '') {
                        return response()->json([
                            'status' => 'Failed',
                            'error' => 'Instagram setup is incomplete. Reconnect Instagram to continue.',
                        ], 422);
                    }

                    $msg = new Msg();
                    $response = $msg->sendInstaMessage($renderedTemplate ?: $request->content, $request->destination, $pageId, $pageToken, $document);
                }
            } else {
                $msg = new Msg();
                $metaIntegrationService = app(MetaIntegrationService::class);

                if ((bool) ($account->requires_reconnect ?? false)) {
                    return response()->json([
                        'status' => 'Failed',
                        'error' => 'Connect Facebook again to continue.',
                    ], 422);
                }

                $response = $msg->sendInstaMessage($renderedTemplate ?: $request->content, $request->destination, $pageId, $pageToken, $document);

                $responseError = $response['error']['message'] ?? $response['error'] ?? '';
                if ($metaIntegrationService->isMetaAccessTokenInvalid($responseError)) {
                    $refreshedPageToken = $metaIntegrationService->refreshFacebookPageAccessToken($account);

                    if ($refreshedPageToken !== '') {
                        $response = $msg->sendInstaMessage(
                            $renderedTemplate ?: $request->content,
                            $request->destination,
                            $pageId,
                            $refreshedPageToken,
                            $document
                        );
                        $responseError = $response['error']['message'] ?? $response['error'] ?? '';
                    }

                    if ($metaIntegrationService->isMetaAccessTokenInvalid($responseError)) {
                        $metaIntegrationService->markFacebookReconnectRequired(
                            $account,
                            'Facebook session expired. Connect Facebook again to continue.'
                        );

                        return response()->json([
                            'status' => 'Failed',
                            'error' => 'Facebook session expired. Connect Facebook again to continue.',
                            'result' => [
                                'msg_type' => $document ? 'Media' : 'Text',
                            ],
                        ], 422);
                    }
                }
            }

            $status = 'Send';
            if (isset($response['error'])) {
                $status = 'Failed';
                $request->channel = 'instgram';
                $result['error'] = $response['error']['message'];
            } else {
                $result['messageId'] = $response['message_id'] ?? $response['id'] ?? null;
            }

            $result['status'] = $status;
        } else {
            // Send Message to Whatsapp
            $template = ($request->template_id) ? $request->template_id : '';
            $catalog_id = ($request->catalog_id) ? $request->catalog_id : '';
            $template_options = ($request->template_options) ? $request->template_options : '';

            $product_retailer_id = ($request->product_retailer_id && $request->product_retailer_id != 'undefined') ? $request->product_retailer_id : '';

            $content = $request->content;

            if ($template && $template != 'undefined') {

                $content = [];
                $message =  Message::join('templates', 'templates.id', 'template_id')
                    ->where('messages.template_uid', $template)
                    ->where('account_id', $account->id)
                    ->first();

                $_POST['content'] = $messageBody = $message->body;

                // $message->example = base64_encode( serialize( $message->example) );
                if (base64_decode($message->example, true)) {
                    $sample = ($message->example) ? unserialize(base64_decode($message->example)) : [];
                } else if ($message->example) {
                    $sample = $message->example;
                } else {
                    $sample = [];
                }
                $contact = Contact::find($parent);
                if (is_array($sample)) {
                    foreach ($sample as $key => $name) {
                        $content[] = $this->replaceFieldValue($name, $contact);
                    }

                    foreach ($content as $key => $value) {
                        $index = $key + 1;
                        if (strpos($messageBody, "{{" . $index . "}}")) {
                            $messageBody = str_replace("{{" . $index . "}}", $value, $messageBody);
                        }
                    }
                    $_POST['content'] = $messageBody;
                } else if ($sample) {
                    $_POST['content'] = $sample;
                }
            }
            $productData = [];
            if ($product_retailer_id) {
                $product = Product::where('retailer_id', $product_retailer_id)->first();
                $_POST['content'] = $product->name . " - Product shared";
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

            if ($template_options && $template_options != 'undefined') {
                if ($request->template_type == 'list_option') {
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

            $result = $msg->sendWhatsAppMessage($content, $request->destination, $account, $template, $document, $productData, $interactiveMessage);

            if ($result['result'] && $result['result']['status'] && $result['result']['status'] != 'error') {
                if ($result['result']['status'] == 'submitted') {
                    $result['status'] = 'Queued';
                }
                $result['messageId'] = $result['result']['messageId'];
            } else {
                $result['status'] = 'Failed';
                $error = isset($result['result']['error']) ? ($result['result']['error']) : ($result['result']['message']);
                $result['error'] = $error ? $error : 'Please check the configuration';
            }
        }
        if ($attachment) {
            // Store Document 
            $file = file_get_contents($path . '/' . $attachment_name);
            $path = "document/{$account->id}/{$parent}/sent/{$attachment_name}";
            $docId = (new Document)->saveDocument($attachment_name, $mimeType, $file, $parent, 'Contact', $path, '');
            $result['result']['file_path'] = $docId;
            $result['result']['msg_type'] = ($type) ? $type[0] : '';
        } else {
            $result['result']['msg_type'] = 'Text';
        }


        if (isset($result['messageId']))
            $this->handleMessageResult($request, $account->id, $result);

        if (
            isset($result['messageId'])
            && in_array($request->channel, ['facebook', 'instagram'], true)
        ) {
            $this->queueSocialHistorySync($account->id, $request->channel);
        }

        return response()->json($result);
    }

    protected function queueSocialHistorySync(int $accountId, string $channel): void
    {
        app()->terminating(function () use ($accountId, $channel) {
            try {
                $account = Account::find($accountId);

                if (! $account || $account->service !== $channel) {
                    return;
                }

                if ($channel === 'instagram') {
                    SyncInstagramMessagesJob::dispatchSync($accountId, true);
                } else {
                    app(MetaIntegrationService::class)->syncHistoricalChatsIfNeeded($account, true);
                }
            } catch (\Throwable $e) {
                Log::warning('Unable to refresh social history after outbound send.', [
                    'account_id' => $accountId,
                    'service' => $channel,
                    'message' => $e->getMessage(),
                ]);
            }
        });
    }

    /**
     * Process message result 
     */
    public function handleMessageResult(Request $request, $accountId, $data)
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
        if (!$message) {
            $message = new Msg();
        }

        foreach ($data as $field => $value) {
            $message->$field = $value;
        }

        // Update Session and Price 
        // if(($message->msg_mode == 'outgoing' && $message->status == 'Sent') || $message->msg_mode == 'incoming' ){
        if ($message->msg_mode == 'incoming' && $message->service === 'whatsapp') {
            $message = $this->updateMessageSession($message);
        }

        $message->save();
        $this->syncConversationFromMessage($message);
    }

    protected function syncConversationFromMessage(Msg $message): void
    {
        if (
            ! $message->account_id
            || ! $message->msgable_id
            || $message->msgable_type !== Contact::class
            || $message->service === 'email'
        ) {
            return;
        }

        $account = Account::find($message->account_id);
        $contact = Contact::find($message->msgable_id);

        if (! $account || ! $contact) {
            return;
        }

        $this->refreshSocialContactNameIfMissing($contact, $account, (string) $message->service);

        $conversation = null;

        if ($message->chat_list_contact_id) {
            $conversation = ChatListContact::where('id', $message->chat_list_contact_id)
                ->where('user_id', $account->user_id)
                ->first();
        }

        if (! $conversation) {
            $conversation = ChatListContact::where('user_id', $account->user_id)
                ->where('contact_id', $message->msgable_id)
                ->where(function ($query) use ($message) {
                    $query->where('account_id', $message->account_id)
                        ->orWhereNull('account_id');
                })
                ->where(function ($query) use ($message) {
                    $query->where('channel', $message->service)
                        ->orWhereNull('channel')
                        ->orWhere('channel', '');
                })
                ->orderByRaw(
                    "CASE
                        WHEN account_id = ? AND channel = ? THEN 0
                        WHEN account_id = ? AND (channel IS NULL OR channel = '') THEN 1
                        WHEN account_id IS NULL AND channel = ? THEN 2
                        WHEN account_id IS NULL AND (channel IS NULL OR channel = '') THEN 3
                        ELSE 2
                    END",
                    [$message->account_id, $message->service, $message->account_id, $message->service]
                )
                ->orderByDesc('id')
                ->first();
        }

        if (! $conversation) {
            $conversation = new ChatListContact();
            $conversation->user_id = $account->user_id;
            $conversation->contact_id = $message->msgable_id;
        }

        $conversation->channel = $message->service;
        $conversation->account_id = $message->account_id;
        $conversation->last_msg_id = $message->id;
        $conversation->last_message_at = $message->received_at ?: $message->sent_at ?: $message->created_at;

        if ($message->msg_mode === 'incoming') {
            $conversation->unread = ! (bool) $message->is_read;
        } else {
            $conversation->unread = false;
        }

        $conversation->save();

        $conversation = $this->mergeDuplicateConversationGroup(
            $account->user_id,
            (string) $message->service,
            (int) $message->msgable_id,
            (int) $message->account_id
        ) ?: $conversation;

        if ((int) $message->chat_list_contact_id !== (int) $conversation->id) {
            Msg::withoutEvents(function () use ($message, $conversation) {
                $message->chat_list_contact_id = $conversation->id;
                $message->save();
            });
        }

        if ($message->msg_mode === 'incoming') {
            $conversation->unread_count = Msg::where('chat_list_contact_id', $conversation->id)
                ->where('service', $message->service)
                ->where('msg_mode', 'incoming')
                ->where(function ($query) {
                    $query->where('is_read', false)->orWhereNull('is_read');
                })
                ->count();
        } else {
            $conversation->unread_count = 0;
        }

        $conversation->save();
    }

    protected function refreshSocialContactNameIfMissing(Contact $contact, Account $account, string $service): void
    {
        if (! in_array($service, ['facebook', 'instagram'], true)) {
            return;
        }

        if (
            $service === 'instagram'
            && (string) ($account->connection_model ?? '') === 'instagram_login'
        ) {
            return;
        }

        $currentName = trim(($contact->first_name ?: '') . ' ' . ($contact->last_name ?: ''));
        $serviceId = $service === 'facebook'
            ? (string) ($contact->facebook_username ?: '')
            : (string) ($contact->instagram_username ?: '');

        if ($serviceId === '') {
            return;
        }

        if ($currentName !== '' && $currentName !== $serviceId) {
            return;
        }

        try {
            $contactData = (new WhatsAppUsers())->getServiceUserInfo($serviceId, $account);
        } catch (\Throwable $e) {
            Log::warning('Unable to refresh social contact name.', [
                'account_id' => $account->id,
                'service' => $service,
                'contact_id' => $contact->id,
                'message' => $e->getMessage(),
            ]);

            return;
        }

        if (! data_get($contactData, 'status')) {
            return;
        }

        $profile = (array) data_get($contactData, 'contact_data', []);
        $firstName = '';
        $lastName = '';

        if ($service === 'instagram') {
            $name = trim((string) ($profile['name'] ?? ''));
            if ($name !== '') {
                $nameParts = preg_split('/\s+/', $name, 2);
                $firstName = (string) ($nameParts[0] ?? '');
                $lastName = (string) ($nameParts[1] ?? '');
            }

            if ($firstName === '' && ! empty($profile['username'])) {
                $firstName = (string) $profile['username'];
            }
        } else {
            $firstName = (string) ($profile['first_name'] ?? '');
            $lastName = (string) ($profile['last_name'] ?? '');

            if ($firstName === '' && ! empty($profile['name'])) {
                $nameParts = preg_split('/\s+/', trim((string) $profile['name']), 2);
                $firstName = (string) ($nameParts[0] ?? '');
                $lastName = (string) ($nameParts[1] ?? '');
            }
        }

        if ($firstName === '' && $lastName === '') {
            return;
        }

        $contact->first_name = $firstName;
        $contact->last_name = $lastName;
        $contact->save();
    }

    /**
     * Send an outgoing email through the linked Gmail account.
     */
    public function sendEmailMessage(
        string $content,
        string $destination,
        $account,
        string $subject = '',
        ?string $textBody = null,
        bool $isHtml = false
    ): array {
        try {
            $gmailService = app(GmailService::class);
            $sendResult = $gmailService->sendMessage($account, [
                'to' => [$destination],
                'subject' => $subject ?: '(no subject)',
                'text_body' => $textBody ?: $content,
                'html_body' => $isHtml ? $content : nl2br(e($content)),
            ]);

            return [
                'result' => [
                    'status' => 'submitted',
                    'messageId' => optional($sendResult['message'])->gmail_message_id,
                    'msg_type' => 'Text',
                ],
                'messageId' => optional($sendResult['message'])->gmail_message_id,
                'status' => 'Sent',
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
    public function getInfoUsingContactUniqueId($uniqueId, $type, $user_id, $name = '')
    {
        $phoneNumber = $instagramId = '';
        $field = '';
        if ($type == 'whatsapp') {
            $field = 'phone_number';
        } elseif ($type == 'instagram') {
            $field = 'instagram_username';
        } elseif ($type == 'facebook') {
            $field = 'facebook_username';
        } elseif ($type == 'email') {
            $field = 'email';
        } else {
            $field = 'phone_number';
        }

        if (strpos($uniqueId, '+') === false) {
            $uniqueId = ($type == 'whatsapp') ? '+' . $uniqueId : $uniqueId;
        }

        $contact = Contact::where($field, $uniqueId)->first();

        if (!$contact) {
            // Create new contact if instagram id is not found
            $contact = new Contact();

            $last_name = isset($_POST['last_name']) ? $_POST['last_name'] : $name;
            $first_name = isset($_POST['first_name']) ? $_POST['first_name'] : $name;

            $contact->last_name = $last_name;
            $contact->first_name = $first_name;

            $contact->$field = $uniqueId;
            $contact->creater_id = $user_id;
            $contact->save();
        }

        // Update contact last update time
        $chatContact = ChatListContact::where('contact_id', $contact->id)
            ->where('user_id', $user_id)
            ->where(function ($query) use ($type) {
                $query->where('channel', $type)
                    ->orWhereNull('channel')
                    ->orWhere('channel', '');
            })
            ->orderByRaw(
                "CASE
                    WHEN channel = ? THEN 0
                    WHEN channel IS NULL OR channel = '' THEN 1
                    ELSE 2
                END",
                [$type]
            )
            ->orderByDesc('id')
            ->first();

        if (! $chatContact) {
            $chatContact = new ChatListContact();
            $chatContact->contact_id = $contact->id;
            $chatContact->user_id = $user_id;
            $chatContact->channel = $type;
        }

        if ($type === 'whatsapp') {
            if (isset($_REQUEST['is_sent']) && $_REQUEST['is_sent'] == 'sent') {
                $chatContact->unread = false;
            } else {
                $chatContact->unread = true;
            }

            $chatContact->save();
        } else {
            if (! $chatContact->exists) {
                $chatContact->save();
            }
        }

        $this->mergeDuplicateConversationGroup($user_id, $type, (int) $contact->id);

        return $contact->id;
    }

    /**
     * Return user id using account id
     */
    public function getUserIdUsingAccountId($account_id)
    {
        $account = Account::find($account_id);
        if ($account) {
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
        if ($sender_info['channeltype'] == 'instagram') {
            $sender_id = $sender_info['channelid'];
        }

        if ($message_info['type'] == 'txt') {
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
        if (!$account) {
            //log::info([ 'status' => false , 'message' => 'Invalid account.' ]);
            return;
        }
        $user_id = $account->user_id;
        $msgable_type = 'App\Models\Contact';

        if (isset($data['sender']) &&  $_GET['origin'] != $data['sender']['phone']) {
            $msgable_id = $this->getInfoUsingContactUniqueId($data['sender']['phone'], 'whatsapp', $user_id, $data['sender']['name']);

            $content = isset($data['payload']['text']) ? $data['payload']['text'] : '';
            $replyTo = $templateId = '';
            if (isset($data['type']) && ($data['type'] == 'list_reply' || $data['type'] == 'button_reply')) {
                $content = $data['payload']['title'];
                if ($data['type'] == 'list_reply') {
                    $content .= $data['payload']['description'];
                }

                $replyTo = $data['context']['gsId'];
                $message = Msg::where('service_id', $replyTo)->first();
                if ($message) {
                    $templateId = $message->template_id;
                }
            }

            $content = ($content == '' && isset($data['payload']['name'])) ? $data['payload']['name'] : $content;
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

            if (isset($data['payload']['contentType'])) {
                // Store document
                $document = new Document();
                $filePath = $document->storeDocument($data['payload']['contentType'], $data['payload']['url'], $msgable_id, $account);
                $type = explode('/', $data['payload']['contentType']);
                $messageData['msg_type'] = $type[0];
                $messageData['message'] = isset($data['payload']['caption']) ?  $data['payload']['caption'] : '';
                $messageData['file_path'] = $filePath;
            }
        } else {

            $serviceId = isset($data['gsId']) ? $data['gsId'] : '';
            $serviceId = ($serviceId == '' && isset($data['id'])) ? $data['id'] : $serviceId;
            if (! $serviceId)
                return false;

            $messageData['service_id'] = $serviceId;
            $message = Msg::where('service_id', $serviceId)->first();
            if (!$message) {
                return false;
            }

            $is_delivered = $is_read = 0;
            $status = 'Sent';
            if (isset($data['type']) && str_contains($data['type'], 'failed')) {
                $messageData['status'] = 'Failed';
                $messageData['error_response'] = $data['payload']['reason'];
            } else if (isset($data['type']) && $data['type'] == 'sent') {
                $messageData['status'] = 'Sent';
            } else if (isset($data['type']) && $data['type'] == 'delivered') {
                $messageData['is_delivered'] = 1;
            } else if (isset($data['type']) && $data['type'] == 'read') {
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

        if ($request->from_crm) {
            $_REQUEST['FROM_CRM'] = true;
        }
        Log::info(['Send message via API' => $_POST]);

        $current_user = $request->user();
        $account_id = $request->account_number;
        $account = Account::where('id', $account_id)->orWhere('phone_number', $account_id)->first();

        if (! $account) {
            return response()->json(['status' => false, 'message' => 'Invalid account id'], 400);
        }

        // Validate the request
        if (!$request->content && !$request->template && !$request->template_id) {
            return response()->json(['status' => false, 'message' => 'Content is missing'], 400);
        }

        if (!$request->destination) {
            return response()->json(['status' => false, 'message' => 'Destination is missing'], 400);
        }
        if ($account->service == 'instagram') {
            $retuen = $this->sendInstaAPIMessage($request);
            return $retuen;
        }

        if (! $account->src_name) {
            return response()->json(['status' => false, 'message' => 'Invalid account.'], 400);
        }

        $content = $request->content;
        $type = 'Text';
        if ($request->template) {

            $content = [];
            if (is_array($request->template_params)) {
                $content = $request->template_params;
            } else {
                $content = json_decode($request->template_params);
            }

            $type = 'Template';

            $message =  Message::join('templates', 'templates.id', 'messages.template_id')
                ->where('messages.template_uid', $request->template)
                ->orWhere('templates.template_uid', $request->template)
                ->first();
            if (!$message) {
                return response()->json(['status' => false, 'message' => 'Template not found.'], 400);
            }

            $messageBody = $message->body;
            if ($content && count($content)) {
                foreach ($content as $key => $value) {
                    $index = $key + 1;
                    if (strpos($messageBody, "{{" . $index . "}}")) {
                        $messageBody = str_replace("{{" . $index . "}}", $value, $messageBody);
                    }
                }
            }
            $_POST['content'] = $messageBody;
        }

        // Check message type
        $interactiveMessage = [];
        if ($request->template_type && $request->template_type == 'interactive') {
            $template = InteractiveMessage::find($request->template_id);

            // Update Params with values
            $content = [];
            if (is_array($request->template_params)) {
                $content = $request->template_params;
            } else {
                $content = json_decode($request->template_params);
            }
            $messageBody = $template->content;
            if ($content && count($content)) {
                foreach ($content as $key => $value) {
                    $index = $key + 1;
                    if (strpos($messageBody, "{{" . $index . "}}")) {
                        $messageBody = str_replace("{{" . $index . "}}", $value, $messageBody);
                    }
                }
            }
            $_POST['content'] = $messageBody;

            if (!$template) {
                return response()->json(['status' => false, 'message' => 'Invalid template id.'], 400);
            }
            // dd($template);
            if ($template->option_type == 'list_option') {
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
        if ($attachment) {
            $content = '';
            $attachment = $request->file('attachment');

            $extention =  $attachment->getClientOriginalExtension();
            $attachment_name = 'ba_' . time() . $extention . '.' . $extention;
            $path = public_path('/uploads/sent_files');
            $attachment->move($path, $attachment_name);
            $mimeType = $request->file('attachment')->getClientMimeType();
            //  $mimeType = "{$request->attachment_type}/{$extention}";

            $type = explode('/', $mimeType);
            $document = [
                'type' => $type[0],
                'url' => url('uploads/sent_files/' . $attachment_name),
                'caption' => $request->content,
            ];

            if ($type[0] == 'image') {
                $docParams = [
                    'previewUrl' => url('uploads/sent_files/' . $attachment_name),
                    'originalUrl' => url('uploads/sent_files/' . $attachment_name),
                ];
            } else {
                $docParams = [
                    'url' => url('uploads/sent_files/' . $attachment_name),
                    'filename' => basename(parse_url($document['url'], PHP_URL_PATH)),
                ];
            }
            if ($type[0] != 'image' && $type[0] != 'video') {
                $document['type'] = ($account->service_engine == 'facebook') ? 'document' : 'file';
                unset($document['caption']);
            }
            $content = basename(parse_url($document['url'], PHP_URL_PATH));
            $_POST['content'] = $content;
            $document = array_merge($document, $docParams);
            // dd($document);
        }
        $parent = $this->getInfoUsingContactUniqueId($request->destination, 'whatsapp', $current_user->id);

        $msg = new Msg();
        $result = $msg->sendWhatsAppMessage($content, $request->destination, $account, $request->template, $document, '', $interactiveMessage);
        $statusCode = 400;
        if ($result['result']['status'] != 'failed' && $result['result']['status'] && $result['result']['status'] != 'error') {
            $statusCode = 200;
            if ($result['result']['status'] == 'submitted') {
                $result['status'] = 'Queued';
            }
            $result['result']['msg_type'] = $type;

            if ($attachment) {
                // Store Document 
                $file = file_get_contents($path . '/' . $attachment_name);
                $path = "document/{$account->id}/{$parent}/sent/{$attachment_name}";
                $docId = (new Document)->saveDocument($attachment_name, $mimeType, $file, $parent, 'Contact', $path, '');
                $result['result']['file_path'] = $docId;
                $result['result']['msg_type'] = ($type) ? $type[0] : '';
            }

            $result['messageId'] = $result['result']['messageId'];
            $request->channel = 'whatsapp';

            if ($interactiveMessage) {
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
    public function handlePrice($contactId, $category)
    {
        $return = 0;
        $price = '';
        $contact = Contact::find($contactId);
        if ($contact) {
            $countryCode = $contact->country_code;
            if (!$countryCode) {
                $number = PhoneNumber::parse($contact->phone_number);
                $countryCode = $number->getCountryCode();
                $contact->country_code = $countryCode;
                $contact->save();
            }
            $price = Price::where('country_code', $countryCode)->first();
        }

        if (! $price) {
            $price = Price::where('is_default', 1)->first();
        }

        if ($price) {
            if ($category == 'UIC') {
                $return = $price->user_initiated;
            } else if ($category == 'BIC') {
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
        if ($wallet) {
            $balance_amount = ($wallet->balance_amount - $price);
            $wallet->balance_amount = $balance_amount;
            $wallet->save();
        }
        DB::commit();
        // Auto Top-up 
        if ($wallet && $wallet->balance_amount < 1) {
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
        $sessionTable = (new Session())->getTable();
        $hasSessionAccountId = Schema::hasColumn($sessionTable, 'account_id');
        if ($msg->msg_mode == 'outgoing' && $msg->status == 'Sent') {
            $updateSession = true;
            $policy = 'BIC';
        } else if ($msg->msg_mode == 'incoming') {
            $updateSession = true;
            $policy = 'UIC';
        }

        if ($updateSession) {
            $condition = [
                'contact_id' => $msg->msgable_id,
            ];
            if ($hasSessionAccountId) {
                $condition['account_id'] = $msg->account_id;
            }
            $session = Session::where($condition)
                ->where('created_at', '>=', Carbon::now()->subDay())
                ->first();

            if (! $session) {

                if ($msg->service == 'whatsapp') {
                    $price = $this->handlePrice($msg->msgable_id, $policy);
                }
                $sessions = Session::where($condition)->count();

                if ($sessions < 1000) {
                    if ($msg->service == 'whatsapp') {
                        $price = config('stripe.wp_msg_price');
                    }
                } else {
                    if ($msg->service == 'whatsapp') {
                        $price = $price + config('stripe.wp_msg_price');
                    } else if ($msg->service == 'facebook') {
                        $price = config('stripe.fb_msg_price');
                    } else if ($msg->service == 'instagram') {
                        $price = config('stripe.ig_msg_price');
                    }
                }


                $this->reduceMessageAmount($price);
                $msg->amount = $price;
                $msg->policy = $policy;

                // Create Session 
                DB::beginTransaction();
                $session = new Session();
                if ($hasSessionAccountId) {
                    $session->account_id = $msg->account_id;
                }
                $session->contact_id = $msg->msgable_id;
                $session->policy = $policy;
                $session->amount = $price;
                $session->uuid = Str::uuid()->toString();
                $session->save();
                DB::commit();
            } else if (!$msg->amount && $msg->amount == 0) {
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
        foreach ($autoTopup as $metedata) {
            $autoTopUpSetup[$metedata->meta_key] = $metedata->meta_value;
        }
        if (isset($autoTopUpSetup['auto_topup_status']) && $autoTopUpSetup['auto_topup_status'] == 'ON' && isset($autoTopUpSetup['auto_topup_value'])) {

            $selectedTopUp = $autoTopUpSetup['auto_topup_value'];

            $company = Company::first();
            $stripe = new \Stripe\StripeClient(config('stripe.stripe_secret'));
            $subscription = $stripe->subscriptions->retrieve($company->subscription_id);
            $subscription_info = [];
            foreach ($subscription->items->data as $subscriptionItem) {
                $price_id = $subscriptionItem->price->id;
                $quantity = 0;

                if ($price_id && ($price_id == config("stripe.top_up_{$selectedTopUp}"))) {
                    $quantity = 1;
                }

                if ($quantity > 0) {
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

    public function resetWalletBalance(Request $request)
    {

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
        $account = Account::where('id', $account_id)->orWhere('phone_number', $account_id)->first();
        if (! $account || $account->service !== 'instagram') {
            return response()->json(['status' => false, 'message' => 'Invalid Instagram account.'], 400);
        }

        if ((string) ($account->connection_model ?? '') === 'instagram_login') {
            try {
                $result = app(MetaIntegrationService::class)->sendInstagramMessage(
                    $account,
                    (string) $request->destination,
                    (string) $request->content
                );
            } catch (\Throwable $e) {
                return response()->json(['status' => false, 'message' => $e->getMessage()], 422);
            }

            if (isset($result['error'])) {
                $result['status'] = 'Failed';
                $result['result']['msg_type'] = 'TEXT';
                $request->channel = 'instgram';
            } else {
                $result['status'] = 'Sent';
                $result['messageId'] = $result['message_id'] ?? $result['id'] ?? null;
            }
        } else {
            $access_token = $account->fb_token;
            $pageId = $account->fb_phone_number_id;
            if (!$access_token) {
                return response()->json(['status' => false, 'message' => 'Access token not generated.'], 400);
            }
            if (!$pageId) {
                return response()->json(['status' => false, 'message' => 'This account has not connected to any page.'], 400);
            }

            $helper = new WhatsAppUsers();
            $pageToken = $helper->getFbPageAccessToken($account);

            $msg = new Msg();
            $result = $msg->sendInstaMessage($request->content, $request->destination, $pageId, $pageToken);
            if (isset($result['error'])) {
                $result['status'] = 'Failed';
                $result['result']['msg_type'] = 'TEXT';
                $request->channel = 'instgram';
            } else {
                $result['status'] = 'Sent';
                $result['messageId'] = $result['message_id'];
            }
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
        if (! $account) {
            return response()->json(['status' => false, 'message' => 'Invalid account.'], 400);
        }

        if ($request->is_delete) {
            $message = Msg::where('service_id', $request->messageId)->first();
            $message->delete();
            return response()->json(['status' => true, 'message' => 'Message stored successfully.'], 200);
        }

        if (
            $request->status == 'Read'
            && ($request->service == 'instagram' || $request->service == 'facebook')
            && ! $request->filled('messageId')
        ) {
            return false;
        }

        $fileUrl = '';
        $isAttachment = '';
        if ($request->reply_to) {
            $fileUrl = $request->reply_to;
            $isAttachment = true;
        }
        if ($request->story_mention) {
            $fileUrl = $request->story_mention;
            $isAttachment = true;
        }
        if ($request->attachment_type && $request->attachment) {
            $fileUrl = $request->attachment;
            $isAttachment = true;
        }

        $contactServiceId = ($request->type == 'incoming') ? $request->sender : $request->recipient;
        $status = ($request->type == 'incoming') ? 'Received' : $request->status;

        if ($request->service != 'whatsapp') {
            $field = ($request->service == 'instagram') ?  'instagram_username' : 'facebook_username';
            $contact = Contact::where($field, $contactServiceId)->first();
        } else {
            $field = 'phone_number';
            $contactServiceId = '+' . $contactServiceId;
            $contact = Contact::where('phone_number', $contactServiceId)
                ->orWhere('whatsapp_number', $contactServiceId)
                ->first();
        }

        $messagableId = '';
        if (! $contact) {
            if ($request->service != 'whatsapp') {
                $contact = new Contact();

                if (
                    $request->service === 'instagram'
                    && (string) ($account->connection_model ?? '') === 'instagram_login'
                ) {
                    $displayName = trim((string) (
                        $request->input('contact_name')
                        ?: $request->input('sender_name')
                        ?: $request->input('username')
                        ?: ''
                    ));

                    if ($displayName !== '') {
                        $nameParts = preg_split('/\s+/', $displayName, 2) ?: [];
                        $contact->first_name = $nameParts[0] ?? 'Instagram';
                        $contact->last_name = $nameParts[1] ?? 'User';
                    } else {
                        $contact->first_name = 'Instagram';
                        $contact->last_name = 'User';
                    }
                } else {
                    $facebookData = new WhatsAppUsers();
                    $contactData = $facebookData->getServiceUserInfo($contactServiceId, $account);

                    if (! empty($contactData['status'])) {
                        if ($request->service == 'instagram') {
                            $displayName = trim((string) ($contactData['contact_data']['name'] ?? ''));
                            $username = trim((string) ($contactData['contact_data']['username'] ?? ''));
                            $resolvedName = $displayName !== '' ? $displayName : $username;
                            $nameParts = preg_split('/\s+/', $resolvedName, 2) ?: [];
                            $contact->first_name = $nameParts[0] ?? 'Instagram';
                            $contact->last_name = $nameParts[1] ?? 'User';
                        } else {
                            $contact->last_name = isset($contactData['contact_data']['last_name']) ? $contactData['contact_data']['last_name'] : '';
                            $contact->first_name = isset($contactData['contact_data']['first_name']) ? $contactData['contact_data']['first_name'] : '';
                        }
                    }
                }
            } else {
                $contact->last_name = $request->name;
            }
            $contact->$field = $contactServiceId;
            $contact->creater_id = $account->user_id;

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
            'is_delivered' => $request->has('is_delivered') ? $request->boolean('is_delivered') : (($request->status == 'Delivered') ? true : false),
            'is_read' => $request->has('is_read') ? $request->boolean('is_read') : (($request->status == 'Read') ? true : false),
        ];
        if ($request->type == 'incoming' && $request->service == 'whatsapp') {
            $messageData['message'] = $request->message;
        } else if ($request->service != 'whatsapp') {
            $messageData['message'] = $request->message;
        }
        if ($request->filled('occurred_at')) {
            if ($request->type === 'incoming') {
                $messageData['received_at'] = $request->occurred_at;
            } else {
                $messageData['sent_at'] = $request->occurred_at;
            }
        }
        if ($status == 'Failed') {
            $messageData['error_response'] = $request->error_msg;
        }

        $msgType = 'story';
        if ($request->story_type == 'reply_to') {
            $messageData['is_reply'] = true;
        }
        if ($request->story_type == 'story_mention') {
            $messageData['is_mention'] = true;
        }
        if ($request->story_type == 'story_mentiond') {
            $messageData['is_expired'] = true;
        }
        if ($request->attachment_type && $request->attachment) {
            $msgType = $request->attachment_type;
        }
        $mediaType = '';
        // Handle whatsapp media file
        if ($request->media_id) {
            $url = config('app.fb.api_url');
            $response = Http::get($url . "/" . $request->media_id . "?access_token={$account->fb_token}");
            $response_body = json_decode($response->body(), true);

            if (isset($response_body['url'])) {
                $fileUrl = $response_body['url'];
                $isAttachment = true;
                $mediaType = $request->media_type;
                $msgType = explode('/', $mediaType)[0];
            }
        }

        if ($isAttachment) {
            $document = new Document();
            $filePath = $document->storeDocument($mediaType, $fileUrl, $messagableId, $account);

            $messageData['msg_type'] = $msgType;
            $messageData['file_path'] = $filePath;
        }

        $this->processMessage($messageData);
        return response()->json(['status' => true, 'message' => 'Message stored successfully.'], 200);
    }

    /**
     * Return product list
     */
    public function getProducts()
    {

        $query = Product::select('products.id', 'products.name', 'products.retailer_id', 'catalogs.catalog_id as catalog_id');
        $query->where('products.catalog_id', '!=', NULL);
        $query->leftjoin('catalogs', 'catalogs.id', 'products.catalog_id');

        $products = $query->limit(5)->get();

        return $products;
    }

    /**
     * Return Interactive messages list
     */
    public function getInteractiveMessages()
    {
        $interactiveMessages = InteractiveMessage::where('is_active', true)->get();

        return $interactiveMessages;
    }
}
