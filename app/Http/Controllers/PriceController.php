<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Field;
use App\Models\Price;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\ValidationException;

class PriceController extends Controller
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
            'country_code' => [ 'label' => 'Country' , 'type' => 'dropdown'],
            'user_initiated' => [ 'label' => 'User Initiated Chat' , 'type' => 'text'],
            'business_initiated' => [ 'label' => 'Business Initiated Chat' , 'type' => 'text'],
            'message' =>  [ 'label' => 'Message' , 'type' => 'text'],
            'media' =>  [ 'label' => 'Media' , 'type' => 'text'],
        ];

        $search = $request->has('search') && $request->get('search') ? $request->get('search') : '';
        $sort_by = $request->has('sort_by') && $request->get('sort_by') ? $request->get('sort_by') : $this->default_sort_by;
        $sort_order = $request->has('sort_order') && $request->get('sort_order') ? $request->get('sort_order') : $this->default_sort_order;

        if($search) {
            $records = Price::orderBy($sort_by, $sort_order)
                        ->where(function ($query) use ($search, $list_view_columns) {    
                            foreach($list_view_columns as $field_name => $field_info) {
                                $query->orWhere($field_name, 'like', '%' . $search . '%');
                            }
                        })
                        ->paginate($this->limit);
        }
        else {
            $records = Price::orderBy($sort_by, $sort_order)->paginate($this->limit);
        }

        return Inertia::render('Pricing/List', [
            'records' => $records->items(),
            'singular' => 'Price',
            'plural' => 'Prices',
            'module' => 'Price',
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
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Get fields from the table
        $fields = Field::where('module_name', 'Price')->get();
        // Prepare validation param
        foreach($fields as $field) {
            if($field['is_mandatory'] === 1) {
                $validate = 'required';
            }
            $validation_params[$field['field_name']] = $validate;
        }

        // Validate the request
        $request->validate($validation_params);

        // Check whether country has been added
        $checkPricingAdded = Price::where('country_code', $request->get('country_code'))->first();
        if($checkPricingAdded) {
            throw ValidationException::withMessages(['country_code' => 'Pricing already added for the Country']);
        }

        // Create new Price record
        $price = new Price();
        foreach($fields as $field) {
            $field_name = $field['field_name'];
            $price->$field_name = $request->get($field_name);
        }
        $price->save();

        return Redirect::route('listPrice');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $record = Price::find($id);
        if(!$record) {
            abort(401);
        }

        return response()->json(['status' => true, 'record' => $record]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        // Get fields from the table
        $fields = Field::where('module_name', 'Price')->get();
        // Prepare validation param
        foreach($fields as $field) {
            $validate = '';
            if($field['is_mandatory'] === 1) {
                $validate = 'required';
            }
            $validation_params[$field->field_name] = $validate;
        }

        // Validate the request
        $request->validate($validation_params);

        // Check whether country has been added
        $price = Price::find($id);
        foreach($fields as $field) {
            $field_name = $field['field_name'];
            $price->$field_name = $request->get($field_name);
        }
        $price->save();

        return Redirect::route('listPrice');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $price = Price::find($id);
        if(!$price) {
            abort(401);
        }
        $price->delete();
        return Redirect::route('listPrice');
    }
}
