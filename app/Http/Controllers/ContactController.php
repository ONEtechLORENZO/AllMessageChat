<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Organization;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\Serviceable;
use Cache;
use App\Models\Tag;
use App\Models\Category;
use App\Models\Account;
use App\Models\Company;
use App\Models\Field;
use App\Models\Service;
use App\Models\User;
use App\Models\Phone;
use App\Models\Email;
use App\Models\Note;
use App\Models\Order;
use App\Models\Opportunity;
use Illuminate\Support\Facades\Validator;


class ContactController extends Controller
{
    public $contactColumns = ['first_name', 'last_name', 'phone_number', 'email'];

    public $limit = 15;

    public $default_sort_by = 'created_at';

    public $default_sort_order = 'desc';

    /**
     * Return list view field Records
     */
    public function fieldRecordList($records)
    {
        $recordList = [];
        foreach ($records as $record) {
            $name = $record->first_name . ' ' . $record->last_name;
            $logo = trim($name, ' ');
            $recordList[$record->id] = [
                'logo' => $logo,
                'id' => $record->id,
                'name' => $name,
                'last_name' => $record->last_name,
                'email' => $record->email,
                'number' => ($record->phone_number != '') ? $record->phone_number : $record->instagram_id
            ];
        }
        return $recordList;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $module = new Contact();       

        $list_view_columns = $module->getListViewFields();     
        $listViewData = $this->listView($request, $module, $list_view_columns);
        $menuBar = $this->fetchMenuBar();
        // API call check
        if ($request->is('api/*')) {            
                unset($listViewData['related_records_header'],$listViewData['customHeader'],$listViewData['search'],$listViewData['filter'],$listViewData['compact_type'],$listViewData['list_view_columns'],$listViewData['sort_by'],$listViewData['sort_order'],$listViewData['translator']);
                return response()->json(['status' => true,'Contact' => $listViewData]);
        } else { 
                
            // Check Role Permission
            $user = $request->user();
            if($user->role_permission) {
                $rolePermissions = $this->rolePermissions($user->role_permission);
                $rolePermissions = isset($rolePermissions['Contacts']) ? $rolePermissions['Contacts'] : '';
                if($rolePermissions == '') {
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
                'mass_edit' => true,
                'merge' => true
            ];

            $moduleData = [
                'singular' => __('Contact'),
                'plural' => __('Contacts'),
                'module' => 'Contact',
                'current_page' => 'Contacts', 
                // Actions
                'actions' => $action,
                'menuBar' => $menuBar
            ];

            $records =  $this->listViewRecord($request, $listViewData, 'Contact');
            
            $data = array_merge($moduleData, $records);
            return Inertia::render('Contacts/List', $data);
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
            $validator = Validator::make($request->all(), [               
                'last_name' => 'required|max:255',
                'birth_date' => 'date_format:Y-m-d|before:today|nullable'
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
                $fields = Field::where('module_name', 'Contact')
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
        
        $contact_id = $this->saveContact($request);
       
        if($request->is('api/*'))     // API call check
        {            
            if($contact_id){
                $contact = Contact::findOrFail($contact_id);   
              //  unset($contact['email']);                    
                $return = ['status' => true , 'message' => 'Record has been created successfully', 'Contact_id' => $contact_id];
                $statusCode = 200;
            } else{
                $return = ['status' => false, 'message' => 'Something went wrong'];
                $statusCode = 400;
            }
            return response()->json($return, $statusCode);
        }
        else
        {
            if($request->parent_module == 'Chat') {
                return Redirect::route('chat_list');
            } else if($request->parent_id){
                $url = route('detail'. $request->parent_module).'?id='.$request->parent_id.'&page=1';
                return Redirect::to($url);
            } else {
                $url = route('detailContact').'?id='.$contact_id;
                return Redirect::to($url);
            }
            
        }
    }


    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Contact  $contact
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request)
    {
        $contact = Contact::find($request->id);
        $menuBar = $this->fetchMenuBar();

        if(!$contact) {
            if($request->is('api/*')){
                return response()->json(['status' => false, 'message' => 'Record not found'],404);
            }
            else{
            abort('404');
            }
        }
        $currentUser = $request->user();

        $tagOptions = $this->getTagOption($request->user());

        $serviceOptions = $this->getServiceList();
        
        $tagSelectedRecords = $this->getSelectedTag($contact);

        $ListOptions = $this->getListOption($request->user());
        $ListSelectRecords = $this->getSelectedList($contact);
        $headers = $this->getModuleHeader( 'Contact');

        $subscribedServices = [];
        foreach($contact->services as $subscribed_service) {
            $subscribedServices[] = $subscribed_service['unique_name'];
        }
        //related organization details
        $organization = Organization::where('id', $contact->organization_id)->first();

        //assign user details
        $user = User::where('id', $contact->assigned_to)->first();

        if($organization){
            $contact['organization_id'] = [ 'label' => $organization['name'], 'value' => $organization['id'], 'module' => 'Organization'];
        }

        if($user){
            $contact['assigned_to'] = [ 'label' => $user['name'] , 'value' => $user['id'], 'module' => 'User'];
        }
        
        if ($request->is('api/*')) { // API call check   
            unset($contact['email']);          
                return response()->json(['status'=> true,'Record' => $contact]);
        } else {    

            // Check Role Permission
            $user = $request->user();
            if($user->role_permission) {
                $rolePermissions = $this->rolePermissions($user->role_permission);
                $rolePermissions = isset($rolePermissions['Contacts']) ? $rolePermissions['Contacts'] : [];
               
            } else {
                $rolePermissions = [ 'edit', 'delete'];
            }
            // Set Action based on permission
            $action = [
                'edit' => in_array( 'Edit', $rolePermissions) ? true : false,
                'delete' => in_array( 'Delete', $rolePermissions) ? true : false,
            ];

            return Inertia::render('Contacts/Detail', [
                'contact' => $contact,
                'tagOptions' => $tagOptions,
                'current_userid' => $request->user()->id,
                'serviceOptions' => $serviceOptions,
                'tagData' => $tagSelectedRecords,
                'listOptions' => $ListOptions,
                'listData' => $ListSelectRecords,
                'headers' => $headers,
                'translator' => Controller::getTranslations(),
                'subscribedServices' => $subscribedServices,
                'menuBar' => $menuBar,
                'action' => $action,
            ]);
        }
    }

    // Get Sub panel data
    public function show_subpanel(Request $request)
    {
        $parent_module= $request->has('module') && $request->get('module') ? $request->get('module') : '';
        $parent_mod = "App\Models\\{$parent_module}";       
     
        $bean = $parent_mod::findOrFail($request->id);
        if($parent_module == 'Contact'){
            $parent_name = $bean->first_name. ' '. $bean->last_name;
        } else {
             $parent_name = $bean->name;
        }
        
        $subModule= $request->has('submodule') && $request->get('submodule') ? $request->get('submodule') : '';
        if($subModule == 'Detail'){
            // TODO return data
        //    return true;
        }

        $submod = "App\Models\\{$subModule}";

        if($parent_module=='Tag')
        {
            $query = $submod::join('taggables', 'taggable_id', 'contacts.id')
                ->where('tag_id', $request->id);
        }
        if($parent_module=='Category')
        {
            $query = $submod::join('categorables', 'categorable_id', 'contacts.id')
                ->where('category_id', $request->id);
        }
        if($parent_module=='Company')
         {            
            if($subModule=='User')
            {         
                $query = $submod::where([]);                 
            } else if($subModule == 'Api'){
                $query = $submod::where([]);
            }
        }
        if($parent_module=='Opportunity')
         {            
            if($subModule=='Product')
            {         
                $query = $submod::join('opportunity_products', 'product_id', 'products.id')
                          ->where('opportunity_products.opportunity_id', $request->id);                 
            }
        }
        if($parent_module=='Contact')
        {
            if($subModule=='Opportunity')
              $query = $submod::where('contact_id', $request->id);
            if($subModule=='Order')
              $query = $submod::where('contact', $request->id);
            if($subModule=='Document')
              $query = $submod::where('parent_id', $request->id);
        }
        if($parent_module=='Organization')
        {
            if($subModule=='Contact')
              $query = $submod::where('organization_id', $request->id);
        }
        if($parent_module == 'Catalog') {
            if($subModule == 'Product') $query = $submod::where('catalog_id', $request->id);
        }
        if($parent_module == 'Product') {
            if($subModule == 'Document') $query = $submod::where('parent_id', $request->id);
        }
    
        $subPanelData = $this->getSubPanelRecords($parent_module, $submod, $query,$parent_name);  
      
        echo json_encode($subPanelData);
       die;
      }


    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Contact  $contact
     * @return \Illuminate\Http\Response
     */ 
    public function edit(Request $request)
    {
        $contact = Contact::find($request->id);

        if(!$contact) {
            return response()->json(['status' => false, 'message' => 'Record not found'],404);   
        }

         //related field pre-fill
         if($contact->organization_id){
            $organization = organization::findOrFail($contact->organization_id);
            $name = $organization->name;
            $contact['organization_id'] = ['value' => $organization->id, 'label' => $name];
        }
        

        if($contact->assigned_to){
            $user = User::findOrFail($contact->assigned_to);
            $name = $user->name;
            
            $contact['assigned_to'] = ['value' => $user->id, 'label' => $name];
        }
        
            return response()->json(['status' => true, 'record' => $contact],200);
        
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Contact  $contact
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {        

        $currentUser = $request->user();    
        $contact = Contact::find($request->id);    
       
        if($request->is('api/*'))
             {
               
              if(!$contact)
               {           
                return response()->json(['status' => false, 'message' => 'Record not found'],404);   
               }            
             else
           {
                $postFields = array_keys($_POST);                
                if(count($postFields) == 0) {
                    return response()->json(['status' => 'failed', 'message' => 'Please pass the form data'],400);
                }   
                $validator = Validator::make($request->all(), [ 
                    'birth_date' => 'date_format:Y-m-d|before:today|nullable',
                ]);
        
                if ($validator->fails()) {
                    $messages =  $validator->messages();
                    return response()->json(['status' => false, 'message' => $messages],400);     
                }   
                //mandatory field cannot be null while update                  
                if(in_array('last_name', $postFields))
                {        
                  if($_POST['last_name']==null)
                    {
                    return response()->json(['status' => 'false', 'message' => 'The last name field cannot be null.'],400);
                    }
                }
                //field validation
                $inputs = [];
                foreach($request->input() as $value => $key)
                    {
                        $inputs[] = $value;
                    }  
                $fields = Field::where('module_name', 'Contact')
                             ->get(['field_name']);
                if ($fields) {                   
                    foreach ($fields as $record) {                    
                        $field []= $record['field_name'];                
                    }
                    array_push($field,'tags');
                    array_push($field,'lists');                  
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
        $contact_id = $this->saveContact($request);
        
        if($request->is('api/*')){            
            $contact = Contact::findOrFail($contact_id); 
            $return = ['Status' => true,'Message' => 'Record has been updated successfully','Contact_id' => $contact_id];
            return response()->json($return);      
         } 
         else
          {
            $url = route('detailContact').'?id='.$contact_id;
            return Redirect::to($url);               
        }          
    
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Contact  
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $contactId)
    {               
           if($request->is('api/*')){
                          
                $contact = Contact::find($request->id);
           
                if(!$contact) {
                    return response()->json(['status' => false, 'message' => 'Record not found'],404);   
                }
                else
                {
                    $contact->delete();        
                    return response()->json(['status' => true,'Record ID'=>$request->id,'message'=>'Record has been deleted successfully'],200);
                }
            }
            else
              {
                $contact = Contact::find($contactId);
                $contact->delete();
                return Redirect::route('listContact');
              }        
    }

     /**
     * Check whether user has permission to access the record
     */
    public function checkPermission($request,$currentUser, $user_id, $module_name)
    {
        return true;
        if(!$user_id) {
            return false;
        }

        // If user is trying to access his own record, allow
        if($currentUser->id == $user_id) {
            return true;
        }
        if($module_name== 'Contact')
        {
        $contact = Contact::where('id',$user_id)->first();
         if($request->is('api/*'))
            {
                if($contact == NULL)
                    {
                        return response()->json(['status' => false, 'message' => 'Record not found'],404);   
                    }
                }

        $companies []= $contact->company_id;              
        }
        $flag = false;
        if($currentUser->role == 'global_admin') {
            $flag = true;
        }
        else {
            $selectedCompany = Cache::has('selected_company_' . $currentUser->id) ? Cache::get('selected_company_' . $currentUser->id) : '';
             
            foreach($companies as $company) {
                if($company == $selectedCompany) {
                    $flag = true;
                    break;
                }
            }
        }
    
        return $flag;
    }

    public function getTagOption($user)
    {
     
        $query = Tag::select('name');
        $tags = $query->get();

        $tagOptions = [];
        if ($tags) {
            foreach ($tags as $tag) {
                $tagOptions[] = ['value' => $tag['name'], 'label' => $tag['name']];
            }
        }
        return $tagOptions;
    }

    public function getSelectedTag($contact)
    {
        $taggableRecords = $contact->tags()->get(); //$contact->tags;
       
        $tagSelectedRecords = [];
        if ($taggableRecords) {
            foreach ($taggableRecords as $tag) {
                $tagSelectedRecords[] = ['value' => $tag['name'], 'label' => $tag['name']];
            }
        }
        return $tagSelectedRecords;
    }

    public function getListOption($user)
    {
        $query = Category::select('name');
        
       $categorys = $query->get();

        $categoryOptions = [];
        if ($categorys) {
            foreach ($categorys as $category) {
                $categoryOptions[] = ['value' => $category['name'], 'label' => $category['name']];
            }
        }
        return $categoryOptions;
    }

    public function getSelectedList($contact)
    {

        $CategorableRecords = $contact->categorys;
        $ListSelectedRecords = [];
        if ($CategorableRecords) {
            foreach ($CategorableRecords as $category) {
                $ListSelectedRecords[] = ['value' => $category['name'], 'label' => $category['name']];
            }
        }
        return $ListSelectedRecords;
    }
   
    public function saveContact($request){        
           
        if ($request->id) {
            $contact = Contact::find($request->id);                
            if($request->is('api/*'))     // API call check
            { 
                //create tags
                $tag = [];
                $postFields = array_keys($_POST);
                if(in_array('tags', $postFields))
                    {        
                        if($_POST['tags'])
                        {
                            $tag=$request->tags;                      
                        }                 
                       $tags=explode(',',$tag);
                        
                       foreach($tags as $record) 
                            { 
                                $tag= new Tag();
                                $tag->name = $record;   
                                $tag->user_id = $request->user()->id;
                                $contact->tags()->save($tag);             
                            }   
                    }        

                $list = [];
                $postFields = array_keys($_POST);
                if(in_array('lists', $postFields))
                    {        
                        if($_POST['lists'])
                        {
                            $list=$request->lists;                      
                        }                 
                       $lists=explode(',',$list);
                        
                       foreach($lists as $record) 
                            { 
                                $category= new Category();
                                $category->name = $record;   
                                $category->user_id = $request->user()->id;
                                $contact->categorys()->save($category);             
                            }   
                    }        
                }
         
        } else {
            $contact = new Contact();
        }

        $fields = Field::where('module_name', 'Contact')
            ->get(['field_name', 'is_custom', 'field_type','options']);
        
        $phoneNumbers = [];
        $emails = [];    
       
            
        if ($fields) {
            $custom_field = [];
            foreach ($fields as $record) {
                
                $field = $record['field_name'];
                $custom = $record['is_custom'];
                $type = $record['field_type']; 
                       
                if($request->has($field) && ($custom == '0' || !$custom)) {
                    
                    if(($field == 'assigned_to' || $field == 'organization_id') && !($request->is('api/*'))) {

                        $related_id = $request->$field;
                        if(isset($related_id['value'])){
                            $contact->$field = $related_id['value'];
                        }else {
                            $contact->$field = NULL;
                        }
                    }else if ($type == 'phones') {
                       
                            $phoneNumbers = $request->$field;
                        }
                     else if ($type == 'emails') {
                        $emails = $request->$field;
                    }
                    else if($type=='dropdown' && $request->is('api/*'))
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
                    else {
                        $contact->$field = $request->$field;
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
                $contact->custom = $custom_field;
            }
            if($contact->whatsapp_number) {
                $contact->phone_number = $contact->whatsapp_number;
            }
            $contact->creater_id= $request->user()->id;     

            $contact->save();
            
            if($phoneNumbers){
                $sync = $this->syncPhoneNumber($request,$contact, $phoneNumbers);
            }

            if($emails) {
                $sync = $this->syncEmails($request,$contact, $emails); 
            }
            
            if($request->parent_id){
                // $parent = array($request->parent_id);
                // if($request->parent_module == 'Category'){
                //     $contact->categorys()->sync($parent);
                //     $url = '/list?id='.$request->parent_id;
                // } else if($request->parent_module == 'Tag'){
                //     $contact->tags()->sync($parent);
                //     $url = '/tag?id='.$request->parent_id;
                // }
            }
        }

        return $contact->id;
    }

    /**
     * Add Subscription
     */
    public function saveSubscription(Request $request)
    { 
        $contact_id = $request->get('id');
        $service_id = $request->get('service_id');     

        $contact = Contact::find($contact_id);
        $service = Service::find($service_id);  
        $contact->services()->save($service );

        return Redirect::to(url()->previous());
    }

    /**
     * Remove Subscription
     */
    public function removeSubscription(Request $request)
    { 
        $contact_id = $request->get('id');
        $service_id = $request->get('service_id');     
        Serviceable::where('serviceable_id', $contact_id)->where('service_id', $service_id)->delete(); 
        return Redirect::to(url()->previous());
    }

    public function syncPhoneNumber($request,$contact, $records) {        
       
        if($request->is('api/*'))     // API call check
        { 
            $flag = false;
            $phone_numbers=explode(",", $records);           
            foreach($phone_numbers as $record) { 
                // If the contact has no WhatsApp Number, Phone Number has taken as whatsapp Number
                if(!$contact->whatsapp_number && !$flag) {
                    $flag = true;
                    $contact->whatsapp_number = $record;
                    $contact->saveQuietly();
                }

                $phone = new Phone();
                $phone->phones = $record;
                $contact->phones()->save($phone);                 
            }           
        }
        else {
            $deletePreviousNumbers = $contact->phones()->delete();
            
            foreach($records as $record) {           
                $number = isset($record['phones']) ? $record['phones'] : '';
                $type = $record['type'];
                if($number){
                    $phone = new Phone();
                    $phone->phones = $number;
                    $phone->type = $type;
                    $contact->phones()->save($phone); 
                }
            }
       }
    }

    public function syncEmails($request,$contact, $records) {
        
        if($request->is('api/*'))     // API call check
        {             
            $emails=explode(",", $records);   
                     
            foreach($emails as $record) { 
                $email = new Email();
                $email->emails = $record;               
                $contact->emails()->save($email);             
            }                     
        }
        else
        {
            $deletePreviousEmails = $contact->emails()->delete();

            foreach($records as $record) {
                $Email = isset($record['emails']) ? $record['emails'] : '';
                $type = $record['type'];
                if($Email){
                    $email = new Email();
                    $email->emails = $Email;
                    $email->type = $type;
                    $contact->emails()->save($email); 
                }
            }
        }
    }

    public function getLatestContact() {
        
        $latestContact = Contact::latest()->first();

        return response()->json(['status' => true, 'contact' => $latestContact]);
    }

    public function groupDeleteRecord(Request $request) {
        
        $checkedId = $request->checkId;
        if($checkedId) {
            foreach($checkedId as $id) {
                $contact = Contact::findOrFail($id);

                if(!$contact) {
                    return response()->json(['status' => false, 'message' => 'Your record has been not founded.']);
                }
                
                // Change contact related Order 
                $orders = Order::where('contact', $id)->get();
                if(count($orders)) {
                    foreach($orders as $order) {
                        $order->contact = NULL;
                        $order->save();
                    }
                }
                // Change contact related Opportunity
                $opportunities = Opportunity::where('contact_id', $id)->get();
                if(count($opportunities)) {
                    foreach($opportunities as $opportunity) {
                        $opportunity->contact_id = NULL;
                        $opportunity->save();
                    }
                }

                $notes = Note::where('notable_id', $id)->delete();               // Delete contact Notes
                $emails = Email::where('emailable_id', $id)->delete();           // Delete contact Email Address
                $phones = Phone::where('phoneable_id', $id)->delete();           // Delete contact Phone Numbers
                $contact->delete();
            }
        }

        return Redirect::to(url()->previous());
    }
}