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
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // List view columns to show
        $list_view_columns = [
            'country_code' => 'Country',
            'user_initiated' => 'User Initiated Chat',
            'business_initiated' => 'Business Initiated Chat',
            'message' => 'Message',
            'media' => 'Media',
        ];

        $records = Price::paginate(15);

        return Inertia::render('Pricing/List', [
            'records' => $records->items(),
            'heading' => 'Price',
            'create' => true,
            'export' => false,
            'import' => false,
            'compact_type' => 'condense',
            'list_view_columns' => $list_view_columns,
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

        return Redirect::route('priceListing');
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
        //
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
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
