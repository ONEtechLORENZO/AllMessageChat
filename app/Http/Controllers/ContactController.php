<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;

use Auth;
use App\Models\MessageLog;
use App\Models\IncomingUrl;
use App\Models\Msg;
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
    public $limit = 5;
    public $contactColumns = ['first_name','last_name','phone_number','email'];

    /**
     * Display a listing of the resource.
     */
    public function list(Request $request)
    {
       
        $limit = $this->limit;
        $searchData = '';
        $selectedFilter = (isset($_GET['filter_id']) && $_GET['filter_id'] )? $_GET['filter_id']: '';
        $filters = [];
        $user = Auth::user();
        $user_id = $request->user()->id;        
        $key = $request->query('search');        
        $sortfield=$request->query('sortfield');       
        $sortdir=$request->query('sortdir');
        if(!$sortfield)
              $sortfield='first_name';
        if(!$sortdir)
              $sortdir='desc';              
        $contactList = [];
        if($key) {

            $contact_cols = ['first_name','last_name','phone_number','email'];
            $contacts = Contact::orderBy($sortfield, $sortdir)
                        ->where('user_id', $user_id)
                        ->where(function ($query) use ($key, $contact_cols) {    
                            foreach($contact_cols as $contact_col) {         
                                $query->orWhere($contact_col, 'like', '%' . $key. '%');                            
                            }
                        })
                        ->paginate($limit);        
        } elseif(isset($_GET['filter']) && $_GET['filter']){
            $searchData = json_decode($_GET['filter']);
            $whereCondition = $this->getWhereFiltetCondition($searchData);
            if(isset($_GET['filter_name']) && $_GET['filter_name']){
                $selectedFilter = $this->saveFilterConditions($_GET['filter_name'], 'Contacts', $user_id, $searchData);
            }
            $contacts = Contact::whereRaw($whereCondition)
                ->where('user_id', $user->id )
                ->orderBy($sortfield,$sortdir)
                ->paginate($limit); 
        }else {          
            $contacts = Contact::where('user_id', $user->id )->orderBy($sortfield,$sortdir)->paginate($limit);    
        }
        $contactList = $this->fieldRecordList($contacts);
        $filterList = Filter::where('user_id', $user_id)
            ->where('module_name', 'Contacts')
            ->get(); 

        if($request->get('mode') == 'ajax') {
            return response()->json(['contacts' => $contactList]);  
        }

        return Inertia::render('Contacts/Contacts', [

            'contacts' => $contactList,
            'filter' => $searchData,
            'filterList' => $filterList,
            'selectedFilter' => $selectedFilter,
            'paginator' => [
                'firstPageUrl' => $contacts->url(1),
                'previousPageUrl' => $contacts->previousPageUrl(),
                'nextPageUrl' => $contacts->nextPageUrl(),
                'lastPageUrl' => $contacts->url($contacts->lastPage()),  
                'currentPage' => $contacts->currentPage(),
                'total' => $contacts->total(),
                'count' => $contacts->count(),
                'lastPage' => $contacts->lastPage(),
                'perPage' => $contacts->perPage(),
                
            ],  
        ]);
    }

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
    public function index()
    {
        //
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
    public function getWhereFiltetCondition($searchData)
    {
        $whereCondition = '';
        $groupCount = 0;
        
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
                            case 'lesser_than':
                                $whereCondition .= " {$condition->field_name} < '{$condition->condition_value}' ";
                                break;
                            case 'lesser_than':
                                $whereCondition .= " {$condition->field_name} > '{$condition->condition_value}' ";
                                break;
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
       
        return $whereCondition;
    }

    /**
     * Show contact detail
     */
    public function contactDetail(Request $request, $contact_id)
    {
        $contact = Contact::findOrFail($request->id);
        return Inertia::render('Contacts/Detail', [
            'contact' => $contact
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
        $contact = Contact::findOrFail($request->contact_id);
        echo json_encode(['contact' => $contact]); die;
    }
}
