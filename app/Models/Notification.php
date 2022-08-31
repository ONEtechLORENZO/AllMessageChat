<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class Notification extends Model
{
    use HasFactory;

    public $limit = 3;
    public $dateChatView = 'g:i A | M j, Y';

    public function getNotifications(Request $request){

        $user_id = $request->user()->id;
        $query = $this->where('notifier_id', $user_id)
                              ->where('status','0')
                              ->limit($this->limit)
                              ->offset(0);
        $records = $query->get();
        $paginate = $query->paginate();
        $total_records = $paginate->total();
        $notifications = []; 
        $id = [];

        if($records){
            foreach($records as $key => $record){
                $notifications[$record['id']] = [
                    'module' => $record['notification_type'],
                    'message' => $record['notification_type'].' has been '.$record['notification_content'],
                    'created_at' => date_format($record->created_at, $this->dateChatView)
                ];
                $id[$key] = $record->id; 
            } 
            $return = [
                'notifications' => $notifications,
                'count' => $total_records,
                'id' => $id
            ];
        }else{
            $return = [
                'notifications' => $notifications,
                'count' => $total_records,
                'id' => $id
            ];
        }                 
 
        echo json_encode($return); die;                                 
    }

    public function clickNotification(Request $request){
        
        $user_id = $request->user()->id;
        $id = $request->id;
        if($id){
            $id = explode(',',$id);
            $status = $this->where('notifier_id',$user_id)->whereIn('id',$id)->update([
                'status' => 1
            ]);
        }
        die;
    }

    public function showMore(Request $request){
       
        $user_id = $request->user()->id;
        $query = $this->where('notifier_id', $user_id)
                              ->where('status','0')
                              ->limit($this->limit)
                              ->offset(0);
        $records = $query->get();
        $paginate = $query->paginate();
        $total_records = $paginate->total();
        
        $notifications = [];
        $id = [];                 
        foreach($records as $key => $record){
            $notifications[$record['id']] = [
                'module' => $record['notification_type'],
                'message' => $record['notification_type'].' has been '.$record['notification_content'],
                'created_at' => date_format($record->created_at, $this->dateChatView)
            ];
            $id[$key] = $record->id; 
        }

        if($notifications){
            $status = $this->where('notifier_id',$user_id)->whereIn('id',$id)->update([
                'status' => 1
            ]);
        }
         
        $return = [
            'notifications' => $notifications,
            'count' => $total_records,
            'id' => $id
        ];
        
        echo json_encode($return);die();
    }
}
