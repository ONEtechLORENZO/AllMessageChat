<?php

namespace App\Http\Controllers;
use App\Models\Lead;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Cache;
use App\Models\Field;
use App\Models\Account;
use App\Models\Opportunity;
use App\Models\Contact;
use App\Models\User;
use App\Models\Product;
use DB;
use Illuminate\Support\Facades\Validator;



class LeadController extends Controller
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
        $module = new Lead();
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
                    $rolePermissions = isset($rolePermissions['Leads']) ? $rolePermissions['Leads'] : '';
                    if($rolePermissions == '') {
                        return Redirect::to(route('home'));
                    }
                } else {
                    $rolePermissions = ['create', 'view', 'edit', 'delete'];
                }
                // Set Action based on permission
                $action = [
                    'create' => in_array( 'Create', $rolePermissions) ? true : false,
                    'detail' =>  true ,
                    'edit' => in_array( 'Edit', $rolePermissions) ? true : false,
                    'delete' => in_array( 'Delete', $rolePermissions) ? true : false,
                    'search' => true, 
                    'export' => true,               
                    'select_field'=>true,
                ]; 
                $moduleData = [
                    'singular' => __('Lead'),
                    'plural' => __('Leads'),
                    'module' => 'Lead',
                    'current_page' => 'Leads', 
                    // Actions
                    'actions' => $action,
                    'menuBar' => $menuBar
                ];
            $records =  $this->listViewRecord($request, $listViewData, 'Lead');
            
            $data = array_merge($moduleData, $records);
            return Inertia::render('Leads/List', $data);
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
            $translator = Controller::getTranslations();
            //field validation
                $inputs = [];
                foreach($request->input() as $value => $key)
                    {
                        $inputs[] = $value;
                    }  
                $fields = Field::where('module_name', 'Lead')
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
        $lead_id = $this->saveLead($request);

        if($request->is('api/*')) // API call check
        {            
            if($lead_id){                
                                       
                $return = ['Message' => 'Record has been created successfully', 'Lead_id' => $lead_id];
                $statusCode = 200;
        
            } else {
                $return = ['Message' => 'Something went wrong'];
                $statusCode = 400;

            }
            return response()->json($return);
        } else {        
            if($request->parent_id){
                $url = route('detail'. $request->parent_module).'?id='.$request->parent_id.'&page=1';
                return Redirect::to($url);
            } else {
                return Redirect::route('detailLead', $lead_id);
            }        
        }
    }

     /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Lead  $Lead
     * @return \Illuminate\Http\Response
     */
    
    public function edit(Request $request, $id)
    {
        $module = new Lead();
        $Lead = $this->checkAccessPermission($request, $module, $id);

        if(!$Lead) {
            return response()->json(['status' => false, 'message' => 'Record not found'],404);   
        }

        //related field pre-fill
        if($Lead->contact_id){
            $contact = Contact::findOrFail($Lead->contact_id);
            $name = $contact->first_name .' '.$contact->last_name;
            $Lead['contact_id'] = ['value' => $contact->id, 'label' => $name];
        }

        if($Lead->assigned_to){
            $user = User::findOrFail($Lead->assigned_to);
            $Lead['assigned_to'] = ['value' => $user->id, 'label' => $user->name];
        }
        
        return response()->json(['record' => $Lead]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Lead  $lead
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $lead_id)
    {
        $module = new Lead();
        $lead = $this->checkAccessPermission($request, $module, $request->id);
        $menuBar = $this->fetchMenuBar();
       
        if(!$lead) { 
            if($request->is('api/*')){
                return response()->json(['status' => false, 'message' => 'Record not found'],404);
            }
            else {
                abort('404');
            }
        }
      
        
        $headers = $this->getModuleHeader('Lead');

        //related contact details
        $contact = Contact::where('id', $lead->contact_id)->first();

        //assign user details
        $user = User::where('id', $lead->assigned_to)->first();

        if($contact){
            $lead['contact_id'] = ['label' =>$contact['first_name'].' '.$contact['last_name'], 'value' => $contact['id'], 'module' => 'Contact'];
        }

        if($user){
            $lead['assigned_to'] = [ 'label' => $user['name'] , 'value' => $user['id'], 'module' => 'User'];
        }  
        list($productList,$lineItems) = $this->getProductList($request->id);
        $translator = Controller::getTranslations();
        if( $request->is('api/*') ){
            return response()->json(['Status' =>true , 'Record' =>$lead],200);
        }
        else{  
            // Check Role Permission
            $user = $request->user();
            if($user->role_permission){
                $rolePermissions = $this->rolePermissions($user->role_permission);
                $rolePermissions = isset($rolePermissions['Leads']) ? $rolePermissions['Leads'] : [];
               
                // Set Action based on permission
                $action = [
                    'edit' => in_array( 'Edit', $rolePermissions) ? true : false,
                    'delete' => in_array( 'Delete', $rolePermissions) ? true : false,
                ];
            } else {
                $rolePermissions = [ 'edit', 'delete'];
            }
            
            return Inertia::render('Leads/Detail', [
                'record' => $lead,            
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
     * @param  \App\Models\Lead  $lead
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        if($request->is('api/*'))
         {
            $lead = Lead::find($request->id); 
             
            if(!$lead)
            {           
             return response()->json(['status' => false, 'message' => 'Record not found'],404);   
            }            
          else
            {
                $postFields = array_keys($_POST);                
                if(count($postFields) == 0) {
                    return response()->json(['status' => 'failed', 'message' => 'Please pass the form data'],400);
                }              
                //mandatory field cannot be null while update
                if(in_array('name', $postFields))
                {        
                if($_POST['name']==null)
                    {
                    return response()->json(['status' => 'false', 'message' => 'The name field cannot be null.It is a Mandatory field'],400);
                    }
                } 
                if($request->is('api/*'))     //field validation
                { 
                    $inputs = [];
                    foreach($request->input() as $value => $key)
                        {
                            $inputs[] = $value;
                        }  
                    $fields = Field::where('module_name', 'Lead')
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

         } else {
            $currentUser = $request->user();         
            $module = new Lead();
        
            $lead = $this->checkAccessPermission($request, $module, $request->id);
            if(!$lead) {           
                    abort('404');
            }
       }
        $lead_id = $this->saveLead($request);
        if($request->is('api/*')){            
           if($lead_id){
            $return = ['status' => 'true','Message' => 'Record has been updated successfully','Record ID' => $lead_id];
                return response()->json($return);}
                else{
                    $return = ['status' => 'false','Message' => 'something went wrong'];
                    $statusCode = 400;
                    return response()->json($return,$statusCode);
                }            
        } else {
            return Redirect::route('listLead', $lead_id);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Lead  $lead
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $leadId)
    {                  
        if($request->is('api/*')){
            $lead = Lead::find($request->id);

            if(!$lead) {
                return response()->json(['status' => false, 'message' => 'Record not found'],404);   
            } else {
                $lead->delete();        
                return response()->json(['Status' => true,'Record ID'=>$request->id,'message'=>'Deleted the record successfully']);
            }
        } else {
            $lead = Lead::find($leadId);
            $lead->delete();                   
            return Redirect::route('listLead');              
        }
    }

    /**
     * Return Lead Detail
     */
    public function getLeadData(Request $request)
    {
        $lead = Lead::findOrFail($request->id);
        echo json_encode(['record' => $lead]);
        die;
    }
    
    public function saveLead($request){

        $current_user = $request->user();      
       
        if ($request->id) {
            if(!$request->is('api/*'))
            {
            $request->validate([
                'name' => 'required|max:255',                
            ]);}
            $lead = Lead::find($request->id);
            

        } else {
            $request->validate([
                'name' => 'required|max:255',                
            ]);
            $lead = new Lead();
        }        
        
        $fields = Field::where('module_name', 'Lead')
            ->get(['field_name', 'is_custom', 'field_type','options']);
            
       
        if ($fields) {
            $custom_field = [];
            foreach ($fields as $record) {
                $field = $record['field_name'];
                $custom = $record['is_custom'];
                 $type = $record['field_type'];                
               
                if($record['field_type'] == 'relate' && $custom == '0' && $request->has($field) && !($request->is('api/*'))) {

                    $related_id = $request->$field;
                    if(isset($related_id['value'])){
                        $lead->$field = $related_id['value'];
                    }else {
                        $lead->$field = NULL;
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
                        $lead->$field = $request->$field;
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
                $lead->custom = $custom_field;
            }     
            if(! $request->assigned_to){
                $lead->assigned_to = $current_user->id;
            } 
            $lead->save();
        }
        return $lead->id;
    } 

    public function getProductList($leadId){
        $lead_products = DB::table('lead_products')->where('lead_id', $leadId)->get('product_id'); 
        
        $productList = [];
        $lineItems=[];
        $productList[] = ['value' => '', 'label' => 'Select', 'id' => ''];
        foreach($lead_products as $products) {
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

    /**
     * Convert Lead to Opportunity
     */
    public function convert_lead(Request $request,Lead $lead,$leadId)
    {
        if($request->is('api/*')){ 
            $lead = Lead::find($request->id);
            if(!$lead)
            {
                return response()->json(['status' => false, 'message' => 'Record not found'],404);   
            }
        } else {
            $lead = Lead::find($leadId);
        }

        $newOpportunity = new Opportunity();
        $newOpportunity = $lead->replicate(['id']);       
        $newOpportunity->setTable('opportunities'); 
        $newOpportunity->save();
        $lead->delete(); 

        if($request->is('api/*')){ 
            $return = ['message' => 'Record has been converted to a new opportunity successfully','Opportunity_id' => $newOpportunity->id];
            return response()->json($return); 
        } else {
            return Redirect::route('listLead');
        }

    }
}