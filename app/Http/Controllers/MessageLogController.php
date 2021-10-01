<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MessageLog;
use Inertia\Inertia;


class MessageLogController extends Controller
{
    /**
     * Message log List view
     */
    public function list( Request $request )
    {
       
        $messageLogs = MessageLog::get();
        return Inertia::render('Messages/List', [ 'messages' => $messageLogs ]);
    }

    /**
     * Set Destination for message
     */
    public function destination( Request $request)
      {
          return Inertia::render('Messages/Destination', [ 'messages' => [] ]);
      }  

    /**
     * Save Message log
     */
    public function saveMessageLog( )
    {
       
            $messageLog = new MessageLog();
            $messageLog->account_id = 1;
            $messageLog->channel = 'WhatsApp';
            $messageLog->content = 'Test WhatsApp message content - '.$i;
            $messageLog->direction = ($i % 2 == 0)? 'In(MO)' : 'Out(MT)';
            $messageLog->sender = '1242132'.$i;
            $messageLog->country = 'India';
            $messageLog->recipient = '5225325'.$i;
            $messageLog->status = 'Deliverd'; 
            $messageLog->save();    
       
       
    }        

}

