<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\LineItem;
use Illuminate\Http\Request;

class LineItemController extends Controller
{
    public $contactColumns = ['first_name', 'last_name', 'phone_number', 'email'];

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
            'quantity' => ['label' => __('Quantity'), 'type' => 'number'],
            'price' =>  ['label' => __('Price'), 'type' => 'amount'],
            'total_amount' =>  ['label' => __('Amount'), 'type' => 'amount'],
            'sequence' => ['label' => __('Sequence'), 'type' => 'number'],
            'description' => ['label' => __('Description'), 'type' => 'textarea']
        ];

        $module = new LineItem();;
        $listViewData = $this->listView($request, $module, $list_view_columns);

        $moduleData = [
            'singular' => __('LineItem'),
            'plural' => __('LineItems'),
            'module' => 'LineItem',
            'current_page' => 'LineItems', 
            // Actions
            'actions' => [
                'create' => true,
                'detail' => true,
                'edit' => true,
                'delete' => true,
                'export' => false,
                'import' => false,
                'search' => true,
                'filter' => true,
                'select_field'=>true,
            ],
        ];
        
        $data = array_merge($moduleData, $listViewData);
        return Inertia::render('LineItems/List', $data);
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
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\LineItem  $lineItem
     * @return \Illuminate\Http\Response
     */
    public function show(LineItem $lineItem)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\LineItem  $lineItem
     * @return \Illuminate\Http\Response
     */
    public function edit(LineItem $lineItem)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\LineItem  $lineItem
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, LineItem $lineItem)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\LineItem  $lineItem
     * @return \Illuminate\Http\Response
     */
    public function destroy(LineItem $lineItem)
    {
        //
    }
}
