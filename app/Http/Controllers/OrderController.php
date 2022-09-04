<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
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
            'name' => ['label' => __('Subject'), 'type' => 'text'],
            'due_date' =>  ['label' => __('Due Date'), 'type' => 'date'],
            'status' =>  ['label' => __('Status'), 'type' => 'dropdown'],
            'description' => ['label' => __('Description'), 'type' => 'textarea'],
        ];

        $module = new Order();
        $listViewData = $this->listView($request, $module, $list_view_columns);

        $moduleData = [
            'singular' => __('Order'),
            'plural' => __('Orders'),
            'module' => 'Order',
            'current_page' => 'Orders', 
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
        return Inertia::render('Orders/List', $data);
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
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\Response
     */
    public function show(Order $order)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\Response
     */
    public function edit(Order $order)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Order $order)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\Response
     */
    public function destroy(Order $order)
    {
        //
    }
}
