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
    public function list_notes(Request $request, $mod,$id)
    {         
        
        $user_id = $request->user()->id;
        
        if($mod)     
        {  
        $module_bean = "App\Models\\{$mod}";
        }
        
        $module = $module_bean::findOrFail($id); 
        
        if($mod=='Contact' || $mod=='Lead')
          {
            $user = User::findorFail($module->creater_id);
          }
       else
         {
            $user = User::findorFail($module->user_id);
         }
       
        $note_List = [];
        $name = $user->name;
        foreach ($module->notes as $note) 
        {       
            $note_id=$note->id;
            $note_List[] = [
                'id' =>$note->id,
                'note' => $note->note,
                'date' => date_format($note->created_at,$this->dateListView)                     
            ];
        }       
  return response()->json(['note_List' => $note_List,'name'=>$name,'translator' =>['Add a new note'=>__('Add a new note'),'Enter your new note here' => __('Enter your new note here')]]); 
    
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function addNotes(Request $request, $mod,$id)    
    {               
        $user_id = $request->user()->id;
        if($mod)     
        {  
        $module_bean = "App\Models\\{$mod}";
        }
        $module = $module_bean::findOrFail($id);       
        $note=new Note;
        if($mod=='Contact' || $mod=='Lead')
        {
            $note->user_id = $module->creater_id;
        }
        else{
            $note->user_id = $module->user_id;
        }
          
        $note->company_id = $module->company_id;
        $note->note=$request->get('noteText');
        $module->notes()->save($note); 
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
