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
use App\Models\IncomingUrl;
use Swift_SmtpTransport;
use Swift_Mailer;
use DB;
use Mail;


class UserController extends Controller
{

    /**
     * Show list of accounts
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
    public function user(Request $request)
    {
        $user = $request->user();
        $users = DB::table('users')
                    ->where( function($query) use($user){
                        if($user->role != 'Admin' ){
                            $query->where('id' , $user->id);
                        }
                    })
                    ->get();
        return Inertia::render('Admin/User/List', ['users' => $users ]);
    } 

    /**
     * Create User
     */
    public function createUser(Request $request)
    {
         
        $user = new User();
        return Inertia::render('Admin/User/CreateUser', ['user' => $user]);   
    } 

    /**
     * Edit User
     */
    public function editUser(Request $request ,$id)
    {

        $user = User::findOrFail($id);
        $password = $user->password;
        $currentUser = $request->user();
        return Inertia::render('Admin/User/CreateUser', ['user' => $user , 'password' => $password , 'currentUser' => $currentUser]);   
    } 

    /**
     * Show Detail view
     */
     public function userDetail($id)
      {
          $user = User::findOrFail($id);
          $token = $user->remember_token;
          return Inertia::render('Admin/User/UserDetail', ['user' => $user , 'token' => $token]);   
      } 

    /**
     * Save user data
     */
    public function storeUserRegistration(Request $request)
    {
        $token = '';
        if(!$request->get('id')){
            $request->validate([
                'name' => 'required|max:255',
                'email' => 'required|unique:users|max:255',
                'password' => 'required',
                'role' => 'required|max:255'
            ]);
            $user = new User();
            $password = bcrypt($request->get('password'));
        
        }   else {
            $user = User::findOrFail($request->get('id'));
            $password = $request->get('password');
        } 

            $fields = [
                'name', 'email', 'role' , 'status' 
            ];


            $user->name = $request->get('name');
            $user->email = $request->get('email');
            $user->role = $request->get('role');
            $user->status = $request->get('status');
            if ($request->get('password') != '') {
                $user->password = $password;
            }
            $user->save();
            if( !$request->get('id') ){
                //Create token new user
                $this->creareAccessToken($user);
            }
            return Redirect::route('user');
        
    }   

    
    /**
     * Regenerate Accrss Token
     */
    public function regenerateToken(Request $request){
        $userId = $request->get('user_id');
        $user = User::findOrFail($request->get('user_id'));
        $token = $this->creareAccessToken($user);
        echo json_encode( ['token' => $token->plainTextToken]);
    } 
    
    /**
     * Create access token to the user
     */
    public function creareAccessToken($user){
                $token = $user->createToken('WHATSAPP_API');
                $user->remember_token = $token->plainTextToken;
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
                // return redirect()->route('user')->with('global', 'Your account has been deleted!');
                 return response()->json(['success' => true, 'url' => '/admin/user', 'success'=> 'Record deleted'], 200);
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

        $templates = $incomingUrls = [];
        if($account) {
            $templates = Template::where('account_id', $id)->get();
            $incomingUrls = IncomingUrl::where('account_id', $id)->get();
        }
     
        return Inertia::render('Account/Detail', ['account' => $account, 'templates' => $templates , 'incoming_url' => $incomingUrls ]);
    }
    
    /**
     * Edit Account Data
     */
    public function editAccountData( $id ){
        $account = Account::findOrFail($id);
        return Inertia::render('Account/Registration', ['account' => $account]);
    } 

    /**
     * Delete account 
     */
    public function deleteAccount( Request $request ){
    
        $accountId = $request->get('id');
        $user_id = $request->user()->id;
        Account::destroy($accountId);
        $accounts = Account::where('user_id', $user_id)->get();
        echo json_encode(['accounts' => $accounts]); die;
    } 

    /**
     * Show account registration form
     */
    public function accountRegistration(Request $request)
    {
        return Inertia::render('Account/Registration');
    }

