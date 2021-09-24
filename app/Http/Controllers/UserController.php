<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Account;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use DB;

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
        $users = DB::table('users')->get();
        return Inertia::render('Admin/List', ['users' => $users ]);
    } 

    /**
     * Create User
     */
    public function createUser(Request $request)
    {
         
        $user = new User();
        return Inertia::render('Admin/CreateUser', ['user' => $user]);   
    } 

    /**
     * Edit User
     */
    public function editUser($id)
    {

        $user = new User();
        $user = User::findOrFail($id);
        $password = $user->password;
        return Inertia::render('Admin/CreateUser', ['user' => $user , 'password' => $password]);   
    } 

    /**
     * Show Detail view
     */
     public function userDetail($id)
      {
          $user = User::findOrFail($id);
          return Inertia::render('Admin/UserDetail', ['user' => $user]);   
      } 

    /**
     * Save user data
     */
    public function storeUserRegistration(Request $request)
    {
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

            return Redirect::route('user');
        
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
     
        return Inertia::render('Account/Detail', ['account' => $account]);
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
            'profile_picture' => 'required|image|mimes:jpg,png',
            'profile_description' => 'required|max:139',
            'oba' => 'required|boolean',
        ]);

        $fields = [
            'company_name', 'company_type', 'website', 'email', 
            'estimated_launch_date', 'type_of_integration', 'phone_number', 'display_name',
            'business_manager_id', 'profile_description', 'oba',
        ];

        $user_id = $request->user()->id;
        
        // Create new account
        $account = new Account();
        foreach($fields as $field_name) {
            $field_value = $request->get($field_name);
            $account->$field_name = $field_value;
        }
        // Setting logged in user id
        $account->user_id = $user_id;
        // Storing the profile picture
        $path = $request->file('profile_picture')->store('profile_pictures');
        $account->profile_picture = $path;
        $account->status = 'New'; // Setting the status as New.
        $account->save();

        return Redirect::route('dashboard');
    }

    /**
     * Show template form
     */
    public function newTemplate($account_id)    
    {
        return Inertia::render('Account/Template/New');
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

        $user_id = $request->user()->id;

        return Redirect::route('account_view', $account_id);
    }
}
