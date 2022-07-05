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
    public $dateFormat = 'g:i A | M j, Y ';

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
        $condition = $selectedContact =  $category = '';
        $contactList = $messages = [];
        $user = $request->user();
        $contacts = Contact::where('user_id', $user->id )->get();
        foreach($contacts as $contact){
            $name = $contact->first_name . ' ' .$contact->last_name;
            $contactList[$contact->id] = [
                'id' => $contact->id,
                'name' => ($name != ' ') ? $name : $contact->phone_number ,
                'number' => $contact->phone_number 
            ];
        }
        
        if($request->contact_id){
           
            $messages = $this->getMessageList($request);
       //   dd($messages);
        
        }
       // dd($contactList);
        return Inertia::render('Messages/ChatList', [
            'contact_list' => $contactList,
            'messages' => $messages,
            'selected_contact' => $request->contact_id,
            'category' => $request->contact_id

        ]);
    }

    /**
     * Return contact conversation history
     */
    public function getMessageList(Request $request)
    {
        $user = $request->user();
        $contactId = $request->contact_id;
        $category = $request->category;
       
        $messages = [];
        $account = Account::where('user_id', $user->id)->first();
        $contact = Contact::find($contactId);
        
       // $getMessages = $contact->messages;
     // dd($contact);
      /*
        $contact = Contact::where('phone_number', $account->phone_number)
            ->first();
        $getMessages = Msg::where(function ($query) use ($user_id ,$contactId ) {
                $query->where('msgable_id', '=', $user_id)
                    ->where('receiver_id', '=', $user_id)
                    ->orWhere('msgable_id', '=', $contactId)
                    ->orWhere('receiver_id', '=', $contactId);
            })
            ->orderBy('created_at')
            ->get();
        $getMessages = Msg::where('account_id', $account->id)
            ->orWhere('msgable_id',  $contactId)
            ->orderBy('created_at')
            ->get();
                    */

        foreach($contact->messages->where('service', $request->category) as $message){
            $messages[] = [
                'content' => $message->message,
                //'date' => $message->created_at, 
                'date' => date_format( $message->created_at , $this->dateFormat),
                'mode' => $message->msg_mode
            ];
        }
      //  dd($messages);
    // return Inertia::render('Messages/ChatList', [
    //     'messages' => $messages
    // ]);
    // echo json_encode(['messages' => $messages]); die;
        return ( $messages);
    }

    /**
     * Send the content to the contact
     */
    public function sendMessage(Request $request)
    {
        $user = $request->user();
        $account = Account::where('user_id', $user->id)->first();
    //    $account = Account::where('phone_number', config('app.origin'))->first();
        $messageLog = new MessageLogController();
        $result = $messageLog->sendMessage($request , $account->id, 'direct');
    }
}
