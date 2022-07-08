<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Account;
use App\Models\Message;
use App\Models\MessageButton;
use App\Models\Template;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use App\Models\MailToAddress;
use App\Models\OutgoingServerConfig;
use Swift_Mailer;
use Illuminate\Support\Facades\Log;
use Mail;
use App\Http\Controllers\TemplateController;
use App\Models\WebhookEvent;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public $per_page = 15;

    public $webhook_events = [
        'enqueued' => ['label' => 'Enqueued', 'help_text' => 'Return sent messasge enqueue response to callback url'], 
        'failed' => ['label' => 'Failed', 'help_text' => 'Return sent messasge enqueue response to callback url'], 
        'read' => ['label' => 'Read', 'help_text' => 'Return sent messasge enqueue response to callback url'], 
        'sent' => ['label' => 'Sent', 'help_text' => 'Return sent messasge enqueue response to callback url'], 
        'delivered' => ['label' => 'Delivered', 'help_text' => 'Return sent messasge enqueue response to callback url'], 
        'delete' => ['label' => 'Delete', 'help_text' => 'Return sent messasge enqueue response to callback url'], 
        'template_events' => ['label' => 'Template events', 'help_text' => 'Return sent messasge enqueue response to callback url'], 
        'account_related_events' => ['label' => 'Account related events', 'help_text' => 'Return sent messasge enqueue response to callback url'],
    ];

    /**
     * Show list of accounts related to logged in user
     */
    public function dashboard(Request $request)
    {
        $user_id = $request->user()->id;
        $accounts = Account::where('user_id', $user_id)->get();
        return Inertia::render('Dashboard', ['accounts' => $accounts]);
    }

    /**
     * Show User list
     */
    public function usersListing(Request $request)
    {
        $users = User::paginate($this->per_page)->withQueryString();
        return Inertia::render('Admin/User/List', ['users' => $users]);
    }

    /**
     * Create User
     */
    public function createUser(Request $request)
    {
        $currentUser = $request->user();
        $user = new User();
        return Inertia::render('Admin/User/CreateUser', ['user' => $user, 'currentUser' => $currentUser]);
    }

    /**
     * Edit User
     */
    public function editUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $password = $user->password;
        $currentUser = $request->user();
        return Inertia::render('Admin/User/CreateUser', ['user' => $user, 'password' => $password, 'currentUser' => $currentUser]);
    }

    /**
     * Show Detail view
     */
    public function userDetail(Request $request, $id = '')
    {
        if($id){
            $user = User::findOrFail($id);
        } else {
            $user = $request->user();
        }
        
        $token = $user->api_token;
        return Inertia::render('Admin/User/UserDetail', ['user' => $user, 'token' => $token]);
    }

    /**
     * Save user data
     */
    public function storeUserRegistration(Request $request)
    {
        Log::info('Save user data process start');
        if (!$request->get('id')) {
            $request->validate([
                'name' => 'required|max:255',
                'email' => 'required|unique:users|max:255',
                'role' => 'required|max:255'
            ]);
            $user = new User();
            $password = bin2hex(openssl_random_pseudo_bytes(8));
            $user->password = bcrypt($password);
        } else {
            $user = User::findOrFail($request->get('id'));
        }

        $user->name = $request->get('name');
        $user->email = $request->get('email');
        $user->role = $request->get('role');
        $user->status = $request->get('status');

        $user->save();
        Log::info('Record saved successfully.');
        return Redirect::route('user');
    }

    /**
     * Change user login password
     */
    public function changePassword(Request $request, $id)
    {
        Log::info('Password change process start');
        $user = User::findOrFail($id);
        $request->validate([
            'new_password' => 'required|min:8|required_with:confirm_password|same:confirm_password',
            'confirm_password' => 'required|min::8',
        ]);
        $user->password = bcrypt($request->get('new_password'));
        $user->save();
        Log::info('Password changed successfully.');
        return Redirect::route('user_detail', $id);
    }

    /**
     * Regenerate access Token
     */
    public function regenerateToken(Request $request)
    {
        $user_id = $request->user()->id;
        $token = $this->createAccessToken($user_id);
        Log::info('Token Generated.');
        echo json_encode(['token' => $token->plainTextToken]);
    }

    /**
     * Create access token to the user
     */
    public function createAccessToken($user_id)
    {
	$user = User::findOrFail($user_id);
        // Delete existing token
        Auth::user()->tokens->each(function($token) {
            $token->delete();
        });
        $token = $user->createToken('API_TOKEN');
        $user->api_token = $token->plainTextToken;
        $user->save();
        return $token;
    }

    /**
     * Delete User form list
     */
    public function deleteUser(Request $request)
    {
        $id = $request->get('id');
        $user = User::find($id);

        if ($user->delete()) {
            Log::info('User deleted.');
            return response()->json(['success' => true, 'url' => '/admin/user', 'success' => 'Record deleted'], 200);
        }
    }

    /**
     * Show detail view of account
     */
    public function showAccount(Request $request, $id)
    {
        $user_id = $request->user()->id;
        $account = Account::where('user_id', $user_id)
            ->where('id', $id)
            ->first();

        if (!$account) {
            abort(401, 'You are not authorised to see this record.');
        }

        $templates = Template::where('account_id', $id)->get();
        $webhookEvents = WebhookEvent::where('account_id', $id)->get();

        $field_info = [
            'company_name' => ['label' => 'Company name'],
            'service' => ['label' => 'Service'],
            'company_type' => ['label' => 'Company type'],
            'website' => ['label' => 'Website'],
            'email' => ['label' => 'Email'],
            'estimated_launch_date' => ['label' => 'Estimated launch date'],
            'type_of_integration' => ['label' => 'Type of integration'],
            'display_name' => ['label' => 'Display name', 'show' => ['whatsapp']],
            'phone_number' => ['label' => 'Phone number', 'show' => ['whatsapp']],
            'src_name' => ['label' => 'Source name', 'show' => ['whatsapp']],
            'business_manager_id' => ['label' => 'Business manager ID', 'show' => ['whatsapp']],
            'profile_picture' => ['label' => 'Profile picture', 'type' => 'image', 'show' => ['whatsapp']],
            'profile_description' => ['label' => 'Profile description', 'show' => ['whatsapp']],
            'status' => ['label' => 'Status'],
        ];

        return Inertia::render('Account/Detail', [
            'account' => $account,
            'field_info' => $field_info,
            'templates' => $templates,
            'webhook_events' => $this->webhook_events,
            'events' => $webhookEvents ? $webhookEvents : [],
        ]);
    }

    /**
     * Edit Account Data
     */
    public function editAccountData($id)
    {
        $account = Account::findOrFail($id);
        $webhook = WebhookEvent::where('account_id', $account->id)->first();
        return Inertia::render('Account/Registration', [
            'account' => $account, 
            'webhook_events' => $this->webhook_events, 
            'events' => $webhook,
        ]);
    }

    /**
     * Show account registration form
     */
    public function accountRegistration(Request $request)
    {
        return Inertia::render('Account/Registration', [
            'webhook_events' => $this->webhook_events, 
        ]);
    }

    /**
     * Store account registration
     */
    public function storeAccountRegistration(Request $request)
    {
        $user_id = $request->user()->id;

        $id = false;
        $service = $request->get('service');
        if ($request->has('id') && $request->get('id') > 0) {
            $id = $request->get('id');
        }

        if($service == 'whatsapp') {
            $phone_validation = 'required|numeric|unique:accounts';
            if($id) {
                $phone_validation = 'required|numeric|unique:accounts,phone_number,' . $request->get('id');
            }

            $request->validate([
                'company_name' => 'required|max:255',
                'company_type' => 'required',
                'website' => 'required|max:255',
                'email' => 'required|max:255|email',
                'service' => 'required',
                'estimated_launch_date' => 'required|date',
                'type_of_integration' => 'required',
                'phone_number' => $phone_validation,
                'display_name' => 'required|max:255',
                'business_manager_id' => 'required|max:255',
                'profile_description' => 'required|max:139',
                'oba' => 'required|boolean',
            ]);
        }
        else {
            $request->validate([
                'company_name' => 'required|max:255',
                'company_type' => 'required',
                'website' => 'required|max:255',
                'email' => 'required|max:255|email',
                'service' => 'required',
                'estimated_launch_date' => 'required|date',
                'type_of_integration' => 'required',
            ]);
        }

        if($id) {
            $account = Account::findOrFail($id);
        }
        else {
            $account = new Account();

            if($service == 'whatsapp') {
                // Storing the profile picture
                $path = $request->file('profile_picture')->store('profile_pictures');
                $account->profile_picture = $path;
            }
            $account->status = 'New'; // Setting the status as New.
        }

        $fields = [
            'company_name', 'company_type', 'website', 'email', 'service',
            'estimated_launch_date', 'type_of_integration', 'phone_number', 'src_name', 'display_name',
            'business_manager_id', 'profile_description', 'oba'
        ];

        foreach ($fields as $field_name) {
            $field_value = $request->get($field_name);
            $account->$field_name = $field_value;
        }
        
        // Setting logged in user id
        $account->user_id = $user_id;
        $account->save();

        return Redirect::route('dashboard');
    }

    /**
     * Delete account 
     */
    public function deleteAccount(Request $request)
    {
        $accountId = $request->get('id');
        $user_id = $request->user()->id;
        Account::destroy($accountId);
        $accounts = Account::where('user_id', $user_id)->get();
        echo json_encode(['accounts' => $accounts]);
        die;
    }

    /**
     * Show template form
     */
    public function newTemplate($account_id)
    {
        return Inertia::render('Account/Template/New', ['account_id' => $account_id]);
    }

    /**
     * Create new template
     */
    public function createNewTemplate(Request $request, $account_id)
    {
        Log::info('Save template process start');
        $request->validate([
            'template_name' => 'required|max:255',
            'category' => 'required',
            'languages' => 'required',
        ]);

        $template = new Template();
        $template->name = $request->get('template_name');
        $template->category = $request->get('category');
        $template->languages = $request->get('languages');
        $template->status = 'draft';
        $template->account_id = $account_id;
        $template->save();

        Log::info('Template saved successfully');
        return Redirect::route('account_view', $account_id);
    }

    /** 
     * Save template status
     */
    public function saveTemplateStatus(Request $request, $account_id, $template_id)
    {
        $template = Template::where('account_id', $account_id)
            ->where('id', $template_id)
            ->where('account_id', $account_id)
            ->first();

        $template->template_name_space = $request->get('template_name_space');
        $template->template_name = $request->get('template_name');
        $template->save();

        return Redirect::route('account_view', $account_id);
    }

    /**
     * Create new webhook event
     */
    public function createWebhookEvent(Request $request, $account_id)
    {
        $request->validate([
            'callback_url' => 'required',
        ]);

        $webhook = new WebhookEvent();
        $webhook->account_id = $account_id;    
        foreach($this->webhook_events as $webhook_event => $event_info) {
            $webhook->$webhook_event = $request->has($webhook_event) && ($request->get($webhook_event) === true || $request->get($webhook_event) == 1)  ? true : false;
        }
        $webhook->callback_url = $request->get('callback_url');
        $webhook->save();

        return Redirect::route('account_view', $account_id);
    }

    /**
     * Update webhook event
     */
    public function updateWebhookURL(Request $request, $account_id, $webhook_id)
    {
        $request->validate([
            'callback_url' => 'required',
        ]);

        $webhook = WebhookEvent::find($webhook_id);
        foreach($this->webhook_events as $webhook_event => $event_info) {
            $webhook->$webhook_event = $request->has($webhook_event) && ($request->get($webhook_event) === true || $request->get($webhook_event) == 1)  ? true : false;
        }
        $webhook->callback_url = $request->get('callback_url');
        $webhook->save();

        return Redirect::route('account_view', $account_id);
    }

    /**
     * Delete webhook event
     */
    public function deleteWebhookEvent(Request $request, $webhook_id)
    {
        $flag = false;
        // Check whether id is related to logged in users account
        $user_id = $request->user()->id;
        $accounts = Account::where('user_id', $user_id)->get();
        $webhook = WebhookEvent::find($webhook_id);
        $account_id = $webhook->account_id;
        foreach($accounts as $account) {
            if($account->id == $webhook->account_id) {
                $webhook->delete();
                $flag = true;
                break;
            }
        }
        
        if(!$flag) {
            abort(401, 'You are not authorised to delete this event');
        }

        return Redirect::route('account_view', $account_id);
    }

    /**
     * Template's detail view
     */
    public function templateDetailView(Request $request, $account_id, $template_id)
    {
        $user_id = $request->user()->id;
        $account = Account::where('user_id', $user_id)
            ->where('id', $account_id)
            ->first();

        if (!$account) {
            abort(401, 'You are not authorised to view this template');
        }

        $template = Template::where('account_id', $account_id)
            ->where('id', $template_id)
            ->first();

        // Setting language
        $language = $template->languages[0];
        if ($request->has('language')) {
            $language = $request->get('language');
        }

        $message = Message::where('template_id', $template_id)
            ->where('language', $language)
            ->first();

        if (!$message) {
            $message = new Message();
        }

        $message_buttons = [];
        if ($message->id) {
            $message_buttons = MessageButton::where('message_id', $message->id)->get();
        }

        return Inertia::render('Account/Template/Detail', [
            'template' => $template,
            'message' => $message,
            'language' => $language,
            'buttons' => $message_buttons,
        ]);
    }

    /**
     * Store template
     */
    public function storeTemplate(Request $request, $account_id, $template_id)
    {
        $validation_array = [
            'header_type' => 'required',
            'body' => 'max:1024',
            'body_footer' => 'max:60',
        ];

        if ($request->get('header_type') == 'text') {
            $validation_array['header_text'] = 'required|max:60';
        }

        $request->validate($validation_array);

        $user_id = $request->user()->id;
        $account = Account::where('user_id', $user_id)
            ->where('id', $account_id)
            ->first();

        if (!$account) {
            abort(401, 'You are not authorised to view this');
        }
        
        // Store Template Attachment
        $attachFilePath = '';
        if($request->file('attach_file')) {
            $file = $request->file('attach_file') ;
            $fileName = $file->getClientOriginalName() ;
            $destinationPath = public_path().'/attach_files' ;
            $file->move($destinationPath,$fileName);
            $attachFilePath = ['url' => asset('attach_files/'.$fileName), 'path' => $destinationPath.'/'.$fileName];
        }

        // Storing Message
        $message = Message::where('template_id', $template_id)
            ->where('language', $request->get('language'))
            ->first();

        if (!$message) {
            $message = new Message();
        }

        $message->header_type = $request->get('header_type');
        if ($message->header_type == 'text') {
            $message->header_content = $request->get('header_text');
        } else {
            $message->header_content = '';
        }

        $message->body = $request->get('body');
        $message->footer_content = $request->get('body_footer');
        $message->template_id = $template_id;
        $message->language = $request->get('language');
        $message->attach_file = isset($attachFilePath['url'])? $attachFilePath['url'] : '';
        $message->example = $request->get('example');
        $message->save();
        
        $message_id = $message->id;

        // Storing Buttons if available
        $buttons = $request->get('buttons');
        if (count($buttons) > 0) {
            foreach ($buttons as $button) {
                if ($button['button_type']) {
                    $buttonObj = new MessageButton();
                    if ($button['id']) {
                        $buttonObj = MessageButton::find($button['id']);
                    }

                    $buttonObj->button_type = $button['button_type'];
                    $buttonObj->body = $button['button_text'];
                    if ($buttonObj->button_type == 'Call to Action') {
                        $buttonObj->action = $button['action'];
                        if ($buttonObj->action == 'call_phone_number') {
                            $buttonObj->body = $button['button_text'];
                            $buttonObj->phone_number = $button['phone_number'];
                        } else {
                            $buttonObj->body = '';
                            $buttonObj->phone_number = '';
                        }

                        if ($buttonObj->action == 'visit_website') {
                            $buttonObj->url_type = $button['url_type'];
                            $buttonObj->url = $button['url'];
                        } else {
                            $buttonObj->url_type = '';
                            $buttonObj->url = '';
                        }
                    } else {
                        $buttonObj->action = '';
                        $buttonObj->phone_number = '';
                        $buttonObj->url_type = '';
                        $buttonObj->url = '';
                    }
                    $buttonObj->message_id = $message_id;
                    $buttonObj->save();
                }
            }
        }

        $template = Template::where('account_id', $account_id)
            ->where('id', $template_id)
            ->first();

        // Submit template to GupShup
        $tempController = new TemplateController();
        $tempController->account_id = $account_id;
        $result = $tempController->submitTemplate(['account_id' => $account_id, 'template_id' => $template_id, 'data' => $request, 'file' => $attachFilePath]);
        // TODO Show the above template result for user

        // Setting language
        $language = $template->languages[0];
        if ($request->has('language')) {
            $language = $request->get('language');
        }

        $message_buttons = MessageButton::where('message_id', $message_id)->get();

        /*
        // Send mail script
        $accFields = [
            'Company Name' => 'company_name', 'Company Type' => 'company_type', 'Company Service Website' =>  'website', 'Technical Point Of Contact' => 'email', 'Estimated Lunch Date' => 'estimated_launch_date', 'Type of Integration' => 'type_of_integration', 'Phone Number' => 'phone_number', 'Display Name' => 'display_name', 'Business Manager Id' => 'business_manager_id'
        ];

        $toAddressInfo = MailToAddress::where('user_id', $user_id)->first();

        // backup mailing configuration
        $backup = Mail::getSwiftMailer();
        $smtpConfigData = OutgoingServerConfig::where('user_id', $user_id)->first();
        if ($smtpConfigData) {

            // set mailing configuration
            $transport = new \Swift_SmtpTransport(
                $smtpConfigData->server_name,
                $smtpConfigData->port_num,
                $smtpConfigData->port_type
            );

            $transport->setUsername($smtpConfigData->user_name, $smtpConfigData->from_name);
            $transport->setPassword(unserialize(base64_decode($smtpConfigData->password)));

            $maildoll = new Swift_Mailer($transport);

            // set mailtrap mailer
            Mail::setSwiftMailer($maildoll);

            if ($toAddressInfo) {
                Mail::send(
                    'Mail.MailTemplate',
                    [
                        'account_data' => $account,
                        'template_data' => $template,
                        'temp_content' => $message,
                        'account_field' => $accFields,
                        'buttons' => $message_buttons,
                    ],
                    function ($message) use ($toAddressInfo, $template, $smtpConfigData) {
                        $message->to($toAddressInfo->to_email, $toAddressInfo->to_name)->subject($template->category . ' - ' . $template->name);
                        $message->from($smtpConfigData->from_email, $smtpConfigData->from_name);
                    }
                );
            }
            Mail::setSwiftMailer($backup);  // Set Mailer Original credential
        }*/

        return Inertia::render('Account/Template/Detail', [
            'template' => $template,
            'message' => $message,
            'language' => $language,
            'buttons' => $message_buttons,
        ]);
    }
}
