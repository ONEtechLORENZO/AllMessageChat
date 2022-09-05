<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Order;
use Illuminate\Http\Request;
use App\Models\Field;
use Illuminate\Support\Facades\Redirect;
use Cache;

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
        $module = new Order();
        $list_view_columns = $module->getListViewFields();
        $listViewData = $this->listView($request, $module, $list_view_columns);

        $moduleData = [
            'singular' => __('Order'),
            'plural' => __('Orders'),
            'module' => 'Order',
            'current_page' => 'Orders', 
            // Actions
            'actions' => [
                'create' => true,                
                'edit' => true,
                'delete' => true,                
                'search' => true,                
                'select_field'=>true,
                'detail' =>true
            ],
        ];
        
        $data = array_merge($moduleData, $listViewData);
        return Inertia::render('Order/List', $data);
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
        $order_id = $this->saveOrder($request);
        
        if($request->parent_module == 'Chat') {
            return Redirect::route('chat_list');
        } else if($request->parent_id){
            $url = route('detail'. $request->parent_module).'?id='.$request->parent_id.'&page=1';
            return Redirect::to($url);
        } else {
            return Redirect::route('detailOrder', $order_id);
        }
    }

    public function getContactData(Request $request)
    {
        $order =Order::findOrFail($request->id);
        echo json_encode(['record' => $order]);
        die;
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $order_id)
    {
        $order =Order::findOrFail($request->id);
       
        $companyId = Cache::get('selected_company_'. $request->user()->id);
        $headers = $this->getModuleHeader($companyId , 'Order');
        
        return Inertia::render('Order/Detail', [
            'record' => $order,            
            'headers' => $headers,
            'translator' => [
                'Detail' => __('Detail'),
                'Notes' => __('Notes'),
                'Edit'  =>__('Edit')
                ]

        ]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\Response
     */
   

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $order_id = $this->saveOrder($request);
        return Redirect::route('listOrder', $order_id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $orderId)
    {
        $order = Order::find($orderId);
        $order->delete();
        return Redirect::route('listOrder');
    }

    /**
     * Return order Detail
     */
    public function getOpportunityData(Request $request)
    {
        $order =Order::findOrFail($request->id);
        echo json_encode(['record' => $order]);
        die;
    }

   
    public function saveOrder($request){

        if ($request->id) {
            $request->validate([
                'name' => 'required|max:255',                
            ]);
            $order = Order::findOrFail($request->id);
        } else {
            $request->validate([
                'name' => 'required|max:255',                
            ]);
            $order = new Order();
        }
     
        $fields = Field::where('module_name', 'Order')
            ->where('user_id', $request->user()->id)
            ->get(['field_name', 'is_custom']);

        if ($fields) {
            $custom_field = [];
            foreach ($fields as $record) {
                $field = $record['field_name'];
                $custom = $record['is_custom'];
                if ($request->has($field) && ($custom == '0' || !$custom)) {
                    $order->$field = $request->$field;
                }
  
                if($custom == '1'){
                    if($request->custom){
                        foreach($request->custom as $key => $value){
                            $custom_field[$key] = $value;
                        }
                    }
                }
            }
            if ($custom_field) {
                $order->custom = $custom_field;
            }
            $order->opportunity='1';
            $order->contact='1';
            $order->company_id = Cache::get('selected_company_'. $request->user()->id);
            $order->save();
            if($request->parent_id){
               
            }
        }

        return $order->id;
    }
    

   
}
