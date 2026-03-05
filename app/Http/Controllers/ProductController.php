<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use App\Models\Field;
use App\Models\Account;
use App\Models\Document;
use App\Models\Catalog;
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
        
        $list_view_columns = $module->getListViewFields();
       
        $menuBar = $this->fetchMenuBar();
        if ($request->is('api/*')) // API call check
        {       
           $api_list_view_columns = [
                'name' => ['label' => ('Product Name'), 'type' => 'text'],
                'price' =>  ['label' => ('Price'), 'type' => 'amount'], 
                'description' =>  ['label' => 'Description', 'type' => 'textarea'],
                'url' => ['label' => ('Website Url'), 'type' => 'text'],
                'brand' => ['label' => ('Brand'), 'type' => 'text'],
                'availability' => ['label' => ('Availability'), 'type' => 'checkbox'],
                'condition' => ['label' => ('Condition'), 'type' => 'dropdown'],
                'status' => ['label' => ('Status'), 'type' => 'checkbox'],
                'product_id' => ['label' => ('Product Id'), 'type' => 'text'],
                'retailer_id' => ['label' => ('Retailer Id'), 'type' => 'text'],
                'media_id' => ['label' => ('Media Id'), 'type' => 'text'],
                'catalog_id' => ['label' => ('Catalog Id'), 'type' => 'text'],
            ];
            $access = $this->apiControlAccess(); // Check to create or update for you current plan
            if($access == 'false') {
                return response()->json(['status' => false, 'message' => "Please update your plan"]);
            }
            $listViewData = $this->listView($request, $module, $api_list_view_columns);

            unset($listViewData['related_records_header'],$listViewData['search'],$listViewData['filter'],$listViewData['compact_type'],$listViewData['list_view_columns'],$listViewData['sort_by'],$listViewData['sort_order'],$listViewData['translator']);
            return response()->json($listViewData);
        }
        else
        {    
            $listViewData = $this->listView($request, $module, $list_view_columns);
            // Check Role Permission
            $user = $request->user();
            if($user->role_permission) {
                $rolePermissions = $this->rolePermissions($user->role_permission);
                $rolePermissions = isset($rolePermissions['Products']) ? $rolePermissions['Products'] : '';
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
                'import' => true,
                'search' => true,
                'select_field'=>true,
            ];

            $moduleData = [
                'singular' => __('Product'),
                'plural' => __('Products'),
                'module' => 'Product',
                'current_page' => 'Products', 
                // Actions
                'actions' => $action,
                'menuBar' => $menuBar
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
                'price' => 'required|max:255',
                'description' => 'required',
                'availability' => 'required'
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
              $fields = Field::where('module_name', 'Product')
                           ->get(['field_name']);
              if ($fields) {                   
                  foreach ($fields as $record) {                    
                      $field []= $record['field_name'];                
                  }
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
    else{
        $request->validate([
            'name' => 'required',
            'price' => 'required',
            'description' => 'required',

        ]);}
        
        $product_id = $this->saveProduct($request);

        if(($product_id) && ($request->parent_id) && $request->parent_module != 'Catalog')
        {
            DB::table('opportunity_products')->insert([
                'opportunity_id' => $request->parent_id,
                'product_id' => $product_id
            ]);
        }

        if($request->is('api/*'))     // API call check
        {        
            if($product_id){                                       
                $return = [ 'status' => true, 'message' => 'Record has been created successfully', 'Product_id' =>  $product_id];
                $statusCode = 200;
            }
            else{
                $statusCode = 400;
                $return = ['status' => false, 'message' => 'Something went wrong'];
            }
            return response()->json($return, $statusCode);
        } else {
            if($request->parent_module == 'Chat') {
                return Redirect::route('chat_list');
            } else if($request->parent_id && $request->parent_module != 'Catalog'){
                $url = route(('detail'. $request->parent_module),['id' => $request->parent_id]);
                return Redirect::to($url);
            } else if($request->parent_id && $request->parent_module == 'Catalog'){
                $url = route('listCatalog', ['record_id' => $request->parent_id]);
                return Redirect::to($url);
            }else {
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
        $product = $this->checkAccessPermission($request, $module, $request->id);
        $menuBar = $this->fetchMenuBar();

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
            $access = $this->apiControlAccess(); // Check to create or update for you current plan
            if($access == 'false') {
                return response()->json(['status' => false, 'message' => "Please update your plan"]);
            }  
        }

        if($product->catalog_id) {
            $catalog = Catalog::where('id', $product->catalog_id)->first();

            if($catalog) {
                $product->catalog_id = $catalog->name;
                $product->catalog_detail = $catalog->id;
            }
        }

        $headers = $this->getModuleHeader('Product');
        
        if( $request->is('api/*') ){
            return response()->json(['Status' =>true , 'Record' =>$product]);
        } else{
            // Check Role Permission
            $user = $request->user();
            if($user->role_permission) {
                $rolePermissions = $this->rolePermissions($user->role_permission);
                $rolePermissions = isset($rolePermissions['Products']) ? $rolePermissions['Products'] : [];
            } else {
                $rolePermissions = [ 'edit', 'delete'];
            }
            // Set Action based on permission
            $action = [
                'edit' => in_array( 'Edit', $rolePermissions) ? true : false,
                'delete' => in_array( 'Delete', $rolePermissions) ? true : false,
            ];
            return Inertia::render('Product/Detail', [
                'record' => $product,            
                'headers' => $headers,
                'translator' => Controller::getTranslations(),
                'menuBar' => $menuBar,
                'action' => $action,
            ]);
        }
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

        if($request->is('api/*')) {
            $access = $this->apiControlAccess(); // Check to create or update for you current plan
            if($access == 'false') {
                return response()->json(['status' => false, 'message' => "Please update your plan, you can't edit a record"]);
            }
        }
 
        if(!$record) {
            if($request->is('api/*')){
                return response()->json(['status' => false, 'message' => 'Record not found'],404);
            } else{
               abort('404');
            }
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
       
        if($request->is('api/*'))     // API call check
        { 
            $product = Product::find($request->id);              
            if(!$product)
            {           
             return response()->json(['status' => false, 'message' => 'Record not found'],404);   
            }            
          else
            {                
                $access = $this->apiControlAccess(); // Check to create or update for you current plan
               
                if($access == 'false') {
                    return response()->json(['status' => false, 'message' => "Please update your plan, you can't edit a record"]);
                }
                $postFields = array_keys($_POST);     
                 //mandatory cannot be null        
                if(count($postFields) == 0) {
                    return response()->json(['status' => 'failed', 'message' => 'Please pass the form data'],400);
                }              
                if(in_array('name', $postFields) && $_POST['name']==null)
                {  
                   return response()->json(['status' => 'false', 'message' => 'The name field cannot be null.'],400);                       
                }  
                if(in_array('price', $postFields) && $_POST['price']==null)
                {  
                   return response()->json(['status' => 'false', 'message' => 'The price field cannot be null.'],400);                       
                }  
                if(in_array('description', $postFields) && $_POST['description']==null)
                {  
                   return response()->json(['status' => 'false', 'message' => 'The description field cannot be null.'],400);                       
                }   
                if(in_array('availability', $postFields) && $_POST['availability']==null)
                {  
                   return response()->json(['status' => 'false', 'message' => 'The availability field cannot be null.'],400);                       
                }         
                
                  //field validation
                  $inputs = [];
                  foreach($request->input() as $value => $key)
                      {
                          $inputs[] = $value;
                      }  
                  $fields = Field::where('module_name', 'Product')
                               ->get(['field_name']);
                  if ($fields) {                   
                      foreach ($fields as $record) {                    
                          $field []= $record['field_name'];                
                      }
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
            $module = new Product(); 
            $product = $this->checkAccessPermission($request, $module, $request->id);
          
        }
        $product_id = $this->saveProduct($request);
        if($request->is('api/*')){
            if($product_id){                
                $return = ['status' =>true, 'message' => 'Record has been updated successfully','Record' => $product_id];
                $statusCode = 200;
            } 
            else{
                $statusCode = 400;
                $return = ['status' =>false, 'message' => 'Something went wrong'];
            }
            return response()->json($return, $statusCode);
        } else if($request->parent_id && $request->parent_module == 'Catalog'){
            $url = route('listCatalog', ['record_id' => $request->parent_id]);
            return Redirect::to($url);
        } else {
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
            $product = Product::find($productId);
            $access = $this->apiControlAccess(); // Check to create or update for you current plan
            if($access == 'false') {
                return response()->json(['status' => false, 'message' => "Please update your plan, you can't delete this record"]);
            }

            if(!$product) {
                return response()->json(['status' => false, 'message' => 'Record not found']);   
            }
            else
            {
                $product->lineItems()->delete();     
                $product->delete();   
                return response()->json(['record'=>$request->id,'message'=>'deleted']);
            }
        }
        else
        {
            $product = Product::find($productId);
            $product->lineItems()->delete();
            $product->delete();
           
            return Redirect::route('listProduct');
        }
    }

    /**
     * Return product Detail
     */
    public function getOpportunityData(Request $request)
    {
        $product = Product::findOrFail($request->id);
        echo json_encode(['record' => $product]);
        die;
    }
   
    public function saveProduct($request){
        if ($request->id) {
            if(!$request->is('api/*')){
            $request->validate([
                'name' => 'required',
                'price' => 'required',
                'description' => 'required',               
            ]);
        }
            $product = Product::find($request->id);
          
        } else {
            $request->validate([
                'name' => 'required',
                'price' => 'required',
                'description' => 'required',               
            ]);
            $product = new Product();
        }
        
        $fields = Field::where('module_name', 'Product')
            ->get(['field_name', 'field_type','is_custom','options']);

        if ($fields) {
            $custom_field = [];
            foreach ($fields as $record) {
                $field = $record['field_name'];
                $custom = $record['is_custom'];
                if ($request->has($field) && ($custom == '0' || !$custom) && $field != 'images') {
                     //option validation
                     if($record['field_type']=='dropdown' && $request->is('api/*'))
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
                              /* $return = ['status' => false , 'message' => 'You have entered invalid options', 'valid options are' => $option];
                                $statusCode = 400;*/
                                                   
                             }
                             
                     }
                     else
                     {
                    $product->$field = $request->$field;
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
                $product->custom = $custom_field;
            }

            if($request->parent_module == 'Catalog' && $request->parent_id) {
                $product->catalog_id = $request->parent_id;
            }
            
            $product->save();
            
            // Save the product image file
            if($request->has('images')) {
                $this->productImage($product, $request);
            }
        }

        return $product->id;
    }

    public function productImage($product, $request) {

        if($request) {
            $name = $product->name.'.jpg';

            $attachment = $request->file('images');
            $extention =  $attachment->getClientOriginalExtension();
            $attachment_name = $name.'.'.$extention;
            $path = public_path('/document/product');
            $attachment->move($path, $attachment_name);
            $mimeType = $request->file('images')->getClientMimeType();
            
            $type = explode('/', $mimeType);

            $file = file_get_contents($path.'/'.$attachment_name);
            $path = "document/product/{$attachment_name}";
            $media_id = (new Document)->saveDocument($attachment_name, $mimeType , $file, $product->id, 'Product', $path, '');

            $product->media_id = $media_id;
            $product->save();
        }
    }

    public function searchProduct(Request $request) {

        $query = Product::select('products.id', 'products.name', 'products.retailer_id', 'catalogs.catalog_id as catalog_id');
        $query->where('products.catalog_id', '!=', NULL);
        if(isset($_GET['search'])) {
            $query->where('products.name', 'like', "%{$_GET['search']}%");
        }
        $query->leftjoin('catalogs', 'catalogs.id', 'products.catalog_id');

        $search = isset($request->search) ? $request->search : '';

        if($search) {
            $query->where(function($query) use($search) {
                $query->orWhere('products.name', 'like', '%' . $search . '%');
            });
        }

        $products = $query->limit(5)->get();
        
        return response()->json(['status' => true, 'products' => $products]);
    }

    public function deleteProduct(Request $request, $id) {
        $product = Product::find($id);

        if(!$product) {
            return response()->json(['status' => false]);
        }
        $product->delete();
        $product->lineItems()->delete();

        $products = Product::where('catalog_id', $request->catalog_id)->get();

        return response()->json(['status' => true, 'products'=> $products]);
    }
}