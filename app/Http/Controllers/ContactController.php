<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;

use Auth;
use DB;
use App\Models\MessageLog;
use App\Models\IncomingUrl;
use App\Models\Msg;
use App\Models\Tag;
use App\Models\Category;
use App\Models\Filter;
use App\Models\MessageResponse;
use App\Models\Account;
use App\Models\User;
use App\Models\Template;
use App\Models\Message;
use Illuminate\Support\Facades\Log;
use DateTime;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Input;

class ContactController extends Controller
{
    public $contactColumns = ['first_name','last_name','phone_number','email'];

    public $limit = 15;

    public $default_sort_by = 'created_at';

    public $default_sort_order = 'desc';

    /**
     * Return list view field Records
     */
    public function fieldRecordList($records)
    {
        $recordList = [];
        foreach($records as $record){
            $name = $record->first_name . ' ' .$record->last_name;
            $logo = trim($name , ' ');     
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

        $user_id = $request->user()->id;

        $list_view_columns = [
            'first_name' => 'First Name',
            'last_name' => 'Last Name',
            'email' => 'Email',
            'tag' => 'Tag',
            'list' => 'List',
            'phone_number' => 'Phone Number',
            'instagram_id' => 'Instagram Id'
        ];

        $search = $request->has('search') && $request->get('search') ? $request->get('search') : '';
        $filter = $request->has('filter') && $request->get('filter') ? $request->get('filter') : '';
        $filterId = $request->has('filter_id') && $request->get('filter_id') ? $request->get('filter_id') : '';
        $sort_by = $request->has('sort_by') && $request->get('sort_by') ? $request->get('sort_by') : $this->default_sort_by;
        $sort_order = $request->has('sort_order') && $request->get('sort_order') ? $request->get('sort_order') : $this->default_sort_order;
        
        $user_id = $request->user()->id;
        $filterData = $this->getFilterData($user_id);

        
        $whereCondition = '';
        if($filter){
            $searchData = json_decode($filter);
            $whereCondition = $this->getWhereFilterCondition($searchData);
        }
        if($filterId && $filterId != 'All'){
            $filter = Filter::find($filterId);
            $searchData = unserialize( base64_decode($filter->condition) );
            $whereCondition = $this->getWhereFilterCondition($searchData);
        }

        if($search) {
            $records = Contact::orderBy($sort_by, $sort_order)
                        ->where(function ($query) use ($search, $list_view_columns, $whereCondition) {  
                            foreach($list_view_columns as $field_name => $field_info) {
                                if($field_name != 'tag' && $field_name != 'list')
                                    $query->orWhere($field_name, 'like', '%' . $search . '%');
                            }
                            if($whereCondition){
                                $query->whereRaw($whereCondition);
                            }
                        })
                        ->where('user_id',$user_id)
                        ->paginate($this->limit);
        } else {
            $records = Contact::where(function ($query) use ($whereCondition) {  
                if($whereCondition){
                    $query->whereRaw($whereCondition);
                }
            })  
            ->orderBy($sort_by, $sort_order)
            ->paginate($this->limit);
        }

        $tag_record = $this->tagRecord($user_id);
        $list_record = $this->ListRecord($user_id);
  

        return Inertia::render('Contacts/List', [
            'records' => $records->items(),
            'tag'=> $tag_record,
            'list'=> $list_record,
            'singular' => 'Contact',
            'plural' => 'Contacts',
            'module' => 'Contact',
            // Actions
            'actions' => [
                'create' => true,
                'edit' => true,
                'delete' => true,
                'export' => false,
                'import' => false,
                'search' => true,
                'filter' => true,
            ],
            'search' => $search,
            'filter' => $filterData,
            'compact_type' => 'condense',
            'list_view_columns' => $list_view_columns,
            // Sorting
            'sort_by' => $sort_by,
            'sort_order' => $sort_order,
            // Paginator
            'paginator' => [
                'firstPageUrl' => $records->url(1),
                'previousPageUrl' => $records->previousPageUrl(),
                'nextPageUrl' => $records->nextPageUrl(),
                'lastPageUrl' => $records->url($records->lastPage()),  
                'currentPage' => $records->currentPage(),
                'total' => $records->total(),
                'count' => $records->count(),
                'lastPage' => $records->lastPage(),
                'perPage' => $records->perPage(),
            ],
        ]);
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
        //
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
    public function update(Request $request, Contact $contact)
    {
        //
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
            $contacts = Contact::where('user_id', $user->id )->get() ;                   
            foreach($contacts as $contact){
            $name = $contact->first_name . ' ' .$contact->last_name;
            $logo = trim($name , ' '); 
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
     * Store filter conditions
     */
    public function saveFilterConditions($name, $module, $user, $condition)
    {
        if(isset($_GET['filter_id']) && $_GET['filter_id'] ){
            $filter = Filter::FindOrFail($_GET['filter_id']);
        } else {
            $filter = new Filter();
        }
        $filter->name = $name;
        $filter->module_name = $module;
        $filter->user_id = $user;
        $filter->condition = base64_encode( serialize( $condition ));
        $filter->save();
        return $filter->id;
    }

    /**
     * Return filter Contacts list
     */
    public function getWhereFilterCondition($searchData)
    {
        $whereCondition = '';
        $groupCount = 0;
        $isNullCondition = true;
        
        foreach($searchData as $key => $groupConditions){
            foreach($groupConditions as $groupOperator => $conditions ){
                $conditionsCount = count($conditions);
                 if(!$conditionsCount){
                    continue;
                 }
                $whereCondition .=  ($groupCount == 0) ? ' (' : " {$groupOperator} (";
                $groupCount ++;
                
                foreach($conditions as $key => $condition){
                    if($condition->field_name){
                        $isNullCondition = false;
                        if($condition->field_name == 'tag_relation'){
                            $tagContacts = [];
                            $selectedTag = $condition->condition_value;
                            $tag = implode(',', $selectedTag);
                           
                            $tagType = "AND taggable_type = 'App\Models\Contact' ";
                            $contactsId = DB::select("select taggable_id from taggables where tag_id in ({$tag})" );
                           
                            foreach($contactsId as $contactId){
                                $tagContacts[] = $contactId->taggable_id;
                            }
                            $tagContacts = implode(',', array_unique($tagContacts));
                            
                            $whereCondition .= " contacts.id in ({$tagContacts}) ";
                        } else {
                            switch($condition->record_condition){
                                case 'equal':
                                    $whereCondition .= " {$condition->field_name} = '{$condition->condition_value}' ";
                                    break;
                                case 'not_equal':
                                    $whereCondition .= " {$condition->field_name} != '{$condition->condition_value}' ";
                                    break;
                                case 'is_null':
                                    $whereCondition .= " {$condition->field_name} is null ";
                                    break;
                                case 'start_with':
                                    $whereCondition .= " {$condition->field_name} like '{$condition->condition_value}%' ";
                                    break;
                                case 'end_with':
                                    $whereCondition .= " {$condition->field_name} like '%{$condition->condition_value}' ";
                                    break;
                                case 'contains':
                                    $whereCondition .= " {$condition->field_name} like '%{$condition->condition_value}%' ";
                                    break;
                                case 'lesser_than':
                                    $whereCondition .= " {$condition->field_name} = '{$condition->condition_value}' ";
                                    break;
                            }
                        }
                        if($conditionsCount != ($key+1) ){
                            $operator = ($condition->condition_operator) ? $condition->condition_operator : 'AND';
                            if($conditions[$key+1]->field_name){
                                $whereCondition .= " {$operator} ";
                            }
                        }
                    }
                }
                $whereCondition .=  " ) ";
            }
        }
        if($isNullCondition){
            $whereCondition = '';
        }
        return $whereCondition;
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

       
        return Inertia::render('Contacts/Detail', [
            'contact' => $contact,
            'tagOptions'=> $tagOptions,
            'tagData' => $tagSelectedRecords,
            'listOptions'=> $ListOptions,
            'listData' => $ListSelectRecords,
        ]);
    }

    /**
     * Store contact data
     */
    public function storeContact(Request $request)
    {
        $user = $request->user();
        if($request->id){ 
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
        $contact->email = $request->email;
        $contact->user_id = $user->id;
        $contact->instagram_id = $request->instagram_id;
        $contact->save();
        return Redirect::route('contact_detail', $contact->id);
    }

    /**
     * Return Contact Detail
     */
    public function getContactData(Request $request)
    {
        $contact = Contact::findOrFail($request->id);
        echo json_encode(['record' => $contact]); die;
    }

    public function tagRecord($user_id)
    {
        
        $contacts = Contact::where('user_id',$user_id)->get();
        $tag_record = [];
        foreach($contacts as $key => $contact){
            $tag_value = [];
            foreach($contact->tags as $tag){
                $tag_value[] = $tag['name'];
            }
            $tag_record[] = $tag_value;
        }

        return $tag_record;
    }

    public function ListRecord($user_id)
    {
        
        $contacts = Contact::where('user_id',$user_id)->get();
        $category_record = [];
        foreach($contacts as $key => $contact){
            $tag_value = [];
            foreach($contact->categorys as $category){
                $category_value[] = $category['name'];
            }
            $category_record[] = $category_value;
        }

        return $category_record;
    }

    public function getTagOption($user_id){
        $tags = Tag::where('user_id',$user_id)->get();
        $tagOptions = [];
        if($tags){
           foreach($tags as $tag){
              $tagOptions[] = ['value' => $tag['name'] , 'label' => $tag['name'] ];
           }
        }
        return $tagOptions;
    }

    public function getSelectedTag($contact){

        $taggableRecords = $contact->tags;
        $tagSelectedRecords = [];
        if($taggableRecords){
            foreach($taggableRecords as $tag){
                $tagSelectedRecords[] = ['value' => $tag['name'] , 'label' => $tag['name']];
            }
        }
        return $tagSelectedRecords;
    }

    public function getListOption($user_id){
        $categorys = Category::where('user_id',$user_id)->get();
        $categoryOptions = [];
        if($categorys){
           foreach($categorys as $category){
              $categoryOptions[] = ['value' => $category['name'] , 'label' => $category['name'] ];
           }
        }
        return $categoryOptions;
    }

    public function getSelectedList($contact){

        $CategorableRecords = $contact->categorys;
        $ListSelectedRecords = [];
        if($CategorableRecords){
            foreach($CategorableRecords as $category){
                $ListSelectedRecords[] = ['value' => $category['name'] , 'label' => $category['name']];
            }
        }
        return $ListSelectedRecords;
    }

    /**
     * Return filter Data
     */
    public function getFilterData($user_id)
    {
        $return = [];
        $filterList = Filter::where('user_id', $user_id)
            ->where('module_name', 'Contacts')
            ->get(); 
        $return['filter_list'] = $filterList;

        $tagList = $this->getTagOptionList($user_id);
        $return['tag_list'] = $tagList;
        $return['selected_filter'] = (isset($_GET['filter_id'])) ? $_GET['filter_id'] : 'All'; 
        return $return;
    }

    /**
     * Return Tag list 
     */
    public function getTagOptionList($user_id)
    {
        $tags = Tag::where('user_id', $user_id)->get();
        foreach($tags as $tag){
            $tagList[] = [
                'value' => $tag->id,
                'label' => $tag->name
            ];
        }
        return $tagList;
    }
    /**
     * Delete Contact 
     */
    public function deleteContact(Request $request , $contactId)
    {
        $contact = Contact::find($contactId);
        $contact->delete();
        return Redirect::route('listContact');
    }
}
