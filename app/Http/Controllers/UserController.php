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
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\TemplateController;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Models\Msg;
use App\Models\Company;
use App\Models\Price;
use App\Models\Field;
use App\Models\WhatsAppUsers;
use App\Models\SupportRequest;
use App\Models\WebhookEvent;
use App\Models\Plan;
use App\Models\Automation;
use App\Models\Session;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;
use Facebook\Facebook;
use PDF;
use Schema;
use Cache;
use DB;
use Mail;
use Illuminate\Support\Facades\Http;

class UserController extends Controller
{
    public $per_page = 15;

    private const EMAIL_PROVIDER_PRESETS = [
        'gmail' => [
            'host' => 'smtp.gmail.com',
            'port' => '587',
            'encryption' => 'tls',
        ],
        'google_workspace' => [
            'host' => 'smtp.gmail.com',
            'port' => '587',
            'encryption' => 'tls',
        ],
        'microsoft_365_outlook' => [
            'host' => 'smtp.office365.com',
            'port' => '587',
            'encryption' => 'tls',
        ],
        'sendgrid' => [
            'host' => 'smtp.sendgrid.net',
            'port' => '587',
            'encryption' => 'tls',
        ],
        'mailgun' => [
            'host' => 'smtp.mailgun.org',
            'port' => '587',
            'encryption' => 'tls',
        ],
    ];

    public $webhook_events = [
        'received' => ['label' => 'Received', 'help_text' => 'Return sent messasge received response to callback url'],
        'enqueued' => ['label' => 'Enqueued', 'help_text' => 'Return sent messasge enqueue response to callback url'],
        'failed' => ['label' => 'Failed', 'help_text' => 'Return sent messasge enqueue response to callback url'],
        'read' => ['label' => 'Read', 'help_text' => 'Return sent messasge enqueue response to callback url'],
        'sent' => ['label' => 'Sent', 'help_text' => 'Return sent messasge enqueue response to callback url'],
        'delivered' => ['label' => 'Delivered', 'help_text' => 'Return sent messasge enqueue response to callback url'],
        //    'delete' => ['label' => 'Delete', 'help_text' => 'Return sent messasge enqueue response to callback url'], 
        'template_events' => ['label' => 'Template events', 'help_text' => 'Return sent messasge enqueue response to callback url'],
        //    'account_related_events' => ['label' => 'Account related events', 'help_text' => 'Return sent messasge enqueue response to callback url'],
    ];

    public $userRoles = [
        'global_admin' => 'Global Admin',
        'regular' => 'Regular',
        'admin' => 'Admin'
    ];

