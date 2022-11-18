<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Organization;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;
use App\Models\Serviceable;
use Cache;
use App\Models\Tag;
use App\Models\Category;
use App\Models\Field;
use App\Models\Service;
use App\Models\User;
use App\Models\Account;
use App\Models\Note;
use App\Models\Contact;
use Illuminate\Support\Facades\Validator;

class LeadController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $module = new Lead();
        if ($request->is('api/*')) // API call check
            {           
                if($request->account_id)
                     {
                        if(Account::where('id',$request->account_id)->exists())
                            {
                                $list_view_columns = $module->getListViewFields();
                                $listViewData = $this->listView($request, $module, $list_view_columns);                
                                if($listViewData)
                                  {
                                    unset($listViewData['related_records_header'],$listViewData['search'],$listViewData['filter'],$listViewData['compact_type'],$listViewData['list_view_columns'],$listViewData['sort_by'],$listViewData['sort_order'],$listViewData['translator']);
                                    return response()->json(['status' => true,'Leads' => $listViewData],200);
                                 }
                                else
                                {
                                    return response()->json(['status' => false, 'message' => 'No records found'],200); 
                                }
                            }
                            else{
                                return response()->json(['status' => false, 'message' => 'Workspace ID not valid'],400); 
                            }
                    }
                else
                {
                    return response()->json(['status' => false, 'message' => 'Workspace ID not found'],404); 
                }   
            }
        else
            {      
                $list_view_columns = $module->getListViewFields();
                $listViewData = $this->listView($request, $module, $list_view_columns);
        $moduleData = [
            'singular' => 'Lead',
            'plural' => 'Leads',
            'module' => 'Lead',
            'current_page' => 'Leads', 
            // Actions
            'actions' => [
                'create' => true,
                'detail' => true,
                'edit' => true,
                'delete' => true,
                'export' => true,                
                'search' => true,                
                'select_field'=>true,
                'merge' => true,
            ],
        ];

        $records =  $this->listViewRecord($request, $listViewData, 'Lead');
        
        $data = array_merge($moduleData, $records);
        return Inertia::render('Leads/List', $data);
    }
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
        if($request->is('api/*'))     // API call check
        { 
            if(!Account::where('id',$request->account_id)->exists())
            {
                return response()->json(['status' => false, 'message' => 'Workspace ID not valid'],404); 
            }
            $postFields = array_keys($_POST);
            if(count($postFields) == 0) {
                return response()->json(['status' => 'failed', 'message' => 'Please pass the form data'],400);
            }
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|unique:leads|max:255',
                'last_name' => 'required|max:255',
            ]);
    
            if ($validator->fails()) {
                $messages =  $validator->messages();

                return response()->json(['status' => false, 'message' => $messages],404);  
    
            }
        }
        if($request->is('api/*'))     // API call check
        { 
            $postFields = array_keys($_POST);
            if(count($postFields) == 0) {
                return response()->json(['status' => 'failed', 'message' => 'Please pass the form data']);
            }
        }
        $lead_id = $this->saveLead($request);
        if($request->is('api/*'))     // API call check
        {            
            if($lead_id){
                $lead = Lead::findOrFail($lead_id);                       
                $return = ['Status' =>true,'Message' => 'Record has been created successfully','Lead' => $lead];
            
            }
            else{
                $return = ['Message' => 'Invalid Input'];
            }
            return response()->json($return,200);
        }
        else
        {        
        if($request->parent_module == 'Chat') {
            return Redirect::route('chat_list');
        } else if($request->parent_id){
            $url = route('detail'. $request->parent_module).'?id='.$request->parent_id.'&page=1';
            return Redirect::to($url);
        } else {
            $url = route('detailLead').'?id='.$lead_id;
            return Redirect::to($url);
        }
       }
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Lead  $lead
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request)
    {
        $module = new Lead();
        if($request->is('api/*') && !(Account::where('id',$request->account_id)->exists()))
        {
            return response()->json(['status' => false, 'message' => 'Workspace ID not valid'],404); 

        }
        else{
            $lead = $this->checkAccessPermission($request, $module, $request->id);
        }
        if(!$lead) {
            if($request->is('api/*')){
                return response()->json(['status' => false, 'message' => 'Record not found']);
            }
            else{
            abort('404');
            }
        }
        if($request->is('api/*')) //api call check
        {
            if ($request->account_id)
            {
            $account = Account::find($request->account_id);                
            $companyId = $account->company_id;                
            }            
        }
        else
        { 
        $companyId = Cache::get('selected_company_'. $request->user()->id);
        }        
        $headers = $this->getModuleHeader($companyId , 'Lead');
       
        //related organization details
        $organization = Organization::where('id', $lead->organization_id)->first();

        //assign user details
        $user = User::where('id', $lead->assigned_to)->first();

        if($organization){
            $lead['organization_id'] = [ 'label' => $organization['name'], 'value' => $organization['id'], 'module' => 'Organization'];
        }

        if($user){
            $lead['assigned_to'] = [ 'label' => $user['name'] , 'value' => $user['id'], 'module' => 'User'];
        }
        if ($request->is('api/*')) { // API call check             
            return response()->json(['Status' =>true , 'Record' =>$lead],200);
         } else {   

        return Inertia::render('Leads/Detail', [
            'record' => $lead,
            'headers' => $headers,
            'current_userid' => $request->user()->id,
            'translator' => [
                'Detail' => __('Detail'),
                'Notes' => __('Notes'),
                'Edit'  =>__('Edit')
            ]
        ]);
    }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Lead  $lead
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request)
    {
        $module = new Lead();
        $lead = $this->checkAccessPermission($request, $module, $request->id);

        if(!$lead) {
            return response()->json(['status' => false, 'message' => 'Record not founded']);
        }

        //related field pre-fill
        if($lead->organization_id){
            $organization = Organization::findOrFail($lead->organization_id);
            $name = $organization->name;
            $lead['organization_id'] = ['value' => $organization->id, 'label' => $name];
        }

        if($lead->assigned_to){
            $user = User::findOrFail($lead->assigned_to);
            $lead['assigned_to'] = ['value' => $user->id, 'label' => $user->name];
        }

        return response()->json(['status' => true, 'record' => $lead]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Lead  $lead
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Lead $lead)
    {
        $currentUser = $request->user();    
        $module = new Lead();  
        if($request->is('api/*'))
            {
                    if ($request->account_id)
                      {
                            if(!Account::where('id',$request->account_id)->exists())
                            {
                                return response()->json(['status' => false, 'message' => 'Workspace ID not valid'],404); 
                            }
                      }    
                    else     
                        {
                            return response()->json(['status' => false, 'message' => 'Enter Workspace ID'],404); 
                        }
            }
        $lead = $this->checkAccessPermission($request, $module, $request->id);
        if(!$lead) {
            if($request->is('api/*')){
                return response()->json(['status' => false, 'message' => 'Record not found'],404);   
            }
            else{
            abort('404');
            }
        }   
        if($request->is('api/*'))     // API call check
        { 
            $postFields = array_keys($_POST);
            if(count($postFields) == 0) {
                return response()->json(['status' => 'failed', 'message' => 'Please pass the form data'],404);
            }
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|unique:leads|max:255',                
            ]);
    
            if ($validator->fails()) {
                $messages =  $validator->messages();

                return response()->json(['status' => false, 'message' => $messages],404);  
    
            }
        }
        $lead_id = $this->saveLead($request);

        if($request->is('api/*')){
            $lead = Lead::findOrFail($lead_id);
            $return = ['Status' => true,'Message' => 'Record has been updated successfully','Record' => $lead];
                return response()->json($return);             
        }
        else
          {        
        $url = route('detailLead').'?id='.$lead_id;
        return Redirect::to($url);}
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Lead  $lead
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request,Lead $lead,$leadId)
    {
        if($request->is('api/*')){
            if(!Account::where('id',$request->account_id)->exists())
                            {
                                return response()->json(['status' => false, 'message' => 'Workspace ID not valid'],404); 
                            }
            $account = Account::findorFail($request->account_id);                
            $company_id = $account->company_id;   
           $lead = Lead::where('id',$request->id)->where('company_id', $company_id);
           $module = new Lead();
           $lead = $this->checkAccessPermission($request, $module, $request->id);

            if(!$lead) {
                return response()->json(['status' => false, 'message' => 'Record not found'],404);   
            }
           else
           {
           $lead->delete();        
           return response()->json(['status' => true,'Record ID'=>$request->id,'message'=>'Deleted the record successsfully']);
           }
       }
       else{
        $lead = Lead::find($leadId);
        $lead->delete();
        return Redirect::route('listLead');}
    }

    // Convert a lead to contact
    public function convert_lead(Request $request,Lead $lead,$leadId)
    {
        if($request->is('api/*')){ 
            if ($request->account_id)
            {
                  if(!Account::where('id',$request->account_id)->exists())
                  {
                      return response()->json(['status' => false, 'message' => 'Workspace ID not valid'],404); 
                  }
            }    
          else     
              {
                  return response()->json(['status' => false, 'message' => 'Enter Workspace ID'],404); 
              }
            $lead = Lead::find($request->id);
            if(!$lead)
            {
                return response()->json(['status' => false, 'message' => 'Record not found'],404);   
            }
        }
        else
        {
        $lead = Lead::find($leadId);
        }
        $new_contact=new Contact();
        $new_contact=$lead->replicate(['id']);       
        $new_contact->setTable('contacts'); 
        $new_contact->save();
        $lead->delete();     
        $contact_note=Contact::find($new_contact->id);
        $notes= Note::where('notable_id', $leadId)->where('notable_type','App\Models\Lead')->get();
        foreach($notes as $note) {
            $note->notable_id=$new_contact->id;           
            $contact_note->notes()->save($note);
        }
        if($request->is('api/*')){ 
            $return = ['Message' => 'Record has been converted to a new contact successfully','Contact_id' => $new_contact->id];
            return response()->json($return); 
            }
            else
              {
        return Redirect::route('listLead');}

    }
    
    public function saveLead($request){

        if ($request->id) {
            $request->validate([
                'email' => 'unique:leads|max:255',
            ]);
            $lead = Lead::findOrFail($request->id);
        } else {
            $request->validate([
                'last_name' => 'required|max:255',
                'email' => 'unique:leads|max:255',
            ]);
            $lead = new Lead();
        }
        if($request->is('api/*'))
        {
            if ($request->account_id)
            {
              $account = Account::findorFail($request->account_id);                
              $company_id = $account->company_id;                
            }  
        }
        else
         {  
        $company_id = Cache::get('selected_company_'. $request->user()->id);
         }
        $fields = Field::where('module_name', 'Lead')
            ->where('company_id', $company_id)
            ->get(['field_name', 'is_custom']);
    
        if ($fields) {
            $custom_field = [];
            foreach ($fields as $record) {
                $field = $record['field_name'];
                $custom = $record['is_custom'];               

                if($request->has($field) && ($custom == '0' || !$custom)) {
                    if(($field == 'assigned_to' || $field == 'organization_id') && !($request->is('api/*'))) {
                         
                        $related_id = $request->$field;
                        
                        if(isset($related_id)){
                            $lead->$field = $related_id['value'];
                        }else {
                            $lead->$field = NULL;
                        }
                    }else {
                        $lead->$field = $request->$field;
                    }
                }
  
                if($custom == '1'){
                    if($request->custom){
                        foreach($request->custom as $key => $value){
                            $custom_field[$key] = $value;
                        }
                    }
                }
            }
            if ($custom_field) {
                $lead->custom = $custom_field;
            }
  
            $lead->creater_id= $request->user()->id;
            $lead->company_id =  $company_id;
           
            $lead->save();

            if($request->parent_id){
                // $parent = array($request->parent_id);
                // if($request->parent_module == 'Category'){
                //     $contact->categorys()->sync($parent);
                //     $url = '/list?id='.$request->parent_id;
                // } else if($request->parent_module == 'Tag'){
                //     $contact->tags()->sync($parent);
                //     $url = '/tag?id='.$request->parent_id;
                // }
            }
        }

        return $lead->id;
    }









}
