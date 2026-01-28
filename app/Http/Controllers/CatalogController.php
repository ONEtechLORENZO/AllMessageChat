<?php

namespace App\Http\Controllers;

use App\Models\Catalog;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Field;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Cache;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use App\Models\Product;
use App\Models\Document;
use App\Models\CatalogSchedular;
use App\Models\FaceBookAppToken;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Facebook\Facebook;


class CatalogController extends Controller
{
    public $product_fb_fields = [
        'name' => ['field_label' => 'Title', 'field_name' => 'name', 'helpline' => 'Product name (ex:catalog_product)', 'is_mandatory' => true],
        'price' => ['field_label' => 'Price', 'field_name' => 'price', 'helpline' => 'Product price amount (ex: $4.00)', 'is_mandatory' => true], 
        'description' => ['field_label' => 'Description', 'field_name' => 'description', 'helpline' => 'Product detail description', 'is_mandatory' => false], 
        'url' => ['field_label' => 'Website link', 'field_name' => 'url', 'helpline' => 'Product website link to know more detail', 'is_mandatory' => false],
        'condition' => ['field_label' => 'Condition', 'field_name' => 'condition', 'helpline' => 'Product condition (ex: New, Used, Refurbished ...)', 'is_mandatory' => false],
        'availability' => ['field_label' => 'Availability', 'field_name' => 'availability', 'helpline' => 'Product is instock or not', 'is_mandatory' => false],
        'status' => ['field_label' => 'Status', 'field_name' => 'status', 'helpline' => 'Product status (ex:Active/Inactive)', 'is_mandatory' => false],
        'brand' => ['field_label' => 'Brand', 'field_name' => 'brand', 'helpline' => 'Brand name of the product (ex: Apple, Sony...)', 'is_mandatory' => false],
      ];

    public $catalog_fb_fields = [
        'name' => ['field_label' => 'Name', 'field_name' => 'name'],
        'id' => ['field_label' => 'Product ID', 'field_name' => 'id'],
        'product_count' => ['field_label' => 'Product Count', 'field_name' => 'product_count'],   
    ];

    public $api_url = 'https://graph.facebook.com/v15.0';

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $module = new Catalog();