    public $categories = [
        'AUTHENTICATION' => 'AUTHENTICATION',
        'MARKETING' => 'MARKETING',
        'UTILITY' => 'UTILITY'
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
     * Show home page 
     */
    public function home(Request $request)
    {
        $message = session()->get('message');
        if ($message) {
            session(['message' => '']);
        }
        $menuBar = $this->fetchMenuBar();

        return Inertia::render('Home', [
            'message' => $message,
            'menuBar' => $menuBar,
            'translator' => [
                'Hi' => __('Hi'),
                'It is a beautiful day to sell through your chats.' => __('It is a beautiful day to sell through your chats.'),
                'Use OneMessage to learn more about your customers, capture leads, create automations, send messages and geek out on analytics.' => __('Use OneMessage to learn more about your customers, capture leads, create automations, send messages and geek out on analytics.'),
                'All the best!' => __('All the best!')
            ],
        ]);
    }

    /**
     * Show list of accounts related to logged in user
     */
    public function socialProfile(Request $request)
    {

        $accounts = Account::select('company_name', 'service', 'accounts.id', 'accounts.status', 'fb_page_name')->get();
        $menuBar = $this->fetchMenuBar();

        return Inertia::render('Dashboard', [
            'accounts' => $accounts,
            'users' => $request->user(),
            'menuBar' => $menuBar,
            'translator' => Controller::getTranslations(),
        ]);
    }

    /**
     * dashboard
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $amountDeduction = $this->getMsgAmountDeduction($request, $user->id);
        $menuBar = $this->fetchMenuBar();

        //wallet balance
        $balance = Wallet::where('user_id', $user->id)
            ->pluck('balance_amount')
            ->first();

        // service data
        $service['total_messages'] = 0;
        $messages = Msg::selectRaw(' count(id) as messages , sum(amount) as total , policy ,service')->whereMonth('created_at', date('m'))
            ->whereYear('created_at', date('Y'))
            ->groupBy('service')->get();

        //daily_messages chart
        $daily_messages = Msg::selectRaw(' count(id) as messages , created_at as date,sum(amount) as total')->whereMonth('created_at', date('m'))
            ->whereYear('created_at', date('Y'))
            ->groupBy(DB::raw('DATE(created_at)'))->get();

        $per_day = [];
        foreach ($daily_messages as $val) {
            $per_day[$val->date] =  $val->messages;
        }
        $chart_input = implode($per_day);
        foreach ($messages as $message) {
            if ($message->service == 'whatsapp' || $message->service == 'facebook' || $message->service == 'instagram') {
                $service['total_messages'] = $message->messages + number_format($service['total_messages']);
            }
            if ($message->service == 'whatsapp') {
                $service[$message->service] = ['amount' => number_format($message->total, 3, '.', ''), 'count' => $message->messages];
            } else if ($message->service == 'instagram') {
                $service[$message->service] = ['amount' => number_format($message->total, 3, '.', ''), 'count' => $message->messages];
            } else if ($message->service == 'facebook') {
                $service[$message->service] = ['amount' => number_format($message->total, 3, '.', ''), 'count' => $message->messages];
            }
        }

        $msgTransactionList = $this->getTransactionList($request, 'Expenses', 'Dashboard');

        // Get Session count
        $sessions = $this->getDashboardSessionCount();
        $totalSessionLimit = $this->getDashboardSessionLimit();

        return Inertia::render('new_ui/DashboardNew', [
            'users' => $request->user(),
            'message_details' => $amountDeduction,
            'balance' => $balance,
            'services' => $service,
            'total_session_limit' => $totalSessionLimit,
            'current_session_count' => $sessions,
            'per_day_count' =>  $chart_input,
            'msgTransactionList' => $msgTransactionList,
            'translator' => [
                'Dashboard' => __('Dashboard'),
                'Confirm to Delete' =>  __('Confirm to Delete'),
                'Are you sure to do this?' => __('Are you sure to do this?'),
                'Yes' => __('Yes'),
                'No' => __('No'),
                'Conversations of this month' => __("Conversations of this month"),
                'Total' => __('Total'),
                'Daily average' => __('Daily average'),
                'Trend' => __('Trend'),
                'Business initiated chats' => __('Business initiated chats'),
                'User initiated chats' => __('User initiated chats'),
                'Your balance' => __('Your balance'),
                'Manual recharge' => __('Manual recharge'),
                'Spent this month' => __('Spent this month'),
                'Message log' => __('Message log'),
                'look closely' => __('look closely'),
                'Recharge your balance' => __('Recharge your balance'),
                'Recharge manually' => __('Recharge manually'),
                'Enter the amount:' => __('Enter the amount:'),
                'min' => __('min'),
                'Charge' => __('Charge'),
                'Set monthly auto-recharge' => __('Set monthly auto-recharge'),
                'Set threshold auto-recharge' => __('Set threshold auto-recharge'),
                'Set the minimum threshold from which to automatically reload' => __('Set the minimum threshold from which to automatically reload'),
                'Set threshold' => __('Set threshold'),
                'Set monthly limit to charge' => __('Set monthly limit to charge'),
                'Set auto-recharge' => __('Set auto-recharge'),
                'Disable' => __('Disable'),
                'Active' => __('Active'),
                'Message log' => __('Message log'),
                'Good Work!' => __('Good Work!'),
                'This month' => __('This month'),
                'No records found!' => __('No records found!'),
            ],
            'actions' => [
                'create' => false,
                'detail' => false,
                'edit' => false,
                'delete' => false,
                'export' => false,
                'import' => false,
                'search' => false,
                'filter' => false,
                'select_field' => false,
                'mass_edit' => false,
                'merge' => false
            ],
            'menuBar' => $menuBar
        ]);
    }

    /**
     * Show User list
     */
    public function usersListing(Request $request)
    {
        $list_view_columns = [
            'name' => ['label' => ' Name', 'type' => 'text'],
            'email' =>  ['label' => 'Email', 'type' => 'text'],
            'role' => ['label' => 'Role', 'type' => 'text'],
            'status' =>  ['label' => 'Status', 'type' => 'checkbox'],
            'created_at' =>  ['label' => 'Created at', 'type' => 'datetime'],
        ];

        $module = new User();

        $listViewData = $this->listView($request, $module, $list_view_columns);

        $moduleData = [
            'singular' => 'User',
            'plural' => 'Users',
            'module' => 'User',
            'add_link' => ($request->is('admin/*')) ?  route('create_global_user') : route('create_user'),
            'edit_link' => 'editUser',
            'add_button_text' => 'Add User',
            'current_page' => 'Users',
            'current_user' => $request->user(),
            // Actions
            'actions' => [
                'create' => true,
                'detail' => true,
                'edit' => true,
                'delete' => true,
                'unlink' => true,
                'export' => false,
                'import' => false,
                'search' => true,
                'filter' => false,
                'invite_user' => true,
                'select_field' => true

            ],
            'translator' => [
                'No records' => __('No records'),
                'Search' => __('Search'),
                'Are you sure you want to delete the record?' => __('Are you sure you want to delete the record?')
            ],
        ];

        $data = array_merge($moduleData, $listViewData);
        return Inertia::render('Admin/User/UserList2', $data);
    }
    /**
     * Show User Form (Create View)
     */
    public function createUser(Request $request)
    {
        $user = new User();
        $currentUser = $request->user();
        $user_roles = $this->getRoles($currentUser);

        if ($currentUser->role != 'regular') {
            return Inertia::render('Admin/User/CreateUser', [
                'user' => $user,
                'currentUser' => $currentUser,
                'time_zone' => $this->timezones,
                'roles' => $user_roles,
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
     * Show User Form (Edit View)
     */
    public function editUser(Request $request, $id)
    {
        $currentUser = $request->user();
        $flag = $this->checkPermission($currentUser, $id);
        if ($flag === false) {
            abort(401);
        }

        $user = User::find($id);
        $password = $user->password;
        $user_roles = $this->getRoles($currentUser);

        // Check global admin access
        if ($user->role == 'global_admin' && $currentUser->role != 'global_admin') {
            return Redirect::route('home');
        }

        // Permission roles
        $roleList = [];
        $roles = Role::all();
        foreach ($roles as $role) {
            $roleList[$role->id] = $role->name;
        }

        if ($currentUser->role != 'regular' || $user->id == $currentUser->id) {
            return Inertia::render('Admin/User/CreateUser', [
                'user' => $user,
                'password' => $password,
                'currentUser' => $currentUser,
                'time_zone' => $this->timezones,
                'roles' => $user_roles,
                'role_permission' => $roleList,
                'translator' => Controller::getTranslations(),

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
        // Check whether user has permission to view the record.
        $currentUser = $request->user();

        $flag = $this->checkPermission($currentUser, $id);

        if ($flag === false) {
            abort(401);
        }

        $user = User::find($id);
        $companies = $user->company;

        // Check global admin access
        if ($user->role == 'global_admin' && $currentUser->role != 'global_admin') {
            return Redirect::route('home');
        }

        $related_Company = $this->UserRelatedCompany($id);

        $token = $user->api_token;
        if ($currentUser->role != 'regular' || $user->id == $currentUser->id) {
            return Inertia::render('Admin/User/UserDetail', [
                'user' => $user,
                'token' => $token,
                'companies' => $companies,
                'current_user' => $request->user(),
                'time_zone' => $this->timezones,
                'related_company' => $related_Company,
                'translator' => Controller::getTranslations(),
            ]);
        } else {
            return Redirect(route('dashboard'));
        }
    }

    /**
     * Profile
     */
    public function profile(Request $request)
    {
        // Check whether user has permission to view the record.
        $currentUser = $request->user();
        $flag = $this->checkPermission($currentUser, $currentUser->id);

        if ($flag === false) {
            abort(401);
        }

        $user = User::find($currentUser->id);

        $token = $user->api_token;
        if ($user->id == $currentUser->id) {
            return Inertia::render('Admin/User/UserDetail', [
                'user' => $user,
                'token' => $token,
                'current_user' => $request->user(),
                'time_zone' => $this->timezones,
                'translator' => Controller::getTranslations(),
            ]);
        } else {
            return Redirect(route('dashboard'));
        }
    }

    /**
     * Save user data
     */
    public function storeUserRegistration(Request $request)
    {
        $currentUser = $request->user();
        // Check whether user has permission to create/update the user
        if (($request->get('id') == $currentUser->id) || $request->user()->role != 'regular') {
            if (!$request->get('id')) {
                $request->validate([
                    'last_name' => 'required|max:255',
                    'email' => 'required|unique:users|max:255',
                ]);

                $user = new User();
                $password = bin2hex(openssl_random_pseudo_bytes(8));
                $user->password = bcrypt($password);
            } else {
                $flag = $this->checkPermission($currentUser, $request->get('id'));
                if ($flag === false) {
                    abort(401);
                }

                $user = User::find($request->get('id'));
            }

            $user->first_name = $request->get('first_name');
            $user->last_name = $request->get('last_name');
            $user->name =  $request->get('first_name') . ' ' . $request->get('last_name');
            $user->email = $request->get('email');
            $user->phone_number = $request->get('phone_number');
            $user->language = $request->get('language');

            // Only admin and global admin can able to set the user role
            if ($currentUser->role == 'admin' || $currentUser->role == 'global_admin') {
                $tmpRole = $request->get('role');
                // Admin user can't set user as global_admin
                if ($currentUser->role == 'admin') {
                    if ($tmpRole == 'global_admin') {
                        $tmpRole = 'admin';
                    }
                }

                $user->role = $tmpRole ? $tmpRole : 'regular';
                $user->status = $request->get('status');
            }

            // Set user permissions based on role  
            if ($request->role_permission) {
                $role = Role::find($request->role_permission);
                $user->role_permission = $request->role_permission;
                $user->syncRoles($role);
            }

            $user->save();

            if ($currentUser->role == 'global_admin') {
                return Redirect::route('detail_global_User', $request->id);
            } else if ($currentUser->role == 'admin') {
                return Redirect::route('detailUser', $request->id);
            } else {
                return Redirect::route('profile');
            }
        }

        return Redirect::route('dashboard');
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request, $id)
    {
        $currentUser = $request->user();
        $flag = $this->checkPermission($currentUser, $id);
        if ($flag === false) {
            abort(401);
        }

        $user = User::find($id);
        if ($currentUser->id == $user->id) { // User updating his/her own password. So we need to match the old password.
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

        $user->update(['password' => Hash::make($request->new_password)]);
        if ($currentUser->role == 'global_admin') {
            return Redirect::route('detail_global_user', $id);
        } else if ($currentUser->role == 'admin') {
            return Redirect::route('detailUser', $id);
        } else {
            return Redirect::route('profile');
        }
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
        $companyId = Cache::get('selected_company_' . $user->id);
        if ($request->is_soft) {
            $condition = [
                'user_id' => $id,
                'company_id' => $companyId
            ];

            DB::table('company_user')->where($condition)->delete();
        } else {
            Schema::disableForeignKeyConstraints();
            if ($user->delete()) {
                Log::info('User deleted.');
                Schema::enableForeignKeyConstraints();
            }
        }

        return Redirect::route('show_Users');
    }

    /**
     * List account 
     */
    public function listAccounts(Request $request)
    {

        $module = new Account();
        $list_view_columns = [
            'company_name' => ['label' => 'Name', 'type' => 'text'],
            'service' =>  ['label' => 'Service', 'type' => 'dropdown'],
            'service_engine' =>  ['label' => 'Service engine', 'type' => 'dropdown'],
            'phone_number' =>  ['label' => 'Phone number', 'type' => 'text'],
            'status' => ['label' => 'Status', 'type' => 'text'],
        ];

        $listViewData = $this->listView($request, $module, $list_view_columns);

        $moduleData = [
            'singular' => 'Social Profile',
            'plural' => 'Social Profiles',
            'module' => 'Account',
            'current_page' => 'Account',
            // Actions
            'actions' => [
                'create' => true,
                'detail' => true,
                'edit' => false,
                'delete' => true,
                'export' => false,
                'import' => false,
                'search' => true,
                'filter' => false,
                'select_field' => false,
                'mass_edit' => false,
                'merge' => false
            ],
        ];

        $records =  $this->listViewRecord($request, $listViewData, 'Account');
        $data = array_merge($moduleData, $records);
        return Inertia::render('Account/List', $data);
    }

    /**
     * Show detail view of account
     */
    public function showAccount(Request $request, $id)
    {
        $user = $request->user();
        $company = Company::first();
        $account = Account::where('id', $id)->first();

        if (!$account) {
            abort(401, __('You are not authorised to see this record.'));
        }
        $template_details = [];
        $templates = Template::where('account_id', $id)->get();
        $messages = Message::select('messages.template_id', 'messages.template_uid', 'messages.language')
            ->join('templates', 'messages.template_id', 'templates.id')
            ->where('account_id', $id)
            ->get();

        $templateIds = [];
        foreach ($messages as $message) {
            if ($message->template_uid)
                $templateIds[$message->template_id][] = ['language' => $message->language, 'id' => $message->template_uid];
        }

        $webhookEvents = WebhookEvent::where('account_id', $id)->get();

        if (count($templates)) {
            foreach ($templates as $template) {
                $creater_name = [];
                $creater_name = User::where('id', $template->created_by)->select('name')->first();

                $templateLanguageId = '';
                if (isset($templateIds[$template->id])) {
                    foreach ($templateIds[$template->id] as $templateLan) {
                        $templateLanguageId .= " {$templateLan['language']} - {$templateLan['id']},";
                    }
                    $templateLanguageId = trim($templateLanguageId, ',');
                }

                $template_details[] = [
                    'id' => $template->id,
                    'creater_name' => $creater_name,
                    'account_id' => $template->account_id,
                    'name' => $template->name,
                    'status' => $template->status,
                    'language' => $templateLanguageId,
                    'created_at' => $template->created_at
                ];
            }
        }

        if (count($webhookEvents)) {
            foreach ($webhookEvents as $webhook) {
                $creater_id = $webhook->created_by;
                $creater = User::find($creater_id);
                if ($creater) {
                    $webhook->created_by = $creater->name;
                }
            }
        }

        $field_info = [
            'company_name' => ['label' => __('Name')],
            'service' => ['label' => __('Service')],
            'service_engine' => ['label' => 'Service Engine', 'user_show' => ['global_admin']],

            // WhatsApp-specific
            'phone_number' => ['label' => __('Phone number'), 'show' => ['whatsapp']],
            'src_name' => ['label' => __('Source name'), 'show' => ['whatsapp']],
            'fb_waba_name' => ['label' => __('FaceBook whatsapp account name'), 'fb_show' => ['facebook', 'gupshup'], 'show' => ['whatsapp']],
            'fb_business_name' => ['label' => __('Business manager names'), 'show' => ['whatsapp']],

            // Instagram / Facebook-specific
            'fb_phone_number_id' => ['label' => 'Instagram Page Name', 'fb_show' => ['facebook'], 'show' => ['instagram']],

            // Email-specific
            'email' => ['label' => __('Sender Email'), 'show' => ['email']],
            'display_name' => ['label' => __('Sender Name'), 'show' => ['email']],
            'smtp_host' => ['label' => __('SMTP Host'), 'show' => ['email']],
            'smtp_port' => ['label' => __('SMTP Port'), 'show' => ['email']],
            'smtp_encryption' => ['label' => __('Encryption'), 'show' => ['email']],

            'Profile' => __('Profile'),
            'Callback URL' => __('Callback URL'),
            'Name of URL' => __('Name of URL'),

        ];

        return Inertia::render('Account/Detail', [
            'account' => $account,
            'company' => $company,
            'field_info' => $field_info,
            'templates' => $template_details,
            'webhook_events' => $this->webhook_events,
            'categories' => $this->categories,
            'events' => $webhookEvents ? $webhookEvents : [],
            'translator' => Controller::getTranslations(),
        ]);
    }

    /**
     * Show templates list page
     */
    public function accountTemplates(Request $request)
    {
        $userId = $request->user()->id;
        $accounts = Account::where('user_id', $userId)
            ->select(
                'accounts.id',
                'company_name',
                'service',
                'accounts.status',
                'fb_page_name',
                'category',
                'phone_number',
                'src_name',
                'fb_phone_number_id',
                'fb_whatsapp_account_id',
                'created_at'
            )
            ->orderBy('company_name')
            ->get();
        $selectedAccountId = $request->get('account_id');
        $account = null;

        if ($selectedAccountId) {
            $account = Account::where('user_id', $userId)
                ->where('id', $selectedAccountId)
                ->first();
        }

        $template_details = [];
        if ($account) {
            $templates = Template::where('account_id', $account->id)
                ->orderByDesc('created_at')
                ->orderByDesc('id')
                ->get();
            $messages = Message::select('messages.template_id', 'messages.template_uid', 'messages.language')
                ->join('templates', 'messages.template_id', 'templates.id')
                ->where('account_id', $account->id)
                ->get();

            $templateIds = [];
            foreach ($messages as $message) {
                if ($message->template_uid) {
                    $templateIds[$message->template_id][] = [
                        'language' => $message->language,
                        'id' => $message->template_uid,
                    ];
                }
            }

            if (count($templates)) {
                foreach ($templates as $template) {
                    $creater_name = User::where('id', $template->created_by)->select('name')->first();

                    $templateLanguageId = '';
                    if (isset($templateIds[$template->id])) {
                        foreach ($templateIds[$template->id] as $templateLan) {
                            $templateLanguageId .= " {$templateLan['language']} - {$templateLan['id']},";
                        }
                        $templateLanguageId = trim($templateLanguageId, ',');
                    }

                    $template_details[] = [
                        'id' => $template->id,
                        'creater_name' => $creater_name,
                        'account_id' => $template->account_id,
                        'name' => $template->name,
                        'service' => $template->service ?: $account->service,
                        'subject' => $template->email_subject,
                        'status' => $template->status,
                        'language' => $template->service === 'email' ? 'Email' : $templateLanguageId,
                        'created_at' => $template->created_at,
                    ];
                }
            }
        }

        return Inertia::render('Account/Templates', [
            'accounts' => $accounts,
            'account' => $account,
            'templates' => $template_details,
            'categories' => $this->categories,
            'current_page' => 'Templates',
            'translator' => Controller::getTranslations(),
        ]);
    }

    /**
     * Edit Account Data
     */
    public function editAccountData($id)
    {
        $company = Company::first();
        $account = Account::findOrFail($id);
        $accountData = $account->toArray();

        if ($account->service === 'email') {
            $accountData['smtp_provider'] = $this->inferEmailProvider(
                $account->smtp_host,
                $account->smtp_port,
                $account->smtp_encryption,
            );
        }
        $pages = [];

        $instaAccounts = [];
        if ($account->service == 'instagram' || $account->service == 'facebook') {
            $pagesList = unserialize(base64_decode($account->fb_meta_data));
            $pageId = $account->fb_phone_number_id;
            $pages = [];
            foreach ($pagesList as $id => $page) {
                $pages[$id] = isset($page['name']) ? $page['name'] : $page;
                if ($account->service == 'instagram') {
                    $account->page_token = $page['token'];
                    $getLinkedAccounts = (new WhatsAppUsers())->getLinkedAccounts($id, $account);
                    $account->fb_token = '';
                    if ($getLinkedAccounts['status']) {
                        $instaAccounts[$id] = $getLinkedAccounts['data'];
                    }
                }
            }
            $account->fb_phone_number_id = $pageId;
        }
        $whatsappAccountList = [];
        if ($company->service_engine == 'Facebook' && $account->service_engine  == 'facebook') {
            $whatsappAccountList = unserialize(base64_decode($account->fb_meta_data));
        }

        $webhook = WebhookEvent::where('account_id', $account->id)->first();
        return Inertia::render('Account/Registration', [
            'account' => $accountData,
            'webhook_events' => $this->webhook_events,
            'events' => $webhook,
            'pages' => $pages,
            'company' => $company,
            'insta_accounts' => $instaAccounts,
            'whatsapp_account_id' => $whatsappAccountList,
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
                'Cancel' =>  __('Cancel'),
                'Save' =>  __('Save'),
                'Sole Proprietorship' =>  __('Sole Proprietorship'),
                'Partnership' =>  __('Partnership'),
                'Limited Liability Company (LLC)' =>  __('Limited Liability Company (LLC)'),
                'Corporation' =>  __('Corporation'),
                'Website' =>  __('Website'),
                'Support' =>  __('Support')
            ]


        ]);
    }

    /**
     * Show account registration form
     */
    public function accountRegistration(Request $request)
    {
        $service = $error = '';
        if (isset($_GET['error'])) {
            $service = session('service');
            $error = $_GET['error'];
        }
        $company = Company::first();
        $accounts = Account::select('company_name', 'service', 'accounts.id', 'accounts.status', 'fb_page_name')->get();
        $menuBar = $this->fetchMenuBar();
        return Inertia::render('Account/Registration/Form', [
            'service' => $service,
            'error' => $error,
            'company' => $company,
            'accounts' => $accounts,
            'menuBar' => $menuBar,
            'translator' => Controller::getTranslations(),
        ]);
    }

    /**
     * Store account registration
     */
    public function storeAccountRegistration(Request $request)
    {
        $id = '';
        $displayName = '';
        $user_id = $request->user()->id;

        if ($request->profile_list) {
            $parentAccount = Account::where('user_id', $user_id)
                ->findOrFail($request->profile_list);

            $account = new Account();
            $account->company_name = $parentAccount->company_name;
            $account->service = $request->get('service', $parentAccount->service);
            $account->status = 'New';
            $account->user_id = $user_id;
            $account->service_engine = 'facebook';
            $account->fb_token = $parentAccount->fb_token;
            $account->fb_user_id = $parentAccount->fb_user_id;
            $account->fb_meta_data = $parentAccount->fb_meta_data;

            $account->save();
            return Redirect::route('edit_account', $account->id);
        }
        //check for edit or create new account
        if ($request->has('id') && $request->get('id') > 0) {
            $id = $request->get('id');
        }

        if ($request->has('legal_entity') && $request->get('legal_entity')) {
            $displayName = $request->get('legal_entity');
        }

        //check if the user select the company name as display name
        if ($displayName != 'yes' && $request->service != 'instagram' && $request->service != 'facebook' && $request->service != 'email' && $request->service_engine != 'facebook') {
            $request->validate([
                'display_name' => 'required|max:255',
            ]);
        }

        $request->validate([
            'service' => 'required',
            'company_name' => 'required'
        ]);

        $service = $request->get('service');

        if ($service == 'whatsapp' && $request->service_engine != 'facebook') {

            //validate the phone number is unique
            if ($request->get('id')) {
                $request->validate([
                    'phone_number' => 'required|numeric|unique:accounts,phone_number,' . $request->get('id')
                ]);
            } else {
                $request->validate([
                    'phone_number' => 'required|numeric|unique:accounts'
                ]);
            }
        }

        if ($service == 'email') {
            $request->merge([
                'smtp_provider' => $this->normalizeEmailProvider(
                    $request->input('smtp_provider')
                ),
            ]);

            $preset = $this->resolveEmailProviderPreset($request->input('smtp_provider'));
            if ($preset) {
                $request->merge([
                    'smtp_host' => $request->filled('smtp_host')
                        ? $request->input('smtp_host')
                        : $preset['host'],
                    'smtp_port' => $request->filled('smtp_port')
                        ? $request->input('smtp_port')
                        : $preset['port'],
                    'smtp_encryption' => $request->filled('smtp_encryption')
                        ? $request->input('smtp_encryption')
                        : $preset['encryption'],
                ]);
            }

            $request->validate([
                'email' => 'required|email',
                'service_token' => 'required',
                'smtp_provider' => ['required', Rule::in(array_merge(array_keys(self::EMAIL_PROVIDER_PRESETS), ['custom']))],
                'smtp_host' => 'required|string|max:255',
                'smtp_port' => 'required|string|max:10',
                'smtp_encryption' => ['required', Rule::in(['tls', 'ssl', 'none'])],
            ]);
        }

        if ($id) {
            $account = Account::findOrFail($id);
        } else {
            $account = new Account();
            $account->user_id = $user_id;
            $account->status = 'New';

            // Set default service engine
            $company = Company::first();
            $serviceEngine = $request->service === 'whatsapp'
                ? ($request->service_engine ?: 'gupshup')
                : (($company->service_engine) ? $company->service_engine : $request->service_engine);
            $account->service_engine = ($serviceEngine) ? $serviceEngine : 'gupshup';
        }
        if ($request->service == 'instagram' || $request->service == 'facebook') {
            $request->status = '';
            $request->service_engine = 'facebook';
            if ($request->fb_phone_number_id) {
                $account->status = 'Active';
            }
        }

        if ($request->service == 'email') {
            $account->service_engine = 'smtp';
            $account->status = 'Active';
        }

        if ($request->service == 'whatsapp' && $account->service_engine == 'facebook' && $request->fb_whatsapp_account_id) {
            $account->status = 'Active';
            $account->fb_phone_number_id = $request->fb_phone_number_id;
        }

        if ($account->fb_phone_number_id != $request->fb_phone_number_id && $request->service != 'whatsapp') {
            $account->fb_phone_number_id = $request->fb_phone_number_id;

            if (!$account->page_token) {
                $pagesList = unserialize(base64_decode($account->fb_meta_data));
                $pageId = $account->fb_phone_number_id;
                $account->page_token = $pagesList[$pageId]['token'];
            }


            // Add subscripe page for start trigger webhooks
            if ($request->fb_phone_number_id) (new WhatsAppUsers())->subscripe($account);
        }


        $account->company_name = $request->company_name;


        if ($displayName == 'yes') {
            $account->display_name = $request->company_name;
        } else {
            $account->display_name = $request->display_name;
        }

        $accountFields = ['company_name', 'category', 'description', 'email', 'service', 'service_token', 'fb_whatsapp_account_id', 'phone_number', 'src_name', 'business_manager_id', 'fb_insta_app_id', 'fb_page_name', 'insta_user_name', 'fb_business_name', 'fb_waba_name', 'api_partner_name', 'api_partner', 'smtp_host', 'smtp_port', 'smtp_encryption'];

        foreach ($accountFields as $field) {
            if ($request->has($field)) {
                $account->$field = $request->$field;
            }
        }

        $account->save();

        if ($id) {
            return Redirect::route('account_view', $account->id);
            //return Redirect::route('listAccount');
        } else {
            $supportRequest = new SupportRequest();
            $supportRequest->subject = 'New Social Profile is created';
            $supportRequest->description = 'New Social Profile is created.[ ' . $account->display_name . ',' . $account->id . ']';
            $supportRequest->type = "Channel";
            $supportRequest->assigned_to = $request->user()->id;
            $supportRequest->status = "New";
            $supportRequest->created_by =  $account->user_id;
            $supportRequest->save();
            return response()->json(['status' => true, 'account_id' => $account->id]);
        }
    }

    private function normalizeEmailProvider(?string $provider): ?string
    {
        if (! $provider) {
            return null;
        }

        $provider = strtolower(trim($provider));

        return match ($provider) {
            'gmail',
            'google_workspace',
            'microsoft_365_outlook',
            'sendgrid',
            'mailgun',
            'custom' => $provider,
            default => null,
        };
    }

    private function normalizeEmailEncryption(?string $encryption): ?string
    {
        if (! $encryption) {
            return null;
        }

        $encryption = strtolower(trim($encryption));

        return in_array($encryption, ['tls', 'ssl', 'none'], true)
            ? $encryption
            : null;
    }

    private function resolveEmailProviderPreset(?string $provider): ?array
    {
        $provider = $this->normalizeEmailProvider($provider);

        return $provider && isset(self::EMAIL_PROVIDER_PRESETS[$provider])
            ? self::EMAIL_PROVIDER_PRESETS[$provider]
            : null;
    }

    private function inferEmailProvider($host, $port, $encryption): ?string
    {
        $host = strtolower(trim((string) $host));
        $port = trim((string) $port);
        $encryption = $this->normalizeEmailEncryption($encryption);

        if (! $host && ! $port && ! $encryption) {
            return null;
        }

        foreach (self::EMAIL_PROVIDER_PRESETS as $provider => $preset) {
            if (
                $host === strtolower($preset['host']) &&
                $port === (string) $preset['port'] &&
                $encryption === $preset['encryption']
            ) {
                return $provider;
            }
        }

        return 'custom';
    }

    /**
     * Delete account 
     */
    public function deleteAccount(Request $request)
    {
        $account_id = $request->get('id');
        $user_id = $request->user()->id;
        $account = Account::findOrFail($account_id);

        // Pre-delete the related record from this accounts 
        $templates = Template::where('account_id', $account_id)->get();
        foreach ($templates as $template) {
            $messages = Message::where('template_id', $template->id)->get();
            foreach ($messages as $message) {
                if ($message) {
                    MessageButton::where('message_id', $message->id)->delete();
                    $message->delete();
                }
            }
            $template->delete();
        }

        $webhook = WebhookEvent::where('account_id', $account_id)->delete();
        $message = Msg::where('account_id', $account_id)->delete();

        $account->delete();

        $accounts = Account::select('company_name', 'service', 'accounts.id', 'accounts.status', 'fb_page_name')->get();

        return response()->json(['status' => true, 'accounts' => $accounts]);
    }

    /**
     * Show template form
     */
    public function newTemplate($account_id)
    {
        return Inertia::render('Account/Template/New', ['account_id' => $account_id]);
    }

    protected function isEmailTemplateFlow(?Account $account = null, ?Template $template = null): bool
    {
        $templateService = strtolower((string) ($template?->service ?? ''));
        if ($templateService !== '') {
            return $templateService === 'email';
        }

        return strtolower((string) ($account?->service ?? '')) === 'email';
    }

    protected function emailTemplateNameRule(int $accountId, ?int $ignoreTemplateId = null): array
    {
        $uniqueRule = Rule::unique('templates', 'name')
            ->where(function ($query) use ($accountId) {
                return $query->where('account_id', $accountId);
            });

        if ($ignoreTemplateId) {
            $uniqueRule = $uniqueRule->ignore($ignoreTemplateId);
        }

        return [
            'required',
            'max:255',
            'regex:/^[a-zA-Z0-9_\s-]*$/',
            $uniqueRule,
        ];
    }

    /**
     * Create new template
     */
    public function createNewTemplate(Request $request, $account_id)
    {
        Log::info('Save template process start');
        $account = Account::where('id', $account_id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $account) {
            abort(401, 'You are not authorised to create templates for this account');
        }

        if ($this->isEmailTemplateFlow($account)) {
            $request->validate([
                'template_name' => $this->emailTemplateNameRule((int) $account_id),
                'subject' => 'required|max:255',
            ]);

            $template = new Template();
            $template->name = $request->get('template_name');
            $template->service = 'email';
            $template->category = 'EMAIL';
            $template->languages = [];
            $template->status = 'draft';
            $template->email_subject = $request->get('subject');
            $template->company_id = Cache::get('selected_company_' . $request->user()->id);
            $template->account_id = $account_id;
            $template->created_by = $request->user()->id;
            $template->save();

            Log::info('Email template saved successfully');

            return Redirect::route('template_detail_view', [$account_id, $template->id]);
        }

        $request->validate([
            'template_name' => 'required|max:255|regex:/^[a-zA-Z0-9_\s]*$/',
            'category' => 'required',
            'languages' => 'required',
        ]);

        $template = new Template();
        $template->name = $request->get('template_name');
        $template->service = $account->service ?: 'whatsapp';
        $template->category = $request->get('category');
        $template->languages = $request->get('languages');
        $template->status = 'draft';
        $template->company_id = Cache::get('selected_company_' . $request->user()->id);
        $template->account_id = $account_id;
        $template->created_by = $request->user()->id;
        $template->save();

        Log::info('Template saved successfully');

        return Redirect::route('template_detail_view', [$account_id, $template->id]);
    }

    /** 
     * Save template status
     */
    public function saveTemplateStatus(Request $request, $account_id, $template_id)
    {
        $template = Template::where('account_id', $account_id)
            ->where('id', $template_id)
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
            'name_url' => 'required'
        ]);

        $webhook = new WebhookEvent();
        $webhook->account_id = $account_id;
        foreach ($this->webhook_events as $webhook_event => $event_info) {
            $webhook->$webhook_event = $request->has($webhook_event) && ($request->get($webhook_event) === true || $request->get($webhook_event) == 1)  ? true : false;
        }
        $webhook->callback_url = $request->get('callback_url');
        $webhook->name_url = $request->name_url;
        $webhook->created_by = $request->user()->id;
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
            'name_url' => 'required'
        ]);

        $webhook = WebhookEvent::find($webhook_id);
        foreach ($this->webhook_events as $webhook_event => $event_info) {
            $webhook->$webhook_event = $request->has($webhook_event) && ($request->get($webhook_event) === true || $request->get($webhook_event) == 1)  ? true : false;
        }
        $webhook->callback_url = $request->get('callback_url');
        $webhook->name_url = $request->name_url;
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
        foreach ($accounts as $account) {
            if ($account->id == $webhook->account_id) {
                $webhook->delete();
                $flag = true;
                break;
            }
        }

        if (!$flag) {
            abort(401, 'You are not authorised to delete this event');
        }

        return Redirect::route('account_view', $account_id);
    }

    /**
     * Template's detail view
     */
    public function templateDetailView(Request $request, $account_id, $template_id)
    {
        $user = $request->user();
        $account = Account::where('id', $account_id)->first();
        $menuBar = $this->fetchMenuBar();

        if (!$account) {
            abort(401, 'You are not authorised to view this template');
        }

        $template = Template::where('account_id', $account_id)
            ->where('id', $template_id)
            ->first();

        if (! $template) {
            abort(404, 'Template not found');
        }

        if ($this->isEmailTemplateFlow($account, $template)) {
            return Inertia::render('Account/Template/EmailTemplateEditor', [
                'template' => $template,
                'menuBar' => $menuBar,
                'translator' => Controller::getTranslations(),
            ]);
        }

        $templateContent = $this->fetchTemplateContent($template_id, $account_id);
        if ($templateContent instanceof \Illuminate\Http\RedirectResponse) {
            return $templateContent;
        }

        return Inertia::render('Account/Template/CreateTemplate', [
            'template' => $templateContent['template'],
            'languages' => $templateContent['languages'],
            'temp_contents' => $templateContent['temp_contents'],
            'fields' => $templateContent['fields'],
            'menuBar' => $menuBar,
            'translator' => Controller::getTranslations(),
        ]);
    }

    /**
     * Return template content
     */
    public function fetchTemplateContent($templateId, $accountId)
    {
        $template = Template::where('account_id', $accountId)
            ->where('id', $templateId)
            ->first();

        if (! $template) {
            return Redirect::route('dashboard');
        }
        // Setting language
        $languages = array_values(array_unique($template->languages));

        $temp_contents = [];
        foreach ($languages as $key => $language) {
            $message = Message::where('template_id', $templateId)
                ->where('language', $language)
                ->first();

            if (!$message) {
                $message = new Message();
            }

            $sampleData = '';
            if ($message->example) {

                if (base64_encode(base64_decode($message->example, true)) === $message->example) {
                    $sampleData = unserialize(base64_decode($message->example));
                }
            }

            $message_buttons = [];
            if ($message->id) {
                $message_buttons = MessageButton::where('message_id', $message->id)->get();
            }

            $temp_contents[$language]['message'] = $message;
            $temp_contents[$language]['sampleData'] = $sampleData;
            $temp_contents[$language]['message_buttons'] = $message_buttons;
        }

        // Get module fields
        $fields = [];
        $getFields = Field::where('module_name', 'Contact')
            ->where('field_type', '!=', 'relate')
            ->groupBy('field_name')
            ->orderBy('id')
            ->get();

        foreach ($getFields as $field) {
            $fields[$field->field_name] = $field->field_label;
        }

        return [
            'template' => $template,
            'temp_contents' => $temp_contents,
            'languages' => $languages,
            'fields' => $fields,
        ];
    }

    /**
     * Store template
     */
    public function storeTemplate(Request $request, $account_id, $template_id)
    {
        $user = $request->user();
        $account = Account::where('id', $account_id)->first();
        $template = Template::where('account_id', $account_id)
            ->where('id', $template_id)
            ->first();

        if (!$account || !$template) {
            abort(401, 'You are not authorised to view this');
        }

        if ($this->isEmailTemplateFlow($account, $template)) {
            $request->validate([
                'template_name' => $this->emailTemplateNameRule((int) $account_id, (int) $template_id),
                'subject' => 'required|max:255',
                'html_body' => 'required|string',
                'text_body' => 'nullable|string',
                'sample_data' => 'nullable|string',
            ]);

            $sampleData = null;
            if ($request->filled('sample_data')) {
                $sampleData = json_decode($request->get('sample_data'), true);

                if (json_last_error() !== JSON_ERROR_NONE || ! is_array($sampleData)) {
                    throw ValidationException::withMessages([
                        'sample_data' => 'Sample data must be valid JSON.',
                    ]);
                }
            }

            $template->name = $request->get('template_name');
            $template->service = 'email';
            $template->category = 'EMAIL';
            $template->languages = [];
            $template->status = 'APPROVED';
            $template->email_subject = $request->get('subject');
            $template->html_body = $request->get('html_body');
            $template->text_body = $request->get('text_body');
            $template->sample_data = $sampleData;
            $template->save();

            return Redirect::route('account_templates', ['account_id' => $account_id]);
        }

        $validation_array = [
            'header_type' => 'required',
            'body' => 'required|max:1024',
            'body_footer' => 'required|max:60',
        ];
        if ($request->get('header_type') == 'text') {
            $validation_array['header_text'] = 'required|max:60';
        }
        if ($request->get('header_type') != 'text') {
            $validation_array['attach_file'] = 'required';
        }

        $request->validate($validation_array);

        // Store Template Attachment
        $attachFilePath = '';
        if ($request->file('attach_file')) {
            $file = $request->file('attach_file');
            $fileName = $file->getClientOriginalName();
            $destinationPath = public_path() . '/attach_files';
            $file->move($destinationPath, $fileName);
            $attachFilePath = ['url' => asset('attach_files/' . $fileName), 'path' => $destinationPath . '/' . $fileName];
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
        $message->attach_file = isset($attachFilePath['url']) ? $attachFilePath['url'] : '';
        $message->example = base64_encode(serialize($request->get('sample_value')));
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
                            // $buttonObj->body = '';
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

        if (base64_decode($request->example, true)) {
            $request->example = ($request->example) ? unserialize(base64_decode($request->example)) : '';
        }

        // Submit template to GupShup
        $tempController = new TemplateController();
        $tempController->account_id = $account_id;
        $result = $tempController->submitTemplate(['account_id' => $account_id, 'template_id' => $template_id, 'data' => $request, 'file' => $attachFilePath]);
        // TODO Show the above template result for user

        // // Setting language
        // $languages = $template->languages;

        // $message_buttons = MessageButton::where('message_id', $message_id)->get();

        $templateContent = $this->fetchTemplateContent($template_id, $account_id);
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

        // return response()->json($result);

        return Inertia::render('Account/Template/CreateTemplate', [
            'template' => $templateContent['template'],
            'languages' => $templateContent['languages'],
            'temp_contents' => $templateContent['temp_contents'],
            'fields' => $templateContent['fields'],
            'result' => $result,
            'translator' => Controller::getTranslations(),
        ]);
    }
    public function setPageLimit(Request $request, $module)
    {
        $pageLimit = $request->per_pagelimit;
        Cache::put($module . 'page_limit' . $request->user()->id, $pageLimit);
        return Redirect::to(url()->previous());
    }

    /**
     * Wallet page
     */
    public function wallet(Request $request)
    {
        $user = $request->user();
        $current_page = $request->query('current_page', 'Wallet');
        $current_page = in_array($current_page, ['Wallet', 'Expenses'], true)
            ? $current_page
            : 'Wallet';
        $page = max((int) $request->query('page', 1), 1);

        $menuBar = $this->fetchMenuBar();

        $data = [
            'menuBar' => $menuBar,
            'transaction_actions' => [],
            'invoice_actions' => ['download' => true],
            'name' => $user->name,
            'current_page' => $current_page,
            'translator' => Controller::getTranslations(),
        ];

        if ($current_page === 'Wallet') {
            $paymentMethods = $this->getPaymentMethods($request, 'direct');

            try {
                $this->ensureStripeCustomerForUser($user);
                $user->refresh();
                $defaultPaymentMethodObject = $user->defaultPaymentMethod();
                $defaultPaymentMethod = $defaultPaymentMethodObject ? $defaultPaymentMethodObject->id : '';
            } catch (\Throwable $e) {
                Log::warning('Unable to load default Stripe payment method.', [
                    'user_id' => $user?->id,
                    'message' => $e->getMessage(),
                ]);

                $defaultPaymentMethod = '';
            }

            $data = array_merge($data, [
                'add_on' => $this->getAddOnSelection(),
                'paymentMethods' => $paymentMethods,
                'defaultPaymentMethod' => $defaultPaymentMethod,
                'stripe_public_key' => config('stripe.stripe_key'),
                'currentCompany' => Company::first(),
            ]);
        }

        if ($current_page === 'Expenses') {
            $msgTransactionList = $this->getTransactionList($request, $page);
            $request->merge(['filter' => '']);

            $data = array_merge($data, [
                'message_deduction' => $this->getMsgAmountDeduction($request, $user->id),
                'message_account_detail' => $this->getDeductionDetail($request),
                'msgTransactionList' => $msgTransactionList,
                'transactionHistory' => $this->getTransactionHistory($request, $page),
            ]);
        }

        return Inertia::render('Wallet/WalletIndex', $data);
    }

    public function getAddOnSelection()
    {
        $company = Company::first();
        $plans = Plan::all();
        $plan = Plan::where('plan_id', $company->plan)->first();
        $return = [];

        $current_plan_index = '';
        foreach ($plans as $index => $planlist) {
            if ($planlist->plan_id == $company->plan) $current_plan_index = $index;
        }

        if ($plan) {
            $max_users = $plan->users;
            $max_account = $plan->accounts;
            $max_workflow = $plan->workflows;

            $total_users = User::count();
            $total_account = Account::count();
            $total_workflow = Automation::count();

            $return = [
                'max_users' => $max_users,
                'max_account' => $max_account,
                'max_workflow' => $max_workflow,
                'total_users' => $total_users,
                'total_account' => $total_account,
                'total_workflow' => $total_workflow,
                'current_plan_index' => $current_plan_index
            ];
        }

        return $return;
    }

    /**
     * Charge the user and update the balance
     */
    public function charge(Request $request)
    {
        $user = $request->user();
        $user_id = $user->id;
        $amount = $request->get('amount') * 100;
        $companyId = Cache::get('selected_company_' . $user_id);

        // Get company
        $company = Company::first();

        try {
            $params = [
                'description' => 'OneMessage recharge',
                'customer' => $company->stripe_id,
            ];

            $stripeCharge = $user->charge(
                $amount,
                $request->get('id'),
                $params
            );

            if ($stripeCharge->id) {
                $wallet = Wallet::where('user_id', $user_id)->first();
                if (!$wallet) {
                    $wallet = new Wallet();
                    $wallet->user_id = $user_id;
                    $wallet->balance_amount = $amount / 100;
                } else {
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
                $transaction->save();
            }
        } catch (\Exception $e) {
            $transaction = new Transaction();
            $transaction->service = 'Stripe';
            $transaction->transaction_id = '-';
            $transaction->amount = $amount / 100;
            $transaction->status = 'failed';
            $transaction->error_message = $e->getMessage();
            $transaction->user_id = $user_id;
            $transaction->save();

            return response()->json(['status' => false, 'message' => $e->getMessage()]);

            //    throw ValidationException::withMessages(['amount' => $e->getMessage()]);
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
            'service' => ['label' => __('Service'), 'type' => 'text'],
            'transaction_id' => ['label' => __('Transaction Id'), 'type' => 'text'],
            'amount' => ['label' => __('Amount'), 'type' => 'text'],
            'status' => ['label' => __('Status'), 'type' => 'text'],
            'error_message' => ['label' => __('Message'), 'type' => 'text'],
            'created_at' => ['label' => __('Created At'), 'type' => 'text'],
            //  'actions'   => [ 'label' =>'Action' , 'type' => 'url'],
        ];

        $search = $request->has('search') && $request->get('search') ? $request->get('search') : '';
        $sort_by = $request->has('sort_by') && $request->get('sort_by') ? $request->get('sort_by') : 'created_at';
        $sort_order = $request->has('sort_order') && $request->get('sort_order') ? $request->get('sort_order') : 'desc';
        $page_limit = Cache::get('page_limit' . $request->user()->id);
        $user_id = $request->user()->id;
        if ($search) {
            $records = Transaction::orderBy($sort_by, $sort_order)
                ->where('user_id', $user_id)
                ->where(function ($query) use ($search, $list_view_columns) {
                    foreach ($list_view_columns as $field_name => $field_info) {
                        $query->orWhere($field_name, 'like', '%' . $search . '%');
                    }
                })
                ->paginate($page_limit);
        } else {
            $records = Transaction::orderBy($sort_by, $sort_order)
                ->where('user_id', $user_id)
                ->paginate($page_limit);
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
                'No records' => __('No records'),
                'Search' => __('Search'),
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
        if (!$invoice || ($invoice->user_id != $request->user()->id)) {
            abort(401);
        }
        $company = Company::first();

        $user = User::find($request->user()->id);
        view()->share('invoice', $invoice);
        view()->share('user', $user);
        view()->share('company', $company);

        $pdf = PDF::loadView('invoice');
        //$pdf->save(storage_path() . '/invoice');
        return $pdf->download('invoice.pdf');
    }

    /**
     * Return user amount deduction
     * 
     * @param INTEGER $user_id
     */
    public function getMsgAmountDeduction($request, $user_id)
    {
        $sort_time = 'All';

        if ($request->has('is_conversation') && ($request->is_conversation == 1 || $request->is_conversation == true)) {
            $query = Msg::selectRaw(' count(id) as messages , sum(amount) as total , policy');
            $start_date = ($request->start_date) ? $request->start_date : '';
            $end_date = ($request->end_date) ? $request->end_date : '';
            $currentModule = ($request->module) ? $request->module : '';
            $sort_time = $request->has('sort_time') && $request->get('sort_time') ? $request->get('sort_time') : 'All';
            $sort_time = ($currentModule == 'Conversation') ? $sort_time : 'All';

            if ($currentModule == 'Conversation') {
                if ($start_date != null && $end_date != null) {
                    $query->wherebetween('created_at', [$start_date, $end_date]);
                } else if ($sort_time == 'today') {
                    $query->whereDate('created_at', Carbon::today());
                } else if ($sort_time == 'yesterday') {
                    $query->whereDate('created_at', Carbon::yesterday());
                } else if ($sort_time == 'week') {
                    $query->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
                } else if ($sort_time == 'month') {
                    $query->whereMonth('created_at', Carbon::now()->month);
                }
            }
            $query->groupBy('amount', 'policy');
            $messages = $query->get();
        } else {
            $messages = Msg::selectRaw(' count(id) as messages , sum(amount) as total , policy')
                ->groupBy('amount', 'policy')
                ->get();
        }

        $data = $this->getAmountDetailsBasedOnMsg($messages);
        $data['sort_time'] = $sort_time;

        return $data;
    }

    /**
     * Return amount details 
     */
    public function getAmountDetailsBasedOnMsg($records)
    {
        $return['total_messages'] = 0;
        $return['total_amount'] = 0;

        foreach ($records as $message) {
            if ($message->policy == 'BIC' || $message->policy == 'UIC') {
                $return['total_messages'] = $message->messages + ($return['total_messages']);
            }
            $amount = ($message->total) ? $message->total : 0;
            $return['total_amount'] =  (float)($amount) +  (float)($return['total_amount']);

            if ($message->policy == 'BIC') {
                $return[$message->policy] = ['amount' => number_format($message->total, 3, '.', ''), 'count' => $message->messages];
            } else if ($message->policy == 'UIC') {
                $return[$message->policy] = ['amount' => number_format($message->total, 3, '.', ''), 'count' => $message->messages];
            } else if ($message->policy == 'FEP') {
                $return[$message->policy] = ['amount' => number_format($message->total, 3, '.', ''), 'count' => $message->messages];
            }
        }

        return $return;
    }

    /**
     * Return amount detail  
     */
    public function getDeductionDetail($request)
    {
        $accounts = Account::select('id', 'company_name', 'service', 'phone_number')->get();

        if ($accounts->isEmpty()) {
            return [];
        }

        $messageGroups = Msg::selectRaw('account_id, count(id) as messages, sum(amount) as total, policy')
            ->whereIn('account_id', $accounts->pluck('id'))
            ->groupBy('account_id', 'amount', 'policy')
            ->get()
            ->groupBy('account_id');

        return $accounts->map(function ($account) use ($messageGroups) {
            $messages = $messageGroups->get($account->id, collect());

            return [
                'name' => $account->company_name,
                'service' => $account->service,
                'number' => $account->phone_number,
                'amount_data' => $this->getAmountDetailsBasedOnMsg($messages),
            ];
        })->all();
    }

    /**
     * Return role list based on the current user role
     */
    public function getRoles($user)
    {
        $user_roles = $this->userRoles;
        if ($user->role != 'global_admin') {
            unset($user_roles['global_admin']);
        }

        return $user_roles;
    }

    /**
     * Check whether user has permission to access the record
     */
    public function checkPermission($currentUser, $user_id)
    {
        $flag = false;
        if (!$user_id) {
            return false;
        }

        // If user is trying to access his own record, allow
        if (($currentUser->id == $user_id) || ($currentUser->role == 'admin') || ($currentUser->role = 'global_admin')) {
            $flag = true;
        }
        return $flag;
    }

    /**
     * Change Login User
     */
    public function changeLogInUser(Request $request)
    {
        // $userId = $request->user_id;
        // $currentUser = $request->user()->id;
        // $user = User::find($userId);

        // // clear cache
        // Cache::forget('selected_company_'. $request->user()->id);
        // Cache::flush();

        // // Start the session
        // Session::put('global_user', $currentUser);

        // Auth::login($user);

        // return Redirect::route('dashboard');
    }

    /**
     * Check user session value
     */
    public function getUserSession(Request $request)
    {
        // $userSession = Session::get('global_user');
        // $sessionUser = false;
        // if($userSession){
        //     $sessionUser = $userSession;
        // }
        // echo json_encode(['session_value' =>$sessionUser ]);
    }

    /**
     * get User Timezone
     */
    public function getUserTimeZone(Request $request)
    {
        $zones = $this->timezones;
        $timezones = [];
        foreach ($zones as $country => $time) {
            $timezones[] = ['value' => $country, 'label' => $time];
        }

        echo json_encode(['time_zone' => $timezones]);
    }

    /**
     * Set Global User
     */
    public function setGlobalUser(Request $request)
    {
        // $userId = $request->user_id;

        // if($userId ==  $request->session()->get('global_user')){
        //     $user = User::find($userId);

        //     // clear cache
        //     Cache::forget('selected_company_'. $request->user()->id);
        //     Cache::flush();

        //     // clear session
        //     $request->session()->forget('global_user');
        //     $request->session()->flush();

        //     // Login Global Admin
        //     Auth::login($user);

        // }

        // return Redirect::route('dashboard');
    }

    /**
     * Store Stribe payment method
     */
    public function storePaymentMethod(Request $request)
    {
        $user = $request->user();
        $company = $this->ensureStripeCustomerForUser($user);

        $stripe = new \Stripe\StripeClient(config('stripe.stripe_secret'));

        // Attach payment method to customer
        $stripe->paymentMethods->attach(
            $request->id,
            ['customer' => $company->stripe_id]
        );

        echo json_encode(['status' => true]);
    }

    protected function getBillingCompanyForUser(User $user): ?Company
    {
        $companyId = Cache::get('selected_company_' . $user->id);
        if ($companyId) {
            $company = Company::find($companyId);
            if ($company) {
                return $company;
            }
        }

        $company = $user->company()->first();
        if ($company) {
            return $company;
        }

        return Company::first();
    }

    protected function ensureStripeCustomerForUser(User $user): Company
    {
        $company = $this->getBillingCompanyForUser($user);

        if (!$company) {
            throw new \RuntimeException('No billing company is available for this account.');
        }

        $secret = config('stripe.stripe_secret');
        if (!$secret) {
            throw new \RuntimeException('Stripe secret key is not configured.');
        }

        $stripe = new \Stripe\StripeClient($secret);
        $customerId = $company->stripe_id ?: $user->stripe_id;
        $customer = null;

        if ($customerId) {
            try {
                $customer = $stripe->customers->retrieve($customerId, []);
                if (!empty($customer->deleted)) {
                    $customer = null;
                }
            } catch (\Throwable $e) {
                if (!str_contains($e->getMessage(), 'No such customer')) {
                    throw $e;
                }
            }
        }

        if (!$customer) {
            $payload = [
                'metadata' => [
                    'domain' => url('/'),
                    'company_id' => (string) $company->id,
                    'user_id' => (string) $user->id,
                ],
            ];

            if ($company->name ?: $user->name) {
                $payload['name'] = $company->name ?: $user->name;
                $payload['description'] = $company->name ?: $user->name;
            }

            if ($company->email ?: $user->email) {
                $payload['email'] = $company->email ?: $user->email;
            }

            $customer = $stripe->customers->create($payload);
        }

        if ($company->stripe_id !== $customer->id) {
            $company->stripe_id = $customer->id;
            $company->saveQuietly();
        }

        if ($user->stripe_id !== $customer->id) {
            $user->stripe_id = $customer->id;
            $user->saveQuietly();
        }

        return $company->fresh();
    }

    public function UserRelatedCompany($user_id)
    {
        $related_company = [];
        if ($user_id) {
            //related company details
            $userCompany = DB::table('company_user')->where('user_id', $user_id)->get('company_id');
            foreach ($userCompany as $company) {
                $company =  Company::first();
                $related_company[$company['id']] = $company['name'];
            }

            return $related_company;
        }
    }

    public function addWalletAmount(Request $request)
    {

        $company_id = $request->selected_company;
        $walletAmount = $request->wallet_amount;

        $wallet = Wallet::where('company_id', $company_id)->first();

        if ($wallet) {
            $balanceAmount = $wallet->balance_amount;
            $addCash = $balanceAmount + $walletAmount;

            $wallet->balance_amount = $addCash;
            $wallet->save();
        }

        return Redirect::route('list_global_user');
    }

    /**
     * Create Stripe Setup Intent
     */
    public function createStripeSetupIntent(Request $request)
    {
        $user = $request->user();
        try {
            $this->ensureStripeCustomerForUser($user);
            $user->refresh();
            $intent = $user->createSetupIntent();
        } catch (\Throwable $e) {
            Log::warning('Stripe setup intent unavailable.', [
                'user_id' => $user?->id,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'intent' => null,
                'message' => 'Stripe setup is unavailable for this account.',
            ]);
        }

        return response()->json(['status' => true, 'intent' => $intent]);
    }

    /**
     * Get Payment Methods
     */
    public function getPaymentMethods(Request $request, $mode = '')
    {
        $user = $request->user();
        $paymentMethods = [];

        try {
            $this->ensureStripeCustomerForUser($user);
            $user->refresh();
            $paymentMethods = $user->paymentMethods();
        } catch (\Throwable $e) {
            Log::warning('Unable to load Stripe payment methods.', [
                'user_id' => $user?->id,
                'message' => $e->getMessage(),
            ]);

            $paymentMethods = [];
        }

        if ($mode) {
            return $paymentMethods;
        } else {
            return response()->json(['paymentMethods' => $paymentMethods]);
        }
    }

    /**
     * Relate Payment Method
     */
    public function relatePaymentMethod(Request $request)
    {
        $user = $request->user();
        try {
            $user->addPaymentMethod($request->get('id'));

            return response()->json(['message' => 'Payment Method Related Successfully', 'status' => true]);
        } catch (\Throwable $e) {
            Log::warning('Unable to relate Stripe payment method.', [
                'user_id' => $user?->id,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Unable to relate payment method for this account.',
                'status' => false,
            ], 422);
        }
    }

    public function sendMigrateRequest(Request $request)
    {

        $emailAddress = config('app.admin_email');
        $emailAddress = filter_var($emailAddress, FILTER_SANITIZE_EMAIL);

        $data = [
            'data' => $request,
            'url' => $request->header('origin')
        ];

        if ($emailAddress) {
            Mail::send('account', $data, function ($message) use ($emailAddress) {
                $message->to($emailAddress)->subject('Welcome');
            });
        }

        return response()->json(['status' => true]);
    }

    /**
     * Connect FaceBook
     */
    public function connectFaceBook(Request $request, $service)
    {
        $supportedServices = ['facebook', 'instagram'];
        if (!in_array($service, $supportedServices, true)) {
            abort(404);
        }

        if (!config('meta.app_id') || !config('meta.app_secret') || !config('meta.login_config_id')) {
            return redirect()->route('account_registration', [
                'error' => 'Meta connection is not configured yet.',
            ]);
        }

        $state = Str::random(40);

        session([
            self::META_OAUTH_SESSION_KEY => [
                'state' => $state,
                'service' => $service,
                'user_id' => optional($request->user())->id,
            ],
            'service' => $service,
        ]);

        $version = config('meta.graph_version');

        $query = http_build_query([
            'client_id' => config('meta.app_id'),
            'redirect_uri' => config('meta.redirect_uri'),
            'state' => $state,
            'response_type' => 'code',
            'config_id' => config('meta.login_config_id'),
        ]);

        return redirect()->away("https://www.facebook.com/{$version}/dialog/oauth?{$query}");
    }

    public function getTransactionHistory($request, $page)
    {

        $module = new Transaction();
        // List view columns to show
        $list_view_columns = [
            'service' => ['label' => __('Service'), 'type' => 'text'],
            'transaction_id' => ['label' => __('Transaction Id'), 'type' => 'text'],
            'amount' => ['label' => __('Amount'), 'type' => 'text'],
            'status' => ['label' => __('Status'), 'type' => 'text'],
            'error_message' => ['label' => __('Message'), 'type' => 'text'],
            'created_at' => ['label' => __('Created At'), 'type' => 'text'],
            //  'actions'   => [ 'label' =>'Action' , 'type' => 'url'],
        ];
        $listViewData = $this->listView($request, $module, $list_view_columns);
        $moduleData = [
            'singular' => '',
            'plural' => '',
            'module' => 'Transaction',
            'current_page' => 'Invoice',
            // Actions
            'actions' => [
                'export' => true,
                'search' => true,
                'filter' => true,
                'mass_edit' => true,
            ],
        ];
        $records =  $this->listViewRecord($request, $listViewData, 'Transaction');
        //$url = route(('wallet'), ['current_page' => 'Invoice']);
        // $records->withPath($url);  
        $data = array_merge($moduleData, $records);
        return $data;
    }

    public function messageLogs(Request $request)
    {
        $menuBar = $this->fetchMenuBar();
        $messageLogList = $this->getTransactionList($request, 'Expenses', '', 'listMessageLogs');

        return Inertia::render('Reports/MessageLogs', array_merge($messageLogList, [
            'plural' => __('Message Logs'),
            'menuBar' => $menuBar,
            'current_page' => 'Message Logs',
            'translator' => array_merge(
                $this->getTranslations(),
                [
                    'Message Logs' => __('Message Logs'),
                    'Messaging' => __('Messaging'),
                    'Messages' => __('Messages'),
                ],
            ),
        ]));
    }
    public function getTransactionList($request, $page, $from = '', $routeName = null)
    {

        $module = new Msg();
        // List view columns to show
        $list_view_columns = [
            'created_at' => ['label' => __('Date'), 'type' => 'text'],
            'service' => ['label' => __('Channel'), 'type' => 'text'],
            'account_id' => ['label' => __('Account'), 'type' => 'text'],
            'msg_type' => ['label' => __('Type'), 'type' => 'text'],
            'amount' => ['label' => __('Amount'), 'type' => 'text'],
        ];

        $listViewData = $this->listView($request, $module, $list_view_columns);
        $moduleData = [
            'singular' => '',
            'plural' => '',
            'module' => ($from == 'Dashboard') ? 'Dashboard' : 'Msg',
            'current_page' => 'Expenses',
            // Actions
            'actions' => [
                'export' => true,
                'search' => true,
                'filter' => true,
                'mass_edit' => true,
            ],
        ];
        //$records =  $this->listViewRecord($request, $listViewData, 'Msg');   

        $data = array_merge($moduleData, $listViewData);

        $data['records'] = collect($data['records'] ?? [])->map(function ($record) {
            $item = is_array($record) ? $record : $record->toArray();

            if (!empty($item['created_at'])) {
                $item['created_at'] = Carbon::parse($item['created_at'])
                    ->format('d-m-Y H:i:s');
            }

            return $item;
        })->all();

        if ($routeName) {
            $data['actions']['mass_edit'] = false;
            $data['paginator'] = $this->buildMessageLogPaginator($request, $routeName, $data['paginator'] ?? []);
            $data['routeName'] = $routeName;
            $data['listRouteParams'] = array_filter([
                'module' => 'Msg',
                'sort_time' => $request->get('sort_time'),
                'start_date' => $request->get('start_date'),
                'end_date' => $request->get('end_date'),
            ], fn($value) => $value !== null && $value !== '');
        }

        return $data;
    }

    private function buildMessageLogPaginator(Request $request, string $routeName, array $paginator): array
    {
        $query = $request->query();
        $query['module'] = $query['module'] ?? 'Msg';

        $currentPage = max((int) ($paginator['currentPage'] ?? 1), 1);
        $lastPage = max((int) ($paginator['lastPage'] ?? 1), 1);

        $paginator['firstPageUrl'] = route($routeName, array_merge($query, ['page' => 1]));
        $paginator['previousPageUrl'] = $currentPage > 1
            ? route($routeName, array_merge($query, ['page' => $currentPage - 1]))
            : null;
        $paginator['nextPageUrl'] = $currentPage < $lastPage
            ? route($routeName, array_merge($query, ['page' => $currentPage + 1]))
            : null;
        $paginator['lastPageUrl'] = route($routeName, array_merge($query, ['page' => $lastPage]));

        return $paginator;
    }

    public function checkInformation(Request $request)
    {

        $user = $request->user();
        $role = $user->role;
        $information = $user->information;

        if ($role == 'admin' && !$information) {
            return response()->json(['status' => 200, 'information' => false]);
        }

        return response()->json(['status' => 200, 'information' => true]);
    }

    public function onBoardingInformation(Request $request)
    {

        $user = $request->user();
        $company = Company::first();
        $stripe_public_key = config('stripe.stripe_key');
        $plans = DB::table('plans')->where('default_plan', 'true')->get();

        foreach ($plans as $plan) {
            $plan->period = 'monthly';
        }

        return Inertia::render('Auth/Registration/RegisterForm', [
            'user' => $user,
            'company' => $company,
            'stripe_public_key' => $stripe_public_key,
            'plans' => $plans,
            'translator' => Controller::getTranslations(),

        ]);
    }

    public function informationComplete(Request $request)
    {

        $user = $request->user();

        $user->information  = true;
        $user->save();

        return response()->json(['status' => true]);
    }

    /**
     * Login Admin user via token
     */
    public function loginAdminUser(Request $request)
    {
        $token = $_GET['access_code'];
        $checkToken = DB::table('company_access_token')
            ->where('token', $token)
            ->first();

        if ($checkToken) {
            $user = User::where('role', 'admin')->first();
            if ($user) {
                DB::table('company_access_token')->where('token', $token)->delete();
                Auth::login($user);
                return Redirect::route('dashboard');
            } else {
                abort(401);
            }
        } else {
            abort(401);
        }
    }

    public function deleteTemplate(Request $request, $id)
    {

        $template = Template::findOrFail($id);
        $account_id = $template->account_id;

        $messages = Message::where('template_id', $id)->get();
        foreach ($messages as $message) {
            if ($message) {
                MessageButton::where('message_id', $message->id)->delete();
                $message->delete();
            }
        }
        $template->delete();

        $templates = Template::where('account_id', $account_id)->get();

        return response()->json(['status' => 200, 'template' => $templates]);
    }

    public function updateApiAccount(Request $request)
    {

        $response = $request->account;
        $phone_number = isset($response['phone_number']) ? $response['phone_number'] : '';
        if (! $phone_number) {
            return response()->json(['status' => false, 'message' => 'Invalid data'], 403);
        }

        $account = Account::where('phone_number', $phone_number)->first();
        if ($account) {
            $fields = ['status', 'src_name', 'fb_whatsapp_account_id'];
            foreach ($fields as $field) {
                if (isset($response[$field])) {
                    $account->$field = $response[$field];
                }
            }
            $account->save();
            return response()->json(['status' => true, 'message' => 'Update your social profile successfully']);
        } else {
            return response()->json(['status' => false, 'message' => 'Invalid params'], 403);
        }
    }

    public function changeProfilePicture(Request $request)
    {

        $request->validate([
            'profile_picture' => 'required|mimes:jpeg,png,jpg,gif,svg',
        ]);

        $file = $request->file('profile_picture');
        $fileName = $file->getClientOriginalName();
        $destinationPath = public_path() . '/images';
        $file->move($destinationPath, $fileName);

        $attachFilePath = ['url' => asset('import_file/' . $fileName), 'path' => $destinationPath . '/' . $fileName];
        $filePath = '/images/' . $fileName;

        $company = Company::first();
        $company->file_path = $filePath;
        $company->save();

        return Redirect::route('wallet_subscription');
    }

    /**
     * Return social profile list and it's pages
     */
    public function fetchSocialPages(Request $request)
    {
        $profileList = [];
        $service = $_GET['service'];
        $accountsList = Account::where('service_engine', 'facebook')
            ->when(
                in_array($service, ['facebook', 'instagram'], true),
                fn($query) => $query->whereIn('service', ['facebook', 'instagram']),
                fn($query) => $query->where('service', $service)
            )
            ->get()
            ->unique(fn($account) => $account->fb_user_id ?: $account->id);

        foreach ($accountsList as $account) {
            $pages = [];
            if ($account->fb_meta_data) {
                $pages = unserialize(base64_decode($account->fb_meta_data));
            }
            $profileList[$account->id] = ['name' => $account->company_name, 'pages' => $pages];
        }

        return response()->json(['status' => true, 'social_profiles' => $profileList]);
    }

    public function tmpBodyfieldMapping(Request $request, $template_id)
    {

        $template = Template::whereId($template_id)->first();

        if (!$template) {
            return response()->json(['status' => false, 'message' => 'Your Template has been not founded.']);
        }

        $message = Message::where('template_id', $template_id)
            ->where('language', $request->language)
            ->first();

        if (!$message) {
            $message = new Message();
        }

        $message->template_id = $template_id;
        $message->language = $request->language;
        $message->example = base64_encode(serialize($request->sample_value));
        $message->save();

        return response()->json(['status' => true, 'message' => 'Template mapping save succesfully.']);
    }

    public function fetchMessageLog(Request $request)
    {
        $user = $request->user();

        $module = new Msg();
        $listViewData = $this->listView($request, $module, array());

        $paginator = array(
            'currentPage' => $listViewData['paginator']['currentPage'],
            'totalPages' => $listViewData['paginator']['lastPage'],
        );

        $records =  array();
        foreach ($listViewData['records'] as $record) {
            // Convert time to UTC
            $record['received_timestamp'] = Carbon::parse($record->created_at)->setTimezone('UTC')->format('Y-m-d H:i:s');
            $records[] = $record;
        }

        return response()->json(['status' => true, 'message' => 'Message log fetched successfully.', 'records' => $records, 'paginator' => $paginator]);
    }

    public function shopifyDashboard(Request $request)
    {
        $user = $request->user();
        $amountDeduction = $this->getMsgAmountDeduction($request, $user->id);

        //wallet balance
        $balance = Wallet::where('user_id', $user->id)
            ->pluck('balance_amount')
            ->first();

        // service data
        $messages = Msg::selectRaw(' count(id) as messages , sum(amount) as total , policy ,service')->whereMonth('created_at', date('m'))
            ->whereYear('created_at', date('Y'))
            ->groupBy('service')->get();

        //daily_messages chart
        $daily_messages = Msg::selectRaw(' count(id) as messages , created_at as date,sum(amount) as total')->whereMonth('created_at', date('m'))->whereYear('created_at', date('Y'))
            ->groupBy(DB::raw('DATE(created_at)'))->get();

        $per_day = [];
        foreach ($daily_messages as $val) {
            $per_day[$val->date] =  $val->messages;
        }
        $chart_input = implode($per_day);

        $service['total_messages'] = 0;
        foreach ($messages as $message) {
            if ($message->service == 'whatsapp' || $message->service == 'facebook' || $message->service == 'instagram') {
                $service['total_messages'] = $message->messages + number_format($service['total_messages']);
            }
            if ($message->service == 'whatsapp') {
                $service[$message->service] = ['amount' => number_format($message->total, 3, '.', ''), 'count' => $message->messages];
            } else if ($message->service == 'instagram') {
                $service[$message->service] = ['amount' => number_format($message->total, 3, '.', ''), 'count' => $message->messages];
            } else if ($message->service == 'facebook') {
                $service[$message->service] = ['amount' => number_format($message->total, 3, '.', ''), 'count' => $message->messages];
            }
        }

        // Get Session count
        $sessions = $this->getDashboardSessionCount();
        $totalSessionLimit = $this->getDashboardSessionLimit();

        $information = [
            'users' => $request->user(),
            'message_details' => $amountDeduction,
            'balance' => $balance,
            'services' => $service,
            'total_session_limit' => $totalSessionLimit,
            'current_session_count' => $sessions,
            'per_day_count' =>  $chart_input,
        ];
        return response()->json(['status' => true, 'message' => 'Dashboard details fetched successfully.', 'information' => $information]);
    }

    private function getDashboardSessionCount(): int
    {
        $sessionQuery = Session::query();
        $now = Carbon::now();

        foreach (['created_at', 'updated_at'] as $column) {
            if (Schema::hasColumn('sessions', $column)) {
                return (clone $sessionQuery)
                    ->whereMonth($column, $now->month)
                    ->whereYear($column, $now->year)
                    ->count();
            }
        }

        return $sessionQuery->count();
    }

    private function getDashboardSessionLimit(): int
    {
        return (int) (Company::query()->value('amount_limit') ?? 0);
    }
}
