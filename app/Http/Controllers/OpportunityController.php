<?php

namespace App\Http\Controllers;
use App\Models\Opportunity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Cache;
use App\Models\Field;
use App\Models\Account;
use App\Models\Contact;
use App\Models\User;
use App\Http\Controllers\ContactController;


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

        if ($request->is('api/*')) // API call check
            {            
                unset($listViewData['related_records_header'],$listViewData['search'],$listViewData['filter'],$listViewData['compact_type'],$listViewData['list_view_columns'],$listViewData['sort_by'],$listViewData['sort_order'],$listViewData['translator']);
                return response()->json($listViewData);
            }
        else
            {      
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
        $records =  $this->listViewRecord($request, $listViewData, 'Opportunity');
        
        $data = array_merge($moduleData, $records);
        return Inertia::render('Opportunity/List', $data);
        }
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
        
        if($request->is('api/*')) // API call check
        {            
            if($opportunity_id){
            return response()->json($opportunity_id);
            }
            else{
                abort(422);
            }
        }
        else
        {                
        return Redirect::route('detailOpportunity', $opportunity_id);
        }
    }

     /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Opportunity  $Opportunity
     * @return \Illuminate\Http\Response
     */
    
    public function edit(Request $request, $id)
    {
        $module = new Opportunity();
        $Opportunity = $this->checkAccessPermission($request, $module, $id);

        if(!$Opportunity) {
            return response()->json(['status' => false, 'message' => 'Record not found']);   
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
        $module = new Opportunity();
        $opportunity = $this->checkAccessPermission($request, $module, $request->id);
       
        if(!$opportunity) {
            abort('404');
        }
        if($request->is('api/*'))
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
        $headers = $this->getModuleHeader($companyId, 'Opportunity');

        //related contact details
        $contact = Contact::where('id', $opportunity->contact_id)->first();

        //assign user details
        $user = User::where('id', $opportunity->assigned_to)->first();

        if($contact){
            $opportunity['contact_id'] = ['label' =>$contact['first_name'].' '.$contact['last_name'], 'value' => $contact['id'], 'module' => 'Contact'];
        }

        if($user){
            $opportunity['assigned_to'] = [ 'label' => $user['name'] , 'value' => $user['id'], 'module' => 'User'];
        }  

        if( $request->is('api/*') ){
            return response()->json($opportunity);
             }
        else{       
        return Inertia::render('Opportunity/Detail', [
            'record' => $opportunity,            
            'headers' => $headers,
            'translator' => [
                'Detail' => __('Detail'),
                'Notes' => __('Notes'),
                'Edit'  =>__('Edit')
            ],
        ]);}
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
        $currentUser = $request->user();         
        $module = new Opportunity();
       
        $opportunity = $this->checkAccessPermission($request, $module, $request->id);
        if(!$opportunity) {
            abort('404');
        }
        $opportunity_id = $this->saveOpportunity($request);
        if($request->is('api/*')){            
            $opportunity = Opportunity::findOrFail($opportunity_id);
            return response()->json($opportunity);           
        }
        else
          {
        return Redirect::route('listOpportunity', $opportunity_id);
          }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Opportunity  $opportunity
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $opportunityId)
    {                  
        if($request->is('api/*')){
            $account = Account::findorFail($request->account_id);                
            $company_id = $account->company_id;  
            $opportunity = Opportunity::where('id',$request->id)->where('company_id', $company_id);
            $module = new Opportunity();
            $Opportunity = $this->checkAccessPermission($request, $module, $request->id);

        if(!$Opportunity) {
            return response()->json(['status' => false, 'message' => 'Record not found']);   
            }           
            else
            {
                $opportunity->delete();        
                return response()->json(['record'=>$request->id,'message'=>'deleted']);
            }
         }
        else
          {
            $opportunity = Opportunity::find($opportunityId);
            $opportunity->delete();                   
            return Redirect::route('listOpportunity');              
          }
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
        $current_user = $request->user();      

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

        if($request->is('api/*'))
        {   
            $current_user = $request->user();
            $account = Account::find($request->account_id);
            if ($request->account_id)
            {                           
              $company_id = $account->company_id;                
            }           
        }
        else
         {    
        $company_id = Cache::get('selected_company_'. $request->user()->id);
         }
        $fields = Field::where('module_name', 'Opportunity')
            ->where('company_id', $company_id)
            ->get(['field_name', 'is_custom', 'field_type']);

        if ($fields) {
            $custom_field = [];
            foreach ($fields as $record) {
                $field = $record['field_name'];
                $custom = $record['is_custom'];
                
                if($record['field_type'] == 'relate' && $custom == '0' && $request->has($field) && !($request->is('api/*'))) {
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
            $opportunity->company_id = $company_id;
            
            $opportunity->save();
        }
        return $opportunity->id;
    }  
}