<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;

class ImageController extends Controller
{
    public function showImage(Request $request, $type, $id) {
        if($type == 'profile') {
            $user_id = $request->user()->id;
            if($user_id != $id) {
                return false;
            }

            $account = Account::where('user_id', $id)
                ->where('id', $id)
                ->first();

            $image_path = storage_path('app/' . $account->profile_picture);
        }

        return response()->file($image_path);
    }
}
