<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Http\Requests\StoreTagRequest;
use App\Http\Requests\UpdateTagRequest;
use Illuminate\Http\Request;
use App\Models\Tag;
use App\Models\Contact;
use App\Models\Taggable;
use Illuminate\Support\Facades\Redirect;


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
        // List view columns to show
        $list_view_columns = [
            'name' => 'Tag',
            'description' => 'Description',
        ];

        $search = $request->has('search') && $request->get('search') ? $request->get('search') : '';
        $sort_by = $request->has('sort_by') && $request->get('sort_by') ? $request->get('sort_by') : $this->default_sort_by;
        $sort_order = $request->has('sort_order') && $request->get('sort_order') ? $request->get('sort_order') : $this->default_sort_order;

        if($search) {
            $records = Tag::orderBy($sort_by, $sort_order)
                        ->where(function ($query) use ($search, $list_view_columns) {    
                            foreach($list_view_columns as $field_name => $field_info) {
                                $query->orWhere($field_name, 'like', '%' . $search . '%');
                            }
                        })
                        ->paginate($this->limit);
        }
        else {
            $records = Tag::orderBy($sort_by, $sort_order)->paginate($this->limit);
        }

        return Inertia::render('Tag/List', [
            'records' => $records->items(),
            'singular' => 'Tag',
            'plural' => 'Tags',
            'module' => 'Tag',
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
     * @param  \App\Http\Requests\StoreTagRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        
        $id = $request->id;
        $data = $request->name;
        $user_id = $request->user()->id;
        $record = [];
        if($data){
            foreach($data as $records){
                foreach($records as $key => $value){
                    if($key == "__isNew__"){
                        $tag = new Tag;
                        $tag->name = $records['label'];
                        $tag->user_id = $user_id;
                        $tag->save();
                    } 
                }
                $record[] = $records['label'];
            }
        }
      
        $sync = $this->syncHandling($record, $id);
        
        return Redirect::route('contact_detail', $id);
               
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Tag  $tag
     * @return \Illuminate\Http\Response
     */
    public function show(Tag $tag)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Tag  $tag
     * @return \Illuminate\Http\Response
     */
    public function edit(Tag $tag)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateTagRequest  $request
     * @param  \App\Models\Tag  $tag
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateTagRequest $request, Tag $tag)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Tag  $tag
     * @return \Illuminate\Http\Response
     */
    public function destroy(Tag $tag)
    {
        //
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
        
        return $contact->tags()->sync($tag_id);
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
