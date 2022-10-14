<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Http\Requests\StoreTagRequest;
use App\Http\Requests\UpdateTagRequest;
use Illuminate\Http\Request;
use App\Models\Tag;
use Cache;
use App\Models\Field;
use App\Models\Contact;
use App\Models\Taggable;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\ValidationException;
use App\Models\Automation;

class TagController extends Controller
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
    
        // List view columns to show
        $list_view_columns = [
            'name' => ['label' => __('Tag'), 'type' => 'text'],
            'description' =>  ['label' => __('Description'), 'type' => 'textarea'],
        ];

        $search = $request->has('search') && $request->get('search') ? $request->get('search') : '';
        $sort_by = $request->has('sort_by') && $request->get('sort_by') ? $request->get('sort_by') : $this->default_sort_by;
        $sort_order = $request->has('sort_order') && $request->get('sort_order') ? $request->get('sort_order') : $this->default_sort_order;

        if($search) {
            $query = Tag::orderBy($sort_by, $sort_order)
                        ->where(function ($query) use ($search, $list_view_columns) {    
                            foreach($list_view_columns as $field_name => $field_info) {
                                $query->orWhere($field_name, 'like', '%' . $search . '%');
                            }
                        });
        }
        else {
            $query = Tag::orderBy($sort_by, $sort_order);
        }

        if( $user->role != 'reqular'){
            $companyId = Cache::get('selected_company_'. $user->id);
            
            $query->where('company_id' , $companyId);
        } else if($user->role = 'regular' ){
            $query->where('user_id', $user_id)->get();
        }
        //$query->where('user_id',$user_id);
        $records = $query->paginate($this->limit);

        return Inertia::render('Tag/List', [
            'records' => $records->items(),
            'singular' => __('Tag'),
            'plural' => __('Tags'),
            'module' => 'Tag',
            'current_page' => 'Tags',
            // Actions
            'actions' => [
                'create' => true,
                'detail' => true,
                'edit' => true,
                'delete' => true,
                'export' => false,
                'import' => false,
                'search' => true,
            ],
            'translator' => [
                'Search' => __('Search'),
                'No records' =>__('No records')
                
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
     * @param  \App\Http\Requests\StoreTagRequest  $request
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
                    $tag = new Tag;
                    foreach($records as $key => $value){
                        if($key == "__isNew__"){
                            $tag->name = $records['label'];
                            $tag->user_id = $user_id;
                            $tag->company_id = Cache::get('selected_company_' . $user_id);

                            $tag->save();
                        } 
                    }
                    $record[] = $records['label'];
                }
            }
           
            //Sync the tag module to taggable table
            $sync = $this->syncHandling($record, $id);
         
            $url = route('detailContact').'?id='.$id;
            return Redirect::to($url);
        }else{

            // Check whether tag name has been unique
            $checkTagName = Tag::where('name', $request->get('name'))
            ->where('user_id', $user_id)
            ->first();

            if($checkTagName) {
               throw ValidationException::withMessages(['message' => 'Name is already exits']);
            }

            //Create new Tag
            $tag = new Tag;
            $tag->name = $request->name;
            if($request->get('description')){
                $tag->description = $request->get('description');
            }
            $tag->user_id = $user_id;
            $tag->company_id = Cache::get('selected_company_'.$user_id);
            $tag->save();

            return Redirect::route('listTag');
        }            
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Tag  $tag
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request)
    {
        $module = new Tag();
        $record = $this->checkAccessPermission($request, $module, $request->id);

        $companyId = Cache::get('selected_company_'. $request->user()->id);

        $headers = $this->getModuleHeader(1 , 'Tag');
        if(!$record){
            abort('404');
        }

        // Get Sub module data
        $supModule = new Contact();
        $query = $supModule->join('taggables', 'taggable_id', 'contacts.id')
            ->where('tag_id', $request->id);
           
        $subPanelData = $this->getSubPanelRecords('Tag', $supModule, $query, $record->name);        

        $data = [
            'record' => $record,
            'headers' => $headers,

            'translator' => [
                'Detail' => __('Detail'),
                'Notes' => __('Notes'),
                'Edit'  =>__('Edit')
            ],
            
        ];
        $data = array_merge($data , $subPanelData);
        return Inertia::render('Tag/Detail', $data);

    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Tag  $tag
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request, $id)
    {
        $module = new Tag();
        $record = $this->checkAccessPermission($request, $module, $id);

        if(!$record) {
            return response()->json(['status' => false, 'message' => 'Record not found']);   
        }

        return response()->json(['status' => true, 'record' => $record]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateTagRequest  $request
     * @param  \App\Models\Tag  $tag
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
    
        $user_id = $request->user()->id;

         // Get fields from the table
         $fields = Field::where('module_name', 'Tag')->get();
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
        $checkTagName = Tag::where('name', $request->get('name'))
                        ->where('id', '!=' , $id)
                        ->where('user_id', $user_id)
                        ->first();
                
        if($checkTagName) {
            throw ValidationException::withMessages(['message' => 'Name is already exits']);
        }

         // Create new Tag record
         $tag = Tag::find($id);
         foreach($fields as $field) {
             $field_name = $field['field_name'];
             $tag->$field_name = $request->get($field_name);
         }
         $tag->save();

         return Redirect::route('listTag');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Tag  $tag
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $tag = Tag::find($id);
        if(!$tag) {
            abort(401);
        }
        $tag->delete();
        $taggable = Taggable::where('tag_id', $id)->delete();
        return Redirect::route('listTag');
    }
    
    public function syncHandling($data, $id) {
        
        $contact = Contact::find($id);
      
        $tag_id = [];
        foreach($data as $value){
            $where = ['name' => $value];  
            $tags = Tag::where($where)->get('id');
            foreach($tags as $key => $tag){
                $tag_id[] = $tag['id']; 
            }
        }

        // Compare exist and current tags
        $existTags = ($contact->tags) ? $contact->tags : [];
        $existTagIds = [];
        foreach($existTags as $tag){
            $existTagIds[] = $tag->id;
        }

        $newTags = array_diff($tag_id , $existTagIds);  // For automation new tag relate event
        $contact->tags()->sync($tag_id);
      
        if($newTags){
            // Process flow functions 
            $user_id = $contact->creater_id;
            $companyId = Cache::get('selected_company_' . $user_id);
            $automations = Automation::where('trigger_mode', 'contact_tag_related')
            //    ->where('company_id', $companyId)
                ->where('status', true)
                ->get();
            
            foreach($automations as $automation){
                unset($_REQUEST['isFlowAction']);   // Reset the flow action
                
                $flow = json_decode($automation->flow);
                $result = $automation->getFlowResult($flow , $contact );
            }
        }
        return true;
    }

    /**
     * Return Tag List based on search
     */
    public function getTagList(Request $request)
    {
        $tagList = [];
        $searchKey = '%'.$request->get('key'). '%';
        $tags = Tag::where('name', 'like', $searchKey)
            ->where('user_id', $request->user()->id)
            ->get();
        foreach($tags as $tag){
            $tagList[] = [
                'value' => $tag->id,
                'label' => $tag->name
            ];
        }
        echo json_encode(['tag_list' => $tagList]); die;
    }
}
