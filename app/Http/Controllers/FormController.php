<?php

namespace App\Http\Controllers;

use App\Models\Field;
use App\Models\Contact;
use App\Models\FieldGroup;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;
use Cache;

class FormController extends Controller
{
    public $entity_modules = ['Contact','Lead', 'Product', 'Opportunity', 'Order', 'Campaign', 'User','Organization','SupportRequest'];

    /**
     * Fetch module fields from Field model
     */
    function fetchModuleFields(Request $request)
    {     
        $user = $request->user();
        $userId = $user->id;
        $companyId = Cache::get('selected_company_' . $userId);
        $module = $request->route('module');

        // Only global admin can able to access the price module
        if($user->role != 'global_admin' && $module == 'Price') {
            abort(401);
        }

        // Regular user is not allowed to view the User module
        if($user->role == 'regular' && $module == 'User') {
            abort(401);
        }
        
        $whereCondition = [
            'module_name' => $module, 
        ];

        if(in_array($module, $this->entity_modules)) {
            $whereCondition['company_id'] = $companyId;
        }

        if($module == 'Field') {
            $fieldGroupList = FieldGroup::where('company_id', $companyId)->get();
            $fieldGroupOptions = [];
            foreach($fieldGroupList as $fieldGroup) {
                $fieldGroupOptions[$fieldGroup->id] = $fieldGroup->name;
            }
        }
        
        $fields = Field::where($whereCondition)->groupBy('field_name')->orderBy('sequence')->orderBy('id')->get();
        
        //only Global admin can change the status of a Support Request
      if($module == 'SupportRequest' && ($user->role != 'global_admin'))
        {
            $fields = $fields->filter(function ($value, $key) {
                return $value['field_name'] != 'status';
            });        
        }
        foreach($fields as $field) {
            if(($field['is_custom'] == '1' && $field['field_type'] == 'dropdown') 
                || $field['field_name'] == 'field_group'
                || ($field['is_custom'] == '1' && $field['field_type'] == 'multiselect')) {

                $option = $field['options'];
                $options = [];
                if ($option) {
                    foreach ($option as $key) {
                        $options[$key['value']] = $key['value'];
                    }
                }
               
                if($field['field_name'] == 'field_group') {
                    $options = $fieldGroupOptions;
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

        if($moduleName == 'Contact' || $moduleName == 'Opportunity' || $moduleName == 'Lead') {
            $whereCondition['user_id'] = $request->user()->id;
        }
        
        $options = Field::where($whereCondition)->first('options');
        if(!$options['options']) {
            $options['options'] = [];
        }

        // return response()->json($options);
        echo json_encode($options);
        die;
    }

    public function getRelateContacts(Request $request)
    {
        $user = $request->user();
        $userId = $user->id;
        $companyId = Cache::get('selected_company_'. $userId);

        $selectedContacts = [];
        // Get related records
       
      
        $query = Contact::select('contacts.id', 'first_name', 'last_name');
        $query->where('company_id', $companyId);
        
        // Filter records based on key 
        $key = (isset($_GET['key']) && $_GET['key']) ? $_GET['key'] : '';
        if($key){
            $query->where(function($query) use($key) {
                $query->orWhere('first_name', 'like', '%' . $key . '%');
                $query->orWhere('last_name', 'like', '%' . $key . '%');
            });
        }
        $records = $query->limit(5)->get();


        $contacts = [];
        foreach($records as $record){
            $contacts[] = ['label' => $record->first_name. ' '. $record->last_name, 'value' => $record->id ];
        }

        echo json_encode(['records' => $contacts ]); die;
    }

    /**
     * Search for given key in module
     */
    function lookup(Request $request)
    {
        $records[] = ['label' => 'Select', 'value' => ''];
        $key = $request->has('key') ? $request->get('key') : ''; 
        
        $module = $request->has('module') ? $request->get('module') : ''; 
        
        if($key && $module && in_array($module, $this->entity_modules)) {
            $user = $request->user();
            $userId = $user->id;
            $companyId = Cache::get('selected_company_' . $userId);

            $class_name = "App\Models\\$module";
            $moduleBean = new $class_name();

            $baseTable = $moduleBean->getTable();
            
            $query = $moduleBean->orderBy("{$baseTable}.created_at", 'DESC');

            if($module == 'Contact' || $module == 'Lead') {
                $query->select(['id', 'first_name', 'last_name']);
                $query->where(function($query) use($key) {
                    $query->orWhere('first_name', 'like', '%' . $key . '%');
                    $query->orWhere('last_name', 'like', '%' . $key . '%');
                });

                $query->where('company_id', $companyId);
            }
            else if($module == 'User') {
                $query->select(['id', 'name']);
                $query->join('company_user', 'user_id', 'users.id');
                $query->where('company_user.company_id', $companyId);
                $query->where('name', 'like', '%' . $key . '%');
            }
           
            else {
                $query->select(['id', 'name']);
                $query->where('name', 'like', '%' . $key . '%');
                $query->where('company_id', $companyId);
            }

            $response = $query->limit(5)->get();
           
            foreach($response as $record) {
                if($module == 'Contact' || $module == 'Lead') {
                    $records[] = ['label' => $record->first_name . ' ' . $record->last_name, 'value' => $record->id];
                }
                else {
                    $records[] = ['label' => $record->name, 'value' => $record->id];
                }
            }
        } else if ($key && $module == 'Company') {
            
            $class_name = "App\Models\\$module";
            $moduleBean = new $class_name();

            $baseTable = $moduleBean->getTable();
            
            $query = $moduleBean->orderBy("{$baseTable}.created_at", 'DESC');

            if($module == 'Company') {
                $query->select(['id', 'name']);
                $query->where('name', 'like', '%' . $key . '%');
            }

            $response = $query->limit(5)->get();

            foreach($response as $record) {
                    $records[] = ['label' => $record->name, 'value' => $record->id];
            }

        }
        
        return response()->json(['records' => $records]);
    }

    public function massEdit(Request $request) {

        $record_id = $request->id;
        $module = $request->module;

        // Custom fields modules
        $customfieldModule = ['Contact', 'Opportunity', 'Product', 'Order'];

        if($module){
            $fields = Field::where('module_name', $module)
                      ->where('mass_edit', '1')
                      ->get();
            
            if($fields) {
                foreach($record_id as $id) {
                
                    $model = "App\\Models\\{$module}"; // Get selected model
                    $currentModel = new $model;  // Create object from the model
                    
                    $currentModule = $currentModel::findOrFail($id);
                    $customField = [];
                    foreach($fields as $field) {
                        $field_name = $field['field_name'];
                        $custom = $field['is_custom'];
                        
                        if($request->has($field_name) && $custom == 0) {
                           $currentModule->$field_name = $request->$field_name;
                        }
                    }
                    
                    // Check if the current module in custom module list
                    foreach($customfieldModule as $customModule) {
                        if($module == $customModule) {
                            if($request->custom) {
                                foreach( $request->custom as $key => $value) {
                                    $customField[$key] = $value;
                                }
                            }
                        }
                    }

                    if($customField) {
                        $currentModule->custom = $customField;
                    }

                    $currentModule->save();
                }
            }          
        }
        
        $redirect = "list{$module}";
        return Redirect::route($redirect);
    }
        
        
}
