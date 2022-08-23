<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Contact;
use App\Models\ChatListContact;
use Inertia\Inertia;
use Cache;
use Illuminate\Support\Facades\Redirect;

class ChatListContactController extends Controller
{
        /**
     * Return User contact list
     */
    public function getUserContacts(Request $request)
    {
        $user = $request->user();
        $query = Contact::select('id', 'first_name', 'last_name');
        if( $user->role != 'reqular'){
            $companyId = Cache::get('selected_company_'. $user->id);
            $query->where('company_id', $companyId);
        } else {
            $query->where('user_id', $user_id);
        }
        $records = $query->get();

        $selectedContacts = [];
        $selectedChatList =  ChatListContact::select('contact_id')->where('user_id', $user->id )->get();
        $contactIdList = [];
        foreach($selectedChatList as $contactId){
            $contactIdList[] = $contactId->contact_id;
        }

        $contacts = [];
        foreach($records as $record){
            if( in_array($record->id , $contactIdList) ){
                $selectedContacts[] = ['label' => $record->first_name. ' '. $record->last_name, 'value' => $record->id ];
            } else {
                $contacts[] = ['label' => $record->first_name. ' '. $record->last_name, 'value' => $record->id ];
            }
        }

        echo json_encode(['records' => $contacts, 'selected_records' => $selectedContacts ]); die;
    }

    /**
     * Store Contact List for conversation
     */
    public function storeUserChatContact(Request $request)
    {
        $user = $request->user();
        $selectedContacts = $request->contacts;
        foreach($selectedContacts as $contact_id){
            $chatListContact = ChatListContact::where('user_id', $user->id )->where('contact_id', $contact_id['value'])->first();

            if(! $chatListContact){
                $chatListContact = new ChatListContact();
            }
            $chatListContact->contact_id = $contact_id['value'];
            $chatListContact->user_id = $user->id;
            $chatListContact->save();
        }
        return Redirect::route('chat_list');
    }

    /**
     * Set chat contact to archived
     */
    public function setArchivedContact(Request $request)
    {
        $user = $request->user();
        $contactId = $request->contact_id;
        $chatListContact = ChatListContact::where('user_id', $user->id )->where('contact_id', $contactId)->first();
        if(!$chatListContact->is_archive){
            $chatListContact->is_archive = true;
        } else {
            $chatListContact->is_archive = false;
        }
        
        $chatListContact->save();
        return Redirect::route('chat_list');
    }
}
