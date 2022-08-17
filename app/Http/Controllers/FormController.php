<?php

namespace App\Http\Controllers;

use App\Models\Field;
use Illuminate\Http\Request;

class FormController extends Controller
{
    /**
     * Fetch module fields from Field model
     */
    function fetchModuleFields(Request $request)
    {     
       
        $user = $request->user();
        $module = $request->route('module');
        if($user->role == 'regular' && $module == 'Price') {
            abort(401);
        }
        $whereCondition = [
            'module_name'=> $module, 
        ];
        if($module == 'Contact'){
            $whereCondition['user_id'] = $request->user()->id ;
        }

        $fields = Field::where($whereCondition)
            ->get();
         
        foreach($fields as $field){
            if($field['is_custom'] == '1' && $field['field_type'] == 'dropdown'){
                $option = $field['options'];
                $options = [];
                if ($option) {
                    foreach ($option as $key) {
                        $options[$key['value']] = $key['value'];
                    }
                }
                $field->options = $options;
            }  
        }   

        return response()->json(['fields' => $fields]);
    }

    /**
     * Return module field options
     */
    public function getFieldOptions(Request $request)
    {
        $moduleName = $request->get('module_name');
        $fieldName = $request->get('field_name');
        $whereCondition = [
            'module_name'=> $moduleName, 
            'field_name' => $fieldName, 
        ];
        if($moduleName == 'Contact'){
            $whereCondition['user_id'] = $request->user()->id ;
        }

        $options = Field::where($whereCondition)
            ->first('options');
        echo json_encode($options);
    }
}
