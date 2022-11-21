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
use App\Models\Opportunity;
use App\Models\Order;
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
                                   // unset($listViewData['related_records_header'],$listViewData['search'],$listViewData['filter'],$listViewData['compact_type'],$listViewData['list_view_columns'],$listViewData['sort_by'],$listViewData['sort_order'],$listViewData['translator']);
                                    return response()->json(['status' => true,'Contacts' => $listViewData],200);
                                 }
                                else
                                {
                                    return response()->json(['status' => false, 'message' => 'No records found'],404); 
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
                'singular' => __('Contact'),
                'plural' => __('Contacts'),
                'module' => 'Contact',
                'current_page' => 'Contacts', 
                // Actions
                'actions' => [
                    'create' => true,
                    'detail' => true,
                    'edit' => true,
                    'delete' => true,
                    'export' => true,
                    'import' => true,
                    'search' => true,
                    'filter' => true,
                    'select_field'=>true,
                    'mass_edit' => true,
                    'merge' => true
                ],
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
            if(!Account::where('id',$request->account_id)->exists())
            {
                return response()->json(['status' => false, 'message' => 'Workspace ID not valid'],404); 
            }
            $postFields = array_keys($_POST);
            if(count($postFields) == 0) {
                return response()->json(['status' => 'failed', 'message' => 'Please pass the form data'],400);
            }
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|unique:contacts|max:255',
                'last_name' => 'required|max:255',
            ]);
    
            if ($validator->fails()) {
                $messages =  $validator->messages();

                return response()->json(['status' => false, 'message' => $messages],404);  
    
            }
        }
        $contact_id = $this->saveContact($request);
       
        if($request->is('api/*'))     // API call check
        {            
            if($contact_id){
                $contact = Contact::findOrFail($contact_id);                       
                $return = ['Status' =>true,'Message' => 'Record has been created successfully', 'Contact' => $contact,200];
            
            }
            else{
                $return = ['Message' => 'Invalid Input',404];
            }
            return response()->json($return);
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
        $module = new Contact();
        if($request->is('api/*') && !(Account::where('id',$request->account_id)->exists()))
        {
            return response()->json(['status' => false, 'message' => 'Workspace ID not valid'],404); 

        }
        else{
            $contact = $this->checkAccessPermission($request, $module, $request->id);
        }
      
        if(!$contact) {
            if($request->is('api/*')){
                return response()->json(['status' => false, 'message' => 'Record not found']);
            }
            else{
            abort('404');
            }
        }
        $currentUser = $request->user();
        
        $flag = $this->checkPermission($request,$currentUser, $request->id,'Contact');
        if($flag === false) {
            abort(401);
        }

        $tagOptions = $this->getTagOption($request->user());

        $serviceOptions = $this->getServiceList();
        
        $tagSelectedRecords = $this->getSelectedTag($contact);

        $ListOptions = $this->getListOption($request->user());
        $ListSelectRecords = $this->getSelectedList($contact);

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
        
        $headers = $this->getModuleHeader($companyId , 'Contact');

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
                return response()->json([ 'status' => true,'Contact' => $contact],200);
        } else {    
            return Inertia::render('Contacts/Detail', [
                'contact' => $contact,
                'tagOptions' => $tagOptions,
                'current_userid' => $request->user()->id,
                'serviceOptions' => $serviceOptions,
                'tagData' => $tagSelectedRecords,
                'listOptions' => $ListOptions,
                'listData' => $ListSelectRecords,
                'headers' => $headers,
                'subscribedServices' => $subscribedServices,
                'translator' => [
                    'Detail' => __('Detail'),
                    'Notes' => __('Notes'),
                    'Edit'  =>__('Edit')
                ]
            ]);
        }
    }

    // Get Sub panel data
    public function show_subpanel(Request $request)
    {
        $parent_module= $request->has('module') && $request->get('module') ? $request->get('module') : '';
        $parent_mod = "App\Models\\{$parent_module}";       

        $contact = $parent_mod::findOrFail($request->id);

        if($parent_module == 'Contact'){
            $parent_name = $contact->first_name. ' '. $contact->last_name;
        } else {
             $parent_name = $contact->name;
        }
         
        $companyId = Cache::get('selected_company_'. $request->user()->id);
        $headers = $this->getModuleHeader($companyId , 'Contact');
        
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
                $query = $submod::join('company_user', 'user_id', 'users.id')
                          ->where('company_user.company_id', $request->id);                 
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
        
        $subPanelData = $this->getSubPanelRecords($request,$parent_module, $submod, $query,$parent_name);  
      
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
        $module = new Contact();
        $contact = $this->checkAccessPermission($request, $module, $request->id);

        if(!$contact) {
            return response()->json(['status' => false, 'message' => 'Record not found'],404);   
        }
        
        //checking access permission 
        $currentUser = $request->user();        
        $flag = $this->checkPermission($request,$currentUser, $request->id,'Contact');
        if($flag === false) {
            abort(401);
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
        $module = new Contact();    
        if($request->is('api/*'))
            {
                    if ($request->account_id)
                      {
                            if(!Account::where('id',$request->account_id)->exists())
                            {
                                return response()->json(['status' => false, 'message' => 'Workspace ID not valid'],404); 
                            }
                      }    
                    else     
                        {
                            return response()->json(['status' => false, 'message' => 'Enter Workspace ID'],404); 
                        }
            }
               
          $flag = $this->checkPermission($request,$currentUser, $request->id,'Contact');
          if($flag === false) {
            if($request->is('api/*')){
                return response()->json(['status' => false, 'message' => 'Record not found'],404);
            }
            else{
            abort(401);}
        }
    
        $contact = $this->checkAccessPermission($request, $module, $request->id);
        if(!$contact) {
            if($request->is('api/*')){
                return response()->json(['status' => false, 'message' => 'Record not found'],404);   
            }
            else{
            abort('404');}
        }   
        if($request->is('api/*'))     // API call check
        { 
            $postFields = array_keys($_POST);
            if(count($postFields) == 0) {
                return response()->json(['status' => 'failed', 'message' => 'Please pass the form data'],404);
            }
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|unique:contacts|max:255',                
            ]);
    
            if ($validator->fails()) {
                $messages =  $validator->messages();

                return response()->json(['status' => false, 'message' => $messages],404);  
    
            }
        }
        $contact_id = $this->saveContact($request);
       
        if($request->is('api/*')){
                $contact = Contact::findOrFail($contact_id);
                $return = ['Status' => true,'Message' => 'Record has been updated successfully','Record' => $contact];
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
                     if(!Account::where('id',$request->account_id)->exists())
                            {
                                return response()->json(['status' => false, 'message' => 'Workspace ID not valid'],404); 
                            }
                            
                 $account = Account::findorFail($request->account_id);                
                 $company_id = $account->company_id;   
                $contact = Contact::where('id',$request->id)->where('company_id', $company_id);
                $module = new Contact();
                $contact = $this->checkAccessPermission($request, $module, $request->id);

        if(!$contact) {
            return response()->json(['status' => false, 'message' => 'Record not found'],404);   
        }
                else
                {
                    $delete_record = $this->deleteRelatedRecords($request->id); // Disable the related assigned records
                    $contact->delete();        
                    return response()->json(['Status' => true,'Record ID'=>$request->id,'Message'=>'Deleted the record successsfully'],200);
                }               
            }
        else {
            $contact = Contact::find($contactId);

            if($contact) {
             $delete_record = $this->deleteRelatedRecords($contactId); // Disable the related assigned records
            }
            $contact->delete();
            return Redirect::route('listContact');
        }
        
    }

     /**
     * Check whether user has permission to access the record
     */
    public function checkPermission($request,$currentUser, $user_id, $module_name)
    {
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
                        return response()->json(['status' => false, 'message' => 'Record not found']);   
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

        if( $user->role != 'reqular'){
            $companyId = Cache::get('selected_company_'. $user->id );
            $query->where('company_id' , $companyId);
        } else if($user->role = 'regular' ){
            $query->where('user_id', $user_id);
        }
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

        if( $user->role != 'reqular'){
            $companyId = Cache::get('selected_company_'. $user->id );
            $query->where('company_id' , $companyId);
        } else if($user->role = 'regular' ){
            $query->where('user_id', $user_id);
        }
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
            $request->validate([
                'email' => 'unique:contacts|max:255',
            ]);
            $contact = Contact::findOrFail($request->id);

        } else {
            $request->validate([
                'last_name' => 'required|max:255',
                'email' => 'unique:contacts|max:255',
            ]);
            $contact = new Contact();
        }

        if($request->is('api/*'))
        {
            if ($request->account_id)
            {
              $account = Account::findorFail($request->account_id);                
              $company_id = $account->company_id;                
            }  
            
            $validator = Validator::make($request->all(), [
                'email' => 'required|unique:contacts|max:255',
            ]);
    
            if ($validator->fails()) {
                return response()->json(['status' => false, 'message' => 'Email id should be unique'],1025);  
    
            }
         
        } else{        
            $company_id = Cache::get('selected_company_'. $request->user()->id);
        }
       
        $fields = Field::where('module_name', 'Contact')
            ->where('company_id', $company_id)
            ->get(['field_name', 'is_custom', 'field_type']);
        
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
                    } else if ($type == 'emails') {
                        $emails = $request->$field;
                    }else {
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
  
            $contact->creater_id= $request->user()->id;
            
            $contact->company_id = $company_id;
               
            $contact->save();

            if($phoneNumbers){
                $sync = $this->syncPhoneNumber($contact, $phoneNumbers, $company_id);
            }

            if($emails) {
                $sync = $this->syncEmails($contact, $emails, $company_id); 
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
        $contact->services()->save($service);

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

    public function syncPhoneNumber($contact, $records, $company_id) {
        
        $deletePreviousNumbers = $contact->phones()->delete();

        foreach($records as $record) {
            $number = $record['phones'];
            $type = $record['type'];

            if($number){
                $phone = new Phone();
                $phone->phones = $number;
                $phone->type = $type;
                $phone->company_id = $company_id;
                $contact->phones()->save($phone); 
            }
        }
    }

    public function syncEmails($contact, $records, $company_id) {
        
        $deletePreviousEmails = $contact->emails()->delete();

        foreach($records as $record) {
            $Email = $record['emails'];
            $type = $record['type'];

            if($Email){
                $email = new Email();
                $email->emails = $Email;
                $email->type = $type;
                $email->company_id = $company_id;
                $contact->emails()->save($email); 
            }
        }
    }

    public function deleteRelatedRecords($contact_id) {

        $Opportunity = Opportunity::where('contact_id', $contact_id)->first(); 
        $Order = Order::where('contact', $contact_id)->first();
        
        // Assigned record are disable...
        if($Opportunity) {
            $Opportunity->contact_id = NULL;   
            $Opportunity->save();
        }
        if($Order) {
            $Order->contact = NULL;
            $Order->save();
        }
        return true;
    }


}