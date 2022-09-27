<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Organization;
use App\Models\Contact;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Cache;
use App\Models\Field;
use Schema;

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
   
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $organization_id = $this->saveOrganization($request);
        
        $url = route('detailOrganization').'?id='.$organization_id;
        return Redirect::to($url);
    }

     /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Organization  $Organization
     * @return \Illuminate\Http\Response
     */
    
    public function edit(Request $request, $id)
    {
        $Organization = Organization::findOrFail($id);
      
        if(!$Organization){
            about(401);
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
        $organization = Organization::findOrFail($request->id);
       
        $companyId = Cache::get('selected_company_'. $request->user()->id);
        $headers = $this->getModuleHeader($companyId, 'Organization');
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

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Organization  $organization
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $organization_id = $this->saveOrganization($request);
        return Redirect::route('listOrganization', $organization_id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Organization  $organization
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $organizationId)
    {
        $organization = Organization::find($organizationId);
        Schema::disableForeignKeyConstraints();
        $organization->delete();
        return Redirect::route('listOrganization');
        Schema::enableForeignKeyConstraints();
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
        $company_id = Cache::get('selected_company_'. $request->user()->id);
     
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

            $organization->company_id = Cache::get('selected_company_'. $request->user()->id);
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
