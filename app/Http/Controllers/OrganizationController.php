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
use App\Models\Company;
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
        $list_view_columns = $module->getListViewFields();
        $listViewData = $this->listView($request, $module, $list_view_columns);
        $menuBar = $this->fetchMenuBar();

        if ($request->is('api/*')) // API call check
        {            
            unset($listViewData['related_records_header'],$listViewData['search'],$listViewData['filter'],$listViewData['compact_type'],$listViewData['list_view_columns'],$listViewData['sort_by'],$listViewData['sort_order'],$listViewData['translator']);
            return response()->json($listViewData);
        }
        else
        {    
            // Check Role Permission
            $user = $request->user();
            if($user->role_permission) {
                $rolePermissions = $this->rolePermissions($user->role_permission);
                $rolePermissions = isset($rolePermissions['Organizations']) ? $rolePermissions['Organizations'] : '';
                if($rolePermissions == '') {
                    return Redirect::to(route('home'));
                }
            } else {
                $rolePermissions = ['create', 'view', 'edit', 'delete'];
            }
            // Set Action based on permission
            $action = [
                'create' => in_array( 'Create', $rolePermissions) ? true : false,
                'detail' => true,
                'edit' => in_array( 'Edit', $rolePermissions) ? true : false,
                'delete' => in_array( 'Delete', $rolePermissions) ? true : false,
                'search' => true, 
                'export' => true,               
                'select_field'=>true,
            ]; 
            
            $moduleData = [
                'singular' => __('Organization'),
                'plural' => __('Organizations'),
                'module' => 'Organization',
                'current_page' => 'Organizations', 
                // Actions
                'actions' => $action,
                'menuBar' => $menuBar
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
            $postFields = array_keys($_POST);
            if(count($postFields) == 0) {
                return response()->json(['status' => 'failed', 'message' => 'Please pass the form data']);
            }

            $validator = Validator::make($request->all(), [               
                'name' => 'required|max:255',                
            ]);
    
            if ($validator->fails()) {
                $messages =  $validator->messages();
                return response()->json(['status' => false, 'message' => $messages],400);     
            }  

              //field validation
              $inputs = [];
              foreach($request->input() as $value => $key)
                  {
                      $inputs[] = $value;
                  }  
              $fields = Field::where('module_name', 'Organization')
                           ->get(['field_name']);
              if ($fields) {                   
                  foreach ($fields as $record) {                    
                      $field []= $record['field_name'];                
                  }
              }
              foreach ($inputs as $record) {                    
                  if(!in_array($record, $field))
                  {                     
                      $return = ['status' => false , 'message' => "Please Enter valid field",'Invalid field_name' => $record];
                      $statusCode = 400;
                      return response()->json($return,$statusCode);
                  }                
              }
        }
        $organization_id = $this->saveOrganization($request);

        if($request->is('api/*'))     // API call check
        {            
            if($organization_id){
                
                $organization= Organization::findOrFail($organization_id);                       
                $return = ['Message' => 'Record has been created successfully', 'Organization_id' => $organization_id,'Record' => $organization];
        
            }
            else{
                $return = ['Message' => 'Invalid Input',400];
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
            return response()->json(['status' => false, 'message' => 'Record not found'],404);   
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
        $organization = $this->checkAccessPermission($request, $module, $request->id);
        $menuBar = $this->fetchMenuBar();

        if(!$organization) {
            if($request->is('api/*')){
                return response()->json(['status' => false, 'message' => 'Record not found'],404);
             }
           else{
               abort('404');
             }
        }
      

        $headers = $this->getModuleHeader('Organization');

        if ($request->is('api/*')) { // API call check             
            return response()->json(['Status' =>true , 'Record' =>$organization]);

        } else {    
            // Check Role Permission
            $user = $request->user();
            if($user->role_permission){
                $rolePermissions = $this->rolePermissions($user->role_permission);
                $rolePermissions = isset($rolePermissions['Organizations']) ? $rolePermissions['Organizations'] : [];
                // Set Action based on permission
                $action = [
                    'edit' => in_array( 'Edit', $rolePermissions) ? true : false,
                    'delete' => in_array( 'Delete', $rolePermissions) ? true : false,
                ];
            } else {
                $rolePermissions = [ 'edit', 'delete'];
            }
            return Inertia::render('Organization/Detail', [
                'record' => $organization,            
                'headers' => $headers,
                'translator' => Controller::getTranslations(),
                'menuBar' => $menuBar,
                'action' => $action,
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
            $organization = Organization::find($request->id); 
             
            if(!$organization)
            {           
             return response()->json(['status' => false, 'message' => 'Record not found'],404);   
            }            
          else
            {
                $postFields = array_keys($_POST);                
                if(count($postFields) == 0) {
                    return response()->json(['status' => 'failed', 'message' => 'Please pass the form data'],400);
                }        
                
                //mandatory field cannot be null while update      
                if(in_array('name', $postFields))
                {        
                if($_POST['name']==null)
                    {
                    return response()->json(['status' => 'false', 'message' => 'The name field cannot be null.'],400);
                    }
                }   
                
                 //field validation
              $inputs = [];
              foreach($request->input() as $value => $key)
                  {
                      $inputs[] = $value;
                  }  
              $fields = Field::where('module_name', 'Organization')
                           ->get(['field_name']);
              if ($fields) {                   
                  foreach ($fields as $record) {                    
                      $field []= $record['field_name'];                
                  }
              }
              foreach ($inputs as $record) {                    
                  if(!in_array($record, $field))
                  {                     
                      $return = ['status' => false , 'message' => "Please Enter valid field",'Invalid field_name' => $record];
                      $statusCode = 400;
                      return response()->json($return,$statusCode);
                  }                
              }
            }
         }
         else
         {       
        $organization = $this->checkAccessPermission($request, $module, $request->id);
        if(!$organization) {           
            abort('404');
           }        
        }
        $organization_id = $this->saveOrganization($request);
        if($request->is('api/*')){
           if($organization_id){
                $return = ['Message' => 'Record has been updated successfully','Record Id' => $organization_id];
                return response()->json($return);  
           }
           else{
            $return = ['status' => 'false','Message' => 'something went wrong'];
            $statusCode = 400;
            return response()->json($return,$statusCode);
           }             
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
            $organization = Organization::find($organizationId);          

        if(!$organization) 
            {
            return response()->json(['status' => false, 'message' => 'Record not found'],404);   
            }           
        else
            {   Schema::disableForeignKeyConstraints();
                $organization->delete();        
                return response()->json(['record'=>$request->id,'message'=>'deleted']);
            }
         }
        else
          {
        $organization = Organization::find($organizationId);
        Schema::disableForeignKeyConstraints();
        $organization->delete();
        if($request->is('api/*')){          
            return response()->json($organization);
            }
            else
              {
        return Redirect::route('listOrganization');
              }
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
            if(!$request->is('api/*')){
            $request->validate([
                'name' => 'required|max:255',                
            ]);}
            $organization = Organization::findOrFail($request->id);
        } else {
            $request->validate([
                'name' => 'required|max:255',                
            ]);
            $organization = new Organization();
        }


        $fields = Field::where('module_name', 'Organization')
            ->get(['field_name', 'is_custom', 'field_type','options']);

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
                        //options validation
                     if($record['field_type']=='dropdown' && $request->is('api/*'))
                    {             
                        $option = [];     
                        foreach($record['options'] as $value => $key)
                        {
                            $option[]=$value;
                        }               
                        
                        if(!in_array($request->$field, $option))  // Check it's option
                            {
                                http_response_code(400);                        
                             die(json_encode(['status' => false, 'message' => "Please enter valid option",'Invalid Option' => $request->$field],400));                               
                             /* $return = ['status' => false , 'message' => 'You have entered invalid options', 'valid options are' => $option];
                               $statusCode = 400;*/
                                                  
                            }
                            
                    }
                    else{
                        $organization->$field = $request->$field;
                    }
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
            $organization->company_id = 1;
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
            ->get();
        
        if($fields) {
            foreach($fields as $field) {
                $field_name = $field['field_name'];
                
                if($request->has($field_name)) {
                    $organization->$field_name = $request->$field_name;
                }
            }
            $organization->company_id = 1;
            $organization->save();
        }   
        
        return response()->json(['status' => true]);
    }
}
