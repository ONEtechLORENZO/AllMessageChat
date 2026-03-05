<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;
use App\Models\InteractiveMessage;
use App\Models\Field;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class InteractiveMessageController extends Controller
{
        /**
     * Intrative messages list 
     */
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
     
        $module = new InteractiveMessage();
        $list_view_columns = $module->getListViewFields();
        $listViewData = $this->listView($request, $module, $list_view_columns);
        $menuBar = $this->fetchMenuBar();

        if ($request->is('api/*')) // API call check
            {     
                $access = '';// $this->apiControlAccess(); // Check to create or update for you current plan
                if($access == 'false') {
                    return response()->json(['status' => false, 'message' => "Please update your plan"]);
                }
           
                unset($listViewData['related_records_header'],$listViewData['search'],$listViewData['filter'],$listViewData['compact_type'],$listViewData['list_view_columns'],$listViewData['sort_by'],$listViewData['sort_order'],$listViewData['translator']);
                return response()->json($listViewData['records']);
            } else {     
                // Check Role Permission
                $user = $request->user();
                if($user->role_permission){
                    $rolePermissions = '';//$this->rolePermissions($user->role_permission);
                    $rolePermissions = isset($rolePermissions['InteractiveMessage']) ? $rolePermissions['InteractiveMessage'] : '';
                    if($rolePermissions == '') {
                        return Redirect::to(route('home'));
                    }
                } else {
                    $rolePermissions = ['create', 'view', 'edit', 'delete'];
                }
                // Set Action based on permission
                $action = [
                    'create' =>  true ,
                    'detail' =>  true ,
                    'edit' =>  true ,
                    'delete' => true ,
                    'search' => true, 
                    'export' => false,               
                    'select_field'=> false,
                ]; 
                $moduleData = [
                    'singular' => 'Interactive Template',
                    'plural' => 'Interactive Templates',
                    'module' => 'InteractiveMessage',
                    'current_page' => 'InteractiveMessage', 
                    // Actions
                    'actions' => $action,
                    'menuBar' => $menuBar
                ];
            $records =  $this->listViewRecord($request, $listViewData, 'InteractiveMessage');
            
            $data = array_merge($moduleData, $records);
            return Inertia::render('InteractiveMessages/List', $data);
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
        $validator = Validator::make($request->all(), [               
            'name' => 'required|max:255',
            'is_active' => 'required',
            'option_type' => 'required',
        ]);

        if($request->is('api/*'))     // API call check
        { 
            $postFields = array_keys($_POST);
            if(count($postFields) == 0) {
                return response()->json(['status' => 'failed', 'message' => 'Please pass the form data'],400);
            }

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
                $fields = Field::where('module_name', 'InteractiveMessage')
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
        $interactiveMessage_id = $this->saveInteractiveMessage($request);

        if($request->is('api/*')) // API call check
        {            
            if($interactiveMessage_id){                
                                       
                $return = ['Message' => 'Record has been created successfully', 'InteractiveMessage_id' => $interactiveMessage_id];
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
                return Redirect::route('detailInteractiveMessage', $interactiveMessage_id);
            }        
        }
    }

     /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\InteractiveMessage  $InteractiveMessage
     * @return \Illuminate\Http\Response
     */
    
    public function edit(Request $request, $id)
    {
        $module = new InteractiveMessage();
        $interactiveMessage = $this->checkAccessPermission($request, $module, $id);

        if(!$interactiveMessage) {
            return response()->json(['status' => false, 'message' => 'Record not found'],404);   
        }
        $interactiveMessage->options = ( json_decode($interactiveMessage->options) );
        
        return response()->json(['record' => $interactiveMessage]);
    }


    /**
     * Display the specified resource.
     *
     * @param  \App\Models\InteractiveMessage  $interactiveMessage
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $interactiveMessage_id)
    {
        $module = new InteractiveMessage();
        $interactiveMessage = $this->checkAccessPermission($request, $module, $request->id);
        
        $menuBar = $this->fetchMenuBar();
        $validator = Validator::make($request->all(), [               
            'name' => 'required|max:255',
            'is_active' => 'required',
            'option_type' => 'required',
        ]);

        if(!$interactiveMessage) { 
            if($request->is('api/*')){
                return response()->json(['status' => false, 'message' => 'Record not found'],404);
            } else {
                abort('404');
            }
        }
      
        $interactiveMessage->options = ( json_decode($interactiveMessage->options) );
        $headers = $this->getModuleHeader('InteractiveMessage');
        $headers['Buttons'] = [];

        $translator = Controller::getTranslations();
        if( $request->is('api/*') ){
            return response()->json(['Status' =>true , 'Record' =>$interactiveMessage],200);
        }
        else{  
            // Check Role Permission
            $user = $request->user();
            
                // Set Action based on permission
                $action = [
                    'edit' => true,
                    'delete' => true,
                ];
         
            
            return Inertia::render('InteractiveMessages/Detail', [
                'record' => $interactiveMessage,            
                'headers' => $headers,
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
     * @param  \App\Models\InteractiveMessage  $interactiveMessage
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        if($request->is('api/*'))
         {
            $interactiveMessage = InteractiveMessage::find($request->id); 
             
            if(!$interactiveMessage)
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
                    $fields = Field::where('module_name', 'InteractiveMessage')
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
            $module = new InteractiveMessage();
        
            $interactiveMessage = $this->checkAccessPermission($request, $module, $request->id);
            if(!$interactiveMessage) {           
                    abort('404');
            }
       }
        $interactiveMessage_id = $this->saveInteractiveMessage($request);
        if($request->is('api/*')){            
           if($interactiveMessage_id){
            $return = ['status' => 'true','Message' => 'Record has been updated successfully','Record ID' => $interactiveMessage_id];
                return response()->json($return);}
                else{
                    $return = ['status' => 'false','Message' => 'something went wrong'];
                    $statusCode = 400;
                    return response()->json($return,$statusCode);
                }            
        } else {
            return Redirect::route('listInteractiveMessage', $interactiveMessage_id);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\InteractiveMessage  $interactiveMessage
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $interactiveMessageId)
    {                  
        if($request->is('api/*')){
            $interactiveMessage = InteractiveMessage::find($request->id);

            if(!$interactiveMessage) {
                return response()->json(['status' => false, 'message' => 'Record not found'],404);   
            } else {
                $interactiveMessage->delete();        
                return response()->json(['Status' => true,'Record ID'=>$request->id,'message'=>'Deleted the record successfully']);
            }
        } else {
            $interactiveMessage = InteractiveMessage::find($interactiveMessageId);
            $interactiveMessage->delete();                   
            return Redirect::route('listInteractiveMessage');              
        }
    }

    /**
     * Return InteractiveMessage Detail
     */
    public function getInteractiveMessageData(Request $request)
    {
        $interactiveMessage = InteractiveMessage::findOrFail($request->id);
        echo json_encode(['record' => $interactiveMessage]);
        die;
    }
    
    public function saveInteractiveMessage($request){

        $current_user = $request->user();      
       
        if ($request->id) {
            if(!$request->is('api/*'))
            {
            $request->validate([
                'name' => 'required|max:255',                
            ]);}
            $interactiveMessage = InteractiveMessage::find($request->id);
            

        } else {
            $request->validate([
                'name' => 'required|max:255',                
            ]);
            $interactiveMessage = new InteractiveMessage();
        }        
        
        $fields = Field::where('module_name', 'InteractiveMessage')
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
                        $interactiveMessage->$field = $related_id['value'];
                    }else {
                        $interactiveMessage->$field = NULL;
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
                        $interactiveMessage->$field = $request->$field;
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
                $interactiveMessage->custom = $custom_field;
            }     
           
            
            if($request->option_type == 'list_option') {
                $buttonData['menu_data'] = $request->menu_items;
                $buttonData['list_option'] = $request->list_options;
                $interactiveMessage->content = $request->menu_items['body'];
                $interactiveMessage->options = json_encode($buttonData);
            } else {
                $interactiveMessage->options = json_encode(($request->list_options));
            }
            
            $interactiveMessage->save();
           // dd($request);
        }
        return $interactiveMessage->id;
    } 

}
