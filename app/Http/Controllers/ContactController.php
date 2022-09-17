<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Organization;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
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
            ],
        ];
        
        $data = array_merge($moduleData, $listViewData);
        return Inertia::render('Contacts/List', $data);
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

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Contact  $contact
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request)
    {
        $contact = Contact::findOrFail($request->id);
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
        $user = User::where('id', $contact->user_id)->first();

        if($organization){
            $contact['organization_id'] = $organization['name'];
        }

        if($user){
            $contact['user_id'] = $user['name'];
        }

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

// Get Sub panel data

    public function show_subpanel(Request $request)
    {
        $parent_module= $request->has('module') && $request->get('module') ? $request->get('module') : '';
        $parent_mod = "App\Models\\{$parent_module}";       

        $contact = $parent_mod::findOrFail($request->id);
        $companyId = Cache::get('selected_company_'. $request->user()->id);
        $headers = $this->getModuleHeader($companyId , 'Contact');
        
        $subModule= $request->has('submodule') && $request->get('submodule') ? $request->get('submodule') : '';
        $submod = "App\Models\\{$subModule}";

        if($parent_module=='Tag')
        {
            $query = $submod::join('taggables', 'taggable_id', 'contacts.id')
                ->where('tag_id', $request->id);
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
        $subPanelData = $this->getSubPanelRecords($parent_module, $submod, $query);  
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
        $contact_id = $this->saveContact($request);
        
        $url = route('detailContact').'?id='.$contact_id;
        return Redirect::to($url);
       
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Contact  $contact
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $contactId)
    {
        $contact = Contact::find($contactId);
        $contact->delete();
        return Redirect::route('listContact');
    }

    /**
     * Return Contact Detail
     */
    public function getContactData(Request $request)
    {
        $contact = Contact::findOrFail($request->id);
         //related field pre-fill
         if($contact->organization_id){
            $organization = organization::findOrFail($contact->organization_id);
            $name = $organization->name;
            $contact['organization_id'] = ['value' => $organization->id, 'label' => $name];
        }

        if($contact->user_id){
            $user = User::findOrFail($contact->user_id);
            $contact['user_id'] = ['value' => $user->id, 'label' => $user->name];
        }
        echo json_encode(['record' => $contact]);
        die;
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

        $taggableRecords = $contact->tags;        
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
     
        $fields = Field::where('module_name', 'Contact')
            ->where('user_id', $request->user()->id)
            ->get(['field_name', 'is_custom']);

        if ($fields) {
            $custom_field = [];
            foreach ($fields as $record) {
                $field = $record['field_name'];
                $custom = $record['is_custom'];
                

                if($request->has($field) && ($custom == '0' || !$custom)) {
                    if(($field == 'user_id' || $field == 'organization_id')) {

                        $related_id = $request->$field;
                        if($related_id['value']){
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
  
           // $contact->user_id= $request->user()->id;
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