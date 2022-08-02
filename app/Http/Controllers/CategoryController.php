<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\ValidationException;

use Inertia\Inertia;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Models\Categorable;
use App\Models\Contact;
use App\Models\Field;

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
        $user_id = $request->user()->id;
    
        // List view columns to show
        $list_view_columns = [
            'name' => 'List',
            'description' => 'Description',
        ];

        $search = $request->has('search') && $request->get('search') ? $request->get('search') : '';
        $sort_by = $request->has('sort_by') && $request->get('sort_by') ? $request->get('sort_by') : $this->default_sort_by;
        $sort_order = $request->has('sort_order') && $request->get('sort_order') ? $request->get('sort_order') : $this->default_sort_order;

        if($search) {
            $records = Category::orderBy($sort_by, $sort_order)
                        ->where(function ($query) use ($search, $list_view_columns) {    
                            foreach($list_view_columns as $field_name => $field_info) {
                                $query->orWhere($field_name, 'like', '%' . $search . '%');
                            }
                        })
                        ->where('user_id',$user_id)
                        ->paginate($this->limit);
        }
        else {
            $records = Category::orderBy($sort_by, $sort_order)->where('user_id',$user_id)->paginate($this->limit);
        }

        return Inertia::render('Category/List', [
            'records' => $records->items(),
            'singular' => 'Category',
            'plural' => 'Categorys',
            'module' => 'Category',
            // Actions
            'actions' => [
                'create' => true,
                'edit' => true,
                'delete' => true,
                'export' => false,
                'import' => false,
                'search' => true,
            ],
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
                'perPage' => $records->perPage(),
            ],
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
    public function store(Request $request, Category $category)
    {
       
        $user_id = $request->user()->id;
        $view = $request->get('view');

        if($view == 'Detail'){
            $id = $request->id;
            $data = $request->name;
            $record = [];

            if($data){
                foreach($data as $records){
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
        
            return Redirect::route('contact_detail', $id);
        }else{

            //Create new category
            $name = $request->name;
            $category->name = $name;
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
    public function show(Category $category)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\Response
     */
    public function edit(Category $category, $id)
    {
        $record = Category::find($id);
        if(!$record) {
            abort(401);
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
        
        return $contact->categorys()->sync($category_id);
    }
}
