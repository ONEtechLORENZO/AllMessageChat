<?php

namespace App\Http\Controllers;

use Cache;
use Inertia\Inertia;
use App\Models\Field;
use App\Models\Order;
use App\Models\Contact;
use App\Models\Product;
use App\Models\Account;
use App\Models\LineItem;
use App\Models\Opportunity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Validator;


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
        $companyId = 1;
        $menuBar = $this->fetchMenuBar();

        if ($request->is('api/*')) // API call check
        {            
            $access = $this->apiControlAccess(); // Check to create or update for you current plan
            if($access == 'false') {
                return response()->json(['status' => false, 'message' => "Please update your plan"]);
            }

            unset($listViewData['related_records_header'],$listViewData['search'],$listViewData['filter'],$listViewData['compact_type'],$listViewData['list_view_columns'],$listViewData['sort_by'],$listViewData['sort_order'],$listViewData['translator']);
            return response()->json($listViewData);
        }
        else
        {    
        //get Product List
        $productList = $this->getProductList($companyId);

        // Check Role Permission
        $user = $request->user();
        if($user->role_permission) {
            $rolePermissions = $this->rolePermissions($user->role_permission);
            $rolePermissions = isset($rolePermissions['Orders']) ? $rolePermissions['Orders'] : '';
            if($rolePermissions == '' ) {
                return Redirect::to(route('home'));
            }
        } else {
            $rolePermissions = ['create', 'view', 'edit', 'delete'];
        }
        // Set Action based on permission
        $action = [
            'create' => in_array( 'Create', $rolePermissions) ? true : false,
            'detail' => true,
            'edit' => in_array( 'Edit', $rolePermissions) ? true : false,
            'delete' => in_array( 'Delete', $rolePermissions) ? true : false,
            'export' => true,
            'import' => true,
            'search' => true,
            'filter' => true,
            'select_field'=>true,
        ];

        $moduleData = [
            'singular' => __('Order'),
            'plural' => __('Orders'),
            'module' => 'Order',
            'current_page' => 'Orders',
            // Actions
            'actions' => $action,
            'productList' => $productList,
            'menuBar' => $menuBar
        ];
        $records =  $this->listViewRecord($request, $listViewData, 'Order');
        
        $data = array_merge($moduleData, $records);
        return Inertia::render('Order/List', $data);
    }
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
        $companyId = 1;

        if($request->is('api/*'))     // API call check
        { 
            $postFields = array_keys($_POST);
            if(count($postFields) == 0) {
                return response()->json(['status' => 'failed', 'message' => 'Please pass the form data'],400);
            }
            $access = $this->apiControlAccess(); // Check to create or update for you current plan
            if($access == 'false') {
                return response()->json(['status' => false, 'message' => "Please update your plan, you can't create a record"]);
            }
            $validator = Validator::make($request->all(), [               
                'name' => 'required|max:255',
            ]);
    
            if ($validator->fails()) {
                $messages =  $validator->messages();
                return response()->json(['status' => false, 'message' => $messages],400);     
            }   
            
            //field validation
            $inputs = [];
            foreach($request->input() as $value => $key)
                {
                    $inputs[] = $value;
                }  
            $fields = Field::where('module_name', 'Order')
                         ->get(['field_name']);
            if ($fields) {                   
                foreach ($fields as $record) {                    
                    $field []= $record['field_name'];                
                }
                array_push($field,'lineItems');
            }
            foreach ($inputs as $record) {                    
                if(!in_array($record, $field))
                {                       
                    $return = ['status' => false , 'message' => "Please Enter valid field",'Invalid field_name' => $record];
                    $statusCode = 400;
                    return response()->json($return,$statusCode);
                }                
            }
        }
        //save the Order
        $order_id = $this->saveOrder($request);     
     
        //save the lineItems
      
        $lineItems = $this->saveLineItems($request, $order_id, $companyId);
        
        if($request->is('api/*'))     // API call check
        {            
            if($order_id){              
                                      
                $return = ['status' =>true, 'message' => 'Record has been created successfully', 'Order_id' => $order_id];
                $statuCode = 200;
            }
            else{
                $return = ['status' =>false, 'message' => 'Something wen wrong'];
                $statuCode = 400;
            }
            return response()->json($return, $statuCode);
            }           
       
        else
        {
          return Redirect::route('detailOrder', $order_id);
        }
      
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $order_id) 
    {
        $module = new Order();
        $order = $this->checkAccessPermission($request, $module, $request->id);
        $menuBar = $this->fetchMenuBar();

        if(!$order){
            if($request->is('api/*')){
                return response()->json(['status' => false, 'message' => 'Record not found'],404);
            } else {
               abort('404');
            }
        }

        if($request->is('api/*')) //api call check
        {
            $access = $this->apiControlAccess(); // Check to create or update for you current plan
            if($access == 'false') {
                return response()->json(['status' => false, 'message' => "Please update your plan"]);
            }    
        }
       
        $headers = $this->getModuleHeader('Order');
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

        //related contact details
        $contact = Contact::where('id', $order->contact)->first();

        //related opporuntity details
        $Opportunity = Opportunity::where('id', $order->opportunity)->first();

        if($contact){
            $order['contact'] = ['label' =>$contact['first_name'].' '.$contact['last_name'], 'value' => $contact['id'], 'module' => 'Contact'];
        }

        if($Opportunity){
            $order['opportunity'] = ['label' => $Opportunity['name'],'value' => $Opportunity['id'], 'module' => 'Opportunity'];
        }

        if ($request->is('api/*')) { // API call check             
            return response()->json(['Status' =>true , 'Record' => $order],200);
        } else {    

            // Check Role Permission
            $user = $request->user();
            if($user->role_permission) {
                $rolePermissions = $this->rolePermissions($user->role_permission);
                $rolePermissions = isset($rolePermissions['Orders']) ? $rolePermissions['Orders'] : [];
               
            } else {
                $rolePermissions = [ 'edit', 'delete'];
            }
            // Set Action based on permission
            $action = [
                'edit' => in_array( 'Edit', $rolePermissions) ? true : false,
                'delete' => in_array( 'Delete', $rolePermissions) ? true : false,
            ];

            return Inertia::render('Order/Detail', [
                'record' => $order,            
                'headers' => $headers,
                'translator' => Controller::getTranslations(),
                'lineItems' => $lineItems,
                'totalPrice' => $totalPrice,
                'menuBar' => $menuBar,
                'action' => $action,
            ]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\Response
     */
    
    public function edit(Request $request, $id)
    {
        $module = new Order();
        $order = $this->checkAccessPermission($request, $module, $id);

        if($request->is('api/*')) {
            $access = $this->apiControlAccess(); // Check to create or update for you current plan
            if($access == 'false') {
                return response()->json(['status' => false, 'message' => "Please update your plan, you can't edit a record"]);
            }
        }

        if(!$order){
            return response()->json(['status' => false, 'message' => 'Record not found'],404);
        }
        
        //related field pre-fill 
        if($order->opportunity){
           $Opportunity = Opportunity::findOrFail($order->opportunity);
           $order['opportunity'] = ['value' => $Opportunity->id , 'label' => $Opportunity->name];
        }
        if($order->contact){
            $contact = Contact::findOrFail($order->contact);
            $name = $contact->first_name .' '.$contact->last_name;
            $order['contact'] = ['value' => $contact->id, 'label' => $name];
        }
      
        if($order){
            $orderItems = $order->lineItem;
            $lineItems = [];
            $companyId = '';

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
            
            if(!$companyId){
                $companyId = Cache::get('selected_company_'. $request->user()->id);
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
        $companyId = 1;
        $currentUser = $request->user();    
        if($request->is('api/*'))     // API call check
        { 
            $order = Order::find($request->id);              
            if(!$order)
            {           
             return response()->json(['status' => false, 'message' => 'Record not found'],404);   
            }            
          else
            {
                $access = $this->apiControlAccess(); // Check to create or update for you current plan
                if($access == 'false') {
                    return response()->json(['status' => false, 'message' => "Please update your plan, you can't edit a record"]);
                }
                //mandatory field cannot be null while update
                $postFields = array_keys($_POST);                
                if(count($postFields) == 0) {
                    return response()->json(['status' => 'failed', 'message' => 'Please pass the form data'],400);
                }              
                if(in_array('name', $postFields))
                {        
                if($_POST['name']==null)
                    {
                    return response()->json(['status' => 'false', 'message' => 'The name field cannot be null.'],400);
                    }
                }   
                //field validation
            $inputs = [];
            foreach($request->input() as $value => $key)
                {
                    $inputs[] = $value;
                }  
            $fields = Field::where('module_name', 'Order')
                         ->get(['field_name']);
            if ($fields) {                   
                foreach ($fields as $record) {                    
                    $field []= $record['field_name'];                
                }
                array_push($field,'lineItems');
            }
            foreach ($inputs as $record) {                    
                if(!in_array($record, $field))
                {                       
                    $return = ['status' => false , 'message' => "Please Enter valid field",'Invalid field_name' => $record];
                    $statusCode = 400;
                    return response()->json($return,$statusCode);
                }                
            }             
            }
           
        }
        else
        {
             
        $module = new Order();        
       
        $order = $this->checkAccessPermission($request, $module, $request->id);
        if(!$order) {            
                 abort('404');
        }
      }

        //save the Order
        $order_id = $this->saveOrder($request);
       
        //delete the old lineItem
        $sync = LineItem::where('order_id', $order_id)->delete();
        //save the lineItems
        $lineItems = $this->saveLineItems($request, $order_id, $companyId);
      
        if($request->is('api/*')){
            
            if($order_id) {
                $return = ['status' =>true, 'message' => 'Record has been updated successfully','Record' => $order_id];
                return response()->json($return, 200);  
            } else{
                $return = ['status' => false, 'message' => 'Something went wrong'];
                $statusCode = 400;
            } 
            return response()->json($return, $statusCode);     
        }
        else
          {
        return Redirect::route('listOrder', $order_id);
          }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $orderId)
    {
        if($request->is('api/*')){
            $order = Order::find($orderId);  
            $access = $this->apiControlAccess(); // Check to create or update for you current plan
            if($access == 'false') {
                return response()->json(['status' => false, 'message' => "Please update your plan, you can't delete this record"]);
            }    

            if(!$order) 
            {
                return response()->json(['status' => false, 'message' => 'Record not found'],404);      
            }           
            else
            {
                $order->delete();        
                return response()->json(['Status' => true,'Record ID'=>$request->id,'Message'=>'Deleted the record successsfully'],200);
            }
         }
        else
        {
            $order = Order::find($orderId);
            $order->delete();       
            return Redirect::route('listOrder');
        }
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
            if(!$request->is('api/*')){
            $request->validate([
                'name' => 'required|max:255',                
            ]);}
            $order = Order::find($request->id);
        } else {
            $request->validate([
                'name' => 'required|max:255',                
            ]);
            $order = new Order();
        }
        
     
        $fields = Field::where('module_name', 'Order')
            ->get('field_name','field_type','options');
          
        if($fields){
            foreach($fields as $field){
                $name = $field->field_name;
                
                if($request->has($name)){
                    if($name == 'opportunity' && !($request->is('api/*'))){
                        $Opportunity = $request->opportunity;
                        if($Opportunity && $Opportunity['value']){
                            $order->$name = $Opportunity['value'];
                        }else{
                            $order->$name = NULL;
                        }
                    }else if($name == 'contact' && !($request->is('api/*'))){
                        $contact = $request->contact;
                        if($contact && $contact['value']){
                            $order->$name = $contact['value'];
                        }else{
                            $order->$name = NULL;
                        }
                    }else if($field->field_type =='dropdown' && $request->is('api/*')) //option validation
                    {             
                        $option = [];     
                        foreach($record['options'] as $value => $key)
                        {
                            $option[]=$value;
                        }               
                        
                        if(!in_array($request->$field, $option))  // Check it's option
                            {
                             http_response_code(400);                        
                             die(json_encode(['status' => false, 'message' => "Please enter valid option",'Invalid Option' => $request->$field],400));                               
                           }
                    }
                    else{
                        $order->$name = $request->$name;
                    }
                }
            }
            
            $order->company_id = 1;
            $order->save();
        } 
        return $order->id;
    }
    
    public function getProductPrice(Request $request, $id){ 

        if($id){
               $product = Product::whereId($id)->first();
               $productPrice = []; 
               if($product) {
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

    public function saveLineItems($request,$order_id, $companyId){        
        
        $lineItems=$request->lineItems;
        
        if($order_id && $lineItems){
            if($request->is('api/*'))
            {
                foreach($lineItems as $key => $item){ 
                    $lineItem = new LineItem();
                    $product = Product::whereId($item['product_id'])->first();
                    
                    if($product == null)
                    {
                        return response()->json(['status' => false, 'message' => 'Product_id not found'],404);
                    }
                    else{
                    $lineItem->order_id = $order_id;
                    $lineItem->product_id = $item['product_id'];
                    $lineItem->quantity = $item['quantity'];
                    $lineItem->price = $product->price;
                    $lineItem->total_amount = ($product->price) * ($item['quantity']) ;
                    $lineItem->sequence = $key;
                    $lineItem->company_id = $companyId;
                    $lineItem->save(); 
                    }                  
                }
            }
            else
            {
            $lineItem = LineItem::where('order_id',$order_id);
       
            foreach($lineItems as $key => $item){            
                if($item['name'] != ''){
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
    }

    public function getProductList($companyId){
    
        $products = Product::all();
        $productList = [];
        $productList[] = ['value' => '', 'label' => 'Select', 'id' => ''];
        foreach($products as $product){
            $productList[] = ['value' => $product->name, 'label' => $product->name, 'id' => $product->id];
        }

        return $productList;
    }
}
