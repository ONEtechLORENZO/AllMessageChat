<?php

namespace App\Http\Controllers;

use App\Models\FieldGroup;
use App\Models\Field;
use Illuminate\Http\Request;
use Cache;

class FieldGroupController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
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
        $name = $request->field_group;
        $user_id = $request->user()->id;
        $fieldGroup = new FieldGroup();
        $fieldGroup->name = $name;
        $fieldGroup->module_name = $request->module_name;
        $fieldGroup->company_id = Cache::get('selected_company_'. $user_id);
        $fieldGroup->created_by = $user_id;
        $fieldGroup->save();
        
        echo json_encode(['result' => 'success']); die;
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\FieldGroup  $fieldGroup
     * @return \Illuminate\Http\Response
     */
    public function show(FieldGroup $fieldGroup)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\FieldGroup  $fieldGroup
     * @return \Illuminate\Http\Response
     */
    public function edit(FieldGroup $fieldGroup)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\FieldGroup  $fieldGroup
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, FieldGroup $fieldGroup)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\FieldGroup  $fieldGroup
     * @return \Illuminate\Http\Response
     */
    public function destroy(FieldGroup $fieldGroup)
    {
        //
    }

    /**
     * Return Fields and groups
     */
     public function getFieldsGroup(Request $request)
     {
        $user = $request->user();
        $companyId = Cache::get('selected_company_'. $user->id);
        $module = $request->get('module');
        
        $groupList = $this->getGroupList($companyId, $module);
        $groupList[0] = 'General';
        
        $fields = Field::where(
                [
                    'module_name' => $module,
                    'company_id' => $companyId
                ]
            )
            ->orderBy('sequence', 'asc')
            ->groupBy('field_name')
            ->get();
        $fieldList = [];
        foreach($fields as $field){
            if($field->field_group){
                $category = $field->field_group;
            } else {
                $category = '0';
            }
            $fieldList[$category][] = ['id' => "{$field->id}" , 'content' => $field->field_label, 'group_id'=> $category];
        }
        echo json_encode(['fields' => $fieldList , 'groups'=> $groupList]);die;
    }

    /**
     * Store field group and field sequence
     */
    public function storeFieldOrder(Request $request)
    {
        $module = $request->module_name;
        $groupList = $request->group_list;
        $order = $request->field_order;

        foreach($order as $groupOrderId => $fields){
            $groupId = $groupList[$groupOrderId];
           // if($groupId > 0){
                $fieldsId = [];
                foreach($fields as $sequence => $field){
                    $fieldsId = $field['id'];
                    $fieldObj =  Field::find($fieldsId);
                    if($fieldObj){
                        $fieldObj->sequence = $sequence;
                        $fieldObj->field_group = ($groupId > 0)? (int) $groupId : null;
                        $fieldObj->save();
                    }        
                }
           // }
        }
        echo json_encode(['result' => true]); die;

    }
}
