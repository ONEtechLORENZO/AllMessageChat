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
use App\Models\Note;
use App\Models\Contact;
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
            ],
        ];
        
        $data = array_merge($moduleData, $listViewData);
        return Inertia::render('Leads/List', $data);
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
        $lead_id = $this->saveLead($request);
        
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

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Lead  $lead
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request)
    {
        $lead = Lead::findOrFail($request->id);
        
        $companyId = Cache::get('selected_company_'. $request->user()->id);
        $headers = $this->getModuleHeader($companyId , 'Lead');

       
        //related organization details
        $organization = Organization::where('id', $lead->organization_id)->first();

        //assign user details
        $user = User::where('id', $lead->assigned_to)->first();

        if($organization){
            $lead['organization_id'] = $organization['name'];
        }

        if($user){
            $lead['assigned_to'] = $user['name'];
        }

        return Inertia::render('Leads/Detail', [
            'record' => $lead,
            'headers' => $headers,
            'translator' => [
                'Detail' => __('Detail'),
                'Notes' => __('Notes'),
                'Edit'  =>__('Edit')
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Lead  $lead
     * @return \Illuminate\Http\Response
     */
    public function edit(Lead $lead)
    {
        //
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
        $lead_id = $this->saveLead($request);
        
        $url = route('detailLead').'?id='.$lead_id;
        return Redirect::to($url);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Lead  $lead
     * @return \Illuminate\Http\Response
     */
    public function destroy(Lead $lead,$leadId)
    {
        $lead = Lead::find($leadId);
        $lead->delete();
        return Redirect::route('listLead');
    }



    //convert a lead to contact
    public function convert_lead(Lead $lead,$leadId)
    {
        $lead = Lead::find($leadId);
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
        
        return Redirect::route('listLead');

    }
   
    /**
     * Return Lead Detail
     */
    public function getLeadData(Request $request)
    {
        $lead = Lead::findOrFail($request->id);
         //related field pre-fill
         if($lead->organization_id){
            $organization = organization::findOrFail($lead->organization_id);
            $name = $organization->name;
            $lead['organization_id'] = ['value' => $organization->id, 'label' => $name];
        }

        if($lead->creater_id){
            $user = User::findOrFail($lead->creater_id);
            $lead['assigned_to'] = ['value' => $user->id, 'label' => $user->name];
        }
        echo json_encode(['record' => $lead]);
        die;
    }

    
    public function saveLead($request){

        if ($request->id) {
            $request->validate([
                'last_name' => 'required|max:255',
                'email' => 'required|max:255',
            ]);
            $lead = Lead::findOrFail($request->id);
        } else {
            $request->validate([
                'last_name' => 'required|max:255',
                'email' => 'required|unique:leads|max:255',
            ]);
            $lead = new Lead();
        }
     
        $fields = Field::where('module_name', 'Lead')
            ->where('user_id', $request->user()->id)
            ->get(['field_name', 'is_custom']);
    
        if ($fields) {
            $custom_field = [];
            foreach ($fields as $record) {
                $field = $record['field_name'];
                $custom = $record['is_custom'];
                

                if($request->has($field) && ($custom == '0' || !$custom)) {
                    if(($field == 'assigned_to' || $field == 'organization_id')) {
                         
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
            $lead->company_id = Cache::get('selected_company_'. $request->user()->id);
           
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
