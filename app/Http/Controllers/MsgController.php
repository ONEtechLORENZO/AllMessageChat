<?php

namespace App\Http\Controllers;

use App\Models\Msg;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Auth;
use App\Models\Account;
use App\Models\Contact;
use App\Http\Controllers\MessageLogController;

class MsgController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Msg  $msg
     * @return \Illuminate\Http\Response
     */
    public function show(Msg $msg)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Msg  $msg
     * @return \Illuminate\Http\Response
     */
    public function edit(Msg $msg)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Msg  $msg
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Msg $msg)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Msg  $msg
     * @return \Illuminate\Http\Response
     */
    public function destroy(Msg $msg)
    {
        //
    }


    public function ChatList(Request $request)
    {
        $limit = 10;
        $condition = '';
        $contactList = [];
        $user = Auth::user();
        $contacts = Contact::where('phone_number' , '!=', config('app.origin') )->get();
        foreach($contacts as $contact){
            $name = $contact->first_name . ' ' .$contact->last_name;
            $contactList[$contact->id] = [
                'id' => $contact->id,
                'name' => ($name != ' ') ? $name : $contact->phone_number ,
                'number' => $contact->phone_number 
            ];
        }
       // dd($contactList);
        return Inertia::render('Messages/ChatList', [
            'contact_list' => $contactList,
        ]);
    }

    /**
     * Return contact conversation history
     */
    public function getMessageList(Request $request )
    {
        $messages = [];
        $contactId =  $request->get('contact_id');
        $contact = Contact::where('phone_number', config('app.origin'))
            ->first();
        $user_id = $contact->id;
        $getMessages = Msg::where(function ($query) use ($user_id ,$contactId ) {
                $query->where('msgable_id', '=', $user_id)
                    ->where('receiver_id', '=', $user_id)
                    ->orWhere('msgable_id', '=', $contactId)
                    ->orWhere('receiver_id', '=', $contactId);
            })
            ->orderBy('created_at')
            ->get();
        foreach($getMessages as $message){
            $messages[] = [
                'content' => $message->message,
                //'date' => $message->created_at, 
                'date' => date_format( $message->created_at , 'g:i A | M j, Y '),
                'mode' => $message->msg_mode
            ];
        }
        echo json_encode(['messages' => $messages]); die;
    }

    /**
     * Send the content to the contact
     */
    public function sendMessage(Request $request)
    {
        $account = Account::where('phone_number', config('app.origin'))->first();
        $messageLog = new MessageLogController();
        $result = $messageLog->sendMessage($request , $account->id, 'direct');
        dd([$result , $request ]);
    }
}
