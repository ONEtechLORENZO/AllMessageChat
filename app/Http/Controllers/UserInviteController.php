<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;
use App\Models\UserInvite;
use App\Models\User;
use Inertia\Inertia;
use Cache;
use DB;

class UserInviteController extends Controller
{
    public function relateUser(Request $request)
    {
        $uuid = $_GET['unique_id'];
        $invitation = UserInvite::where('unique_id' , $uuid)->first();
        if($invitation){
            $user = User::where('email' , $invitation->email)->first();
            if(! $user){
                return redirect('/register?unique_id='.$uuid); 
            } else {
                $invitation->delete();
                $data['result'] = 'success';
            }
        } else {
            $data['result'] = 'failed';
        }
        return Inertia::render('Company/UserRelated', $data);
    }
}
