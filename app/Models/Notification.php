<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class Notification extends Model
{
    use HasFactory;

    public function getNotifications(Request $request){

        $user_id = $request->user()->id;
        $notifications = $this->where('notifier_id', $user_id)
                         ->where('status','0')
                         ->get();
        echo $notifications; die;                                 
    }

    public function clickNotification($id){
        $notifications = $this->where('id',$id)->update([
            'status' => 1
        ]);
        echo $notifications;die;
    }
}
