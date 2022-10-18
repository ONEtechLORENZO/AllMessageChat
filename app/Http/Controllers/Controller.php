<?php

namespace App\Http\Controllers;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use App\Models\Filter;
use App\Models\Tag;
use App\Models\Category;
use App\Models\Field;
use App\Models\FieldGroup;
use Cache;
use App\Models\Contact;
use App\Models\User;
use App\Models\Opportunity;
use App\Models\Service;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    public $limit = 15;

    public $default_sort_by = 'created_at';

    public $default_sort_order = 'desc';

    /**
     * Return list view data based on module
     */
    public function listView($request, $module, $list_view_columns)
    {
        $baseTable = $module->getTable();
       
        $moduleName = class_basename($module);
        
        // Search
        $search = $request->has('search') && $request->get('search') ? $request->get('search') : '';

        // Filter
        $filter = $request->has('filter') && $request->get('filter') ? $request->get('filter') : '';
        $filterId = $request->has('filter_id') && $request->get('filter_id') ? $request->get('filter_id') : '';

        // Sorting
        $sort_by = $request->has('sort_by') && $request->get('sort_by') ? $request->get('sort_by') : $this->default_sort_by;
        $sort_order = $request->has('sort_order') && $request->get('sort_order') ? $request->get('sort_order') : $this->default_sort_order;
        $from = $request->has('from') && $request->get('from') ? $request->get('from') : '';

        $user = $request->user();
        $user_id = $user->id;

        // Get company selected by the user.
        $companyId = Cache::get('selected_company_'. $user->id);
        
        // If user is not related to any company, abort the below process      
        if(!$companyId) {
            abort(403);
        }

        // Check whether user has updated the list view columns. If so, use it
        $columnlist = Cache::get($moduleName . 'selected_column_list_'. $user->id);
        if($columnlist) {
            $list_view_columns = $columnlist;
        }

        $filterData = $this->getFiltersInfo($companyId, $user_id, $moduleName, false);
       
        $searchData = '';
        if($filter) {
            $searchData = json_decode($filter);
        }

        // If filter is selected, we should use the filter conditions
        if($filterId && $filterId != 'All') {
            $filter = Filter::where('id', $filterId)->where('company_id', $companyId)->first();
            if($filter) {
                $searchData = unserialize( base64_decode($filter->condition) );
            }
        }

        $query = $module->orderBy("{$baseTable}.{$sort_by}", $sort_order); // TODO Need to check how it reacts when we sort using custom fields.
        // Select Base module Fields
        $query = $this->getListViewFields($baseTable, $moduleName, $query, $list_view_columns);

        if($search) {
            $query->where(function ($query) use ($search, $list_view_columns, $moduleName) {  
                foreach($list_view_columns as $field_name => $field_info) {
                    if($field_name != 'tag' && $field_name != 'list') {
                        $isCustom = $this->isCustomField($field_name, $moduleName);
                        if($isCustom){
                            $query->orWhere("custom->{$field_name}", 'like', '%' . $search . '%');
                        } else {
                            $query->orWhere($field_name, 'like', '%' . $search . '%');
                        }
                    }
                }
            });
        }
        else {
            if($moduleName == 'Contact') {
                $query->leftJoin('taggables', "{$baseTable}.id", 'taggable_id');
                $query->leftJoin('categorables', "{$baseTable}.id", 'categorable_id');
            }
        }

        $query = ($searchData) ? $this->prepareQuery($searchData, $query, $baseTable) : $query;

        if($moduleName != 'Price' && $moduleName != 'Company' && $moduleName != 'Plan') {
            // For tenancy
            if($user->role != 'global_admin' && $moduleName != 'User') {
                $query->where("{$baseTable}.company_id", $companyId);
            }

            // Show Users who are all related to selected company
            if(!($request->is('admin/*')) && $moduleName == 'User') {
                $query->join('company_user', 'user_id', 'users.id');
                $query->where('company_user.company_id', $companyId);
            }
        }

        if($moduleName == 'Company' && $user->role != 'global_admin') {
            $query->join('company_user', 'company_id', 'companies.id');
            $query->where('company_user.user_id', $user_id);
        }
        
        // Show only module records
        if($moduleName == 'Field') {           
            $mod = $request->has('mod') ? $request->get('mod') : '';
            if($mod) {
                $query->where('module_name', $mod);        
            }
            else {
                $query->where('module_name', 'Contact');
            }
        }

        // To skip the duplicates
        $query->groupBy("{$baseTable}.id");
        
        if($from == 'campaignfilter') {
            $module = new Contact();
            $headers = $module->getListViewFields();
            $records = $query->paginate($this->limit);

            $return = [
                'records' => $records->items(),
                'headers' => $headers,
                'total' => $records->total(),
            ];
           
            return json_encode($return);
        }

        // Fetch the data
        $records = $query->paginate($this->limit)->withQueryString();

        $return = [
            'records' => $records->items(),

            'search' => $search,
            'filter' => $filterData,
            'compact_type' => 'condense',
            'list_view_columns' => $list_view_columns,

            // Sorting
            'sort_by' => $sort_by,
            'sort_order' => $sort_order,

            // Paginator
            'paginator' => [
                'firstPageUrl' => $records->url(1),
                'previousPageUrl' => $records->previousPageUrl(),
                'nextPageUrl' => $records->nextPageUrl(),
                'lastPageUrl' => $records->url($records->lastPage()),  
                'currentPage' => $records->currentPage(),
                'total' => $records->total(),
                'count' => $records->count(),
                'lastPage' => $records->lastPage(),
                'perPage' => $records->perPage(),
            ],

            'translator' => $this->getTranslations(),
        ];
     
        return $return;
    }

    /**
     * Return filter Data
     */
    public function getFiltersInfo($company_id, $user_id, $moduleName, $is_chat = false)
    {
        $return = [];
        // Filter list
        $query = Filter::where('user_id', $user_id)
            ->where('module_name', $moduleName);

        if($is_chat) {
            $query->where('is_chat', true);
        } else {
            $query->where(function($query){
                $query->whereNull('is_chat')
                    ->orWhere('is_chat' , false);
            });
        }

        $return['filter_list'] = $query->get(); 
        
        // Tag list
        $return['tag_list'] = $this->getTagOptionList($company_id);

        // Category list
        $return['category_list'] = $this->getCategoryOptionList($company_id);

        $return['selected_filter'] = (isset($_GET['filter_id'])) ? $_GET['filter_id'] : 'All'; 
        return $return;
    }

    /**
     * Return tags related to company
     */
    public function getTagOptionList($company_id)
    {
        $tags = Tag::where('company_id', $company_id)->get();
        $tagList = [];
        foreach($tags as $tag) {
            $tagList[] = [
                'value' => $tag->id,
                'label' => $tag->name
            ];
        }
        return $tagList;
    }



    /**
     * Return categories related to company
     */
    public function getCategoryOptionList($company_id)
    {
        $categories = Category::where('company_id', $company_id)->get();
        $categoryList = [];
        foreach($categories as $category) {
            $categoryList[] = [
                'value' => $category->id,
                'label' => $category->name
            ];
        }
        return $categoryList;
    }



    /**
     * return available services
     */
    public function getServiceList()
    {
        $services = Service::all();
        $serviceList = [];
        foreach($services as $service) {
            $serviceList[] = [
                'value' => $service->id,
                'label' => $service->name,
                'name'  => $service->unique_name                
            ];
        }
        return $serviceList;
    }

    /**
     * Prepare Query based on Search data
     */
    public function prepareQuery($searchData, $query, $baseTable)
    {
        $groupCount = 0;
        foreach($searchData as $key => $groupConditions) {
            foreach($groupConditions as $groupOperator => $conditions) {
                $controller = $this;
                // Setting the group operator
                $groupOperator = ($groupCount == 0) ? '' : $groupOperator;
                $groupCount ++;
                
                if($groupOperator == 'AND' || $groupOperator == '') {
                    $query->where(function($query) use ($conditions, $baseTable, $controller) {
                        $query = $controller->setConditions($query, $conditions, $baseTable);
                    });   
                } 
                else {
                    $query->orWhere(function($query) use ($conditions, $baseTable, $controller) {
                        $query = $controller->setConditions($query, $conditions, $baseTable);
                    });
                }
            }
        }
        return $query;
    }

    /**
     * Set conditions based on the params
     */
    public function setConditions($query, $conditions, $baseTable)
    {
        $conditionsCount = count($conditions);
        if(!$conditionsCount) {
            return;
        }

        foreach($conditions as $key => $condition) {
            $fieldName = $condition->field_name;
            $fieldValue = $condition->condition_value;
            if($fieldName) {
                // For Tag and List module
                if(isset($condition->field_type) && $condition->field_type == 'tag') {
                    $selectedTag = $condition->condition_value;
                    if( $fieldName == 'tag_relation' ) { // Tag
                        if($selectedTag) {
                            $fieldName = 'tag_id';
                            $conditionOperator = 'in';
                            $fieldValue = $selectedTag;
                        } else {
                            $fieldName = 'tag_id';
                            $conditionOperator = 'null';
                            $fieldValue = "";
                        }
                    } else { // List
                        if($selectedTag) {
                            $fieldName = 'category_id';
                            $conditionOperator = 'in';
                            $fieldValue = $selectedTag;
                        } else {
                            $fieldName = 'category_id';
                            $conditionOperator = 'null';
                            $fieldValue = "";
                        }
                    }
                } 
                else {
                    $conditionOperator = $condition->record_condition;
                    // Check whether field is custom field
                    if( strpos($fieldName , 'cf_') !== false ) {
                        $fieldName = 'custom->'.$fieldName;
                    }
                    
                    switch($condition->record_condition) {
                        case 'equal':
                            $conditionOperator = '=';
                            break;
                        case 'not_equal':
                            $conditionOperator = '!=';
                            break;
                        case 'is_null':
                            $conditionOperator = 'null';
                            break;
                        case 'start_with':
                            $conditionOperator = 'like';
                            $fieldValue = "{$fieldValue}%";
                            break;
                        case 'end_with':
                            $conditionOperator = 'like';
                            $fieldValue = "%{$fieldValue}";
                            break;
                        case 'contains':
                            $conditionOperator = 'like';
                            $fieldValue = "%{$fieldValue}%";
                            break;
                        case 'lesser_than':
                            $conditionOperator = ' < ';
                            break;
                        default:
                            $conditionOperator = '';
                            break;
                    }

                    // Skip if condition operator doesn't match with our defaults
                    if(!$conditionOperator) {
                        continue;
                    }

                    // If user doesn't enter any value, need to check whether it is null
                    if(!$fieldValue) {
                        $conditionOperator = 'null';
                    }
                }

                $operator = '';
                if($key > 0) {
                    $operator = ($conditions[$key - 1]) ? $conditions[$key - 1]->condition_operator : 'AND';
                }
                
                if($operator == 'AND' || $operator == '') {
                    if($conditionOperator == 'in') {
                        $query->whereIn($fieldName, $fieldValue);
                    } else if($conditionOperator == 'null') {
                        $query->whereNull($fieldName);
                    } else {
                        $query->where($fieldName, $conditionOperator, $fieldValue);
                    }
                } else {
                    if($conditionOperator == 'in') {
                        $query->orWhereIn($fieldName, $fieldValue);
                    } else if($conditionOperator == 'null') {
                        $query->orWhereNull($fieldName);
                    } else {
                        $query->orWhere($fieldName, $conditionOperator, $fieldValue);
                    }
                }
            }
        }
        return $query;
    }

    /** 
     * Return module header list
     */
    public function getModuleHeader($company_id, $module)
    {
        $groupList = $this->getGroupList($company_id, $module);
        $fields = Field::where('module_name', $module)
            ->where('company_id', $company_id)
            ->orderBy('sequence', 'asc')
            ->groupBy('field_name')
            ->orderBy('sequence')
            ->get(['field_label', 'field_name', 'field_type', 'is_custom', 'field_group', 'is_mandatory']);

        $header = [];
        foreach ($fields as $field) {           
            $is_custom = ($field->field_group) ? $groupList[$field->field_group] : 'default';
            if($field->field_group) {
                $header['custom'][$is_custom][$field['field_name']] = ['label' => $field['field_label'], 'type' => $field['field_type'], 'custom' => $field['is_custom'], 'name' => $field['field_name'], 'mandatory' => $field['is_mandatory']];
            } else {
                $header[$is_custom][$field['field_name']] = ['label' => $field['field_label'], 'type' => $field['field_type'], 'custom' => $field['is_custom'], 'name' => $field['field_name'], 'mandatory' => $field['is_mandatory']];
            }
        }

        if($module == 'Contact') {
            $header['default']['tag'] = ['label' => __('Tag'), 'type' => 'text'];
            $header['default']['list'] = ['label' => __('List'), 'type' => 'text'];
        }
        return $header;
    }


    /**
     * Return group list
     */
    public function getGroupList($companyId, $module)
    {
        // $userId = $request->user()->id;
        // $companyId = Cache::get('selected_company_'.$userId);
        $list = FieldGroup::where(['company_id' => $companyId, 'module_name' => $module ])->get();
        $groupList = [];
        foreach($list as $group){
            $groupList[$group->id] = $group->name;
        }
        return $groupList;
    }

    /**
     * Return translator
     */
    public function getTranslations()
    {
        $translator = [
            'Edit' => __('Edit'),
            'Search' => __('Search'),
            'Search filter' => __('Search filter'),
            'Save Filter' => __('Save Filter'),
            'Add' => __('Add'),
            'All' => __('All'),
            'Add New' => __('Add New'),
            'Close' =>__('Close'),
            'Search Filter' => __('Search Filter'),
            'Add New Condition' => __('Add New Condition'),
            'Add Group' => __('Add Group'),
            'Filter name' => __('Filter name'),
            'AND' => __('AND'),
            'OR' => __('OR'),
            'Tag' =>__('Tag'),
            'List' => __('List'),
            'Equal' => __('Equal'),
            'Contains' => __('Contains'),
            'Null' => __('Null'),
            'Start with' => __('Start with'),
            'End with' => __('End with'),
            'Lesser than' => __('Lesser than'),
            'Greater than' =>__('Greater than'),
            'Not equal' => __('Not equal'),
            'Are you sure you want to delete the record?' => __('Are you sure you want to delete the record?'),
            'No records' =>__('No records'),
            'No profile'=>__('No profile'),
            'Get started by creating a new social profile.'=>__('Get started by creating a new social profile.'),
            'Click here to create a new social profile'=>__('Click here to create a new social profile'),
            'Confirm to Delete' =>  __('Confirm to Delete'),
            'Are you sure to do this?' => __('Are you sure to do this?'),
            'Yes' =>__('Yes'),
            'No' =>__('No'), 
            'No records' =>__('No records'),
            'Search' =>__('Search'),
            'Are you sure you want to delete the record?' => __('Are you sure you want to delete the record?'),
        ];
        return $translator;
    }

    public function getContactRecords($module, $fields, $searchData, $limit, $offset){
        
        $baseTable = $module->getTable();
        
        $moduleName = class_basename($module);
        $sort_by = 'created_at';
        $sort_order = 'asc';
        
        $listFields = array_keys($fields) ;
        $listFields = array_diff( $listFields, ['tag' , 'list'] );
        $listFields[] = 'id'; 
        $listFields = substr_replace($listFields, "{$baseTable}.", 0, 0);

        $query = $module->select( $listFields )
                        ->orderBy("{$baseTable}.{$sort_by}", $sort_order);                

        if($moduleName == 'Contact'){
            $query->leftJoin('taggables', "{$baseTable}.id",'taggable_id');
            $query->leftJoin('categorables', "{$baseTable}.id", 'categorable_id');
        }

        $query = $this->prepareQuery($searchData , $query , $baseTable);
        
        if($limit){
            $query->offset($offset)
                   ->limit($limit);
                   
            return $query->get();      
        }
       
        $records = $query->paginate();
  
        return $records->items();

    }

    /**
     * select base table fiels
     */
    public function getListViewFields($baseTable, $moduleName, $query ,$headers)
    {
        // Preparing list view fields
        $listFields = array_keys($headers);
        // Skipping the tag and list 
        $listFields = array_diff($listFields, ['tag', 'list']);

        // Appending the base table for uniqueness
        $listFields = $this->appendBaseTableName($baseTable, $moduleName, $listFields);
        $listFields[] = "{$baseTable}.id";

        $query->select($listFields);

        return $query;
        
    }

    /**
     * Appending the base table for uniqueness
     */
    public function appendBaseTableName($baseTable, $moduleName,  $headers)
    {
        $listFields = [];
        foreach($headers as $header){
            $isCustom = $this->isCustomField($header, $moduleName);
            
            if($isCustom){
                if(! in_array( "{$baseTable}.custom" , $listFields))
                    $listFields[] = "{$baseTable}.custom";
            } else {
                $listFields[] = "{$baseTable}.{$header}";
            }
        }
        return $listFields;
    }

    /***
     * Check the field is custom
     */
    public function isCustomField($fieldName, $moduleName)
    {
        $return = false;
        $field = Field::where('field_name' , $fieldName )->where('module_name', $moduleName )->first();
        if($field && $field->is_custom){
            $return = true;
        }
        return $return;
    }
    /**
     * Get SubPanel Records
     */
    public function getSubPanelRecords( $parent, $submodule, $query,$parent_name)
    {
        $module=new $submodule;
        $headers = $module->getListViewFields();
   
        $baseTable = $module->getTable();
       
        $moduleName = class_basename($module);
        $query = $this->getListViewFields($baseTable, $moduleName, $query, $headers);

        $records = $query->paginate($this->limit);
        unset($headers['tag']);
        unset($headers['list']);

        // Set custom url for Paginate  
        $url = route(('detail'. $parent),['id' => $_GET['id']]);
        $records->withPath($url);

        $currentTab = 'Detail';
        if(isset($_GET['page'])){
            $moduleName = class_basename($module);
            $currentTab = $moduleName;
        }
        if($moduleName == 'Document'){
            $actions = [
                'detail' => false,
                'create' => false,
                'download' => true,
            ];
        } else {
            $actions = [
                'detail' => true,
                'create' => true,
            ];
        }

        $return = [
            'related_records' => $records->items(),
            'related_records_header' => $headers,
            'current_tab' => $currentTab,
            'parent_name' => $parent_name,
            // Paginator
            'sub_panel_pagination' => [
                'firstPageUrl' => $records->url(1),
                'previousPageUrl' => $records->previousPageUrl(),
                'nextPageUrl' => $records->nextPageUrl(),
                'lastPageUrl' => $records->url($records->lastPage()),  
                'currentPage' => $records->currentPage(),
                'total' => $records->total(),
                'count' => $records->count(),
                'lastPage' => $records->lastPage(),
                'perPage' => $records->perPage(),
            ],
            
            // Actions
            'sub_panbel_actions' => $actions,
        ];
        return $return;
    }

    /**
     * Check who can show the record
     */
    public function checkAccessPermission($request, $module, $id) {
        
        $user = $request->user();
        
        // Get current user company id
        $companyId = Cache::get('selected_company_'. $user->id);

        $record = $module->whereId($id)
                  ->where('company_id', $companyId) 
                  ->first();           

        return $record;
    }
}