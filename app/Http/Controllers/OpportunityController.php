<?php

namespace App\Http\Controllers;
use App\Models\Opportunity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Cache;
use App\Models\Field;
use App\Models\Contact;
use App\Models\User;

class OpportunityController extends Controller
{
    public $limit = 15;

    public $default_sort_by = 'created_at';

    public $default_sort_order = 'desc';

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $module = new Opportunity();
        $list_view_columns = $module->getListViewFields();
        $listViewData = $this->listView($request, $module, $list_view_columns);

        $moduleData = [
            'singular' => __('Opportunity'),
            'plural' => __('Opportunities'),
            'module' => 'Opportunity',
            'current_page' => 'Opportunities', 
            // Actions
            'actions' => [
                'create' => true,                
                'edit' => true,
                'delete' => true,                
                'search' => true, 
                'export' => true,               
                'select_field'=>true,
                'detail' => true,

            ],
        ];
        
        $data = array_merge($moduleData, $listViewData);
        return Inertia::render('Opportunity/List', $data);
    }
   
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $opportunity_id = $this->saveOpportunity($request);
        
        return Redirect::route('detailOpportunity', $opportunity_id);
    }

     /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Opportunity  $Opportunity
     * @return \Illuminate\Http\Response
     */
    
    public function edit(Request $request, $id)
    {
        $Opportunity = Opportunity::findOrFail($id);
      
        if(!$Opportunity){
            about(401);
        }

        //related field pre-fill
        if($Opportunity->contact_id){
            $contact = Contact::findOrFail($Opportunity->contact_id);
            $name = $contact->first_name .' '.$contact->last_name;
            $Opportunity['contact_id'] = ['value' => $contact->id, 'label' => $name];
        }

        if($Opportunity->assigned_to){
            $user = User::findOrFail($Opportunity->assigned_to);
            $Opportunity['assigned_to'] = ['value' => $user->id, 'label' => $user->name];
        }
        
        return response()->json(['record' => $Opportunity]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Opportunity  $opportunity
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $opportunity_id)
    {
        $opportunity = Opportunity::findOrFail($request->id);
       
        $companyId = Cache::get('selected_company_'. $request->user()->id);
        $headers = $this->getModuleHeader($companyId, 'Opportunity');

        //related contact details
        $contact = Contact::where('id', $opportunity->contact_id)->first();

        //assign user details
        $user = User::where('id', $opportunity->assigned_to)->first();

        if($contact){
            $opportunity['contact_id'] = $contact['first_name'].' '.$contact['last_name'];
        }

        if($user){
            $opportunity['assigned_to'] = $user['name'];
        }
       
        return Inertia::render('Opportunity/Detail', [
            'record' => $opportunity,            
            'headers' => $headers,
            'translator' => [
                'Detail' => __('Detail'),
                'Notes' => __('Notes'),
                'Edit'  =>__('Edit')
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Opportunity  $opportunity
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $opportunity_id = $this->saveOpportunity($request);
        return Redirect::route('listOpportunity', $opportunity_id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Opportunity  $opportunity
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $opportunityId)
    {
        $opportunity = Opportunity::find($opportunityId);
        $opportunity->delete();
        return Redirect::route('listOpportunity');
    }

    /**
     * Return Opportunity Detail
     */
    public function getOpportunityData(Request $request)
    {
        $opportunity = Opportunity::findOrFail($request->id);
        echo json_encode(['record' => $opportunity]);
        die;
    }
    
    public function saveOpportunity($request){

        if ($request->id) {
            $request->validate([
                'name' => 'required|max:255',                
            ]);
            $opportunity = Opportunity::findOrFail($request->id);
        } else {
            $request->validate([
                'name' => 'required|max:255',                
            ]);
            $opportunity = new Opportunity();
        }
     
        $fields = Field::where('module_name', 'Opportunity')
            ->where('user_id', $request->user()->id)
            ->get(['field_name', 'is_custom', 'field_type']);

        if ($fields) {
            $custom_field = [];
            foreach ($fields as $record) {
                $field = $record['field_name'];
                $custom = $record['is_custom'];
                if($record['field_type'] == 'relate' && $custom == '0' && $request->has($field)) {
                    $opportunity->$field = $request->get($field)['value'];
                }
                else {
                    if ($request->has($field) && ($custom == '0' || !$custom)) {
                        $opportunity->$field = $request->$field;
                    }
                }
  
                if($custom == '1') {
                    if($request->custom) {
                        foreach($request->custom as $key => $value) {
                            $custom_field[$key] = $value;
                        }
                    }
                }
            }

            if ($custom_field) {
                $opportunity->custom = $custom_field;
            }

            $opportunity->company_id = Cache::get('selected_company_'. $request->user()->id);
            $opportunity->save();
        }

        return $opportunity->id;
    }  
}