<?php

namespace App\Http\Controllers;

use App\Models\Field;
use App\Models\Category;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Illuminate\Http\Request;

class FieldController extends Controller
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
        $list_view_columns = [
            'module_name' => ['label' => 'Module Name', 'type' => 'text'],
            'field_label' => ['label' => 'Field Label', 'type' => 'text'],
            'field_type' => ['label' => 'Field Type', 'type' => 'text'],
            'is_mandatory' => ['label' => 'Mandatory', 'type' => 'checkbox'],
            'is_custom' => ['label' => 'Custom', 'type' => 'checkbox'],
        ];

        $search = $request->has('search') && $request->get('search') ? $request->get('search') : '';
        $sort_by = $request->has('sort_by') && $request->get('sort_by') ? $request->get('sort_by') : $this->default_sort_by;
        $sort_order = $request->has('sort_order') && $request->get('sort_order') ? $request->get('sort_order') : $this->default_sort_order;

        if ($search) {
            $records = Field::orderBy($sort_by, $sort_order)
                ->where(function ($query) use ($search, $list_view_columns) {
                    foreach ($list_view_columns as $field_name => $field_info) {
                        $query->orWhere($field_name, 'like', '%' . $search . '%');
                    }
                })
                ->paginate($this->limit);
        } else {
            $records = Field::orderBy($sort_by, $sort_order)->paginate($this->limit);
        }

        return Inertia::render('Field/List', [
            'records' => $records->items(),
            'singular' => 'Field',
            'plural' => 'Fields',
            'module' => 'Field',
            // Actions
            'actions' => [
                'create' => true,
                'edit' => true,
                'delete' => false,
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
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, Field $field)
    {
        //save fields in table
        $this->saveField($request, $field);

        return Redirect::route('listField');
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Field  $field
     * @return \Illuminate\Http\Response
     */
    public function show(Field $field)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Field  $field
     * @return \Illuminate\Http\Response
     */
    public function edit(Field $field, $id)
    {
        $record = Field::find($id);
        if (!$record) {
            abort(401);
        }

        return response()->json(['status' => true, 'record' => $record]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Field  $field
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
       
        if ($request->id) {
            $field = Field::findOrFail($request->id);
        } else {
            $field = new Field();
        }

        $this->saveField($request, $field);
        return Redirect::route('listField');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Field  $field
     * @return \Illuminate\Http\Response
     */
    public function destroy(Field $field, $id)
    {
        $field = Field::find($id);
        if($field->is_custom){
           $field->delete();
        }

        return Redirect::route('listField');
    }

    function cleaner($string)
    {
        $string = str_replace(' ', '-', $string); // Replaces all spaces with hyphens.
        $string = preg_replace('/[^A-Za-z0-9\-]/', '', $string); // Removes special chars.
        $string = str_replace('-', ' ', $string);
        return $string;
    }

    function creater($string)
    {
        $string = strtolower($string); //change to small letter.
        $string = str_replace(' ', '_', $string); // Replaces all spaces with underscore.
        $custom = 'cf_' . $string;
        return $custom;
    }

    function saveField($request, $field){

        $field_label = $this->cleaner($request->field_label);
        $field_name = $this->creater($field_label);
        $options = $request->options;
        if($request->has('is_mandatory')){
            $mandatory = $request->is_mandatory;
        }else{
            $mandatory = false;
        }

        $field->module_name = $request->module_name;
        $field->field_name = $field_name;
        $field->field_label = $field_label;
        $field->field_type = $request->field_type;
        $field->is_mandatory = $mandatory;
        $field->is_custom = 1;
        $field->user_id = $request->user()->id;
        if ($options) {
            $field->options = $options;
        }
     
        $field->save();
    }
}
