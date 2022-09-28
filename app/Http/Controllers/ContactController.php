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
use App\Models\Field;
use App\Models\Service;
use App\Models\User;

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

        if ($request->is('api/*')) // API call check
            {            
                unset($listViewData['related_records_header'],$listViewData['search'],$listViewData['filter'],$listViewData['compact_type'],$listViewData['list_view_columns'],$listViewData['sort_by'],$listViewData['sort_order'],$listViewData['translator']);
                return response()->json($listViewData);
            }
        else
            {      
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
                    'mass_edit' => true
                ],
            ];
            
            $data = array_merge($moduleData, $listViewData);
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
        $contact_id = $this->saveContact($request);
       
        if($request->is('api/*'))
        {            
            if($contact_id){
            return response()->json($contact_id);
            }
            else{
                abort(422);
            }
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
        $contact = Contact::findOrFail($request->id);

        $currentUser = $request->user();
        
        $flag = $this->checkPermission($currentUser, $request->id,'Contact');
        if($flag === false) {
            abort(401);
        }

        $tagOptions = $this->getTagOptionList($request->user()->id);

        $serviceOptions = $this->getServiceList();
        
        $tagSelectedRecords = $this->getSelectedTag($contact);

        $ListOptions = $this->getListOption($request->user()->id);
        $ListSelectRecords = $this->getSelectedList($contact);

        $companyId = Cache::get('selected_company_'. $request->user()->id);
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
                return response()->json($contact);
        } else {    
            return Inertia::render('Contacts/Detail', [
                'contact' => $contact,
                'tagOptions' => $tagOptions,
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

        if($parent_module == 'Contact')
        {
            $parent_name = $contact->first_name. ' '. $contact->last_name;
        }
        else {
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

        if($parent_module=='Contact')
        {
            if($subModule=='Opportunity')
              $query = $submod::where('contact_id', $request->id);
            if($subModule=='Order')
              $query = $submod::where('contact', $request->id);
        }
        if($parent_module=='Organization')
        {
            if($subModule=='Contact')
              $query = $submod::where('organization_id', $request->id);
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
    public function edit(Contact $contact)
    {
        //
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
        $flag = $this->checkPermission($currentUser, $request->id,'Contact');
        if($flag === false) {
            abort(401);
        }

        $contact_id = $this->saveContact($request);
       
        if($request->is('api/*')){
            
                $contact = Contact::findOrFail($contact_id);
                return response()->json($contact);           
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
        $contact = Contact::find($contactId);
        $contact->delete();
        
           if($request->is('api/*')){          
            return response()->json($contact);
            }
            else
              {
                return Redirect::route('listContact');
              }
        
    }

    /**
     * Return Contact Detail
     */
    public function getContactData(Request $request)
    {
        $contact = Contact::findOrFail($request->id);
        
        //checking access permission 
        $currentUser = $request->user();        
        $flag = $this->checkPermission($currentUser, $request->id,'Contact');
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
        if( $request->is('api/*') ){
            return response()->json($contact);
             }
        else{
            echo json_encode(['record' => $contact]);
            die;
          }
    }


     /**
     * Check whether user has permission to access the record
     */
    public function checkPermission($currentUser, $user_id, $module_name)
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

    public function getTagOption($user_id)
    {
        $tags = Tag::where('user_id', $user_id)->get();
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

    public function getListOption($user_id)
    {
        $categorys = Category::where('user_id', $user_id)->get();
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
                'last_name' => 'required|max:255',
                'email' => 'required|max:255',
            ]);
            $contact = Contact::findOrFail($request->id);
        } else {
            $request->validate([
                'last_name' => 'required|max:255',
                'email' => 'required|unique:contacts|max:255',
            ]);
            $contact = new Contact();
        }

        $company_id = Cache::get('selected_company_'. $request->user()->id);
     
        $fields = Field::where('module_name', 'Contact')
            ->where('company_id', $company_id)
            ->get(['field_name', 'is_custom']);

        if ($fields) {
            $custom_field = [];
            foreach ($fields as $record) {
                $field = $record['field_name'];
                $custom = $record['is_custom'];
                         
                if($request->has($field) && ($custom == '0' || !$custom)) {
                    if(($field == 'assigned_to' || $field == 'organization_id')) {

                        $related_id = $request->$field;
                        if(isset($related_id['value'])){
                            $contact->$field = $related_id['value'];
                        }else {
                            $contact->$field = NULL;
                        }
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
            $contact->company_id = Cache::get('selected_company_'. $request->user()->id);
            $contact->save();

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
}