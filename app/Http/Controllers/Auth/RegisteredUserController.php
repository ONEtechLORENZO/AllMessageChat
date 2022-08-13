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
use Inertia\Inertia;
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
        
        $user = User::create([
            'name' => $request->first_name . ' ' .$request->last_name,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'status' => 'regular',
            'password' => Hash::make($request->password),
        ]);

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