    /**
     * Store account registration
     */
    public function storeAccountRegistration(Request $request) 
    {

        $user_id = $request->user()->id;
        // Create new account
        if($request->has('id') && $request->get('id') > 0){
            $id = $request->get('id');
            $request->validate([
                    'company_name' => 'required|max:255',
                    'company_type' => 'required',
                    'website' => 'required|max:255',
                    'email' => 'required|max:255|email',
                    'estimated_launch_date' => 'required|date',
                    'type_of_integration' => 'required',
                    'phone_number' => 'required|numeric',
                    'display_name' => 'required|max:255',
                    'business_manager_id' => 'required|max:255',
                    'profile_description' => 'required|max:139',
                    'oba' => 'required|boolean',
            ]);
            $existPhnCheck = Account::where('phone_number', $request->get('phone_number'))->where('id', '!=' , $id)->first();
            if($existPhnCheck){
                $request->validate([
                    'phone_number' => 'required|numeric|unique:accounts',
                    ]);
            }
            $account = Account::findOrFail($id);
        } else {
            $request->validate([
                    'company_name' => 'required|max:255',
                    'company_type' => 'required',
                    'website' => 'required|max:255',
                    'email' => 'required|max:255|email',
                    'estimated_launch_date' => 'required|date',
                    'type_of_integration' => 'required',
                    'phone_number' => 'required|numeric|unique:accounts',
                    'display_name' => 'required|max:255',
                    'business_manager_id' => 'required|max:255',
                    'profile_picture' => 'required|image|mimes:jpg,png',
                    'profile_description' => 'required|max:139',
                    'oba' => 'required|boolean',
            ]);
            $account = new Account();
        
            // Storing the profile picture
            $path = $request->file('profile_picture')->store('profile_pictures');
            $account->profile_picture = $path;
        }

        $fields = [
            'company_name', 'company_type', 'website', 'email', 
            'estimated_launch_date', 'type_of_integration', 'phone_number', 'display_name',
            'business_manager_id', 'profile_description', 'oba',
        ];

        
        foreach($fields as $field_name) {
            $field_value = $request->get($field_name);
            $account->$field_name = $field_value;
        }
        // Setting logged in user id
        $account->user_id = $user_id;

        $account->status = 'New'; // Setting the status as New.
        $account->save();

        return Redirect::route('dashboard');
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


        return Redirect::route('account_view', $account_id);
    }

