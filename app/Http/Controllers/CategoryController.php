<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\ValidationException;
use Cache;
use Inertia\Inertia;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Models\Categorable;
use App\Models\Contact;
use App\Models\Field;
use App\Models\Automation;

class CategoryController extends Controller
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
        $user = $request->user();
        $user_id = $user->id;
        $pageLimit= Cache::get('Category'.'page_limit'. $request->user()->id);
        $menuBar = $this->fetchMenuBar();
    
        // List view columns to show
        $list_view_columns = [
            'name' => ['label' => __('List'), 'type' => 'text'],
            'description' =>  ['label' => __('Description'), 'type' => 'textarea'],
        ];

        $search = $request->has('search') && $request->get('search') ? $request->get('search') : '';
        $sort_by = $request->has('sort_by') && $request->get('sort_by') ? $request->get('sort_by') : $this->default_sort_by;
        $sort_order = $request->has('sort_order') && $request->get('sort_order') ? $request->get('sort_order') : $this->default_sort_order;

        if($search) {
            $query = Category::orderBy($sort_by, $sort_order)
                        ->where(function ($query) use ($search, $list_view_columns) {    
                            foreach($list_view_columns as $field_name => $field_info) {
                                $query->orWhere($field_name, 'like', '%' . $search . '%');
                            }
                        });
                     
        }
        else {
            $query = Category::orderBy($sort_by, $sort_order);
        }

        $query->where('user_id', $user_id)->get();
       
        $records = $query->paginate($this->limit);

        return Inertia::render('Category/List', [
            'records' => $records->items(),
            'singular' => __('List'),
            'plural' => __('Lists'),
            'module' => 'Category',
            'current_page' => 'Lists',
            // Actions
            'actions' => [
                'create' => true,
                'detail' => true,
                'edit' => true,
                'delete' => true,
                'export' => false,
                'import' => false,
                'search' => true,
                'select_field'=>true
            ],
            'translator' => Controller::getTranslations(),
            
                
            'search' => $search,
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
                'firstItem' => $records->firstItem(),
                'lastItem' => $records->lastItem(),
                'pageLimit' => $pageLimit
               // 'perPage' => $records->perPage(),
            ],
            'menuBar' => $menuBar
        ]);
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
     * @param  \App\Http\Requests\StoreCategoryRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
       
        $user_id = $request->user()->id;
        $view = $request->get('view');

        if($view == 'Detail'){
            $id = $request->id;
            $data = $request->name;
            $record = [];

            if($data){
                foreach($data as $records){
                    $category = new Category;
                    foreach($records as $key => $value){
                        if($key == "__isNew__"){
                            $category->name = $records['label'];
                            $category->user_id = $user_id;
                            
                            $category->save();
                        } 
                    }
                    $record[] = $records['label'];
                }
            }
        
            //Sync the tag module to taggable table
            $sync = $this->syncHandling($record, $id);
        
            $url = route('detailContact').'?id='.$id;
            return Redirect::to($url);
           // return Redirect::route('detailContact', $id);
        }else{

            $checkTagName = Category::where('name', $request->get('name'))
            ->where('user_id', $user_id)
            ->first();

            if($checkTagName) {
               throw ValidationException::withMessages(['message' => 'Name is already exits']);
            }

            //Create new category
            $category = new Category;
            $category->name = $request->name;
            if($request->get('description')){
                $category->description = $request->get('description');
            }
            $category->user_id = $user_id;

            $category->save();

            return Redirect::route('listCategory');
        }     
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request)
    {
     
        $module = new Category();
        $record = $this->checkAccessPermission($request, $module, $request->id);
        $menuBar = $this->fetchMenuBar();

        $companyId = Cache::get('selected_company_'. $request->user()->id);

        $headers = $this->getModuleHeader('Category');
        if(!$record){
            abort('404');
        }

        // Get Sub module data
        $supModule = new Contact();
        $query = $supModule->join('categorables', 'categorable_id', 'contacts.id')
            ->where('category_id', $request->id);
           
        $subPanelData = $this->getSubPanelRecords('Category', $supModule, $query, $record->name);        

        $data = [
            'record' => $record,
            'headers' => $headers,
            'translator' => Controller::getTranslations(),
            'menuBar' => $menuBar
        ];
        $data = array_merge($data , $subPanelData);
        return Inertia::render('Category/Detail', $data);

    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\Response
     */
    public function edit(Category $category, $id,Request $request)
    {
        $module = new Category();
        $record = $this->checkAccessPermission($request, $module, $id);

        if(!$record) {
            return response()->json(['status' => false, 'message' => 'Record not founded']);
        }

        return response()->json(['status' => true, 'record' => $record]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateCategoryRequest  $request
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
                
        $user_id = $request->user()->id;

         // Get fields from the table
         $fields = Field::where('module_name', 'Category')->get();
         // Prepare validation param
         foreach($fields as $field) {
             $validate = '';
             if($field['is_mandatory'] === 1) {
                 $validate = 'required';
             }
             $validation_params[$field['field_name']] = $validate;
         }

         // Validate the request
        $request->validate($validation_params);

        // Check whether tag name has been unique
        $checkTagName = Category::where('name', $request->get('name'))
                        ->where('id', '!=' , $id)
                        ->where('user_id', $user_id)
                        ->first();
                
        if($checkTagName) {
            throw ValidationException::withMessages(['message' => 'Name is already exits']);
        }

         // Create new Tag record
         $category = Category::find($id);
         foreach($fields as $field) {
             $field_name = $field['field_name'];
             $category->$field_name = $request->get($field_name);
         }
         $category->save();

         return Redirect::route('listCategory');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $category = Category::find($id);
        if(!$category) {
            abort(401);
        }
        $category->delete();
        $taggable = Categorable::where('category_id', $id)->delete();
        return Redirect::route('listCategory');
    }

    public function syncHandling($data, $id) {
       
        $contact = Contact::find($id);
        $category_id = [];
        foreach($data as $value){
            $where = ['name' => $value];  
            $categorys = Category::where($where)->get('id');
            foreach($categorys as $key => $category){
                $category_id[] = $category['id']; 
            }
        }

        // Compare exist and current categories
        $existCategories = $contact->categorys;
        $existCategoryIds = [];
        foreach($existCategories as $category){
            $existCategoryIds[] = $category->id;
        }
        $newCategories = array_diff($category_id , $existCategoryIds);
        $contact->categorys()->sync($category_id);
      
        if($newCategories){
            // Process flow functions 
            $user_id = $contact->creater_id;
            $companyId = Cache::get('selected_company_' . $user_id);
            $automations = Automation::where('trigger_mode', 'contact_list_related')
                ->where('status', true)
            //    ->where('company_id', $companyId)
                ->get();
           
            foreach($automations as $automation){
                unset($_REQUEST['isFlowAction']);   // Reset the flow action

                $flow = json_decode($automation->flow);
                $result = $automation->getFlowResult($flow , $contact );
            }
        }
        return true;
         
    }
}
