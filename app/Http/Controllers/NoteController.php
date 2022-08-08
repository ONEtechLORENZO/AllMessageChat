<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use App\Http\Controllers\ContactController;
use App\Models\Contact;
use App\Models\User;

class NoteController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public $dateListView = 'd-m-Y h:m:s';
    public function list_notes(Request $request, $module, $id)
    {
        $user_id = ($request->user()->id);           
        $contact = Contact::findOrFail($id); 
        $note_List = [];
        $name = $contact->first_name . ' ' .$contact->last_name;
        foreach ($contact->notes as $note) 
        {       
            $note_id=$note->id;
            $note_List[] = [
                'id' =>$note->id,
                'note' => $note->note,
                'date' => date_format($note->created_at,$this->dateListView)                     
            ];
        }       
  return response()->json(['note_List' => $note_List,'name'=>$name]); 
    
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function addNotes(Request $request, $module, $id)    
    {               
        print_r($request->all()); 
        $contact = Contact::findOrFail($id);        
        $note=new Note;
        $note->user_id = $contact->user_id;
        $note->note=$request->get('noteText');
        $contact->notes()->save($note); 
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
     * @param  \App\Models\Note  $note
     * @return \Illuminate\Http\Response
     */
    public function show(Note $note)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Note  $note
     * @return \Illuminate\Http\Response
     */
    public function edit(Note $note)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Note  $note
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Note $note)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Note  $note
     * @return \Illuminate\Http\Response
     */
    public function destroy(Note $note)
    {
        //
    }
}