        if ($request->is('api/*')) // API call check
        {            
            $api_list_view_columns = [
                'name' => ['label' => __('Catalog Name'), 'type' => 'text'],
                'catalog_type' =>  ['label' => __('Catalog Type'), 'type' => 'dropdown'],
                'product_count' => [ "label" => "Product Count", "type" => "text"],
                'business_id' => [ "label" => "Business ID","type" => "text"],               
            ];
            
            $listViewData = $this->listView($request, $module, $api_list_view_columns);
            
            unset($listViewData['related_records_header'],$listViewData['search'],$listViewData['filter'],$listViewData['compact_type'],$listViewData['list_view_columns'],$listViewData['sort_by'],$listViewData['sort_order'],$listViewData['translator']);
            
            $menuBar = $this->fetchMenuBar();

            return response()->json($listViewData); 
        }
        else
        {
            $list_view_columns = [
                'name' => ['label' => __('Catalog Name'), 'type' => 'text'],
                'catalog_type' =>  ['label' => __('Catalog Type'), 'type' => 'dropdown'],
                'catalog_id' => [ "label" => __('Catalog Id'), "type" => "text"],
                'business_id' => [ "label" => "Business ID","type" => "text"],          
            ];

            $fbToken = $request->has('fbToken') ? $request->get('fbToken') : '';
            $listViewData = $this->listView($request, $module, $list_view_columns);

            $menuBar = $this->fetchMenuBar();
            $catalog_id = $request->has('record_id') ? $request->get('record_id') : '';      
                
            // Check Role Permission
            $user = $request->user();
            if($user->role_permission) {
                $rolePermissions = $this->rolePermissions($user->role_permission);
                $rolePermissions = isset($rolePermissions['Catalogs']) ? $rolePermissions['Catalogs'] : '';
                if($rolePermissions == '' ) {
                    return Redirect::to(route('home'));
                }
            } else {
                $rolePermissions = ['create', 'view', 'edit', 'delete'];
            }
            // Set Action based on permission
            $action = [
                'new_catalog' => in_array( 'Create', $rolePermissions) ? true : false,
                'detail' => true,
                'delete' => in_array( 'Delete', $rolePermissions) ? true : false,
                'search' => true,
            ];

            
            $moduleData = [
                'singular' => __('Catalog'),
                'plural' => __('Catalogs'),
                'module' => 'Catalog',
                'current_page' => 'Catalog', 

                // Actions
                'actions' => $action,
                'menuBar' => $menuBar,
                'catalog_id' => $catalog_id,
                'fbToken' => $fbToken
            ];

            $records =  $this->listViewRecord($request, $listViewData, 'Catalog');
            $catalogs = $records['records'];
            $options = [];
            if(count($catalogs)) {
                foreach($catalogs as $catalog) {
                    $options[$catalog->id] = $catalog->name;
                }
            }
            $data = array_merge($moduleData, $records);
            $data['options'] = $options;

            return Inertia::render('Catalog/List', $data);
        }
    }

    public function fetchFBfields(Request $request) 
    {
        $module_name = $request->module;
        $user_id = $request->user()->id;

        $fb_fields = [];
        $fieldList = [];
        $mapping_fields = [];
        $fields = Field::where('module_name', $module_name)->get(['field_name','field_label','is_mandatory']);

        if($fields){
            foreach($fields as $index => $field){
                $fieldList[$field['field_name']] = ['field_label' => $field['field_label'], 'field_name' => $field['field_name'], 'is_mandatory' => $field['is_mandatory']];
            }
        }
        unset($fieldList['images']);

        $fb_fields = $this->product_fb_fields;

        if($request->catalog_id) {
            $schedular = CatalogSchedular::whereId($request->catalog_id)->first();
            $mapping_fields = $schedular->fb_mapping_fields;
        }

        return response()->json( [ 'fb_fields' => $fb_fields,'crm_fields' => $fieldList, 'mapping_fields' => $mapping_fields ]);        
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
        // Code ...
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Catalog  $catalog
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request,$id)
    {
        $catalog = Catalog::findOrFail($id);
       
        $menuBar = $this->fetchMenuBar();
        $headers = [
            'default' => [
                "name" => [ "label" => "Name","type" => "text","custom" => 0,"name" => "name","mandatory" => 0],
                "catalog_type" => [ "label" => "Catalog Type", "type" => "text","custom" => 0,"name" => "catalog_type","mandatory" => 0],
                "product_count" => [ "label" => "Product Count", "type" => "text","custom" => 0,"name" => "product_count","mandatory" => 0],
                "business_id" => [ "label" => "Business ID","type" => "text","custom" => 0,"name" => "business_id","mandatory" => 0],
            ]
        ];
        if($request->is('api/*')){
            if(!$catalog) {
                return response()->json(['status' => false, 'message' => 'Record not found'],404);
            } else {
                $return = ['Status' => true,'Record' => $catalog];
                return response()->json($return);      
            }
        } else{
            if(!$catalog) abort(404);
            // Check Role Permission
            $user = $request->user();
            if($user->role_permission) {
                $rolePermissions = $this->rolePermissions($user->role_permission);
                $rolePermissions = isset($rolePermissions['Catalogs']) ? $rolePermissions['Catalogs'] : [];
            
            } else {
                $rolePermissions = [ 'edit', 'delete'];
            }
            // Set Action based on permission
            $action = [
                'edit' => in_array( 'Edit', $rolePermissions) ? true : false,
                'delete' => in_array( 'Delete', $rolePermissions) ? true : false,
            ];
            $data = [
                'record' => $catalog,
                'headers' => $headers,
                'translator' => Controller::getTranslations(),
                'menuBar' => $menuBar,
                'action' => $action,
            ];

            return Inertia::render('Catalog/Detail', $data);
        }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Catalog  $catalog
     * @return \Illuminate\Http\Response
     */
    public function edit(Catalog $catalog)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Catalog  $catalog
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Catalog $catalog)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Catalog  $catalog
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        if($request->is('api/*'))
        {          
            $catalog = Catalog::find($request->id);   
           
            if(!$catalog) 
                {
                    return response()->json(['status' => false, 'message' => 'Record not found'],404);   
                }
            else
                {
                    $catalog->delete();        
                    return response()->json(['record'=>$request->id,'message'=>'deleted'],200);
                }
        }
        else
        {
            $catalog = Catalog::findOrFail($id);
            $products = Product::where('catalog_id', $id)->delete();
            $catalog->delete();            
            return Redirect::route('listCatalog');
        }
    }

    public function createCatalog(Request $request) {
    
        if($request->is('api/*'))     // API call check
        { 
            $postFields = array_keys($_POST);
            if(count($postFields) == 0) {
                return response()->json(['status' => 'failed', 'message' => 'Please pass the form data'],400);
            }
        }
        //update
        if($request->id)
        {
            $catalog = Catalog::find($request->id);

            if($request->is('api/*'))     // API call check
            {             
                if(!$catalog)
                {           
                    return response()->json(['status' => false, 'message' => 'Record not found'],404);   
                }    
                
                    if(in_array('name', $postFields) || in_array('catalog_type', $postFields))
                    {        
                    if($_POST['name']==null)
                        {
                        return response()->json(['status' => 'false', 'message' => 'The name field cannot be null.'],400);
                        }
                    if($_POST['catalog_type']==null)
                        {
                        return response()->json(['status' => 'false', 'message' => 'The catalog type field cannot be null.'],400);
                        }
                    }        
           $msg = 'Record has been updated successfully';

            }
        }
    
      else {
            $catalog = new Catalog();
            if($request->is('api/*'))     // API call check
            { 
                $postFields = array_keys($_POST);
                if(count($postFields) == 0) {
                    return response()->json(['status' => 'failed', 'message' => 'Please pass the form data'],400);
                }
                $validator = Validator::make($request->all(), [               
                    'name' => 'required|max:255',
                    'catalog_type' => 'required|max:255',
                ]);
        
                if ($validator->fails()) {
                    $messages =  $validator->messages();
                    return response()->json(['status' => false, 'message' => $messages],400);     
                }          
            }
            $msg = 'Record has been created successfully';
        }
        $catalog->name = $request->name;
        $catalog->catalog_type = $request->catalog_type;
        $catalog->save();
        if($request->is('api/*'))     // API call check
        {   
            if($catalog->id) 
            { 
            return response()->json(['status' => true , 'message' => $msg, 'Catalog' => $catalog->id],200);   
            }
        }
        else{
        return Redirect::route('listCatalog');}
    }
    
    // List to the catalog Schedular 
    public function catalogScheduleList(Request $request) {

        $catalogs = CatalogSchedular::all();
        
        return response()->json(['status' => true, 'catalogs' => $catalogs]);
    }

    // GET FB catalog product list
    public function scheduleCatalog($businessId, $fbToken, $call_back_url = '') {

        $limit = 25;
        $fbAppToken = FaceBookAppToken::whereId($fbToken)->first();

        if(!$fbAppToken && $fbAppToken->token) {
            return response()->json(['status' => false, 'message' => 'Bearer Token not founded.']);
        }

        $business_id = $businessId;
        $bearer_token = $fbAppToken->token;
        
        if($call_back_url) {
            $url = $call_back_url;
        } else {
            $url = $this->api_url ."/{$business_id}/owned_product_catalogs?fields=vertical,name,product_count,business&limit={$limit}";
        }

        $headers = ['Authorization' => 'Bearer ' .$bearer_token]; 
        $response = Http::withHeaders($headers)->get($url);
        $catalog_response = $response->json();

        $product_catalogs = isset($catalog_response['data']) ? $catalog_response['data'] : '';  //Catalogs list
        $catalog_next_page = isset($catalog_response['paging']['next']) ? $catalog_response['paging']['next'] : '';  // Next page url
        $catalog_previous_page = isset($catalog_response['paging']['previous']) ? $catalog_response['paging']['previous'] : ''; // Previous page url
        $catalog_error_response = isset($catalog_response['error']) ? $catalog_response['error'] : '';  // Catalog Error response

        if($catalog_error_response){
            $error_message = $catalog_error_response['message'];
            
            return response()->json(['status' => false, 'message' => $error_message]);
        }

        $catalogField = [
            'name' => 'name', 'catalog_id' => 'id','business_id' => 'business', 'catalog_type' => 'vertical', 'product_count' => 'product_count'
        ];

        $scheduleField = [
            'name' => 'name', 'catalog_id' => 'id','business_id' => 'business','total_product' => 'product_count', 'catalog_type' => 'vertical'
        ];

        if($product_catalogs) {
            if($product_catalogs) {
                foreach($product_catalogs as $catalog_item) {
                    $catalog_id = $catalog_item['id'];
                    $catalog_type = $catalog_item['vertical'];
    
                    if($catalog_type == 'commerce') {
                        
                        // Check for update or create new catalog
                        $catalog = Catalog::where('catalog_id', $catalog_id)->first();
                        $schedular = CatalogSchedular::where('catalog_id', $catalog_id)->first();
    
                        if(!$catalog) {
                            $catalog = new Catalog();  // Create new catalog
                        } 
                        if(!$schedular) {
                            $schedular = new CatalogSchedular();  // Create new catalog schedular
                        }
                        
                        foreach($catalogField as $field => $name){
                            $catalog->$field = $catalog_item[$name];
                        }

                        foreach($scheduleField as $field => $name){
                            $schedular->$field = $catalog_item[$name];
                        }
    
                        $schedular->status = '-';
                        $schedular->token_id = $fbToken;    

                        $catalog->save();         
                        $schedular->save();
                    } 
                }
            }
        }

        if($catalog_next_page) {
            $call_back_url = $catalog_next_page;
            $call_next_page = $this->scheduleCatalog($businessId, $fbToken, $call_back_url);   // GET next page catalog list
        }
        
        return response()->json(['status' => true, 'message' => 'Catalog are scheduled successfully']);
    }

    public function reSchedularCatalogProduct($id, $business_id = '', $call_back_url = '', $schedular_catalog_id = '') {
     
        $limit = 25;

        $settingsData = Setting::whereIn('meta_key', ['is_fb_connect'])->get();

        foreach($settingsData as $setting){
            $metaData[$setting->meta_key] = unserialize( base64_decode($setting->meta_value));
        }

        if(!isset($metaData['is_fb_connect'])) {
            return response()->json(['status' => false, 'message' => 'Bearer Token not founded.']);
        }

        $catalogSchedular = CatalogSchedular::whereId($id)->first();

        // Add Partner catalog
        //$this->addPartnerCatalog($catalogSchedular->business_id, $metaData);

        if(!$catalogSchedular) {
            return response()->json(['status' => false, 'message' => 'Your catalog schedular not founded.']);
        }

        if(!$business_id || !$schedular_catalog_id) {
            $schedular_catalog_id = $catalogSchedular->catalog_id;
            $business_owner = $catalogSchedular->business_id;
            $business_id = $business_owner['id'];
        }

        $bearer_token = $metaData['is_fb_connect'];

        if($call_back_url) {
            $url = $call_back_url;
        } else {
            $url = $this->api_url ."/{$business_id}/owned_product_catalogs?fields=vertical,name,product_count,business&limit={$limit}";
        }

        $headers = ['Authorization' => 'Bearer ' .$bearer_token]; 
        $response = Http::withHeaders($headers)->get($url);
        $catalog_response = $response->json();

        $product_catalogs = isset($catalog_response['data']) ? $catalog_response['data'] : '';  //Catalogs list
        $catalog_next_page = isset($catalog_response['paging']['next']) ? $catalog_response['paging']['next'] : '';  // Next page url
        $catalog_error_response = isset($catalog_response['error']) ? $catalog_response['error'] : '';  // Catalog Error response

        if($catalog_error_response){
            $error_message = $catalog_error_response['message'];
            
            return response()->json(['status' => false, 'message' => $error_message]);
        }

        $catalogField = [
            'name' => 'name', 'catalog_id' => 'id','business_id' => 'business', 'catalog_type' => 'vertical', 'product_count' => 'product_count'
        ];

        if($product_catalogs) {
            foreach($product_catalogs as $catalog_item) {

                $catalog_id = $catalog_item['id'];

                if($schedular_catalog_id == $catalog_id) {

                    $catalog = Catalog::where('catalog_id', $catalog_id)->first();

                    if(!$catalog) {
                        $catalog = new Catalog();  // If old catalog has been deleted create new catalog
                    }

                    foreach($catalogField as $field => $name){
                        $catalog->$field = $catalog_item[$name];
                    }

                    $catalogSchedular->status = 'New';   //Update the status of catalog schedular
                    $catalogSchedular->sync_count = 0;

                    $catalogSchedular->save();
                    $catalog->save();
                }
            }
        }

        if($catalog_next_page) {
            $call_back_url = $catalog_next_page;
            $this->reSchedularCatalogProduct($id, $business_id, $call_back_url, $schedular_catalog_id);   // GET next page catalog list
        }
        $schedularList = CatalogSchedular::all();
        
        return response()->json(['status' => true, 'message' => 'Your catalog has been re-schedule successfully', 'schedularList' => $schedularList]);
    }

    function schedularFieldMapping(Request $request, $id) {

        $schedular = CatalogSchedular::whereId($id)->first();
        
        if(!$schedular) {
            abort(404);
        }

        $mappingFields = json_decode(($request->getContent()), TRUE);
        $schedular->fb_mapping_fields = $mappingFields;
        $schedular->save();
        
        $schedularList = CatalogSchedular::all();

        return response()->json(['status' => true, 'catalogSchedular' => $schedularList]);
    }

    function catalogSchedularHandler(Request $request, $id, $action) {

        $schedular = CatalogSchedular::whereId($id)->first();

        if(!$schedular) {
            abort(404);
        }

        if($action == 'stop') {
            $schedular->status = 'Stopped';
        } else if ($action == 'cancel') {
            $schedular->status = 'Canceled';
        } else if($action == 'start') {
            $schedular->status = 'New';
            $schedular->sync_count = 0;
        } else if ($action == 'inprogress') {
            if($schedular->sync_count == '0') {
                $schedular->status = 'New';
            } else {
                $schedular->status = 'Inprogress';
            }
        }

        $schedular->save();



        if($action == 'start') { 

            // Add partner
            $settingsData = Setting::whereIn('meta_key', ['is_fb_connect'])->get();
            foreach($settingsData as $setting){
                $metaData[$setting->meta_key] = unserialize( base64_decode($setting->meta_value));
            }
           // $this->addPartnerCatalog($schedular->business_id, $metaData);
        }

        $schedularList = CatalogSchedular::all();

        return response()->json(['status' => true, 'catalogSchedular' => $schedularList]);
    }

    public function fetchCatalogProduct(Request $request, $id) {

        $module = new Product();
        $baseTable = $module->getTable();
        $pageLimit = 10;

        $list_fields = [
            'name' => ['label' => __('Product Name'), 'type' => 'text'],
            'price' =>  ['label' => __('Price'), 'type' => 'amount'], 
            'media_id' =>  ['label' => __('Media'), 'type' => 'file'], 
        ];

        $search = $request->has('search') ? $request->get('search') : '';
        $sort_by = $request->has('sort_by') ? $request->get('sort_by') : 'created_at';
        $sort_order = $request->has('sort_order') ? $request->get('sort_order') : 'desc';

        $query = $module->where('catalog_id', $id)->orderBy($sort_by , $sort_order);

        if($search) {
            $query->where(function ($query) use ($search, $list_fields) {  
                foreach($list_fields as $field_name => $field_info) {
                    $query->orWhere($field_name, 'like', '%' . $search . '%');
                }
            });
        }

        $query = $this->getListViewFields($baseTable, 'Product', $query, $list_fields);
        $query->groupBy("{$baseTable}.id");
        $records = $query->paginate($pageLimit)->withQueryString();

        $products = $records->items();
        $pagination = [
            'firstPageUrl' => $records->url(1),
            'previousPageUrl' => $records->previousPageUrl(),
            'nextPageUrl' => $records->nextPageUrl(),
            'lastPageUrl' => $records->url($records->lastPage()),  
            'currentPage' => $records->currentPage(),
            'total' => $records->total(),
            'count' => $records->count(),
            'firstItem' => $records->firstItem(),
            'lastItem' => $records->lastItem(),
            'lastPage' => $records->lastPage(),
            'perPage' => $records->perPage(),
            'pageLimit' => $pageLimit
        ];

        return response()->json(['status' => true, 'products' => $products, 'pagination' => $pagination, 'sort_order' => $sort_order]);
    }

    /**
     * Add partner whatsapp catalog
     */
    public function addPartnerCatalog($business_id, $metaData)
    {
        // $appId = config('app.fb.app_id');
        // $accessToken = $metaData['is_fb_connect'];
       

        // $url = $this->api_url."/{$business_id['id']}/managed_businesses?existing_client_business_id=712358006971116&access_token={$accessToken}";
        // "/managed_businesses?existing_client_business_id=<CLIENT_BM_ID>&access_token=<USERS_ACCESS_TOKEN>";
        // $response = Http::post($url);
        // $result = $response->json();

        // dd($result);
    }

    
    public function fetchBusinessAccount(Request $request, $token) {

        $fbToken = FaceBookAppToken::whereId($token)->first();

        if(!$fbToken) {
            return response()->json(['status' => false]);
        }

        $businessAccount = $fbToken->business_name;

        return response()->json(['status'=> true, 'businessAccount' => $businessAccount]);
    }

    public function schedularList(Request $request, $token) {

        $schedulars = CatalogSchedular::where('token_id', $token)->get();

        $catalogOptions = [];
        if(count($schedulars)) {
            foreach($schedulars as $schedular) {
                $catalogOptions[$schedular->id] = $schedular->name;
            }
        }

        return response()->json(['status' => true, 'catalogOptions' => $catalogOptions]);
    }

    public function scheduleTimeperiod(Request $request, $catalog_id) {
        
        $schedular = CatalogSchedular::whereId($catalog_id)->first();
        
        $schedular->status = 'New';
        $schedular->schedule = $request->period;
        $schedular->save();

        return response()->json(['status' => true, 'message' => 'Schedule successfully']);
    }

    public function fetchFBAppList(Request $request) {
        $fbAppName = FaceBookAppToken::all();
        $fbApplist = [];
        
        foreach($fbAppName as $account) {
            $fbApplist[$account->id] = $account->name;
        }

        return response()->json(['status' => true, 'fbApplist' => $fbApplist]);
    }
}
