<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use App\Models\UserInvite;
use App\Models\Company;
use Inertia\Inertia;
use Cache;
use DB;


class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        $uuid = isset($_GET['unique_id']) ? $_GET['unique_id'] : '';

        $invitation = UserInvite::where('unique_id' , $uuid)->first();
        $email = '';
        if($invitation){
            $email = $invitation->email;
        }
        return Inertia::render('Auth/Register', ['email' => $email , 'uuid' => $uuid]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Create Company
        if ( $request->company_name ) {
            $company = Company::create([
                'name' => $request->company_name
            ]);
            $company_id = $company->id;
        }
        
        
        $userData = [
            'name' => $request->first_name . ' ' .$request->last_name,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'role' => 'admin',
            'status' => true,
            'password' => Hash::make($request->password),
        ];
        if ($request->uuid){
            $invitation = UserInvite::where('unique_id' , $request->uuid)->first();
            $company_id = $invitation->company_id;
            $userData['role'] = 'regular';
        } 
        $_REQUEST['company_id'] = $company_id;

        $user = User::create($userData);

        if($company_id){
            $user->company()->syncWithoutDetaching([$company_id]);
            // DB::table('company_user')->insert([
            //     'user_id' => $user->id,
            //     'company_id' => $company_id
            // ]);
        }

        event(new Registered($user));

        Auth::login($user);
        
        if ($request->uuid) {
            $invitation = UserInvite::where('unique_id' , $request->uuid)->first();
            
            if( $invitation ){
                DB::table('company_user')->insert([
                    'user_id' => $user->id,
                    'company_id' => $invitation->company_id
                ]);
                $url = '/user-invite?unique_id='.$request->uuid;
                return redirect($url); 
            }
        }
        return redirect(RouteServiceProvider::HOME);
    }
}
