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
use App\Models\SupportRequest;
use App\Models\WebhookEvent;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Facebook\Facebook;
use Session;
use PDF;
use Schema;
use Cache;
use DB;
use Mail;

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
        'global_admin' => 'Global Admin',
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
     * Show home page 
     */
    public function home(Request $request)
    {
        return Inertia::render('Home',[

        ]);
    }

    /**
     * Show list of accounts related to logged in user
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();        
        $user_id = $user->id;
        $companyId = Cache::get('selected_company_' . $user_id);

        $query = Account::select('company_name', 'service', 'accounts.id', 'accounts.status');
    //    if($user->role != 'global_admin') {
            $query->where('company_id', $companyId);
    //    }

        $accounts = $query->get();
        
        return Inertia::render('Dashboard', [
            'accounts' => $accounts,
            'users' =>$user,
            'translator' => [
                'Dashboard'=>__('Dashboard'),
                'Create a new social profile'=>__('Create a new social profile'),
                'Business profiles'=>__('Business profiles'),
                'No profile'=>__('No profile'),
                'Get started by creating a new social profile.'=>__('Get started by creating a new social profile.'),
                'Click here to create a new social profile'=>__('Click here to create a new social profile'),
                'Confirm to Delete' =>  __('Confirm to Delete'),
                'Are you sure to do this?' => __('Are you sure to do this?'),
                'Yes' =>__('Yes'),
                'No' =>__('No'),  
            ],      
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

        $listViewData = $this->listView($request, $module, $list_view_columns);        

        $moduleData = [
            'singular' => 'User',
            'plural' => 'Users',
            'module' => 'User',
            'add_link' => ( $request->is('admin/*') ) ?  route('create_global_user') : route('create_user'),
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
                'select_field'=>true

            ],
            'translator' => [
                'No records' =>__('No records'),
                'Search' =>__('Search'),
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
        
        if($currentUser->role != 'regular') {
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
        if($flag === false) {
            abort(401);
        }

        $user = User::find($id);
        $password = $user->password;
        $user_roles = $this->getRoles($currentUser);
        
        if($currentUser->role != 'regular' || $user->id == $currentUser->id) {
            return Inertia::render('Admin/User/CreateUser', [
                    'user' => $user, 
                    'password' => $password, 
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
     * Show Detail view
     */
    public function userDetail(Request $request, $id = '')
    {
        // Check whether user has permission to view the record.
        $currentUser = $request->user();
       
        $flag = $this->checkPermission($currentUser, $id);
        
        if($flag === false) {
            abort(401);
        }

        $user = User::find($id);
        $companies = $user->company;

        $related_Company = $this->UserRelatedCompany($id);
        
        $token = $user->api_token;        
        if($currentUser->role != 'regular' || $user->id == $currentUser->id) {
            return Inertia::render('Admin/User/UserDetail', [
                'user' => $user, 
                'token' => $token,
                'companies' => $companies,
                'current_user' => $request->user(),
                'time_zone' => $this->timezones,
                'related_company' => $related_Company,
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
        
        if($flag === false) {
            abort(401);
        }

        $user = User::find($currentUser->id);

        $token = $user->api_token;
        if($user->id == $currentUser->id) {
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
        $companyId = Cache::get('selected_company_'. $currentUser->id);
        // Check whether user has permission to create/update the user
        if(($request->get('id') == $currentUser->id) || $request->user()->role != 'regular') {
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
                if($flag === false) {
                    abort(401);
                }
        
                $user = User::find($request->get('id'));
            }

            $user->first_name = $request->get('first_name');
            $user->last_name = $request->get('last_name');
            $user->name =  $request->get('first_name') . ' ' .$request->get('last_name');
            $user->email = $request->get('email');
            $user->phone_number = $request->get('phone_number');
            $user->language = $request->get('language');
            // $user->currency = $request->get('currency');
            // $user->time_zone = $request->get('time_zone');
            // $user->company_address = $request->get('company_address');
            // $user->company_country = $request->get('company_country');
            // $user->company_vat_id = $request->get('company_vat_id');
            // $user->codice_destinatario = $request->get('codice_destinatario');
            // $user->email = $request->get('email');

            // Only admin and global admin can able to set the user role
            if($currentUser->role == 'admin' || $currentUser->role == 'global_admin') {
                $tmpRole = $request->get('role');
                // Admin user can't set user as global_admin
                if($currentUser->role == 'admin') {
                    if($tmpRole == 'global_admin') {
                        $tmpRole = 'admin';
                    }
                }

                $user->role = $tmpRole ? $tmpRole : 'regular';
                $user->status = $request->get('status');
            }

            $_REQUEST['company_id'] = $companyId;
            
            $user->save();

            $user_id = $user->id;

            // Attached the company
            $user->company()->syncWithoutDetaching([$companyId]);
            
            if($currentUser->role == 'global_admin') {
                return Redirect::route('detail_global_User', $user_id);
            }
            else if($currentUser->role == 'admin') {
                return Redirect::route('detailUser', $user_id);
            }
            else {
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
        if($flag === false) {
            abort(401);
        }

        $user = User::find($id);
        if($currentUser->id == $user->id) { // User updating his/her own password. So we need to match the old password.
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
        if($currentUser->role == 'global_admin') {
            return Redirect::route('detail_global_user', $id);
        }
        else if($currentUser->role == 'admin') {
            return Redirect::route('detailUser', $id);
        }
        else {
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
        $companyId = Cache::get('selected_company_'. $user->id);
        if($request->is_soft){
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
                'select_field'=>false,
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
        $companyId = Cache::get('selected_company_'. $user->id);
        $query = Account::where('id', $id);

        if($user->role != 'global_admin') {
            $query->where('company_id', $companyId);
        }
        $account = $query->first();

        if (!$account) {
            abort(401, __('You are not authorised to see this record.'));
        }

        $templates = Template::where('account_id', $id)->get();
        $webhookEvents = WebhookEvent::where('account_id', $id)->get();

        // $field_info = [
        //     'company_name' => ['label' => __('Name')],
        //     'service_engine' => ['label' => 'Service Engine'],
        //     'service_token' => ['label' => 'Service token'],
        //     'fb_phone_number_id' => ['label' => 'FaceBook phone number ID'],
        //     'fb_whatsapp_account_id' => ['label' => 'FaceBook whatsapp account ID'],
        //     'service' => ['label' => __('Service')],
        //     // 'company_type' => ['label' => 'Company type'],
        //     // 'website' => ['label' => 'Website'],
        //     // 'email' => ['label' => 'Email'],
        //     // 'estimated_launch_date' => ['label' => 'Estimated launch date'],
        //     // 'type_of_integration' => ['label' => 'Type of integration'],
        //     'display_name' => ['label' => __('Display name'), 'show' => ['whatsapp']],
        //     'phone_number' => ['label' => __('Phone number'), 'show' => ['whatsapp']],
        //     'src_name' => ['label' => __('Source name'), 'show' => ['whatsapp', 'instagram']],
        //     'api_partner' => ['label' => __('API partner'), 'show' => ['whatsapp']],
        //     'api_partner_name' => ['label' => __('API partner Name'), 'show' => ['whatsapp']],
        //     'business_manager_id' => ['label' => __('Business manager ID'), 'show' => ['whatsapp']],
        //     'Profile' => __('Profile'),
        //     'Callback URL' => __('Callback URL')
        //     // 'profile_picture' => ['label' => 'Profile picture', 'type' => 'image', 'show' => ['whatsapp']],
        //     // 'profile_description' => ['label' => 'Profile description', 'show' => ['whatsapp']],
        //     // 'status' => ['label' => 'Status'],
        // ];

        $field_info = [
            'company_name' => ['label' => __('Name')],
            'phone_number' => ['label' => __('Phone number'), 'show' => ['whatsapp']],
            'service' => ['label' => __('Service')],
            'service_engine' => ['label' => 'Service Engine'],
          //  'service_token' => ['label' => 'Service token'],
            'fb_phone_number_id' => ['label' => 'FaceBook phone number ID' , 'fb_show' => [ 'facebook', 'global_admin']],
            'src_name' => ['label' => __('Source name'), 'show' => ['whatsapp', 'instagram']],
            'fb_whatsapp_account_id' => ['label' => 'FaceBook whatsapp account ID', 'fb_show' => [ 'facebook' , 'gupshup']],
          
           // 'display_name' => ['label' => __('Display name'), 'show' => ['whatsapp']],
          //  'api_partner' => ['label' => __('API partner'), 'show' => ['whatsapp']],
          //  'api_partner_name' => ['label' => __('API partner Name'), 'show' => ['whatsapp']],
            'business_manager_id' => ['label' => __('Business manager ID'), 'show' => ['whatsapp']],
            'Profile' => __('Profile'),
            'Callback URL' => __('Callback URL')
          
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
        return Inertia::render('Account/Registration/Form');
        // return Inertia::render('Account/Registration', [
        //     'webhook_events' => $this->webhook_events, 
        //     'translator' => [
        //         'Account Registration' => __('Account Registration'),
        //         'Account Information' =>  __('Account Information'),
        //         'Enter your company information. We will be using this information to create your business account' =>  __('Enter your company information. We will be using this information to create your business account'),
        //         'Name' => __('Name'),
        //         'Enter your Account name' => __('Enter your Account name'),
        //         'Company Name' =>  __('Company Name'),
        //         'Enter your company name' =>  __('Enter your company name'),
        //         'Service' =>  __('Service'),
        //         'Company type' =>  __('Company type'),
        //         'Company website' =>  __('Company website'),
        //         'Enter your company website' =>  __('Enter your company website'),
        //         'Email (Technical point of contact' =>  __('Email (Technical point of contact)'),
        //         'Estimated launch date' =>  __('Estimated launch date'),
        //         'Type of integration' =>  __('Type of integration'),
        //         'Whatsapp Information' =>  __('Whatsapp Information'),
        //         'Instagram Information' =>  __('Instagram Information'),
        //         'Information will be used to create your whatsapp business account' =>  __('Information will be used to create your whatsapp business account'),
        //         'Information will be used to create your instagram business account' =>  __('Information will be used to create your instagram business account'),
        //         'Phone number' =>  __('Phone number'),
        //         'Source Name' =>  __('Source Name'),
        //         'Display Name' =>  __('Display Name'),
        //         'API partner Name' => __('API partner Name'),
        //         'Do you agree with our' =>__('Do you agree with our'),'terms and conditions?' => __('terms and conditions?'),
        //         'Business manager Id' =>  __('Business manager Id'),
        //         'Profile picture' =>  __('Profile picture'),
        //         'Profile description' =>  __('Profile description'),
        //         'Official business account' =>  __('Official business account'),
        //         'Request for Whatsapp official business account (OBA).' =>  __('Request for Whatsapp official business account (OBA).'),
        //         'Cancel' =>  __('Cancel'),'Save' =>  __('Save'),
        //         'Sole Proprietorship' =>  __('Sole Proprietorship'),
        //         'Partnership' =>  __('Partnership'),'Limited Liability Company (LLC)' =>  __('Limited Liability Company (LLC)'),
        //         'Corporation' =>  __('Corporation'),'Website' =>  __('Website'),'Support' =>  __('Support')]

        // ]);
    }

    /**
     * Store account registration
     */
    public function storeAccountRegistration(Request $request)
    {
        $id = '';
        $displayName = '';
        $user_id = $request->user()->id;
        
        //check for edit or create new account
        if ($request->has('id') && $request->get('id') > 0) {
            $id = $request->get('id');
        }

        if($request->has('legal_entity') && $request->get('legal_entity')){
            $displayName = $request->get('legal_entity'); 
        }

        //check if the user select the company name as display name
        if($displayName != 'yes'){
           $request->validate([
            'display_name' => 'required|max:255',
           ]);
        }

        $request->validate([
            'service' => 'required',
            'company_name' => 'required'
        ]);

        $service = $request->get('service');

        if($service == 'whatsapp'){

            //validate the phone number is unique
            if($request->get('id')) {
                $request->validate([
                    'phone_number' => 'required|numeric|unique:accounts,phone_number,' . $request->get('id')
                ]);
            } else {
                $request->validate([
                    'phone_number' => 'required|numeric|unique:accounts'
                ]);
            }
        }

        if($id){
            $account = Account::findOrFail($id);
        }else{
            $account = new Account();

            $account->status = 'New'; // inicial  status as New.
        }

        $account->service = $request->service;
        $account->status = ($request->status) ? $request->status : 'New';
        $account->service_engine = $request->service_engine;
        $account->service_token = $request->service_token;
        $account->fb_phone_number_id = $request->fb_phone_number_id;
        $account->fb_whatsapp_account_id = $request->fb_whatsapp_account_id;
        $account->phone_number = $request->phone_number;
        $account->src_name = $request->src_name;
        $account->company_name = $request->company_name;
        $account->business_manager_id = $request->business_manager_id;
        
        if($displayName == 'yes'){
           $account->display_name = $request->company_name;
        }else{
           $account->display_name = $request->display_name;
        }
        
        $accountFields = ['company_name','website','category','description','email'];

        foreach($accountFields as $field){
            if($request->has($field)){
                $account->$field = $request->$field;
            }
        }

        //log in user id & company
        $account->user_id = $user_id;
        $account->company_id = Cache::get('selected_company_'. $user_id);
        $account->save();
        

        if($id){
            return Redirect::route('wallet_subscription' , ['tab' => 2]);
            //return Redirect::route('listAccount');
        }else{
            $supportRequest = new SupportRequest();
            $supportRequest->subject= 'New Social Profile is created';
            $supportRequest->description = 'New Social Profile is created.[ '.$account->display_name.','. $account->id.']';
            $supportRequest->type = "Channel";
            $supportRequest->assigned_to = $request->user()->id;
            $supportRequest->status = "New";
            $supportRequest->company_id = Cache::get('selected_company_'. $user_id);
            $supportRequest->created_by=  $account->user_id;          
            $supportRequest->save();
            return response()->json(['status' => true, 'account_id' => $account->id]);
        }

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
        $template->company_id = Cache::get('selected_company_' . $request->user()->id) ;
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
        $user = $request->user();
        $companyId = Cache::get('selected_company_'. $user->id);

        $query = Account::where('id', $account_id);
        if($user->role != 'global_admin') {
            $query->where('company_id', $companyId);
        }
        $account = $query->first();

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
        $sampleData = '';
        if($message->example){
            $sampleData = unserialize(base64_decode($message->example));
        }

        $message_buttons = [];
        if ($message->id) {
            $message_buttons = MessageButton::where('message_id', $message->id)->get();
        }

        // Get module fields
        $fields = [];
        $getFields = Field::where('module_name', 'Contact')
                ->where('company_id', $companyId)
                ->where('field_type' , '!=' , 'relate' )
                ->groupBy('field_name')
                ->orderBy('id')
                ->get();
        
        foreach($getFields as $field){
            $fields[$field->field_name] = $field->field_label;
        }
    //   dd($message);
        return Inertia::render('Account/Template/Detail', [
            'template' => $template,
            'message' => $message,
            'samples' => $sampleData,
            'language' => $language,
            'buttons' => $message_buttons,
            'fields' => $fields,
        ]);
    }

    /**
     * Store template
     */
    public function storeTemplate(Request $request, $account_id, $template_id)
    {
        $user = $request->user();
        $companyId = Cache::get('selected_company_'. $user->id);
        $query = Account::where('id', $account_id);
        if($user->role != 'global_admin') {
            $query->where('company_id', $companyId);
        }
        $account = $query->first();

        if (!$account) {
            abort(401, 'You are not authorised to view this');
        }
        if($account->service_engine == 'facebook'){
            $validation_array = [
                'body' => 'required|max:1024',
            ];
        } else {
            $validation_array = [
                'header_type' => 'required',
                'body' => 'required|max:1024',
                'body_footer' => 'required|max:60',
            ];
            if ($request->get('header_type') == 'text') {
                $validation_array['header_text'] = 'required|max:60';
            }
        }
        if($request->get('header_type') != 'text' ){
            $validation_array['attach_file'] = 'required';
        }
    
        $request->validate($validation_array);
        
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
            'result' => $result,
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
        
        $company_id = Cache::get('selected_company_'.$user->id);

        //get current company details
        $currentCompany =  Company::where('id', $company_id)->first();
        
        // Get Company Subscription Plan name
        if($currentCompany->plan != 'lite') {
            $plan = DB::table('stripe_plans')->where('id', $currentCompany->plan)->first();

            if($plan){
                $currentCompany['plan'] = $plan->name;
            }
        }

        // Get message amount deduction
        $messageDeduction = $this->getMsgAmountDeduction($user->id);
        $accountDeduction = $this->getDeductionDetail($user->id);
    
        $paymentMethods = $this->getPaymentMethods($request , 'direct');

        $stripe_public_key = config('stripe.stripe_key');

        return Inertia::render('Wallet/WalletIndex', [
            'name' => $user->name,
            'balance' => $balance,
            'message_deduction' => $messageDeduction,
            'message_accoount_detail' => $accountDeduction,
            'paymentMethods' => $paymentMethods,
            'stripe_public_key' => $stripe_public_key,
            'currentPlan' => $currentCompany,
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
        $companyId = Cache::get('selected_company_'. $user_id);

        // Get company
        $company = Company::find($companyId);
        
        try {
            $params = [
                'description' => 'OneMessage recharge',
                'customer' => $company->stripe_id,
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
                $transaction->company_id = $companyId;
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
            $transaction->company_id = Cache::get('selected_company_'.$user_id);
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
            'created_at' => [ 'label' => __('Created At') , 'type' => 'text'],
          //  'actions'   => [ 'label' =>'Action' , 'type' => 'url'],
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
    public function getMsgAmountDeduction($user_id)
{
        //TODO Need to get country id for gettting price detail

        $countryId = 1;
        //$price = Price::find($countryId);

        $messages = Msg::selectRaw(' count(msgs.id) as messages , sum(amount) as total , policy')
            ->leftJoin('accounts', 'account_id', 'accounts.id')
            ->where('user_id', $user_id)
            ->where('msgs.created_at', '>', now()->subDays(30)->endOfDay())
            ->whereNotNull('policy')
            ->groupBy('amount', 'policy')
            ->get();
           
        $data = $this->getAmountDetailsBasedOnMsg($messages );
        return $data;
    }

    /**
     * Return amount details 
     */
    public function getAmountDetailsBasedOnMsg($records)
    {
        $return['total_messages'] = 0;
        $return['total_amount'] = 0;
      
        foreach($records as $message){    
            $return['total_messages'] = $message->messages + $return['total_messages'];
            $return['total_amount'] = $message->total + $return['total_amount'];

            if($message->policy == 'BIC'){
                $return[$message->policy] = ['amount' => number_format($message->total , 4, '.', ''), 'count' => $message->messages];
            } else if($message->policy == 'UIC') {
                $return[$message->policy] = ['amount' => number_format($message->total , 4, '.', '') , 'count' => $message->messages];
            } else if($message->policy == 'FEP'){
                $return[$message->policy] = ['amount' => number_format($message->total , 4, '.', '') , 'count' => $message->messages];
            }
        }
        return $return; 
    }

    /**
     * Return amount detail  
     */
    public function getDeductionDetail($userId)
    {
        $companyId =  Cache::get('selected_company_' . $userId);
        $accounts = Account::where('company_id' , $companyId)->get();

        $accooutAmountDetail = [];
        foreach($accounts as $account){
            $messages = Msg::selectRaw(' count(msgs.id) as messages , sum(amount) as total , policy')
                ->where('account_id', $account->id)
                ->where('msgs.created_at', '>', now()->subDays(30)->endOfDay())
                ->whereNotNull('policy')
                ->groupBy('amount', 'policy')
                ->get();

            $data = $this->getAmountDetailsBasedOnMsg($messages);
            $accooutAmountDetail[] = [
                'service' => $account->service,
                'number' => $account->phone_number,
                'amount_data' => $data,
            ];
        } 
        
        return $accooutAmountDetail;
      //  dd($accooutAmountDetail);
    }


    /**
     * Return companies related to User and selected company name
     */
    public function getSelectedCompany(Request $request)
    {
        $user = $request->user();
        // Get user related compan
        $companies = $this->UserRelatedCompany($user->id);

        $selectedCompany = Cache::has('selected_company_' . $user->id) ? Cache::get('selected_company_' . $user->id) : '';
       
        // If user has single company related to him, set the company as default
        if($companies && !$selectedCompany && count($companies) == 1) {
            $selectedCompany = array_keys($companies)[0];
            Cache::put('selected_company_' . $user->id, $selectedCompany);
        }

        // Get register step 
        $registerStep = Cache::get('user_steps_status_'. $request->user()->id );
        
        return response()->json([
            'success' => true,
            'selected_company' => $selectedCompany,
            'companies' => $companies,
            'register_step' => $registerStep,
        ], 200);
    }

    /**
     * Return role list based on the current user role
     */
    public function getRoles($user)
    {
        $user_roles = $this->userRoles;
        if($user->role != 'global_admin') {
            unset($user_roles['global_admin']);
        }
        return $user_roles;
    }

    /**
     * Check whether user has permission to access the record
     */
    public function checkPermission($currentUser, $user_id)
    {
        if(!$user_id) {
            return false;
        }

        // If user is trying to access his own record, allow
        if($currentUser->id == $user_id) {
            return true;
        }

        $user = User::where('id', $user_id)->first();
        $companies = $user->company;

        $flag = false;
        if($currentUser->role == 'global_admin') {
            $flag = true;
        }
        else {
            $selectedCompany = Cache::has('selected_company_' . $currentUser->id) ? Cache::get('selected_company_' . $currentUser->id) : '';
            foreach($companies as $company) {
                if($company->id == $selectedCompany) {
                    $flag = true;
                    break;
                }
            }
        }
        return $flag;
    }

    /**
     * Change Login User
     */
    public function changeLogInUser(Request $request)
    {
        $userId = $request->user_id;
        $currentUser = $request->user()->id;
        $user = User::find($userId);
        
        // clear cache
        Cache::forget('selected_company_'. $request->user()->id);
        Cache::flush();

        // Start the session
        Session::put('global_user', $currentUser);
        
        Auth::login($user);

        return Redirect::route('dashboard');
    }

    /**
     * Check user session value
     */
    public function getUserSession(Request $request)
    {
        $userSession = Session::get('global_user');
        $sessionUser = false;
        if($userSession){
            $sessionUser = $userSession;
        }
        echo json_encode(['session_value' =>$sessionUser ]);
    }

    /**
     * get User Timezone
     */
    public function getUserTimeZone(Request $request)
    {   
        $zones = $this->timezones;
        $timezones = [];
        foreach($zones as $country => $time) {
            $timezones[] = ['value' => $country, 'label' => $time];
        }
        
        echo json_encode(['time_zone' => $timezones ]);
    }

    /**
     * Set Global User
     */
    public function setGlobalUser(Request $request)
    {
        $userId = $request->user_id;

        if($userId ==  $request->session()->get('global_user')){
            $user = User::find($userId);

            // clear cache
            Cache::forget('selected_company_'. $request->user()->id);
            Cache::flush();

            // clear session
            $request->session()->forget('global_user');
            $request->session()->flush();

            // Login Global Admin
            Auth::login($user);
            
        }

        return Redirect::route('dashboard');
    }

    /**
     * Store Stribe payment method
     */
    public function storePaymentMethod(Request $request)
    {
        $user = $request->user();
        // Get company
        $companyId = Cache::get('selected_company_'. $user->id);
        $company = Company::find($companyId);

        $stripe = new \Stripe\StripeClient(config('stripe.stripe_secret'));

        // Attach payment method to customer
        $stripe->paymentMethods->attach(
            $request->id,
            ['customer' => $company->stripe_id]
        );
        
        echo json_encode(['status' => true ]);
    }

    public function UserRelatedCompany($user_id){
        
        if($user_id){
            //related company details
            $userCompany = DB::table('company_user')->where('user_id', $user_id)->get('company_id');            
            foreach($userCompany as $company){
                $company =  Company::where('id', $company->company_id)->first();
                $related_company[$company['id']] = $company['name'];
            }

            return $related_company;
        }
    }

    public function addWalletAmount(Request $request){
        
        $company_id = $request->selected_company;
        $walletAmount = $request->wallet_amount;

        $wallet = Wallet::where('company_id',$company_id)->first();

        if($wallet){
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
        $intent = $user->createSetupIntent();

        return response()->json(['intent' => $intent]);
    }

    /**
     * Get Payment Methods
     */
    public function getPaymentMethods(Request $request , $mode = '') 
    {
        $user = $request->user();
        $paymentMethods = '';
        try{
            $paymentMethods = $user->paymentMethods();
        }
        catch(error $e){
            log::info(['Payment method issue ' => $e->getMessage()]);
        }

        if($mode){
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
        $user->addPaymentMethod($request->get('id'));
        return response()->json(['message' => 'Payment Method Related Successfully', 'status' => true]);
    }

    public function sendMigrateRequest(Request $request) {

        $emailAddress = 'rajkumar@blackant.io';
        $emailAddress = filter_var($emailAddress, FILTER_SANITIZE_EMAIL);

        $data = [
            'data' => $request
        ];

        if($emailAddress){
            Mail::send('account',$data, function($message) use ($emailAddress){
                $message->to($emailAddress)->subject
                ('Welcome');
            });
        }
        
        return response()->json(['status' => true]);
    }

    /**
     * Connect FaceBook
     */
    public function connectFaceBook(Request $request, $accountId)
    {
	    session_start();
        Session::put('fb_access_token_account_id', $accountId);

        $fb = new Facebook([
            'app_id' => config('app.fb.api_id'),
            'app_secret' => config('app.fb.app_secret'),
            'default_graph_version' => config('app.fb.app_graph_version'),
     	]);
          
        $helper = $fb->getRedirectLoginHelper();
        $permissions = ['email', 'whatsapp_business_management', 'whatsapp_business_messaging', 'public_profile'];
        $loginUrl = $helper->getLoginUrl( config('app.fb.call_back_url'), $permissions);

        return redirect()->away($loginUrl);
    }

    /**
     * Get facebook unique code and store account table 
     */
    public function storeFaceBookCode(Request $request)
    {
        Session::put('fb_access_token', '');
        session_start();
        
        $accountId =  Session::get('fb_access_token_account_id');
       
        $fb = new Facebook([
            'app_id' => config('app.fb.api_id'),
            'app_secret' => config('app.fb.app_secret'),
            'default_graph_version' => config('app.fb.app_graph_version'),
            ]);
          
          $helper = $fb->getRedirectLoginHelper();
          
          try {
            $accessToken = $helper->getAccessToken();
          } catch(Facebook\Exceptions\FacebookResponseException $e) {
            Log::info('Graph returned an error: ' . $e->getMessage());
            exit;
          } catch(Facebook\Exceptions\FacebookSDKException $e) {
            Log::info(  'Facebook SDK returned an error: ' . $e->getMessage());
            exit;
          }
          
          if (! isset($accessToken)) {
            if ($helper->getError()) {
              header('HTTP/1.0 401 Unauthorized');
              echo "Error: " . $helper->getError() . "\n";
              echo "Error Code: " . $helper->getErrorCode() . "\n";
              echo "Error Reason: " . $helper->getErrorReason() . "\n";
              echo "Error Description: " . $helper->getErrorDescription() . "\n";
            } else {
              header('HTTP/1.0 400 Bad Request');
              echo 'Bad request';
            }
            exit;
          }
          
          $token = $accessToken->getValue();
          $account = Account::find($accountId);
          $account->fb_token = $token;
          $account->status = 'Active';
          $account->save();

          return Redirect::route('dashboard');
    }

}
