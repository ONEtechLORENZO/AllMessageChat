<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Illuminate\Mail\Message;
use App\Models\User;
use Inertia\Inertia;
use Carbon\Carbon;
use Mail;
use DB;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);
        
        // We will send the password reset link to this user. Once we have attempted
        // to send the link, we will examine the response then see the message we
        // need to show to the user. Finally, we'll send out a proper response.
    
        // $status = Password::sendResetLink(
        //     $request->only('email')
        // );

        $status = 'passwords.sent';
        $user = User::where('email', $request->only('email'))->first();  // Check for authorized the user email address

        if(!$user) {
            $status = 'passwords.user';
            return back()->withErrors(['email' => [__($status)]]);        
        }

        $token = Str::random(60);  // Generate the reset-password-token

        $reset_password_data = [
            'email' => $user->email,
            'token' => Hash::make($token),   
            'created_at' => Carbon::now()
        ];

        //Check for the user has already reset token
        $reset_password_token =  DB::table('password_resets')->where('email', $user->email)->first();  
   
        if(!$reset_password_token) {
            DB::table('password_resets')->insert($reset_password_data);
        } else {
            DB::table('password_resets')->where('email', $user->email)->update($reset_password_data);
        }

        $url = url('/') . "/reset-password/$token?email=$user->email";
        $data = ['url' => $url];

        // Send the reset-password mail to the users
        Mail::send('resetpassword', $data, function($message) use ($user) {
            $message->to($user->email)->subject('Reset Password');
        });

        // Update the status
        if ($status == Password::RESET_LINK_SENT) {
            return back()->with('status', __($status));
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }

}
