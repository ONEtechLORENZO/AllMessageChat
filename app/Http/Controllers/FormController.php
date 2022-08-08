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
        if($user->role != 'admin' && $module == 'Price') {
            abort(401);
        }

        $fields = Field::where('module_name', $module)
            ->where('user_id', $request->user()->id)
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
        $options = Field::where([
                'module_name'=> $moduleName, 
                'field_name' => $fieldName, 
                'user_id' => $request->user()->id 
            ])
            ->first('options');
        echo json_encode($options);
    }
}
