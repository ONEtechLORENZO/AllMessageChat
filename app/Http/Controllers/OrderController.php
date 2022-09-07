<?php

namespace App\Http\Controllers;

use Cache;
use Inertia\Inertia;
use App\Models\Field;
use App\Models\Order;
use App\Models\Product;
use App\Models\LineItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class OrderController extends Controller
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
        $module = new Order();
        $list_view_columns = $module->getListViewFields();
        $listViewData = $this->listView($request, $module, $list_view_columns);
        $companyId = Cache::get('selected_company_'. $request->user()->id);

        //get Product List
        $productList = $this->getProductList($companyId);

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
            'productList' => $productList,
        ];
        
        $data = array_merge($moduleData, $listViewData);
        return Inertia::render('Order/List', $data);
    }
  /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
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
        $companyId = Cache::get('selected_company_'. $request->user()->id);

        //save the Order
        $order_id = $this->saveOrder($request);

        //save the lineItems
        $lineItems = $this->saveLineItems($request->lineItems, $order_id, $companyId);

        return Redirect::route('detailOrder', $order_id);
      
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $order_id) 
    {
        $order = Order::findOrFail($order_id);

        if(!$order){
            about(401);
        }
         
        $companyId = Cache::get('selected_company_'. $request->user()->id);
        $headers = $this->getModuleHeader($companyId , 'Order');
        $lineItems = [];
        $totalPrice = 0;
        foreach($order->lineItem as $item){

            $product = Product::find($item->product_id);
            $lineItems[] = [
                'name' => $product->name,
                'quantity' => $item->quantity,
                'price' => $item->price,
                'amount' => $item->total_amount,
                'id' => $item->product_id,
            ]; 
            
            $totalPrice += $item->total_amount;
        }

        return Inertia::render('Order/Detail', [
            'record' => $order,            
            'headers' => $headers,
            'translator' => [
                'Detail' => __('Detail'),
                'Notes' => __('Notes'),
                'Edit'  =>__('Edit')
            ],
            'lineItems' => $lineItems,
            'totalPrice' => $totalPrice
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\Response
     */
    
    public function edit(Request $request, $id)
    {
        $order = Order::with('lineItem')->whereId($id)->first();

        if(!$order){
            about(401);
        }
     
        if($order){
            $orderItems = $order->lineItem;
            $lineItems = [];

            if($orderItems){
                foreach($orderItems as $item){  

                    $product = Product::find($item->product_id);
                    $lineItems[] = [
                        'name' => ['value' => $product->name, 'label' => $product->name],
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'amount' => $item->total_amount,
                        'id' => $item->product_id,
                    ];
                    $companyId = $item->company_id;
                }
            }
            $productList = $this->getProductList($companyId);

            return response()->json(['record' => $order, 'productList' => $productList, 'lineItems' => $lineItems ]);
        }
        
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $companyId = Cache::get('selected_company_'. $request->user()->id);

        //save the Order
        $order_id = $this->saveOrder($request);
        
        //delete the old lineItem
        $sync = LineItem::where('order_id', $order_id)->delete();

        //save the lineItems
        $lineItems = $this->saveLineItems($request->lineItems, $order_id, $companyId);

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
        $order = Order::findOrFail($request->id);
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
            ->get(['field_name', 'is_custom', 'field_type']);

        if ($fields) {
            $custom_field = [];
            foreach ($fields as $record) {
                $field = $record['field_name'];
                $custom = $record['is_custom'];
                if($record['field_type'] == 'relate' && $custom == '0' && $request->has($field)) {
                    $order->$field = $request->get($field)['value'];
                }
                else {
                    if ($request->has($field) && ($custom == '0' || !$custom)) {
                        $order->$field = $request->$field;
                    }
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

            $order->company_id = Cache::get('selected_company_'. $request->user()->id);
            $order->save();
        }

        return $order->id;
    }
    
    public function getProductPrice(Request $request, $id){
           
           if($id){
               $companyId = Cache::get('selected_company_'. $request->user()->id);
               $products = Product::where('id',$id)
                                ->where('company_id', $companyId)
                                ->get();
                $productPrice = [];                
                foreach($products as $product){
                    $productPrice = [
                        'name' => ['value' => $product->name, 'label' => $product->name],
                        'quantity' => 0,
                        'price' => $product->price,
                        'amount' => '0.00',
                        'id' => $product->id
                    ]; 
                } 
                             
               return response()->json($productPrice);
           }
           
    }

    public function saveLineItems($lineItems, $order_id, $companyId){
        
        if($order_id){
            
            $lineItem = LineItem::where('order_id',$order_id);
        
            foreach($lineItems as$key => $item){
            
                if($item['id'] != ''){

                    $lineItem = new LineItem();
                    $lineItem->order_id = $order_id;
                    $lineItem->product_id = $item['id'];
                    $lineItem->quantity = $item['quantity'];
                    $lineItem->price = $item['price'];
                    $lineItem->total_amount = $item['amount'];
                    $lineItem->sequence = $key;
                    $lineItem->company_id = $companyId;
                    $lineItem->save();
                }
            }
        }
    }

    public function getProductList($companyId){
    
        $products = Product::where('company_id', $companyId)->get(['id','name']);
        $productList = [];
        $productList[] = ['value' => '', 'label' => 'Select', 'id' => ''];
        foreach($products as $product){
            $productList[] = ['value' => $product->name, 'label' => $product->name, 'id' => $product->id];
        }

        return $productList;
    }
}
