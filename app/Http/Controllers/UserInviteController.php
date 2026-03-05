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
    public function inviteUser(Request $request)
    {
        $uuid = $_GET['unique_id'];
        $invitation = UserInvite::where('unique_id' , $uuid)->first();
        
        $data['result'] = ($invitation) ? true : false;
        if($invitation){
            return redirect('/register?unique_id='.$uuid);
        }
        return Inertia::render('Company/UserRelated', $data);
    }
}
