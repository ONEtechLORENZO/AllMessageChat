<?php

namespace App\Http\Controllers;
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
use App\Models\Group;



class GroupController extends Controller
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
        $module = new Group();
        $list_view_columns = $module->getListViewFields();
        $listViewData = $this->listView($request, $module, $list_view_columns);
        $menuBar = $this->fetchMenuBar();
        $users=User::where('status', '1')->get();
        $user_list=[];
        foreach ($users as $user)
            { 
               $user_list[$user->id] = $user->name;
            }              
          
          

        if ($request->is('api/*')) // API call check
            {     
                $access = $this->apiControlAccess(); // Check to create or update for you current plan
                if($access == 'false') {
                    return response()->json(['status' => false, 'message' => "Please update your plan"]);
                }
           
                unset($listViewData['related_records_header'],$listViewData['search'],$listViewData['filter'],$listViewData['compact_type'],$listViewData['list_view_columns'],$listViewData['sort_by'],$listViewData['sort_order'],$listViewData['translator']);
                return response()->json($listViewData);
            } else {      
                $moduleData = [
                    'singular' => __('Group'),
                    'plural' => __('Groups'),
                    'module' => 'Group',
                    'current_page' => 'Groups', 
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
                    'menuBar' => $menuBar,
                    'user_list' => $user_list,
                ];
            $records =  $this->listViewRecord($request, $listViewData, 'Group');
            
            $data = array_merge($moduleData, $records);
            return Inertia::render('Group/List', $data);
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
        $group_id = $this->saveGroup($request);
        
            if($request->parent_id){
                $url = route('detail'. $request->parent_module).'?id='.$request->parent_id.'&page=1';
                return Redirect::to($url);
            } else {
                return Redirect::route('detailGroup', $group_id);
            }        
        
    }

    //save group

    public function saveGroup($request){

        $current_user = $request->user();     
       
        if ($request->id) {           
            $group = Group::find($request->id);            

        } else {
            $request->validate([
                'name' => 'required|max:255',                
            ]);
            $group = new Group();
        }        
        
        $fields = Field::where('module_name', 'Group')
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
                        $group->$field = $related_id['value'];
                    }else {
                        $group->$field = NULL;
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
                        $group->$field = $request->$field;
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
                $group->custom = $custom_field;
            }                 
            $group->save();
        }
        return $group->id;
    } 

 /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Group  $group
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {       
            $currentUser = $request->user();         
            $module = new Group();
        
            $group = $this->checkAccessPermission($request, $module, $request->id);
            if(!$group) {           
                    abort('404');            
                }
       
        $group_id = $this->saveGroup($request);    
        return Redirect::route('listGroup', $group_id);        
    }


     /**
     * Display the specified resource.
     *
     * @param  \App\Models\Group  $group
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $group_id)
    {
        $module = new Group();
        $group = $this->checkAccessPermission($request, $module, $request->id);
        $menuBar = $this->fetchMenuBar();
        $users=User::where('status', '1')->get();
        $user_list=[];
        foreach ($users as $user)
            { 
               $user_list[$user->id] = $user->name;
            }              
          
          
       
        if(!$group)
        { 
            if($request->is('api/*')){
                return response()->json(['status' => false, 'message' => 'Record not found'],404);
            }
            else {
                abort('404');
            }
        }      
        
        $headers = $this->getModuleHeader('Group');
        
        $translator = Controller::getTranslations();
        if( $request->is('api/*') ){
            return response()->json(['Status' =>true , 'Record' =>$group],200);
        }
        else{  
            return Inertia::render('Group/Detail', [
                'record' => $group,            
                'headers' => $headers,               
                'translator' => Controller::getTranslations(),
                'menuBar' => $menuBar,
                'user_list' => $user_list,
            ]);
        }
    }

    //delete

    public function destroy(Request $request, $groupId)
    {    
            $group = Group::find($groupId);
            $group->delete();                   
            return Redirect::route('listGroup');  
    }



    public function edit(Request $request, $id)
    {
        $module = new Group();
        $Group= $this->checkAccessPermission($request, $module, $id);

        if(!$Group) {
            return response()->json(['status' => false, 'message' => 'Record not found'],404);   
        }        
        return response()->json(['record' => $Group]);
    }


    
}
