<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Organization;
use App\Models\Contact;
use App\Models\User;
use App\Models\Account;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Cache;
use App\Models\Field;
use Schema;
use Illuminate\Support\Facades\Validator;

class OrganizationController extends Controller
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
        $module = new Organization();
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
                                    return response()->json(['Status' => true,'Organization' => $listViewData],200);
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
            'singular' => __('Organization'),
            'plural' => __('Organizations'),
            'module' => 'Organization',
            'current_page' => 'Organizations', 
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
        return Inertia::render('Organization/List', $data);
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
                'name' => 'required|max:255',                
            ]);
    
            if ($validator->fails()) {
                $messages =  $validator->messages();

                return response()->json(['status' => false, 'message' => $messages],400);  
    
            }
        }
        $organization_id = $this->saveOrganization($request);

        if($request->is('api/*'))     // API call check
        {            
            if($organization_id){
                
                $organization= Organization::findOrFail($organization_id);                       
                $return = ['Status'=>true,'Message' => 'Record has been created successfully','Record' => $organization];
        
            }
            else{
                $return = ['Message' => 'Invalid Input'];
            }
            return response()->json($return);
        }
        else
        {        
        $url = route('detailOrganization').'?id='.$organization_id;
        return Redirect::to($url);
        }
    }

     /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Organization  $Organization
     * @return \Illuminate\Http\Response
     */
    
    public function edit(Request $request, $id)
    {
        $module = new Organization();
        $Organization = $this->checkAccessPermission($request, $module, $id);
      
        if(!$Organization){
            return response()->json(['status' => false, 'message' => 'Record not found']);   
        }
        
        return response()->json(['record' => $Organization]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Organization  $organization
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request)
    {
        $module = new Organization();
        if($request->is('api/*') && !(Account::where('id',$request->account_id)->exists()))
        {
            return response()->json(['status' => false, 'message' => 'Workspace ID not valid'],404); 

        }
        else{
        $organization = $this->checkAccessPermission($request, $module, $request->id);
        }
        if(!$organization) {
            if($request->is('api/*')){
                return response()->json(['status' => false, 'message' => 'Record not found'],404);
             }
           else{
               abort('404');
             }
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
        $headers = $this->getModuleHeader($companyId, 'Organization');

        if ($request->is('api/*')) { // API call check             
            return response()->json(['Status' =>true , 'Record' =>$organization]);
        } else {    
        return Inertia::render('Organization/Detail', [
            'record' => $organization,            
            'headers' => $headers,
            'translator' => [
                'Detail' => __('Detail'),
                'Notes' => __('Notes'),
                'Edit'  =>__('Edit')
            ],
        ]);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Organization  $organization
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $currentUser = $request->user();         
        $module = new Organization();  
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
        $organization = $this->checkAccessPermission($request, $module, $request->id);
        if(!$organization) {
            if($request->is('api/*')){
                return response()->json(['status' => false, 'message' => 'Record not found'],404);   
            }
            else{
                 abort('404');}
        }
        if($request->is('api/*'))     // API call check
        { 
            $postFields = array_keys($_POST);
            if(count($postFields) == 0) {
                return response()->json(['status' => 'failed', 'message' => 'Please pass the form data'],400);
            }
        }
        $organization_id = $this->saveOrganization($request);
        if($request->is('api/*')){
            $organization = Organization::findOrFail($organization_id);
            $return = ['Status' => true,'Message' => 'Record has been updated successfully','Record' => $organization];
                return response()->json($return);               
        }
        else
          {
            return Redirect::route('listOrganization', $organization_id);
          }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Organization  $organization
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $organizationId)
    {
        if($request->is('api/*')){
            if(!Account::where('id',$request->account_id)->exists())
            {
                return response()->json(['status' => false, 'message' => 'Workspace ID not valid'],404); 
            }
            $account = Account::findorFail($request->account_id);                
            $company_id = $account->company_id;  
            $organization = Organization::where('id',$request->id)->where('company_id', $company_id);
            $module = new Organization();
            $organization = $this->checkAccessPermission($request, $module, $request->id);

        if(!$organization) 
            {
            return response()->json(['status' => false, 'message' => 'Record not found'],404);   
            }           
        else
            {   Schema::disableForeignKeyConstraints();
                $organization->delete();        
                return response()->json(['Status' => true,'Record ID'=>$request->id,'message'=>'Deleted the record successsfully']);
            }
         }
        else
          {
        $organization = Organization::find($organizationId);
        Schema::disableForeignKeyConstraints();
        $organization->delete();        
        return Redirect::route('listOrganization');
              
        Schema::enableForeignKeyConstraints();              
        }
    }

    /**
     * Return organization Detail
     */
    public function getOrganizationData(Request $request)
    {
        $organization = Organization::findOrFail($request->id);
        echo json_encode(['record' => $organization]);
        die;
    }
    
    public function saveOrganization($request){
        $current_user = $request->user();  
        if ($request->id) {
            $request->validate([
                'name' => 'required|max:255',                
            ]);
            $organization = Organization::findOrFail($request->id);
        } else {
            $request->validate([
                'name' => 'required|max:255',                
            ]);
            $organization = new Organization();
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
        $fields = Field::where('module_name', 'Organization')
            ->where('company_id', $company_id)
            ->get(['field_name', 'is_custom', 'field_type']);

        if ($fields) {
            $custom_field = [];
            foreach ($fields as $record) {
                $field = $record['field_name'];
                $custom = $record['is_custom'];
                if($record['field_type'] == 'relate' && $custom == '0' && $request->has($field)) {
                    $organization->$field = $request->get($field)['value'];
                }
                else {
                    if ($request->has($field) && ($custom == '0' || !$custom)) {
                        $organization->$field = $request->$field;
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
                $organization->custom = $custom_field;
            }
            $organization->company_id = $company_id;
            $organization->save();
        }
        return $organization->id;
    } 
    
    public function newOrganization(Request $request) {

        $request->validate([
            'name' => 'required'
        ]);

        $organization = new Organization;

        $fields = Field::where('module_name', 'Organization')
            ->where('user_id', $request->user()->id)
            ->get();
        
        if($fields) {
            foreach($fields as $field) {
                $field_name = $field['field_name'];
                
                if($request->has($field_name)) {
                    $organization->$field_name = $request->$field_name;
                }
            }
            $organization->company_id = Cache::get('selected_company_'. $request->user()->id);
            $organization->save();
        }   
        
        return response()->json(['status' => true]);
    }
}
