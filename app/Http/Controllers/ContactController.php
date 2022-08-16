<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;

use Auth;
use DB;
use Cache;
use App\Models\MessageLog;
use App\Models\IncomingUrl;
use App\Models\Msg;
use App\Models\Tag;
use App\Models\Taggable;
use App\Models\Category;
use App\Models\Filter;
use App\Models\MessageResponse;
use App\Models\Account;
use App\Models\Field;
use App\Models\User;
use App\Models\Template;
use App\Models\Message;
use Illuminate\Support\Facades\Log;
use DateTime;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Input;

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

        $list_view_columns = [
            'first_name' => ['label' => __('First Name'), 'type' => 'text'],
            'last_name' =>  ['label' => __('Last Name'), 'type' => 'text'],
            'email' =>  ['label' => __('Email'), 'type' => 'text'],
            'tag' => ['label' => __('Tag'), 'type' => 'text'],
            'list' =>  ['label' => __('List'), 'type' => 'text'],
            'phone_number' => ['label' => __('Phone number'), 'type' => 'phone_number'],
            'instagram_id' =>  ['label' => 'Instagram Id', 'type' => 'text'],
        ];

        $module = new Contact();
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
                'export' => false,
                'import' => false,
                'search' => true,
                'filter' => true,
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
        return Redirect::route('detailContact', $contact_id);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Contact  $contact
     * @return \Illuminate\Http\Response
     */
    public function show(Contact $contact)
    {
        //
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
        return Redirect::route('detailContact', $contact_id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Contact  $contact
     * @return \Illuminate\Http\Response
     */
    public function destroy(Contact $contact)
    {
       //
    }

    /**
     * List contacts
     */
    public function contactList(Request $request)
    {
        $contactList = [];
        $contacts = Contact::where('user_id', $user->id)->get();
        foreach ($contacts as $contact) {
            $name = $contact->first_name . ' ' . $contact->last_name;
            $logo = trim($name, ' ');
            $contactList[$contact->id] = [
                'logo' => $logo,
                'id' => $contact->id,
                'name' => $name,
                'last_name' => $contact->last_name,
                'email' => $contact->email,
                'number' => ($contact->phone_number != '') ? $contact->phone_number : $contact->instagram_id
            ];
        }
        return Inertia::render('Contacts/Contacts', [
            'contacts' => $contactList,
        ]);
    }

    /**
     * Show contact detail
     */
    public function contactDetail(Request $request, $contact_id)
    {
        $contact = Contact::findOrFail($request->id);
        $tagOptions = $this->getTagOptionList($request->user()->id);
        $tagSelectedRecords = $this->getSelectedTag($contact);
        $ListOptions = $this->getListOption($request->user()->id);
        $ListSelectRecords = $this->getSelectedList($contact);
        $headers = $this->getModuleHeader($request->user()->id);

        return Inertia::render('Contacts/Detail', [
            'contact' => $contact,
            'tagOptions' => $tagOptions,
            'tagData' => $tagSelectedRecords,
            'listOptions' => $ListOptions,
            'listData' => $ListSelectRecords,
            'headers' => $headers,
            'translator' => [
                'Detail' => __('Detail'),
                'Notes' => __('Notes'),
                'Edit'  =>__('Edit')
                ]

        ]);
    }

    /**
     * Store contact data
     */
    public function storeContact(Request $request)
    {
        /*
        $user = $request->user();
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
        
         $contact->first_name = $request->first_name;
        $contact->last_name = $request->last_name;
        $contact->phone_number = $request->phone_number;
        $contact->country_code = $request->country_code;
        $contact->email = $request->email;
        $contact->user_id = $user->id;
        $contact->instagram_id = $request->instagram_id;
        $contact->save();
        */
  
    }

    /**
     * Return Contact Detail
     */
    public function getContactData(Request $request)
    {
        $contact = Contact::findOrFail($request->id);
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

    /**
     * Delete Contact 
     */
    public function deleteContact(Request $request, $contactId)
    {
        $contact = Contact::find($contactId);
        $contact->delete();
        return Redirect::route('listContact');
    }

    public function getModuleHeader($user)
    {
        $fields = Field::where('module_name', 'Contact')
            ->where('user_id', $user)
            ->get(['field_label', 'field_name', 'field_type', 'is_custom']);
        $header = [];
        foreach ($fields as $field) {
            $is_custom = ($field->is_custom) ? 'custom' : 'default';
            $header[$is_custom][$field['field_name']] = ['label' => $field['field_label'], 'type' => $field['field_type']];
        }
        $header['default']['tag'] = ['label' => __('Tag'), 'type' => 'text'];
        $header['default']['list'] = ['label' => __('List'), 'type' => 'text'];
        return $header;
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
                if ($request->has($field) && ($custom == '0' || !$custom)) {
                    $contact->$field = $request->$field;
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
  
            $contact->user_id = $request->user()->id;
            $contact->company_id = Cache::get('selected_company');

            $contact->save();
        }

        return $contact->id;
    }

}