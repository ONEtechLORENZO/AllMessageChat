<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Response;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

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
    public function newTemplate()
    {
        return Inertia::render('Account/Template/New');
    }
}
