<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use App\Models\Field;
use App\Models\Account;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Cache;
use DB;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
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
        $module = new Product();
        if ($request->is('api/*')) // API call check
            {           
                if($request->account_id)
                     {
                        if(Account::where('id',$request->account_id)->exists())
                            {
                                $list_view_columns = $module->getListViewFields();
                                $listViewData = $this->listView($request, $module, $list_view_columns);                
                                if($listViewData)
                                  {
                                    unset($listViewData['related_records_header'],$listViewData['search'],$listViewData['filter'],$listViewData['compact_type'],$listViewData['list_view_columns'],$listViewData['sort_by'],$listViewData['sort_order'],$listViewData['translator']);
                                    return response()->json(['Status' => true,'Product' => $listViewData],200);
                                 }
                                else
                                {
                                    return response()->json(['status' => false, 'message' => 'No records found'],200); 
                                }
                            }
                            else{
                                return response()->json(['status' => false, 'message' => 'Workspace ID not valid'],400); 
                            }
                    }
                else
                {
                    return response()->json(['status' => false, 'message' => 'Workspace ID not found'],404); 
                }   
            }
        else
            {      
                $list_view_columns = $module->getListViewFields();
                $listViewData = $this->listView($request, $module, $list_view_columns);
                
                $moduleData = [
                    'singular' => __('Product'),
                    'plural' => __('Products'),
                    'module' => 'Product',
                    'current_page' => 'Products', 
                    // Actions
                    'actions' => [
                        'create' => true,                
                        'edit' => true,
                        'delete' => true,                
                        'search' => true,                
                        'select_field'=> true,
                        'detail' => true,
                        'import' => true
                    ],
                ];
                
                $data = array_merge($moduleData, $listViewData);
                return Inertia::render('Product/List', $data);
    }
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
        if($request->is('api/*'))     // API call check
        { 
            if(!Account::where('id',$request->account_id)->exists())
            {
                return response()->json(['status' => false, 'message' => 'Workspace ID not valid'],404); 
            }
            $postFields = array_keys($_POST);
            if(count($postFields) == 0) {
                return response()->json(['status' => 'failed', 'message' => 'Please pass the form data'],400);
            }
            $validator = Validator::make($request->all(), [               
                'name' => 'required|max:255',
                'price' => 'required|max:255',
                'description' => 'required|max:255',
            ]);
    
            if ($validator->fails()) {
                $messages =  $validator->messages();

                return response()->json(['status' => false, 'message' => $messages],400);  
    
            }
        }
        $product_id = $this->saveProduct($request);
        if(($product_id) && ($request->parent_id))
        {
            DB::table('opportunity_products')->insert([
                'opportunity_id' => $request->parent_id,
                'product_id' => $product_id
            ]);
        }
        if($request->is('api/*'))     // API call check
        {        
            if( $product_id){
                
                $product = Product::findOrFail($product_id);                       
                $return = ['Message' => 'Record has been created successfully','Record' =>  $product];
        
            }
            else{
                $return = ['Message' => 'Invalid Input'];
            }
            return response()->json($return);
        }
        else
        {
        
        if($request->parent_module == 'Chat') {
            return Redirect::route('chat_list');
        } else if($request->parent_id){
            $url = route(('detail'. $request->parent_module),['id' => $request->parent_id]);
            return Redirect::to($url);
        } else {
            return Redirect::route('listProduct', $product_id);
        }
    }
    }

    public function getContactData(Request $request)
    {
        $product = Product::findOrFail($request->id);
        echo json_encode(['record' => $product]);
        die;
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $product_id)
    {
        $module = new Product();
        if($request->is('api/*') && !(Account::where('id',$request->account_id)->exists()))
        {
            return response()->json(['status' => false, 'message' => 'Workspace ID not valid'],404); 

        }
        else{
        $product = $this->checkAccessPermission($request, $module, $request->id);
        }
        if(!$product) { 
            if($request->is('api/*')){
                 return response()->json(['status' => false, 'message' => 'Record not found'],404);
              }
            else{
                abort('404');
              }
        }
        if($request->is('api/*')) //api call check
            {
                if ($request->account_id)
                {
                $account = Account::find($request->account_id);                
                $companyId = $account->company_id;                
                }            
            }
        else
            {        
            $companyId = Cache::get('selected_company_'. $request->user()->id);
            }
        $headers = $this->getModuleHeader($companyId , 'Product');
        
        if( $request->is('api/*') ){
            return response()->json(['Status' =>true , 'Record' =>$product]);
             }
        else{
        return Inertia::render('Product/Detail', [
            'record' => $product,            
            'headers' => $headers,
            'translator' => [
                'Detail' => __('Detail'),
                'Notes' => __('Notes'),
                'Edit'  =>__('Edit')
                ]

        ]);}
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request) 
    {
        $module = new Product();
        $record = $this->checkAccessPermission($request, $module, $request->id);

        if(!$record) {
            return response()->json(['status' => false, 'message' => 'Record not found']);   
        }

        return response()->json(['status' => true, 'record' => $record]);
    }
   

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {        
        $currentUser = $request->user();    
        $module = new Product(); 
        if($request->is('api/*'))     // API call check
        { 
            $postFields = array_keys($_POST);
            if(count($postFields) == 0) {
                return response()->json(['status' => 'failed', 'message' => 'Please pass the form data'],400);
            }
            if(!Account::where('id',$request->account_id)->exists())
            {
                return response()->json(['status' => false, 'message' => 'Workspace ID not valid'],404); 
            }
        }
        $product = $this->checkAccessPermission($request, $module, $request->id);
        if(!$product) {
            if($request->is('api/*')){
                return response()->json(['status' => false, 'message' => 'Record not found'],404);   
            }
            else{
                 abort('404');}           
        }   
        
        $product_id = $this->saveProduct($request);
        if($request->is('api/*')){
            
            $product = Product::findOrFail($product_id);
            $return = ['status' =>true,'Message' => 'Record has been updated successfully','Record' => $product];
                return response()->json($return);                 
        }
        else
          {
        return Redirect::route('listProduct', $product_id);
          }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $productId)
    {
        if($request->is('api/*')){
            if(!Account::where('id',$request->account_id)->exists())
            {
                return response()->json(['status' => false, 'message' => 'Workspace ID not valid'],404); 
            }
            $account = Account::findorFail($request->account_id);                
            $company_id = $account->company_id;   
            $product = Product::where('id',$request->id)->where('company_id', $company_id);
            $module = new Product();
            $product = $this->checkAccessPermission($request, $module, $request->id);
            if(!$product) {
                return response()->json(['status' => false, 'message' => 'Record not found'],404);   
            }
           else
           {
            $product->delete();        
            return response()->json(['Status' => true,'Record ID'=>$request->id,'Message'=>'Deleted the record successsfully']);
        }
        }
        else
            {
            $product = Product::find($productId);
            $product->delete();
            return Redirect::route('listProduct');
            }
    }

    /**
     * Return product Detail
     */
    public function getOpportunityData(Request $request)
    {
        $product =Product::findOrFail($request->id);
        echo json_encode(['record' => $product]);
        die;
    }
   
    public function saveProduct($request){

        if ($request->id) {
            $request->validate([
                'name' => 'required|max:255',                
            ]);
            $product = Product::findOrFail($request->id);
        } else {
            $request->validate([
                'name' => 'required|max:255',                
            ]);
            $product = new Product();
        }
        if($request->is('api/*'))
        {
            if ($request->account_id)
            {
              $account = Account::findorFail($request->account_id);                
              $company_id = $account->company_id;                
            }
        }
        else
         {   
            $company_id = Cache::get('selected_company_'. $request->user()->id);
         }
        $fields = Field::where('module_name', 'Product')
            ->where('company_id', $company_id)
            ->get(['field_name', 'is_custom']);

        if ($fields) {
            $custom_field = [];
            foreach ($fields as $record) {
                $field = $record['field_name'];
                $custom = $record['is_custom'];
                if ($request->has($field) && ($custom == '0' || !$custom)) {
                    $product->$field = $request->$field;
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
                $product->custom = $custom_field;
            }
            $product->company_id = $company_id;                
            $product->save();

            if($request->parent_id){
               
            }
        }

        return $product->id;
    }
    

}
