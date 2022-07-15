<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

use Illuminate\Http\Request;

class ContactController extends Controller
{
    public $fiedls = [

    ];
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
     * @param  \App\Models\Contact  $contact
     * @return \Illuminate\Http\Response
     */
    public function show(Contact $contact)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Contact  $contact
     * @return \Illuminate\Http\Response
     */
    public function edit(Contact $contact)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Contact  $contact
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Contact $contact)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Contact  $contact
     * @return \Illuminate\Http\Response
     */
    public function destroy(Contact $contact)
    {
        //
    }

    /**
     * List contacts
     */
    public function contactList(Request $request)
    {
        $contactList = [];
        $user = $request->user();
        $contacts = Contact::where('user_id', $user->id )->get();
        foreach($contacts as $contact){
            $name = $contact->first_name . ' ' .$contact->last_name;
            $logo = trim($name , ' '); 

            $contactList[$contact->id] = [
                'logo' => $logo,
                'id' => $contact->id,
                'name' => $name,
                'last_name' => $contact->last_name,
                'email' => $contact->email,
                'number' => ($contact->phone_number != '') ? $contact->phone_number : $contact->instagram_id 
            ];
        }
        return Inertia::render('Contacts/Contacts', [
            'contacts' => $contactList
        ]);
    }

    /**
     * Show contact detail
     */
    public function contactDetail(Request $request, $contact_id)
    {
        $contact = Contact::findOrFail($request->id);
        return Inertia::render('Contacts/Detail', [
            'contact' => $contact
        ]);
    }

    /**
     * Store contact data
     */
    public function storeContact(Request $request)
    {
       
        $user = $request->user();
        if($request->id){ 
            $contact = Contact::findOrFail($request->id);
        } else {
            $request->validate([
                'last_name' => 'required|max:255',
                'email' => 'required|unique:contacts|max:255',
            ]);
            $contact = new Contact();
        }
        
        $contact->first_name = $request->first_name;
        $contact->last_name = $request->last_name;
        $contact->phone_number = $request->phone_number;
        $contact->email = $request->email;
        $contact->user_id = $user->id;
        $contact->instagram_id = $request->instagram_id;
        $contact->save();
        return Redirect::route('contact_detail', $contact->id);
       // return redirect(route('contact_detail', $contact->id))->with('status', 'Profile updated!');
    }

    /**
     * Return Contact Detail
     */
    public function getContactData(Request $request)
    {
        $contact = Contact::findOrFail($request->contact_id);
        echo json_encode(['contact' => $contact]); die;
    }
}
