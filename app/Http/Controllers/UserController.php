<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Account;
use App\Models\Message;
use App\Models\MessageButton;
use App\Models\Template;
use Inertia\Inertia;
use App\Rules\MatchOldPassword;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use App\Models\MailToAddress;
use App\Models\OutgoingServerConfig;
use Swift_Mailer;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Mail;
use App\Http\Controllers\TemplateController;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Models\Msg;
use App\Models\Price;
use App\Models\WebhookEvent;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use PDF;
use Cache;
use DB;

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
    public $userRoles = [
    //    'global_admin' => 'Global Admin',
        'regular' => 'Regular',
        'admin' => 'Admin'
    ];
    public $categories = [
        'TRANSACTIONAL' => 'TRANSACTIONAL',
        'MARKETING' => 'MARKETING',
        'OTP' => 'OTP'
    ];
    public $timezones = array(
        'Pacific/Midway'       => "(GMT-11:00) Midway Island",
        'US/Samoa'             => "(GMT-11:00) Samoa",
        'US/Hawaii'            => "(GMT-10:00) Hawaii",
        'US/Alaska'            => "(GMT-09:00) Alaska",
        'US/Pacific'           => "(GMT-08:00) Pacific Time (US &amp; Canada)",
        'America/Tijuana'      => "(GMT-08:00) Tijuana",
        'US/Arizona'           => "(GMT-07:00) Arizona",
        'US/Mountain'          => "(GMT-07:00) Mountain Time (US &amp; Canada)",
        'America/Chihuahua'    => "(GMT-07:00) Chihuahua",
        'America/Mazatlan'     => "(GMT-07:00) Mazatlan",
        'America/Mexico_City'  => "(GMT-06:00) Mexico City",
        'America/Monterrey'    => "(GMT-06:00) Monterrey",
        'Canada/Saskatchewan'  => "(GMT-06:00) Saskatchewan",
        'US/Central'           => "(GMT-06:00) Central Time (US &amp; Canada)",
        'US/Eastern'           => "(GMT-05:00) Eastern Time (US &amp; Canada)",
        'US/East-Indiana'      => "(GMT-05:00) Indiana (East)",
        'America/Bogota'       => "(GMT-05:00) Bogota",
        'America/Lima'         => "(GMT-05:00) Lima",
        'America/Caracas'      => "(GMT-04:30) Caracas",
        'Canada/Atlantic'      => "(GMT-04:00) Atlantic Time (Canada)",
        'America/La_Paz'       => "(GMT-04:00) La Paz",
        'America/Santiago'     => "(GMT-04:00) Santiago",
        'Canada/Newfoundland'  => "(GMT-03:30) Newfoundland",
        'America/Buenos_Aires' => "(GMT-03:00) Buenos Aires",
        'Greenland'            => "(GMT-03:00) Greenland",
        'Atlantic/Stanley'     => "(GMT-02:00) Stanley",
        'Atlantic/Azores'      => "(GMT-01:00) Azores",
        'Atlantic/Cape_Verde'  => "(GMT-01:00) Cape Verde Is.",
        'Africa/Casablanca'    => "(GMT) Casablanca",
        'Europe/Dublin'        => "(GMT) Dublin",
        'Europe/Lisbon'        => "(GMT) Lisbon",
        'Europe/London'        => "(GMT) London",
        'Africa/Monrovia'      => "(GMT) Monrovia",
        'Europe/Amsterdam'     => "(GMT+01:00) Amsterdam",
        'Europe/Belgrade'      => "(GMT+01:00) Belgrade",
        'Europe/Berlin'        => "(GMT+01:00) Berlin",
        'Europe/Bratislava'    => "(GMT+01:00) Bratislava",
        'Europe/Brussels'      => "(GMT+01:00) Brussels",
        'Europe/Budapest'      => "(GMT+01:00) Budapest",
        'Europe/Copenhagen'    => "(GMT+01:00) Copenhagen",
        'Europe/Ljubljana'     => "(GMT+01:00) Ljubljana",
        'Europe/Madrid'        => "(GMT+01:00) Madrid",
        'Europe/Paris'         => "(GMT+01:00) Paris",
        'Europe/Prague'        => "(GMT+01:00) Prague",
        'Europe/Rome'          => "(GMT+01:00) Rome",
        'Europe/Sarajevo'      => "(GMT+01:00) Sarajevo",
        'Europe/Skopje'        => "(GMT+01:00) Skopje",
        'Europe/Stockholm'     => "(GMT+01:00) Stockholm",
        'Europe/Vienna'        => "(GMT+01:00) Vienna",
        'Europe/Warsaw'        => "(GMT+01:00) Warsaw",
        'Europe/Zagreb'        => "(GMT+01:00) Zagreb",
        'Europe/Athens'        => "(GMT+02:00) Athens",
        'Europe/Bucharest'     => "(GMT+02:00) Bucharest",
        'Africa/Cairo'         => "(GMT+02:00) Cairo",
        'Africa/Harare'        => "(GMT+02:00) Harare",
        'Europe/Helsinki'      => "(GMT+02:00) Helsinki",
        'Europe/Istanbul'      => "(GMT+02:00) Istanbul",
        'Asia/Jerusalem'       => "(GMT+02:00) Jerusalem",
        'Europe/Kiev'          => "(GMT+02:00) Kyiv",
        'Europe/Minsk'         => "(GMT+02:00) Minsk",
        'Europe/Riga'          => "(GMT+02:00) Riga",
        'Europe/Sofia'         => "(GMT+02:00) Sofia",
        'Europe/Tallinn'       => "(GMT+02:00) Tallinn",
        'Europe/Vilnius'       => "(GMT+02:00) Vilnius",
        'Asia/Baghdad'         => "(GMT+03:00) Baghdad",
        'Asia/Kuwait'          => "(GMT+03:00) Kuwait",
        'Africa/Nairobi'       => "(GMT+03:00) Nairobi",
        'Asia/Riyadh'          => "(GMT+03:00) Riyadh",
        'Europe/Moscow'        => "(GMT+03:00) Moscow",
        'Asia/Tehran'          => "(GMT+03:30) Tehran",
        'Asia/Baku'            => "(GMT+04:00) Baku",
        'Europe/Volgograd'     => "(GMT+04:00) Volgograd",
        'Asia/Muscat'          => "(GMT+04:00) Muscat",
        'Asia/Tbilisi'         => "(GMT+04:00) Tbilisi",
        'Asia/Yerevan'         => "(GMT+04:00) Yerevan",
        'Asia/Kabul'           => "(GMT+04:30) Kabul",
        'Asia/Karachi'         => "(GMT+05:00) Karachi",
        'Asia/Tashkent'        => "(GMT+05:00) Tashkent",
        'Asia/Kolkata'         => "(GMT+05:30) Kolkata",
        'Asia/Kathmandu'       => "(GMT+05:45) Kathmandu",
        'Asia/Yekaterinburg'   => "(GMT+06:00) Ekaterinburg",
        'Asia/Almaty'          => "(GMT+06:00) Almaty",
        'Asia/Dhaka'           => "(GMT+06:00) Dhaka",
        'Asia/Novosibirsk'     => "(GMT+07:00) Novosibirsk",
        'Asia/Bangkok'         => "(GMT+07:00) Bangkok",
        'Asia/Jakarta'         => "(GMT+07:00) Jakarta",
        'Asia/Krasnoyarsk'     => "(GMT+08:00) Krasnoyarsk",
        'Asia/Chongqing'       => "(GMT+08:00) Chongqing",
        'Asia/Hong_Kong'       => "(GMT+08:00) Hong Kong",
        'Asia/Kuala_Lumpur'    => "(GMT+08:00) Kuala Lumpur",
        'Australia/Perth'      => "(GMT+08:00) Perth",
        'Asia/Singapore'       => "(GMT+08:00) Singapore",
        'Asia/Taipei'          => "(GMT+08:00) Taipei",
        'Asia/Ulaanbaatar'     => "(GMT+08:00) Ulaan Bataar",
        'Asia/Urumqi'          => "(GMT+08:00) Urumqi",
        'Asia/Irkutsk'         => "(GMT+09:00) Irkutsk",
        'Asia/Seoul'           => "(GMT+09:00) Seoul",
        'Asia/Tokyo'           => "(GMT+09:00) Tokyo",
        'Australia/Adelaide'   => "(GMT+09:30) Adelaide",
        'Australia/Darwin'     => "(GMT+09:30) Darwin",
        'Asia/Yakutsk'         => "(GMT+10:00) Yakutsk",
        'Australia/Brisbane'   => "(GMT+10:00) Brisbane",
        'Australia/Canberra'   => "(GMT+10:00) Canberra",
        'Pacific/Guam'         => "(GMT+10:00) Guam",
        'Australia/Hobart'     => "(GMT+10:00) Hobart",
        'Australia/Melbourne'  => "(GMT+10:00) Melbourne",
        'Pacific/Port_Moresby' => "(GMT+10:00) Port Moresby",
        'Australia/Sydney'     => "(GMT+10:00) Sydney",
        'Asia/Vladivostok'     => "(GMT+11:00) Vladivostok",
        'Asia/Magadan'         => "(GMT+12:00) Magadan",
        'Pacific/Auckland'     => "(GMT+12:00) Auckland",
        'Pacific/Fiji'         => "(GMT+12:00) Fiji",
    );
    

    /**
     * Show list of accounts related to logged in user
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $user_id = $user->id;
        $companyId = Cache::get('selected_company');

        $query = Account::select('company_name', 'service', 'accounts.id', 'accounts.status');
        if($user->role == 'admin'){
            $query->where('company_id' , $companyId);
        } else if($user->role = 'regular'){
            $query->where('user_id', $user_id)->get();
        }
        $accounts = $query->get();

        return Inertia::render('Dashboard', [
            'accounts' => $accounts,
            'translator' => [
                    'Dashboard'=>__('Dashboard'),
                    'Create new account'=>__('Create new account'),
                    'Business profiles'=>__('Business profiles'),
                    'No account'=>__('No account'),
                    'Get started by creating a new account.'=>__('Get started by creating a new account.'),
                    'Click here to create new account'=>__('Click here to create new account'),
                    'Confirm to Delete' =>  __('Confirm to Delete'),
                    'Are you sure to do this?' => __('Are you sure to do this?'),
                    'Yes' =>__('Yes'),
                    'No' =>__('No')  ]      
        ]);
    }

    /**
     * Show User list
     */
    public function usersListing(Request $request)
    {
        $list_view_columns = [
            'name' => [ 'label' => ' Name' , 'type' => 'text'],
            'email' =>  [ 'label' => 'Email' , 'type' => 'text'],
            'role' => [ 'label' => 'Role' , 'type' => 'text'],
            'status' =>  [ 'label' => 'Status' , 'type' => 'checkbox'],
            'created_at' =>  [ 'label' => 'Created at' , 'type' => 'datetime'],
        ];
        $module = new User();
        $listViewData = $this->listView( $request , $module, $list_view_columns);

        $moduleData = [
            'singular' => 'User',
            'plural' => 'Users',
            'module' => 'User',
            'add_link' => route('create_user'),
            'edit_link' => 'editUser',
            'add_button_text' => 'Add User',
            'current_page' => 'Users',
            // Actions
            'actions' => [
                'create' => true,
                'detail' => true,
                'edit' => true,
                'delete' => true,
                'export' => false,
                'import' => false,
                'search' => true,
                'filter' => false,
                'invite_user' => true,
            ],
            'translator' => [
                'No records' =>__('No records'),
                'Search' =>__('Search'),
                'Are you sure you want to delete the record?' => __('Are you sure you want to delete the record?')
            ],
        ];
        $data = array_merge($moduleData , $listViewData);
        return Inertia::render('Admin/User/UserList2', $data);
    }

    /**
     * Create User
     */
    public function createUser(Request $request)
    {
        $currentUser = $request->user();
        $user = new User();
        
        if($currentUser->role != 'regular'){
            return Inertia::render('Admin/User/CreateUser', [
                    'user' => $user, 
                    'currentUser' => $currentUser,
                    'time_zone' => $this->timezones,
                    'roles' => $this->userRoles,
                    'translator' => [
                        'Name' => __('Name'),
                        'Company name' => __('Company name'),
                        'Email' => __('Email'),
                        'Phone number' => __('Phone number'),
                        'Language' => __('Language'),
                        'Currency' => __('Currency'),
                        'Active Status' => __('Active Status'),
                        'Company Address' => __('Company Address'),
                        'Company Country' => __('Company Country'),
                        'Company VAT ID' => __('Company VAT ID'),
                        'Admin email for invoices' => __('Admin email for invoices'),
                        'Users'  => __('Users'),
                        'Personal Information' => __('Personal Information'),
                        'Time Zone' => __('Time Zone'),
                        'Edit User' => __('Edit User'),
                        'Save'  => __('Save'),
                        'Cancel' => __('Cancel')
                    ]
                ]);
        } else {
            return Redirect(route('dashboard'));
        }
    }

    /**
     * Edit User
     */
    public function editUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $password = $user->password;
        $currentUser = $request->user();
        
        if($currentUser->role != 'regular' || $user->id == $currentUser->id){
            return Inertia::render('Admin/User/CreateUser', [
                    'user' => $user, 
                    'password' => $password, 
                    'currentUser' => $currentUser,
                    'time_zone' => $this->timezones,
                    'roles' => $this->userRoles,
                    'translator' => [
                        'Name' => __('Name'),
                        'Company name' => __('Company name'),
                        'Email' => __('Email'),
                        'Phone number' => __('Phone number'),
                        'Language' => __('Language'),
                        'Currency' => __('Currency'),
                        'Active Status' => __('Active Status'),
                        'Company Address' => __('Company Address'),
                        'Company Country' => __('Company Country'),
                        'Company VAT ID' => __('Company VAT ID'),
                        'Admin email for invoices' => __('Admin email for invoices'),
                        'Users'  => __('Users'),
                        'Personal Information' => __('Personal Information'),
                        'Time Zone' => __('Time Zone'),
                        'Edit User' => __('Edit User'),
                        'Save'  => __('Save'),
                        'Cancel' => __('Cancel')
                    ]
                ]);
        } else {
            return Redirect(route('dashboard'));
        }
    }

    /**
     * Show Detail view
     */
    public function userDetail(Request $request, $id = '')
    {
        if($id){
            $query = User::where('id' ,$id);
            if( $request->user()->role == 'admin'){
                $companyId = Cache::get('selected_company');
                $query->join('company_user' ,'user_id', 'users.id');
                $query->where('company_id' , $companyId);
            }
            $user = $query->first();
        } else {
            $user = $request->user();
        }
        if(! $user){
            about(401);
        }

        $token = $user->api_token;
        return Inertia::render('Admin/User/UserDetail', [
                'user' => $user, 
                'token' => $token,
                'current_user' => $request->user(),
                'time_zone' => $this->timezones,
                'translator' => [
                    'Name' => __('Name'),
                    'New Password' => __('New Password'),
                    'Confirm Password' => __('Confirm Password'),
                    'User Detail'  => __('User Detail'),
                    'Company name' => __('Company name'),
                    'Email' => __('Email'),
                    'Token' => __('Token'),
                    'Phone number' => __('Phone number'),
                    'Language' => __('Language'),
                    'Currency' => __('Currency'),
                    'Active Status' => __('Active Status'),
                    'Company Address' => __('Company Address'),
                    'Company Country' => __('Company Country'),
                    'Company VAT ID' => __('Company VAT ID'),
                    'Admin email for invoices' => __('Admin email for invoices'),
                    'Users'  => __('Users'),
                    'Personal Information' => __('Personal Information'),
                    'Edit User' => __('Edit User'),
                    'Change Password' => __('Change Password'),
                    'Change' => __('Change'),
                    'Close' => __('Close'),
                    'Confirm Password'  => __('Confirm Password'),
                    'New Password' => __('New Password'),
                    'Personal Information' => __('Personal Information'),
                    'Billing Information' => __('Billing Information'),
                    'The new password and confirm password must match' => __('The new password and confirm password must match'),
                    'Time Zone' => __('Time Zone'),
                    'Do you want change the user token?' => __('Do you want change the user token?')
                ]
            ]);
    }

    /**
     * Save user data
     */
    public function storeUserRegistration(Request $request)
    {
        Log::info('Save user data process start');
        if(($request->get('id') == $request->user()->id) ||  $request->user()->role != 'regular'){
           
            if (!$request->get('id')) {
                $request->validate([
                    'last_name' => 'required|max:255',
                    'email' => 'required|unique:users|max:255',
                //    'role' => 'required|max:255'
                ]);
                $user = new User();
                $password = bin2hex(openssl_random_pseudo_bytes(8));
                $user->password = bcrypt($password);
            } else {
                $user = User::findOrFail($request->get('id'));
            }

            $user->first_name = $request->get('first_name');
            $user->last_name = $request->get('last_name');
            $user->name =  $request->get('first_name') . ' ' .$request->get('last_name');
            $user->email = $request->get('email');
            $user->company_name = $request->get('company_name');
            $user->phone_number = $request->get('phone_number');
            $user->language = $request->get('language');
            $user->currency = $request->get('currency');
            $user->time_zone = $request->get('time_zone');
            $user->company_address = $request->get('company_address');
            $user->company_country = $request->get('company_country');
            $user->company_vat_id = $request->get('company_vat_id');
            $user->codice_destinatario = $request->get('codice_destinatario');
            $user->admin_email = $request->get('admin_email');

            if( $request->user()->role != 'regular') {
                $user->role = ($request->get('role')) ? $request->get('role') : 'regular';
                $user->status = $request->get('status');
            }

            $company = Cache::get('selected_company');
            $_REQUEST['company_id'] = $company;
            
            $user->save();
            $user_id = $user->id;
            if (!$request->get('id') && $company) {
                DB::table('company_user')->insert([
                    'user_id' => $user_id,
                    'company_id' => $company
                ]);
            }
            Log::info('Record saved successfully.');
            return Redirect::route('user_profile', $user_id);
        }
        
        return Redirect::route('dashboard');
    }

    /**
     * Change user login password
     */
    public function changePassword(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $currentUser = $request->user();
       
        if($currentUser->id == $user->id ){
            $request->validate([
                'current_password' => ['required', new MatchOldPassword],
                'new_password' => 'required|min:8',
                'confirm_password' => 'required|min:8|required_with:confirm_password|same:new_password',
            ]);
        } else {
            $request->validate([
                'new_password' => 'required|min:8',
                'confirm_password' => 'required|min:8|required_with:confirm_password|same:new_password',
            ]);
        }

        $user->update(['password'=> Hash::make($request->new_password)]);
        Log::info('Password changed successfully.');
        return Redirect::route('detailUser', $id);
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
            abort(401, __('You are not authorised to see this record.'));
        }

        $templates = Template::where('account_id', $id)->get();
        $webhookEvents = WebhookEvent::where('account_id', $id)->get();

        $field_info = [
            'company_name' => ['label' => __('Name')],
            'service' => ['label' => __('Service')],
            // 'company_type' => ['label' => 'Company type'],
            // 'website' => ['label' => 'Website'],
            // 'email' => ['label' => 'Email'],
            // 'estimated_launch_date' => ['label' => 'Estimated launch date'],
            // 'type_of_integration' => ['label' => 'Type of integration'],
            'display_name' => ['label' => __('Display name'), 'show' => ['whatsapp']],
            'phone_number' => ['label' => __('Phone number'), 'show' => ['whatsapp']],
            'src_name' => ['label' => __('Source name'), 'show' => ['whatsapp', 'instagram']],
            'api_partner' => ['label' => __('API partner'), 'show' => ['whatsapp']],
            'api_partner_name' => ['label' => __('API partner Name'), 'show' => ['whatsapp']],
            'business_manager_id' => ['label' => __('Business manager ID'), 'show' => ['whatsapp']],
            'Profile' => __('Profile'),
            'Callback URL' => __('Callback URL')
            // 'profile_picture' => ['label' => 'Profile picture', 'type' => 'image', 'show' => ['whatsapp']],
            // 'profile_description' => ['label' => 'Profile description', 'show' => ['whatsapp']],
            // 'status' => ['label' => 'Status'],
        ];

        return Inertia::render('Account/Detail', [
            'account' => $account,
            'field_info' => $field_info,
            'templates' => $templates,
            'webhook_events' => $this->webhook_events,
            'categories' => $this->categories,
            'events' => $webhookEvents ? $webhookEvents : [],
            'translator' => [
                'Edit' => __('Edit'),
                'Are you sure you want to delete this webhook event?'  => __('Are you sure you want to delete this webhook event?'),
                'Profile Info'  => __('Profile Info'),
                'Profile Information'  => __('Profile Information'),
                'Templates'  => __('Templates'),
                'Add template' => __('Add template'),
                'No templates found' => __('No templates found'),
                'Get started by creating a new template.' =>  __('Get started by creating a new template.'),
                'Click here to create new template' => __('Click here to create new template'),
                'Add Webhook URL' => __('Add Webhook URL'),
                'Webhooks not configured yet.' => __('Webhooks not configured yet.'),
                'Add template'  => __('Add template'),
                'Create a new WhatsApp template. Each template must have a unique name consisting of lowercase alphanumeric characters.Spaces must be replaced with underscores (_). Only WhatsApp templates within the pre-defined categories can be accepted.' => __('Create a new WhatsApp template. Each template must have a unique name consisting of lowercase alphanumeric characters.Spaces must be replaced with underscores (_). Only WhatsApp templates within the pre-defined categories can be accepted.'),
                'Name' => __('Name'),
                'Template name' => __('Template name'),
                'Category' => __('Category'),
                'Languages' => __('Languages'),
                'Create' => __('Create'),
                'Close'  => __('Close'),
                'Update' => __('Update'),
                'Add'    => __('Add'),
                'Create a new WhatsApp Webhook URL to receive notifications about events like sent, failed etc...'  => __('Create a new WhatsApp Webhook URL to receive notifications about events like sent, failed etc...'),
                'Enqueued' => __('Enqueued'),
                'Failed' => __('Failed'),
                'Read' => __('Read'),
                'Sent' => __('Sent'),
                'Delivered' => __('Delivered'),
                'Delete' => __('Delete'),
                'Template events' => __('Template events'),
                'Account related events' => __('Account related events'),
                'Return sent messasge enqueue response to callback url' => __('Return sent messasge enqueue response to callback url')

            ]
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
            'translator' => [
                'Account Registration' => __('Account Registration'),
                'Account Information' =>  __('Account Information'),
                'Enter your company information. We will be using this information to create your business account' =>  __('Enter your company information. We will be using this information to create your business account'),
                'Name' => __('Name'),
                'Enter your Account name' => __('Enter your Account name'),
                'Company Name' =>  __('Company Name'),
                'Enter your company name' =>  __('Enter your company name'),
                'Service' =>  __('Service'),
                'Company type' =>  __('Company type'),
                'Company website' =>  __('Company website'),
                'Enter your company website' =>  __('Enter your company website'),
                'Email (Technical point of contact' =>  __('Email (Technical point of contact)'),
                'Estimated launch date' =>  __('Estimated launch date'),
                'Type of integration' =>  __('Type of integration'),
                'Whatsapp Information' =>  __('Whatsapp Information'),
                'Instagram Information' =>  __('Instagram Information'),
                'Information will be used to create your whatsapp business account' =>  __('Information will be used to create your whatsapp business account'),
                'Information will be used to create your instagram business account' =>  __('Information will be used to create your instagram business account'),
                'Phone number' =>  __('Phone number'),
                'Source Name' =>  __('Source Name'),
                'Display Name' =>  __('Display Name'),
                'API partner Name' => __('API partner Name'),
                'Business manager Id' =>  __('Business manager Id'),
                'Profile picture' =>  __('Profile picture'),
                'Profile description' =>  __('Profile description'),
                'Official business account' =>  __('Official business account'),
                'Request for Whatsapp official business account (OBA).' =>  __('Request for Whatsapp official business account (OBA).'),
                'Cancel' =>  __('Cancel'),'Save' =>  __('Save'),
                'Sole Proprietorship' =>  __('Sole Proprietorship'),
                'Partnership' =>  __('Partnership'),'Limited Liability Company (LLC)' =>  __('Limited Liability Company (LLC)'),
                'Corporation' =>  __('Corporation'),'Website' =>  __('Website'),'Support' =>  __('Support')]


        ]);
    }

    /**
     * Show account registration form
     */
    public function accountRegistration(Request $request)
    {
        return Inertia::render('Account/Registration', [
            'webhook_events' => $this->webhook_events, 
            'translator' => [
                'Account Registration' => __('Account Registration'),
                'Account Information' =>  __('Account Information'),
                'Enter your company information. We will be using this information to create your business account' =>  __('Enter your company information. We will be using this information to create your business account'),
                'Name' => __('Name'),
                'Enter your Account name' => __('Enter your Account name'),
                'Company Name' =>  __('Company Name'),
                'Enter your company name' =>  __('Enter your company name'),
                'Service' =>  __('Service'),
                'Company type' =>  __('Company type'),
                'Company website' =>  __('Company website'),
                'Enter your company website' =>  __('Enter your company website'),
                'Email (Technical point of contact' =>  __('Email (Technical point of contact)'),
                'Estimated launch date' =>  __('Estimated launch date'),
                'Type of integration' =>  __('Type of integration'),
                'Whatsapp Information' =>  __('Whatsapp Information'),
                'Instagram Information' =>  __('Instagram Information'),
                'Information will be used to create your whatsapp business account' =>  __('Information will be used to create your whatsapp business account'),
                'Information will be used to create your instagram business account' =>  __('Information will be used to create your instagram business account'),
                'Phone number' =>  __('Phone number'),
                'Source Name' =>  __('Source Name'),
                'Display Name' =>  __('Display Name'),
                'API partner Name' => __('API partner Name'),
                'Do you agree with our' =>__('Do you agree with our'),'terms and conditions?' => __('terms and conditions?'),
                'Business manager Id' =>  __('Business manager Id'),
                'Profile picture' =>  __('Profile picture'),
                'Profile description' =>  __('Profile description'),
                'Official business account' =>  __('Official business account'),
                'Request for Whatsapp official business account (OBA).' =>  __('Request for Whatsapp official business account (OBA).'),
                'Cancel' =>  __('Cancel'),'Save' =>  __('Save'),
                'Sole Proprietorship' =>  __('Sole Proprietorship'),
                'Partnership' =>  __('Partnership'),'Limited Liability Company (LLC)' =>  __('Limited Liability Company (LLC)'),
                'Corporation' =>  __('Corporation'),'Website' =>  __('Website'),'Support' =>  __('Support')]

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
                'service' => 'required'
            ]);
        }
        else {
            $request->validate([
                'company_name' => 'required|max:255',
                'service' => 'required',
            ]);
        }

        if($id) {
            $account = Account::findOrFail($id);
        }
        else {
            $account = new Account();

            if($service == 'whatsapp') {
                // Storing the profile picture
            //    $path = $request->file('profile_picture')->store('profile_pictures');
            //    $account->profile_picture = $path;
            }
            $account->status = 'New'; // Setting the status as New.
        }

        $fields = [
            'company_name', 'service', 'phone_number', 'src_name', 'business_manager_id', 'api_partner','display_name','api_partner_name'
        ];
        foreach ($fields as $field_name) {
            $field_value = $request->get($field_name);
            $account->$field_name = $field_value;
        }
        
        // Setting logged in user id
        $account->user_id = $user_id;
        $account->company_id = Cache::get('selected_company');
        
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
        $account = Account::where('id', $accountId)->delete();
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

    /**
     * Wallet page
     */
    public function wallet(Request $request)
    {
        $user = $request->user();
        $wallet = Wallet::where('user_id', $user->id)->first();
        
        $balance = 0.00;
        if($wallet) {
            $balance = $wallet->balance_amount;
        }
        
        // Get message amount deduction
        $messageDeduction = $this->getAmountDeduction($user->id);
 
        $paymentMethods = $user->paymentMethods();

        $stripe_public_key = env('STRIPE_KEY');

        return Inertia::render('Wallet/Index', [
            'name' => $user->name,
            'balance' => $balance,
            'message_deduction' => $messageDeduction,
            'paymentMethods' => $paymentMethods,
            'stripe_public_key' => $stripe_public_key,
            'current_page' => 'Wallet',
            'translator' => [
                'Wallet' => __('Wallet'),
                'Hi' => __('Hi'),
                'Welcome to your Wallet' => __('Welcome to your Wallet'),
                'Here you can see your payments, change your payment method and get your invoices.' => __('Here you can see your payments, change your payment method and get your invoices.'),
                'Available Balance' => __('Available Balance'),
                'Add Balance' => __('Add Balance'),
                'This Month' => __('This Month'),
                'Total Spent' => __('Total Spent'),
                'Business Initiated Chat' => __('Business Initiated Chat'),
                'User Initiated Chat' => __('User Initiated Chat'),
                'Free Entry Point Chats' => __('Free Entry Point Chats'),
                'Messages' => __('Messages'),
                'Your Payment Method' => __('Your Payment Method'),
                'Add a Payment Method' => __('Add a Payment Method'),
                'See Transactions History' => __('See Transactions History'),
                'See Details' => __('See Details'),
                'Download your VAT Invoices' => __('Download your VAT Invoices'),'Go to Invoices'=>__('Go to Invoices'),
                'Recharge your account'=> __('Recharge your account'),'Cancel'=> __('Cancel'),'Enter the amount' => __('Enter the amount')
                
                
            ]
        ]);
    }

    /**
     * Charge the user and update the balance
     */
    public function charge(Request $request)
    {
        $user = $request->user();
        $user_id = $user->id;
        $amount = $request->get('amount') * 100;
        try {
            $params = [
                'description' => 'OneMessage recharge',
                'customer' => $user->stripe_id,
            ];

            $stripeCharge = $user->charge(
                $amount, $request->get('id'), $params
            );

            if($stripeCharge->id) {
                $wallet = Wallet::where('user_id', $user_id)->first();
                if(!$wallet) {
                    $wallet = new Wallet();
                    $wallet->user_id = $user_id;
                    $wallet->balance_amount = $amount / 100;
                }
                else {
                    $wallet->balance_amount = $wallet->balance_amount + ($amount / 100);
                }
                $wallet->save();

                // New transaction
                $transaction = new Transaction();
                $transaction->service = 'Stripe';
                $transaction->transaction_id = $stripeCharge->id;
                $transaction->amount = $amount / 100;
                $transaction->status = 'success';
                $transaction->user_id = $user_id;
                $transaction->company_id = Cache::get('selected_company');
                $transaction->save();
            }
        }
        catch (\Exception $e) {
            $transaction = new Transaction();
            $transaction->service = 'Stripe';
            $transaction->transaction_id = '-';
            $transaction->amount = $amount / 100;
            $transaction->status = 'failed';
            $transaction->error_message = $e->getMessage();
            $transaction->user_id = $user_id;
            $transaction->company_id = Cache::get('selected_company');
            $transaction->save();

            throw ValidationException::withMessages(['amount' => $e->getMessage()]);
        }

        return response()->json(['status' => true, 'message' => 'Payment successful']);
    }

    /**
     * Return user balance
     */
    public function userBalance(Request $request)
    {
        $user_id = $request->user()->id;
        $balance = Wallet::where('user_id', $user_id)
                    ->pluck('balance_amount')
                    ->first();

        return response()->json(['status' => true, 'balance' => $balance]);
    }

    /**
     * Transactions list view
     */
    public function transactions(Request $request)
    {
        // List view columns to show
        $list_view_columns = [
            'service' => [ 'label' => __('Service') , 'type' => 'text'],
            'transaction_id' => [ 'label' => __('Transaction Id') , 'type' => 'text'],
            'amount' => [ 'label' => __('Amount') , 'type' => 'text'],
            'status' => [ 'label' => __('Status') , 'type' => 'text'],
            'error_message' => [ 'label' => __('Message') , 'type' => 'text'],
            'created_at' => [ 'label' => __('Created At') , 'type' => 'text']
        ];

        $search = $request->has('search') && $request->get('search') ? $request->get('search') : '';
        $sort_by = $request->has('sort_by') && $request->get('sort_by') ? $request->get('sort_by') : 'created_at';
        $sort_order = $request->has('sort_order') && $request->get('sort_order') ? $request->get('sort_order') : 'desc';

        $user_id = $request->user()->id;
        if($search) {
            $records = Transaction::orderBy($sort_by, $sort_order)
                        ->where('user_id', $user_id)
                        ->where(function ($query) use ($search, $list_view_columns) {    
                            foreach($list_view_columns as $field_name => $field_info) {
                                $query->orWhere($field_name, 'like', '%' . $search . '%');
                            }
                        })
                        ->paginate($this->per_page);
        }
        else {
            $records = Transaction::orderBy($sort_by, $sort_order)
                        ->where('user_id', $user_id)
                        ->paginate($this->per_page);
        }
        
        return Inertia::render('Wallet/Transactions', [
            'records' => $records->items(),
            'singular' => __('Transaction'),
            'plural' => __('Transactions'),
            'module' => 'Transaction',
            'search' => $search,
            'actions' => [
                'create' => false,
                'edit' => false,
                'delete' => false,
                'export' => false,
                'import' => false,
                'download' => true,
            ],
            // Sorting
            'sort_by' => $sort_by,
            'sort_order' => $sort_order,
            'compact_type' => 'condense',
            'list_view_columns' => $list_view_columns,
            'translator' => [
                'No records' =>__('No records'),
                'Search' =>__('Search'),
                'Are you sure you want to delete the record?' => __('Are you sure you want to delete the record?')

            ],
            // Paginator
            'paginator' => [
                'firstPageUrl' => $records->url(1),
                'previousPageUrl' => $records->previousPageUrl(),
                'nextPageUrl' => $records->nextPageUrl(),
                'lastPageUrl' => $records->url($records->lastPage()),  
                'currentPage' => $records->currentPage(),
                'total' => $records->total(),
                'count' => $records->count(),
                'lastPage' => $records->lastPage(),
                'perPage' => $records->perPage(),
            ],
        ]);
    }

    /**
     * Return user invoices
     */
    public function invoices(Request $request)
    {
        $invoice = Transaction::find($request->id);
        if(!$invoice || ($invoice->user_id != $request->user()->id)) {
            abort(401);
        }

        $user = User::find($request->user()->id);
            view()->share('invoice',$invoice);
            view()->share('user',$user);

            $pdf = PDF::loadView('invoice');
          //$pdf->save(storage_path() . '/invoice');
            return $pdf->download('invoice.pdf');
    }

    /**
     * Return user amount deduction
     * 
     * @param INTEGER $user_id
     */
    public function getAmountDeduction($user_id)
    {
        //TODO Need to get country id for gettting price detail

        $countryId = 1;
        $price = Price::find($countryId);

        $messages = Msg::selectRaw(' count(msgs.id) as messages , sum(amount) as total , policy, amount ')
            ->leftJoin('accounts', 'account_id', 'accounts.id')
            ->where('user_id', $user_id)
            ->where('msgs.created_at', '>', now()->subDays(30)->endOfDay())
            ->whereNotNull('policy')
            ->groupBy('amount', 'policy')
            ->get();
           
        $return['total_messages'] = 0;
        $return['total_amount'] = 0;
        foreach($messages as $message){
          
            $return['total_messages'] = $message->messages + $return['total_messages'];
            $return['total_amount'] = $message->amount + $return['total_amount'];
           
            if($price->user_initiated == $message->amount){
                $return[$message->policy] = ['amount' => number_format($message->total , 4, '.', ''), 'count' => $message->messages];
            } else if($price->business_initiated == $message->amount) {
                $return[$message->policy] = ['amount' => number_format($message->total , 4, '.', '') , 'count' => $message->messages];
            } else {
                $return['messages'] = ['amount' => number_format($message->total , 4, '.', '') , 'count' => $message->messages];
            }
        }
        return $return; 
    }

    /**
     * Return selected company name
     */
    public function getSelectedCompany(Request $request)
    {
        $user = $request->user();
        $companies = $user->company;
        $selectedCompany = false;
        $selectedCompany = (Cache::has('selected_company')) ? Cache::get('selected_company') : '';
        if( ($companies && !$selectedCompany) && count($companies) == 1 && isset($companies[0]) ) {
            $selectedCompany = $companies[0]->id;
            Cache::put('selected_company', $companies[0]->id );
        }
        echo json_encode([
            'selected_company' => $selectedCompany,
            'companies' => $companies
        ]);
    }
}
