<?php

namespace App\Http\Controllers;
use App\Models\Opportunity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Cache;
use App\Models\Field;
use App\Models\Account;
use App\Models\Contact;
use App\Models\User;
use App\Models\Product;
use App\Http\Controllers\ContactController;
use DB;
use Illuminate\Support\Facades\Validator;



class OpportunityController extends Controller
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
        $module = new Opportunity();
        $list_view_columns = $module->getListViewFields();
        $listViewData = $this->listView($request, $module, $list_view_columns);
        $menuBar = $this->fetchMenuBar();

        if ($request->is('api/*')) // API call check
            {     
                $access = $this->apiControlAccess(); // Check to create or update for you current plan
                if($access == 'false') {
                    return response()->json(['status' => false, 'message' => "Please update your plan"]);
                }
           
                unset($listViewData['related_records_header'],$listViewData['search'],$listViewData['filter'],$listViewData['compact_type'],$listViewData['list_view_columns'],$listViewData['sort_by'],$listViewData['sort_order'],$listViewData['translator']);
                return response()->json($listViewData);
        } else {  
                // Check Role Permission
            $user = $request->user();
            if($user->role_permission){
                $rolePermissions = $this->rolePermissions($user->role_permission);
                $rolePermissions = isset($rolePermissions['Deals']) ? $rolePermissions['Deals'] : '';
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
                'search' => true, 
                'export' => true,               
                'select_field'=>true,
            ];    
             
        $moduleData = [
            'singular' => __('Deal'),
            'plural' => __('Deals'),
            'module' => 'Opportunity',
            'current_page' => 'Deals', 
            // Actions
            'actions' => [
                'create' => true,                
                'edit' => true,
                'delete' => true,                
                'search' => true, 
                'export' => true,               
                'select_field'=>true,
                'detail' => true,

            ],
            'menuBar' => $menuBar
        ];
        $records =  $this->listViewRecord($request, $listViewData, 'Opportunity');
        
        $data = array_merge($moduleData, $records);
        return Inertia::render('Opportunity/List', $data);
        }
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
            $validator = Validator::make($request->all(), [               
                'name' => 'required|max:255',
            ]);
    
            if ($validator->fails()) {
                $messages =  $validator->messages();
                return response()->json(['status' => false, 'message' => $messages],400);     
            } 
            
            if($request->is('api/*'))     // API call check
            { 
                $inputs = [];
                foreach($request->input() as $value => $key)
                    {
                        $inputs[] = $value;
                    }  
                $fields = Field::where('module_name', 'Opportunity')
                             ->get(['field_name']);
                if ($fields) {                   
                    foreach ($fields as $record) {                    
                        $field []= $record['field_name'];                
                    }
                }
                foreach ($inputs as $record) {                    
                    if(!in_array($record, $field))
                    {
                        //http_response_code(400);
                       // die(json_encode(['status' => false, 'message' => "Please enter valid field name",'Invalid field_name' => $record]));                               
                        $return = ['status' => false , 'message' => "Please Enter valid field",'Invalid field_name' => $record];
                        $statusCode = 400;
                        return response()->json($return,$statusCode);
                    }                
                }
                
            }   
        }
        $opportunity_id = $this->saveOpportunity($request);

        if($request->is('api/*')) // API call check
        {            
            if($opportunity_id){                
                                       
                $return = ['Message' => 'Record has been created successfully', 'Opportunity_id' => $opportunity_id];
                $statusCode = 200;
        
            }
            else{
                $return = ['Message' => 'Something went wrong'];
                $statusCode = 400;

            }
            return response()->json($return);
        }
        else
        {        
            if($request->parent_id){
                $url = route('detail'. $request->parent_module).'?id='.$request->parent_id.'&page=1';
                return Redirect::to($url);
            } else {
                return Redirect::route('detailOpportunity', $opportunity_id);
            }        
        }
    }

     /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Opportunity  $Opportunity
     * @return \Illuminate\Http\Response
     */
    
    public function edit(Request $request, $id)
    {
        $module = new Opportunity();
        $Opportunity = $this->checkAccessPermission($request, $module, $id);

        if(!$Opportunity) {
            return response()->json(['status' => false, 'message' => 'Record not found'],404);   
        }

        //related field pre-fill
        if($Opportunity->contact_id){
            $contact = Contact::findOrFail($Opportunity->contact_id);
            $name = $contact->first_name .' '.$contact->last_name;
            $Opportunity['contact_id'] = ['value' => $contact->id, 'label' => $name];
        }

        if($Opportunity->assigned_to){
            $user = User::findOrFail($Opportunity->assigned_to);
            $Opportunity['assigned_to'] = ['value' => $user->id, 'label' => $user->name];
        }
        
        return response()->json(['record' => $Opportunity]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Opportunity  $opportunity
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $opportunity_id)
    {
        $module = new Opportunity();
        $opportunity = $this->checkAccessPermission($request, $module, $request->id);
        $menuBar = $this->fetchMenuBar();
       
        if(!$opportunity) { 
            if($request->is('api/*')){
                 return response()->json(['status' => false, 'message' => 'Record not found'],404);
              }
            else{
                abort('404');
              }
        }
      
        
        $headers = $this->getModuleHeader('Opportunity');

        //related contact details
        $contact = Contact::where('id', $opportunity->contact_id)->first();

        //assign user details
        $user = User::where('id', $opportunity->assigned_to)->first();

        if($contact){
            $opportunity['contact_id'] = ['label' =>$contact['first_name'].' '.$contact['last_name'], 'value' => $contact['id'], 'module' => 'Contact'];
        }

        if($user){
            $opportunity['assigned_to'] = [ 'label' => $user['name'] , 'value' => $user['id'], 'module' => 'User'];
        }  
        list($productList,$lineItems) = $this->getProductList($request->id);
        
        if( $request->is('api/*') ){
            return response()->json(['Status' =>true , 'Record' =>$opportunity],200);
        }
        else{  
            // Check Role Permission
            $user = $request->user();
            if($user->role_permission){
                $rolePermissions = $this->rolePermissions($user->role_permission);
                $rolePermissions = isset($rolePermissions['Deals']) ? $rolePermissions['Deals'] : [];
                // Set Action based on permission
                $action = [
                    'edit' => in_array( 'Edit', $rolePermissions) ? true : false,
                    'delete' => in_array( 'Delete', $rolePermissions) ? true : false,
                ];
            } else {
                $rolePermissions = [ 'edit', 'delete'];
            }

            return Inertia::render('Opportunity/Detail', [
                'record' => $opportunity,            
                'headers' => $headers,
                'productList' => $productList,
                'lineItems' => $lineItems,
                'totalPrice' => 0,
                'translator' => Controller::getTranslations(),
                'menuBar' => $menuBar,
                'action' => $action,
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Opportunity  $opportunity
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        if($request->is('api/*'))
         {
            $opportunity = Opportunity::find($request->id); 
             
            if(!$opportunity)
            {           
             return response()->json(['status' => false, 'message' => 'Record not found'],404);   
            }            
          else
            {
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
                
                    $inputs = [];
                    foreach($request->input() as $value => $key)
                        {
                            $inputs[] = $value;
                        }  
                    $fields = Field::where('module_name', 'Opportunity')
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
        $currentUser = $request->user();         
        $module = new Opportunity();
       
        $opportunity = $this->checkAccessPermission($request, $module, $request->id);
        if(!$opportunity) {           
                 abort('404');
        }

       }
        $opportunity_id = $this->saveOpportunity($request);
        if($request->is('api/*')){            
           if($opportunity_id){
            $return = ['status' => 'true','Message' => 'Record has been updated successfully','Record ID' => $opportunity_id];
                return response()->json($return);}
                else{
                    $return = ['status' => 'false','Message' => 'something went wrong'];
                    $statusCode = 400;
                    return response()->json($return,$statusCode);
                }            
        }
        else
          {
        return Redirect::route('listOpportunity', $opportunity_id);
          }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Opportunity  $opportunity
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $opportunityId)
    {                  
        if($request->is('api/*')){
            $opportunity = Opportunity::find($request->id);

            if(!$opportunity) {
                return response()->json(['status' => false, 'message' => 'Record not found'],404);   
            }           
            else
            {
                $opportunity->delete();        
                return response()->json(['Status' => true,'Record ID'=>$request->id,'message'=>'Deleted the record successfully']);
            }
         }
        else
          {
            $opportunity = Opportunity::find($opportunityId);
            $opportunity->delete();                   
            return Redirect::route('listOpportunity');              
          }
    }

    /**
     * Return Opportunity Detail
     */
    public function getOpportunityData(Request $request)
    {
        $opportunity = Opportunity::findOrFail($request->id);
        echo json_encode(['record' => $opportunity]);
        die;
    }
    
    public function saveOpportunity($request){

        $current_user = $request->user();      

        if ($request->id) {
            if(!$request->is('api/*')){
            $request->validate([
                'name' => 'required|max:255',                
            ]);}
            $opportunity = Opportunity::find($request->id);
        } else {
            $request->validate([
                'name' => 'required|max:255',                
            ]);
            $opportunity = new Opportunity();
        }
        
        $fields = Field::where('module_name', 'Opportunity')
            ->get(['field_name', 'is_custom', 'field_type' ,'options']);

        if ($fields) {
            $custom_field = [];
            foreach ($fields as $record) {
                $field = $record['field_name'];
                $custom = $record['is_custom'];
                              
                if($record['field_type'] == 'relate' && $custom == '0' && $request->has($field) && !($request->is('api/*'))) {

                    $related_id = $request->$field;
                    if(isset($related_id['value'])){
                        $opportunity->$field = $related_id['value'];
                    }else {
                        $opportunity->$field = NULL;
                    }
                }
                else {
                    if ($request->has($field) && ($custom == '0' || !$custom)) {
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
                        $opportunity->$field = $request->$field;
                          }
                    }
                }
  
                if($custom == '1') {
                    if($request->custom) {
                        foreach($request->custom as $key => $value) {
                            $custom_field[$key] = $value;
                        }
                    }
                }
            }
            if ($custom_field) {
                $opportunity->custom = $custom_field;
            }     
            if(! $request->assigned_to){
                $opportunity->assigned_to = $current_user->id;
            } 
           
            $opportunity->save();
        }
        return $opportunity->id;
    } 

    public function getProductList($opportunityId){
        $opportunity_products = DB::table('opportunity_products')->where('opportunity_id', $opportunityId)->get('product_id'); 
        
        $productList = [];
        $lineItems=[];
        $productList[] = ['value' => '', 'label' => 'Select', 'id' => ''];
        foreach($opportunity_products as $products)
        {
        $product = Product::where('id', $products->product_id)->get(['id','name','price'])->first();
        $productList[] = ['value' => $product->name, 'label' => $product->name, 'id' => $product->id];
        $lineItems[] = [
            'name' => ['value' => $product->name, 'label' => $product->name],
            'quantity' => 0,
            'price' => $product->price,
            'amount' => 0,
            'id' => $product->id
        ];
       // $totalPrice += $product->price;
        }  
        return array($productList,$lineItems);
    }
}