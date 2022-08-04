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
        $listFields[] = $baseTable.'.id'; 
      
        if($search) {
            $query = $module->select( $listFields )->orderBy("{$baseTable}.{$sort_by}", $sort_order)
                        ->where(function ($query) use ($search, $list_view_columns) {  
                            foreach($list_view_columns as $field_name => $field_info) {
                                if($field_name != 'tag' && $field_name != 'list')
                                    $query->orWhere($field_name, 'like', '%' . $search . '%');
                            }
                          
                        });
            $query = ($searchData ) ? $this->getWhereFilterCondition($searchData , $query, $baseTable) : $query;
            $records = $query->groupBy('id')->paginate($this->limit);
                       
        } else {
            $query = $module->select( $listFields )->orderBy("{$baseTable}.{$sort_by}", $sort_order);
            $query = ($searchData ) ? $this->getWhereFilterCondition($searchData , $query , $baseTable) : $query;
            $records = $query->groupBy('id')->paginate($this->limit);
        }

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
                $conditionsCount = count($conditions);
                 if(!$conditionsCount){
                    continue;
                 }
                $whereCondition .=  ($groupCount == 0) ? ' (' : " {$groupOperator} (";
                $groupCount ++;
                
                foreach($conditions as $key => $condition){
                    if($condition->field_name){
                        $isNullCondition = false;
                        if( isset($condition->field_type) && $condition->field_type == 'tag'){
                            $selectedTag = $condition->condition_value;
                                
                            if( $condition->field_name == 'tag_relation' ) {
                                $query->leftJoin('taggables', "{$baseTable}.id",'taggable_id');
                                if($selectedTag){
                                    $tag = implode(',', $selectedTag);
                                    $whereCondition .= "tag_id in ({$tag}) ";
                                } else {
                                    $whereCondition .= "tag_id is null ";
                                }
                            } else {
                                $query->leftJoin('categorables', "{$baseTable}.id", 'categorable_id');
                                if($selectedTag){
                                    $tag = implode(',', $selectedTag);
                                    $whereCondition .= "category_id in ({$tag}) ";
                                } else {
                                    $whereCondition .= "category_id is null ";
                                }
                            }
                        } else {
                            switch($condition->record_condition){
                                case 'equal':
                                    $whereCondition .= " {$condition->field_name} = '{$condition->condition_value}' ";
                                    break;
                                case 'not_equal':
                                    $whereCondition .= " {$condition->field_name} != '{$condition->condition_value}' ";
                                    break;
                                case 'is_null':
                                    $whereCondition .= " {$condition->field_name} is null ";
                                    break;
                                case 'start_with':
                                    $whereCondition .= " {$condition->field_name} like '{$condition->condition_value}%' ";
                                    break;
                                case 'end_with':
                                    $whereCondition .= " {$condition->field_name} like '%{$condition->condition_value}' ";
                                    break;
                                case 'contains':
                                    $whereCondition .= " {$condition->field_name} like '%{$condition->condition_value}%' ";
                                    break;
                                case 'lesser_than':
                                    $whereCondition .= " {$condition->field_name} = '{$condition->condition_value}' ";
                                    break;
                            }
                        }
                        if($conditionsCount != ($key+1) ){
                            $operator = ($condition->condition_operator) ? $condition->condition_operator : 'AND';
                            if($conditions[$key+1]->field_name){
                                $whereCondition .= " {$operator} ";
                            }
                        }
                    }
                }
                $whereCondition .=  " ) ";
            }
        }
        if(! $isNullCondition ){
            $query->whereRaw($whereCondition);
        }
        return $query;
    }

}
