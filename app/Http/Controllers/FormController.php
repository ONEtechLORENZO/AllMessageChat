<?php

namespace App\Http\Controllers;

use App\Models\Phone;
use App\Models\Email;
use App\Models\Field;
use App\Models\Contact;
use App\Models\FieldGroup;
use App\Models\Tag;
use App\Models\Category;
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

        //API call
        if($request->is('api/*')) {
           $module_name = $request->module_name;
           if(in_array($module_name, $this->entity_modules)) {             
                $whereCondition = [
                    'module_name' => $module_name, 
                ];
            }
            else {
                return response()->json(['status' => false, 'message' => 'Unknown Module Name'],404);  
            }
        }
        if($module == 'Field') {
            $fieldGroupList = FieldGroup::get();
            $fieldGroupOptions = [];
            foreach($fieldGroupList as $fieldGroup) {
                $fieldGroupOptions[$fieldGroup->id] = $fieldGroup->name;
            }
        }

        if($module == 'Msg') {
            $fields = [
                ['field_name' => 'service', 'field_label' => 'Channel', 'field_type' => 'text'],
                ['field_name' => 'msg_type', 'field_label' => 'Type', 'field_type' => 'text'],
                ['field_name' => 'account_id', 'field_label' => 'Account', 'field_type' => 'text'],
                ['field_name' => 'amount', 'field_label' => 'Amount', 'field_type' => 'text'],
            ];
            
            return response()->json(['status' => 200, 'fields' => $fields]);
        }

        if($request->is('api/*'))
        {            
            if($request->has('field')&& $request->get('field') )
            {
            $field_list = $request->get('field');
            $field_list = explode(',', $field_list); 
            
            }
            else{
                $field_list=['field_name','field_label','is_mandatory','field_type','options'];
            }
            $fields = Field::select($field_list)->where($whereCondition)->groupBy('field_name')->orderBy('sequence')->orderBy('id')->get();
            
            if(count($fields) !==0)
            {  
                foreach($fields as $field) {
                    if($field['options']==null)
                    {
                        unset($field['options']); 
                    }
                    $return[]=$field; 
                }   
                return response()->json(['status' => true,'Fields' => $return],200);
            }
            else
            {
                return response()->json(['status' => false,'Fields' => "Fields not found"],404);
            }
        } else{        
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

             //   $query->where('company_id', $companyId);
            }
            else if($module == 'User') {
                $query->select(['id', 'name']);
               // $query->join('company_user', 'user_id', 'users.id');
               // $query->where('company_user.company_id', $companyId);
                $query->where('name', 'like', '%' . $key . '%');
            }
           
            else {
                $query->select(['id', 'name']);
                $query->where('name', 'like', '%' . $key . '%');
               // $query->where('company_id', $companyId);
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

        $fields = Field::where('module_name', $module)->where('mass_edit', '1')->get();

        if($fields) {
            foreach($record_id as $id) {
            
                $model = "App\\Models\\{$module}"; // Get selected model
                $currentModel = new $model;  // Create object from the model
                
                $currentModule = $currentModel::findOrFail($id);
                $customField = [];
                $emails = [];
                $phoneNumbers = [];
                foreach($fields as $field) {
                    $field_name = $field['field_name'];
                    $custom = $field['is_custom'];
                    $field_type = $field['field_type'];

                    if($request->has($field_name) && ($custom == 0 || !$custom)) {

                        if($field_name == 'assigned_to' || $field_name == 'organization_id') {
                            $related_id = $request->$field_name;
                            if(isset($related_id['value'])){
                                $currentModule->$field_name = $related_id['value'];
                            }else {
                                $contact->$field_name = NULL;
                            }
                        } else if ($field_type == 'emails') {
                            $emails = $request->$field_name;
                        } else if ($field_type == 'phones') {
                            $phoneNumbers = $request->$field_name;
                        } else {
                            $currentModule->$field_name = $request->$field_name;
                        }
                    }

                    if($custom == '1' || $custom == 1){
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

                if($emails) {
                    $emailSync = $this->syncEmails($emails, $currentModule);
                }

                if($phoneNumbers) {
                    $phoneNumberSync = $this->phoneNumberSync($phoneNumbers, $currentModule);
                }
            }
        }     

        if($module == 'Contact') {
            $syncRecord = $this->syncContactTagList($request, $record_id);
        }

        $redirect = "list{$module}";
        return Redirect::route($redirect);
    }

    public function phoneNumberSync($records, $module) {
        foreach($records as $record) {           
            $number = isset($record['phones']) ? $record['phones'] : '';
            $type = isset($record['type']) ? $record['type'] : '';
            if($number){
                $phone = new Phone();
                $phone->phones = $number;
                $phone->type = $type;
                $module->phones()->save($phone); 
            }
        }
    }

    public function syncEmails($records, $module) {
        foreach($records as $record) {
            $Email = isset($record['emails']) ? $record['emails'] : '';
            $type = isset($record['type']) ? $record['type'] : '';
            if($Email){
                $email = new Email();
                $email->emails = $Email;
                $email->type = $type;
                $module->emails()->save($email); 
            }
        }
    }

    public function syncContactTagList($request, $record_id) {

        $tags = [];
        $categorys = [];
        $user_id = $request->user()->id;

        if($request->tags) {
            foreach($request->tags as $record) {
                $tag = new Tag();
                foreach($record as $key => $value) {
                    if($key == '__isNew__') {
                        $tag->name = $record['label'];
                        $tag->user_id = $user_id;
                        $tag->save();
                    }
                }
                $tags[] = $record['label']; 
            }
        }
        if($request->categorys) {
            foreach($request->categorys as $record) {
                $category = new Category();
                foreach($record as $key => $value) {
                    if($key == '__isNew__') {
                        $category->name = $record['label'];
                        $category->user_id = $user_id;
                        $category->save();
                    }
                }
                $categorys[] = $record['label']; 
            }
        }

        foreach($record_id as $id) {
            $contact = Contact::find($id);
            if($tags) {
                $tag_id = [];
                foreach($tags as $name) {
                    $tag = Tag::where('name', $name)->first();
                    $tag_id[] = $tag->id;
                }
                $contact->tags()->syncWithoutDetaching($tag_id);
            }
            if($categorys) {
                $category_id = [];
                foreach($categorys as $name) {
                    $category = Category::where('name', $name)->first();
                    $category_id[] = $category->id;
                }
                $contact->categorys()->syncWithoutDetaching($category_id);
            }
        }
    }

    public function fetchModuleGroupFields(Request $request, $module) {
        
        $user = $request->user();
        $userId = $user->id;

        if($module == 'Field') {
            $fieldGroupList = FieldGroup::get();
            $fieldGroupOptions = [];
            foreach($fieldGroupList as $fieldGroup) {
                $fieldGroupOptions[$fieldGroup->id] = $fieldGroup->name;
            }
        }

        if($module == 'Msg') {
            $fields = [
                ['field_name' => 'service', 'field_label' => __('Channel'), 'field_type' => 'text'],
                ['field_name' => 'msg_type', 'field_label' => __('Type'), 'field_type' => 'text'],
                ['field_name' => 'account_id', 'field_label' => __('Account'), 'field_type' => 'text'],
                ['field_name' => 'amount', 'field_label' => __('Amount'), 'field_type' => 'text'],
            ];
            return response()->json(['status' => true, 'fields' => $fields]);
        }

        // GET field group list
        $fieldGroupLists = $this->getGroupList($module);
        $fieldGroupLists[0] ='General';

        //GET module fields
        $fields = Field::where('module_name', $module)->orderBy('sequence', 'asc')->groupBy('field_name')->get();

        // Role creation/editing must remain usable even when dynamic field
        // metadata has not been seeded into the fields table.
        if ($module == 'Role' && $fields->isEmpty()) {
            $fields = collect([
                new Field([
                    'field_name' => 'name',
                    'field_label' => 'Role name',
                    'field_type' => 'text',
                    'field_group' => 0,
                    'is_custom' => 0,
                    'is_mandatory' => 1,
                    'readonly_on_edit' => 'false',
                ]),
                new Field([
                    'field_name' => 'description',
                    'field_label' => 'Description',
                    'field_type' => 'textarea',
                    'field_group' => 0,
                    'is_custom' => 0,
                    'is_mandatory' => 0,
                    'readonly_on_edit' => 'false',
                ]),
            ]);
        }

        //only Global admin can change the status of a Support Request
        if($module == 'SupportRequest' && ($user->role != 'global_admin'))
        {
            $fields = $fields->filter(function ($value, $key) {
                return $value['field_name'] != 'status';
            });        
        }

        $groupFieldList = [];

        foreach($fields as $field) {

            if($field->field_group) {
                $catagory = $fieldGroupLists[$field->field_group];
            } else {
                $catagory = $fieldGroupLists[0];
            }

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

            $groupFieldList[$catagory][] = $field;
        }

        if($module == 'Order') {
            $fieldGroupLists[] = 'Line Items';
        }
        if($module == 'InteractiveMessage') {
            $fieldGroupLists[] = 'Buttons';
        }

        // Get Role Permission List
        $modulePermissions = [];
        if($module == 'Role') {
            $fieldGroupLists[] = 'Permissions'; 
            $modulePermissions = $this->getRolePermissionModules();
        }

        return response()->json([
            'status' => true, 
            'fields' => $fields, 
            'fieldGroupLists' => $fieldGroupLists, 
            'groupFieldList' => $groupFieldList,
            'modulePermissions' => $modulePermissions
        ]);
    }

    public function fetchTagListOption(Request $request) {
        
        $tags = Tag::all(['name']);
        $categorys = Category::all(['name']);
        $tagOptions= [];
        $categoryOptions = [];

        if(count($tags)) {
            foreach($tags as $tag) {
                $tagOptions[] = ['value' => $tag['name'], 'label' => $tag['name']];
            }
        }
        if(count($categorys)) {
            foreach($categorys as $category) {
                $categoryOptions[] = ['value' => $category['name'], 'label' => $category['name']];
            }
        }

        return response()->json(['status' => true, 'tagOptions' => $tagOptions, 'categoryOptions' => $categoryOptions]);
    }
}
