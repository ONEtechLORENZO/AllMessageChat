<?php

namespace App\Http\Controllers;

use App\Models\Field;
use App\Models\FieldGroup;
use App\Models\Category;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Cache;

class FieldController extends Controller
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
        
        $list_view_columns = [
            'module_name' => ['label' => 'Module Name', 'type' => 'text'],
            'field_label' => ['label' => 'Field Label', 'type' => 'text'],
            'field_type' => ['label' => 'Field Type', 'type' => 'text'],
            'is_mandatory' => ['label' => 'Mandatory', 'type' => 'checkbox'],
            'is_custom' => ['label' => 'Custom', 'type' => 'checkbox'],
        //    'field_group' => ['label' => 'Field group', 'type' => 'text'],
        ];

    //    $userId = $request->user()->id;
    //    $companyId = Cache::get('selected_company_'.$userId);
    //    $groupList = $this->getGroupList($companyId);
    
        $module = new Field();        
        $listViewData = $this->listView( $request , $module, $list_view_columns);
        $moduleList = ['Contact'=> 'Contacts','Opportunity'=>'Opportunities','Product'=>'Products','Order'=>'Orders'];
        
        $mod= $request->has('mod') && $request->get('mod') ? $request->get('mod') : '';
        
            
        $moduleData = [
            'singular' => 'Field',
            'plural' => 'Fields',
            'module' => 'Field',
        //    'group_list' => $groupList,
            'module_list' => $moduleList,
            'mod' =>$mod,

            // Actions
            'actions' => [
                'create' => true,
                'edit' => true,
                'delete' => false,
                'export' => false,
                'import' => false,
                'search' => true,                
                'field_group' => true,  
                'order_field' => true, 
                'select_field'=>true,
            ],
        ];

        $data = array_merge($moduleData , $listViewData);
        return Inertia::render('Field/List', $data);

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
    public function store(Request $request, Field $field)
    {     
           
        $status = 'new';
        //save fields in table
        $this->saveField($request, $field, $status);

        return Redirect::to(url()->previous());
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Field  $field
     * @return \Illuminate\Http\Response
     */
    public function show(Field $field)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Field  $field
     * @return \Illuminate\Http\Response
     */
    public function edit(Field $field, $id)
    {
        $record = Field::find($id);
        if (!$record) {
            abort(401);
        }

        return response()->json(['status' => true, 'record' => $record]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Field  $field
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
       
        if ($request->id) {
            $field = Field::findOrFail($request->id);
        } else {
           abort(404);
        }

        $status = 'edit';
        $this->saveField($request, $field, $status);
        return Redirect::to(url()->previous());
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Field  $field
     * @return \Illuminate\Http\Response
     */
    public function destroy(Field $field, $id)
    {
        $field = Field::find($id);
        if($field->is_custom){
           $field->delete();
        }

        return Redirect::to(url()->previous());
    }

    function cleaner($string)
    {
        $string = str_replace(' ', '-', $string); // Replaces all spaces with hyphens.
        $string = preg_replace('/[^A-Za-z0-9\-]/', '', $string); // Removes special chars.
        $string = str_replace('-', ' ', $string);
        return $string;
    }

    function creater($string)
    {
        $string = strtolower($string); //change to small letter.
        $string = str_replace(' ', '_', $string); // Replaces all spaces with underscore.
        $custom = 'cf_' . $string;
        return $custom;
    }

    function saveField($request, $field, $status){  

        if($status == 'edit'){
            $field_label = $this->cleaner($request->field_label);
            $field_name = $request->field_name;
        }else{
            $field_label = $this->cleaner($request->field_label);
            $field_name = $this->creater($field_label);            
        }

        if($request->has('is_mandatory')){
            $mandatory = $request->is_mandatory;
        }else{
            $mandatory = false;
        }

        if($request->has('is_custom')){
            $custom = $request->is_custom;
        }else{
            $custom = 1;
        }

        $options = $request->options; //get options fields

        $field->module_name = $request->module_name;
        $field->field_name = $field_name;
        $field->field_label = $field_label;
        $field->field_type = $request->field_type;
        $field->is_mandatory = $mandatory;
        $field->mass_edit = $request->mass_edit;
        $field->is_custom = $custom;
        $field->field_group = $request->field_group;
        $field->user_id = $request->user()->id;
        $field->company_id = Cache::get('selected_company_'. $request->user()->id);
        if ($options) {
            $field->options = $options;
        }
   
        $field->save();
    }
}
