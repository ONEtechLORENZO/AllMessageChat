<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

use App\Models\Filter;
use App\Models\Contact;
use App\Models\Tag;
use App\Models\Category;
use DB;

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

        $search = $request->has('search') && $request->get('search') ? $request->get('search') : '';
        $filter = $request->has('filter') && $request->get('filter') ? $request->get('filter') : '';
        $filterId = $request->has('filter_id') && $request->get('filter_id') ? $request->get('filter_id') : '';
        $sort_by = $request->has('sort_by') && $request->get('sort_by') ? $request->get('sort_by') : $this->default_sort_by;
        $sort_order = $request->has('sort_order') && $request->get('sort_order') ? $request->get('sort_order') : $this->default_sort_order;
        
        $user_id = $request->user()->id;
        $filterData = $this->getFiltersInfo($user_id , $moduleName);
       
        $searchData = '';
        if($filter){
            $searchData = json_decode($filter);
        }
        if($filterId && $filterId != 'All'){
            $filter = Filter::find($filterId);
            if($filter){
                $searchData = unserialize( base64_decode($filter->condition) );
            }
        }

        $listFields = array_keys($list_view_columns) ;
        $listFields = array_diff( $listFields, ['tag' , 'list'] );
        $listFields[] = 'id'; 
        $listFields = substr_replace($listFields, "{$baseTable}.", 0, 0);

        //DB::enableQueryLog();
        if($search) {
            $query = $module->select( $listFields )->orderBy("{$baseTable}.{$sort_by}", $sort_order)
                        ->where(function ($query) use ($search, $list_view_columns) {  
                            foreach($list_view_columns as $field_name => $field_info) {
                                if($field_name != 'tag' && $field_name != 'list')
                                    $query->orWhere($field_name, 'like', '%' . $search . '%');
                            }
                        });
            $query = ($searchData) ? $this->getWhereFilterCondition($searchData , $query, $baseTable) : $query;
        } else {
            $query = $module->select( $listFields )->orderBy("{$baseTable}.{$sort_by}", $sort_order);
            
            $query->leftJoin('taggables', "{$baseTable}.id",'taggable_id')->groupBy("{$baseTable}.id");
            $query->leftJoin('categorables', "{$baseTable}.id", 'categorable_id')->groupBy("{$baseTable}.id");

            $query = ($searchData) ? $this->getWhereFilterCondition($searchData , $query , $baseTable) : $query;
        }
        if($moduleName != 'User'){
            $query->where('user_id' , $user_id);
        }
        $records = $query->paginate($this->limit);
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
        ];
       
        return $return;
    }

    /**
     * Return filter Data
     */
    public function getFiltersInfo($user_id, $moduleName)
    {
        $return = [];
        // Filter list
        $return['filter_list'] = Filter::where('user_id', $user_id)
            ->where('module_name', $moduleName)
            ->get(); 
        
        // Tag list
        $return['tag_list'] = $this->getTagOptionList($user_id);

        // Category list
        $return['category_list'] = $this->getCategoryOptionList($user_id);

        $return['selected_filter'] = (isset($_GET['filter_id'])) ? $_GET['filter_id'] : 'All'; 
        return $return;
    }

    /**
     * Return Tag list 
     */
    public function getTagOptionList($user_id)
    {
        $tags = Tag::where('user_id', $user_id)->get();
        $tagList = [];
        foreach($tags as $tag){
            $tagList[] = [
                'value' => $tag->id,
                'label' => $tag->name
            ];
        }
        return $tagList;
    }

    /**
     * Return Category list 
     */
    public function getCategoryOptionList($user_id)
    {
        $categories = Category::where('user_id', $user_id)->get();
        $categoryList = [];
        foreach($categories as $category){
            $categoryList[] = [
                'value' => $category->id,
                'label' => $category->name
            ];
        }
        return $categoryList;
    }


    /**
     * Return filter record list
     */
    public function getWhereFilterCondition($searchData, $query, $baseTable)
    {
        $whereCondition = '';
        $groupCount = 0;
        $isNullCondition = true;
        foreach($searchData as $key => $groupConditions){
            foreach($groupConditions as $groupOperator => $conditions ){
                $groupOperator =  ($groupCount == 0) ? '' : $groupOperator;
                $groupCount ++;
                $obj = $this;
                
                if($groupOperator == 'AND' || $groupOperator == ''){
                    $query->where(function($query) use ( $conditions , $baseTable, $obj) {
                        $query = $obj->setWhereCondition($query , $conditions, $baseTable );
                    });
                   
                } else {
                    $query->orWhere(function($query) use ( $conditions , $baseTable, $obj) {
                        $query = $obj->setWhereCondition($query , $conditions , $baseTable );
                    });
                }
            }
            
        }
        return $query;
    }

    public function setWhereCondition($query , $conditions , $baseTable )
    {
        $whereCondition = '';
        $conditionsCount = count($conditions);
        if(!$conditionsCount){
            return ;
        }
        foreach($conditions as $key => $condition){
            $fieldName = $condition->field_name;
            $fieldValue = $condition->condition_value;


            if($fieldName){
                $isNullCondition = false;
                if( isset($condition->field_type) && $condition->field_type == 'tag'){
                    $selectedTag = $condition->condition_value;
                        
                    if( $fieldName == 'tag_relation' ) {
                        if($selectedTag){
                            $fieldName = 'tag_id';
                            $conditionOperator = 'in';
                            $fieldValue = $selectedTag;
                        } else {
                            $fieldName = 'tag_id';
                            $conditionOperator = 'null';
                            $fieldValue = "";
                        }
                    } else {
                        if($selectedTag){
                            $tag = implode(',', $selectedTag);
                            $fieldName = 'category_id';
                            $conditionOperator = 'in';
                            $fieldValue = $selectedTag;
                        } else {
                            $fieldName = 'category_id';
                            $conditionOperator = 'null';
                            $fieldValue = "";
                        }
                    }
                } else {
                    $conditionOperator = $condition->record_condition;

                    if( strpos($fieldName , 'cf_') !== false ){
                        $fieldName = 'custom->'.$fieldName;
                    }
                    
                    switch($condition->record_condition){
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
                            $fieldValue = " '{$fieldValue}%' ";
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
                    }
                    if(!$fieldValue){
                        $conditionOperator = 'null';
                    }
                    
                }
                $operator = '';
               
                if($key > 0 ){
                    $operator = ($conditions[$key-1]) ? $conditions[$key-1]->condition_operator : 'AND';
                }
                
                if($operator == 'AND' || $operator == ''){
                    if($conditionOperator == 'in'){
                        $query->whereIn($fieldName , $fieldValue );
                    } else if($conditionOperator == 'null'){
                        $query->whereNull($fieldName);
                    } else {
                        $query->where($fieldName, $conditionOperator , $fieldValue );
                    }
                } else {
                    if($conditionOperator == 'in'){
                        $query->orWhereIn($fieldName , $fieldValue );
                    } else if($conditionOperator == 'null'){
                        $query->orWhereNull($fieldName);
                    } else {
                        $query->orWhere($fieldName, $conditionOperator , $fieldValue );
                    }
                }
            }
        }
        return $query;
    }
}