    /**
     * Create new Incoming URL
     */
    public function createNewIncomingURL(Request $request , $account_id){
        $request->validate([ 
            'incoming_url' => 'required',
        ]);
        $incomingUrl = new IncomingUrl();
        $incomingUrl->incoming_url = $request->get('incoming_url');
        $incomingUrl->account_id = $account_id;

        $incomingUrl->save();

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
        
        if(!$account) {
            abort(401, 'You are not authorised to view this');
        }

        $template = Template::where('account_id', $account_id)
            ->where('id', $template_id)
            ->first();

        // Setting language
        $language = $template->languages[0];
        if($request->has('language')) {
            $language = $request->get('language');
        }

        $message = Message::where('template_id', $template_id)
            ->where('language', $language)
            ->first();

        if(!$message) {
            $message = new Message();
        }

        $message_buttons = [];
        if($message->id) {
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

        if($request->get('header_type') == 'text') {
            $validation_array['header_text'] = 'required|max:60';
        }
 
        $request->validate($validation_array);        

        $user_id = $request->user()->id;
        $account = Account::where('user_id', $user_id)
            ->where('id', $account_id)
            ->first();
        
        if(!$account) {
            abort(401, 'You are not authorised to view this');
        }

        // Storing Message
        $message = Message::where('template_id', $template_id)
            ->where('language', $request->get('language'))
            ->first();

        if(!$message) {
            $message = new Message();
        }

        $message->header_type = $request->get('header_type');
        if($message->header_type == 'text') {
            $message->header_content = $request->get('header_text');
        }
        else {
            $message->header_content = '';
        }

        $message->body = $request->get('body');
        $message->footer_content = $request->get('body_footer');
        $message->template_id = $template_id;
        $message->language = $request->get('language');
        $message->save();

        $message_id = $message->id;

        // Storing Buttons if available
        $buttons = $request->get('buttons');
        if(count($buttons) > 0) {
            foreach($buttons as $button) {
                $buttonObj = new MessageButton();
                if($button['id']) {
                    $buttonObj = MessageButton::find($button['id']);
                }

                $buttonObj->button_type = $button['button_type'];
                $buttonObj->body = $button['button_text'];
                if($buttonObj->button_type == 'Call to Action') {
                    $buttonObj->action = $button['action'];
                    if($buttonObj->action == 'call_phone_number') {
                        $buttonObj->body = $button['button_text'];
                        $buttonObj->phone_number = $button['phone_number'];
                    }
                    else {
                        $buttonObj->body = '';
                        $buttonObj->phone_number = '';
                    }

                    if($buttonObj->action == 'visit_website') {
                        $buttonObj->url_type = $button['url_type'];
                        $buttonObj->url = $button['url'];
                    }
                    else {
                        $buttonObj->url_type = '';
                        $buttonObj->url = '';
                    }
                }
                else {
                    $buttonObj->action = '';
                    $buttonObj->phone_number = '';
                    $buttonObj->url_type = '';
                    $buttonObj->url = '';
                }
                $buttonObj->message_id = $message_id;
                $buttonObj->save();
            }
        }

        $template = Template::where('account_id', $account_id)
            ->where('id', $template_id)
            ->first();

        // Setting language
        $language = $template->languages[0];
        if($request->has('language')) {
            $language = $request->get('language');
        }

        $message_buttons = MessageButton::where('message_id', $message_id)->get();

        // Send mail script
        $accFields = [
            'Company Name' => 'company_name', 'Company Type' => 'company_type', 'Company Service Website' =>  'website', 'Technical Point Of Contact' => 'email', 'Estimated Lunch Date' => 'estimated_launch_date', 'Type of Integration' => 'type_of_integration', 'Phone Number' => 'phone_number', 'Display Name' => 'display_name'
        ];
        $toAddressInfo = MailToAddress::where('user_id' ,$user_id )->first();

        // backup mailing configuration
        $backup = Mail::getSwiftMailer();
        $smtpConfigData = OutgoingServerConfig::where('user_id' ,$user_id )->first();

        // set mailing configuration
        $transport = new \Swift_SmtpTransport(
                                    $smtpConfigData->server_name, 
                                    $smtpConfigData->port_num, 
                                    $smtpConfigData->port_type
                                );

        $transport->setUsername($smtpConfigData->user_name , $smtpConfigData->from_name );
        $transport->setPassword( unserialize( base64_decode( $smtpConfigData->password) ) );


        $maildoll = new Swift_Mailer($transport);
        
        // set mailtrap mailer
        Mail::setSwiftMailer($maildoll);

        Mail::send('Mail.MailTemplate', [
                    'account_data' => $account , 
                    'template_data' => $template , 
                    'temp_content' => $message , 
                    'account_field' => $accFields ,
                    'buttons' => $message_buttons,
                ], 
                function($message) use( $toAddressInfo , $template ,$smtpConfigData ) {
                   $message->to($toAddressInfo->to_email, $toAddressInfo->to_name)->subject( $template->category );
                   $message->from($smtpConfigData->from_email , $smtpConfigData->from_name); 
                });

        Mail::setSwiftMailer($backup);  // Set Mailer Original credential

        return Inertia::render('Account/Template/Detail', [
            'template' => $template,
            'message' => $message,
            'language' => $language,
            'buttons' => $message_buttons,
        ]);
    }
}
