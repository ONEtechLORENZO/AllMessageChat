<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Contact;
use App\Models\ChatListContact;
use Inertia\Inertia;
use Cache;
use App\Models\Categorable;
use App\Models\Taggable;
use Illuminate\Support\Facades\Redirect;

class ChatListContactController extends Controller
{
    /**
     * Return User contact list
     */
    public function getUserContacts(Request $request)
    {
        $user = $request->user();
        $userId = $user->id;
        //$companyId = Cache::get('selected_company_'. $userId);

        $selectedContacts = [];
        // Get related records
        if($request->parent == "Category"){
            $getSelectedContacts = Categorable::select('categorable_id as contact_id')->where('category_id', $request->record)->get();
        } elseif($request->parent == 'Tag') {
            $getSelectedContacts = Taggable::select('taggable_id as contact_id')->where('tag_id', $request->record)->get();
        } elseif($request->parent == 'Chat') {
            $getSelectedContacts = ChatListContact::where('user_id', $userId)->select('contact_id')->get();
        }
        elseif($request->parent == 'Organization') {
            $getSelectedContacts = Contact::select('id as contact_id')->where('organization_id', $request->record)->get();
        }

        foreach ($getSelectedContacts as $key => $selectedContact) {
            $selectedContacts[] = $selectedContact->contact_id ;
        }
      
        $query = Contact::select('contacts.id', 'first_name', 'last_name');
        //$query->where('company_id', $companyId);
        $query->whereNotIn('contacts.id',  $selectedContacts);
  
        // Filter records based on key 
        $key = (isset($_GET['key']) && $_GET['key']) ? $_GET['key'] : '';
        if($key){
            $query->where(function($query) use($key) {
                $query->orWhere('first_name', 'like', '%' . $key . '%');
                $query->orWhere('last_name', 'like', '%' . $key . '%');
            });
        }
        $records = $query->limit(5)->get();


        $contacts = [];
        foreach($records as $record){
            $contacts[] = ['label' => $record->first_name. ' '. $record->last_name, 'value' => $record->id ];
        }

        echo json_encode(['records' => $contacts ]); die;
    }

    /**
     * Store Contact List for conversation
     */
    public function storeUserChatContact(Request $request)
    {
        $user = $request->user();
        $selectedContacts = $request->contacts;
        foreach($selectedContacts as $contact_id){
            $contact = Contact::find($contact_id['value']);
            if($request->parent == 'Chat'){
                $chatListContact = ChatListContact::where('user_id', $user->id )->where('contact_id', $contact_id['value'])->first();
                if(! $chatListContact){
                    $chatListContact = new ChatListContact();
                }
                $chatListContact->contact_id = $contact_id['value'];
                $chatListContact->user_id = $user->id;
                $chatListContact->save();
            } else if($request->parent == "Category"){
                $parent = array($request->record);
                $contact->categorys()->sync($parent);
            } else if($request->parent == "Tag"){
                $parent = array($request->record);
                $contact->tags()->sync($parent);
            }else if($request->parent == "Organization"){
                if($request->record){
                    $contact->organization_id = $request->record;
                    $contact->save();
                }
            }
        }
        if($request->parent == 'Chat'){
            return Redirect::route('chat_list');
        } else {
            $url = route('detail'. $request->parent).'?id='.$request->record.'&page=1';
            return Redirect::to($url);
        }
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
            $chatListContact->unread = false;
        } else {
            $chatListContact->is_archive = false;
        }
        
        $chatListContact->save();
        return Redirect::route('chat_list');
    }
}