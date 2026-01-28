<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use App\Http\Controllers\ContactController;
use App\Models\Contact;
use App\Models\User;
use App\Models\Company;
use Cache;
use Mail;
use Illuminate\Support\Facades\Redirect;


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
        $note_List = [];
        
        foreach ($module->notes as $note) 
        {       
            $note_id=$note->id;    
            $user_name=[];        
            $user_name= User::where('id',$note->user_id)->pluck('name');           
            $note_List[] = [
                'id' =>$note->id,
                'note' => $note->note,
                'date' => date_format($note->created_at,$this->dateListView) , 
                'user_id' => $note->user_id,
                'name' => $user_name[0],
                'assigned_to' => $note->assigned_to,
                'status' => $note->status,
                'current_user' => $user_id,
            ];
        }       
        
        return response()->json(['note_List' => $note_List,'translator' =>['Add a new note'=>__('Add a new note'),'Enter your new note here' => __('Enter your new note here') , 'user_id' => $user_id]]); 
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function addNotes(Request $request, $mod,$id)    
    {     
        $user_id = $request->user()->id;
        $user_name= $request->user()->name;
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
        else if($mod=='SupportRequest')
        {
            $note->user_id = $request->user()->id;
        }
        else{
            $note->user_id = $module->user_id;
        }          
         //sends e-mail to all the mentioned users
         if($request->get('mentions'))
         {
            foreach($request->get('mentions') as $email){
                $email_id = $email['id'];
                $email_address= User::where('id',$email_id)->pluck('email'); 
                $email_address= trim($email_address,"[]");
                $email_address = filter_var($email_address, FILTER_SANITIZE_EMAIL);
                $data = [
                    'data' => $request->get('noteText'),
                    'name' => $user_name,
                ];
                if($email_address){
                    Mail::send('note',$data, function($message) use ($email_address){
                        $message->to($email_address)->subject
                        ('Task Assigned');
                    });
                }}
        }
     
      $assigned_to = $request->get('assignedTo');
      /* $email_address= User::where('id',$assigned_to)->pluck('email'); 
      
       $email_address = filter_var($email_address, FILTER_SANITIZE_EMAIL);

        $data = [
            'data' => $request->get('noteText'),
            'name' => $user_name,
        ];
        if($email_address){
            Mail::send('note',$data, function($message) use ($email_address){
                $message->to($email_address)->subject
                ('Task Assigned');
            });
        }*/
        $note->note = $request->get('noteText');
        $note->assigned_to = $assigned_to;
        $note->status = 0;
        $module->notes()->save($note); 
   
            if($mod=='SupportRequest' && ($request->user()->role == 'global_admin') && ($request->get('creator_id')))
            {
                $email_address= User::where('id',$request->get('creator_id'))->pluck('email');                
                $email_address= trim($email_address,"[]");
                    $email_address = filter_var($email_address, FILTER_SANITIZE_EMAIL);
                    $data = [
                        'data' => $request->get('noteText'),
                        'name' => $user_name,                        
                    ];
                   
                    if($email_address){
                        Mail::send('supportrequest',$data, function($message) use ($email_address){
                            $message->to($email_address)->subject
                            ('A note is added to your support request by the admin');
                        });
                    }
            }
    }

    //get mention users list 
    public function getUsers(Request $request, $mod,$id)
    {     
        $user_id = $request->user()->id;
        $companyId = Cache::get('selected_company_'. $user_id);
        $company = Company::find($companyId);
        $users = $company->user;
        $name=[];
        foreach ($users as $user) 
        {       
          $name[] =[
            'id' => $user->id,
            'display' => $user->name,
          ];
        }
        return response()->json(['users' => $name]);
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

  //to update a note status
    public function updateTask(Request $request, $mod,$id)  
    {
        if ($request->get('noteId')) {            
            $note = Note::findOrFail($request->get('noteId'));
        }
        $note->status = 1;
        $note->save();       
        return response()->json(['response' => $note->status]);

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
