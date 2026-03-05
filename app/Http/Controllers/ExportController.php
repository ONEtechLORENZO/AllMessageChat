<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Field;
use League\Csv\Writer;
use App\Models\MessageLog;
use App\Models\Msg;
use Cache;
use App\Models\Filter;

class ExportController extends Controller
{
    public $entity_modules = ['Contact', 'Product', 'Opportunity', 'Order', 'Campaign','Message','Lead','Organization','Transaction','Msg','Group'];

    public $sort_by = 'created_at';

    public $sort_order = 'desc';

    public $dateListView = 'd-m-Y h:m:s';

    public function exportFile(Request $request){
        
        $user_id = $request->user()->id;

        $search = $request->has('search') && $request->get('search') ? $request->get('search') : '';              // GET search condition 
        $filter = $request->has('filter') && $request->get('filter') ? $request->get('filter') : '';              // GET filter search condition
        $filterId = $request->has('filter_id') && $request->get('filter_id') ? $request->get('filter_id') : '';   // GET filter ID
        $export_mod = $request->has('exportmod') && $request->get('exportmod') ? $request->get('exportmod') : '';  // GET export module 
        $related_id = $request->has('related_id') && $request->get('related_id') ? $request->get('related_id') : '';  // GET export module 

        $useModule = "App\Models\\{$export_mod}";
        $module = new $useModule();
        $moduleName = class_basename($module);
        $baseTable = $module->getTable();

        if(in_array($export_mod, $this->entity_modules))  // Check it's Entity Module
        {
           $where_condition = ['module_name' => $export_mod]; // ADD condition 
        }
        $fields = Field::where($where_condition)->get(['field_name','field_label','is_custom','field_type']);
     
        if($fields){
            $fieldList = [];
            $csvHeader = [];
            foreach($fields as $index => $field){
                $csvHeader[] = $field['field_label'];
                $fieldList[$field['field_name']] = ['label' => $field['field_label'], 'is_custom' => $field['is_custom'], 'type' => $field['field_type']];
            }
           
            if($export_mod == 'Msg') {

                $query_columns = ['created_at', 'service', 'account_id', 'msg_type', 'amount'];
                $export_records = Msg::select( $query_columns)->get();   

                $csvHeader = ['Date','Channel','Account','Type','Amount'];
                $fieldList = [
                    'created_at' => [ 'label' => 'Date' , 'is_custom' => 0, 'type' => 'text'],
                    'service' => [ 'label' => 'Channel' , 'is_custom' => 0, 'type' => 'text'],
                    'account_id' => [ 'label' => 'Account' , 'is_custom' => 0, 'type' => 'text'],
                    'msg_type' => [ 'label' => 'Type' , 'is_custom' => 0, 'type' => 'text'],
                    'amount' => [ 'label' => 'Amount' , 'is_custom' => 0, 'type' => 'text'],
                ];                
            }  else if($export_mod == 'Lead') {

                $export_records = $module::select('*')->get();               
            } else{
                $export_records = $module::get();
            }
        }

        $searchData = '';
        if($filter) {
            $searchData = json_decode($filter);
        }
        
        // If filter is selected, we should use the filter conditions
        if($filterId && $filterId != 'All') {
            $filter = Filter::where('id', $filterId)->first();
            if($filter) {
                $searchData = unserialize( base64_decode($filter->condition) );
            }
        }

        // Report Export method
        if($moduleName == 'Message') {      
            $csvHeader= ['Message','Company Name','Message mode', 'Sender', 'Destination', 'Status', 'Error', 'Date'];
            $fieldList=[
                'message' => ['label' => 'Message', 'is_custom' => 0, 'type' => 'textarea'],
                'company_name' => ['label' => 'Company Name', 'is_custom' => 0, 'type' => 'text'], 
                'msg_mode' => ['label' => 'Message mode', 'is_custom' => 0, 'type' => 'text'],
                'sender' => ['label' => 'Sender', 'is_custom' => 0, 'type' => 'text'],
                'destination' => ['label' => 'Destination', 'is_custom' => 0, 'type' => 'text'],
                'status' =>  ['label' => 'Status', 'is_custom' => 0, 'type' => 'text'],
                'error_response' =>  ['label' => 'Error', 'is_custom' => 0, 'type' => 'textarea'],
                'created_at' =>  ['label' => 'Date', 'is_custom' => 0, 'type' => 'text'],
            ]; 
            $export_records = $this->messageModuleRecord($search, $searchData);
        }

        if(($search || $searchData) && $moduleName != 'Message') {

            $query = $module->orderBy("{$baseTable}.{$this->sort_by}", $this->sort_order);
        
            if($search) {
                $list_view_columns = $module->getListViewFields(); 

                $query->where(function ($query) use ($search, $list_view_columns, $moduleName) {  
                    foreach($list_view_columns as $field_name => $field_info) {
                        if($field_name != 'tag' && $field_name != 'list') {
                            $isCustom = $this->isCustomField($field_name, $moduleName);
                            if($isCustom){
                                $query->orWhere("custom->{$field_name}", 'like', '%' . $search . '%');
                            } else {
                                $query->orWhere($field_name, 'like', '%' . $search . '%');
                            }
                        }
                    }
                });
            }

            $query = ($searchData) ? $this->prepareQuery($searchData, $query, $baseTable) : $query;
            $query->groupBy("{$baseTable}.id");
            $export_records = $query->get();
        } 

        if($moduleName == 'Product' && $related_id) {
            $export_records = $module::where('catalog_id', $related_id)->get();
        }

        $this->generateCSVfile($csvHeader, $export_records, $fieldList,$export_mod);
    }

    public function generateCSVfile($header, $records, $fields,$modulename){
       
       $fileName = $modulename;
       if($modulename == "Msg")
       {
          $fileName='Expenses';
       }
       $csvRecords = [];   
         foreach($records as $index => $record){
            $csvRecord = [];
            
              foreach($fields as $name => $field){  
                if($field['type']=='multiselect') { 

                   $csvRecord[]= (isset($record[$name])) ? implode(', ', $record[$name]) : '';
                } 
                else if($field['type'] == 'phones') {

                    $contactNumbers = $record->$name;
                    $contacts = []; 
                    if(count($contactNumbers)) {
                        foreach($contactNumbers as $contact) {
                            $contacts[] = $contact->phones;
                        }
                    }
                    $csvRecord[] = (count($contacts)) ? implode(', ', $contacts) : '';
                }
                else if($field['type'] == 'emails') {

                    $contactEmails = $record->$name;
                    $Emails = []; 
                    if(count($contactEmails)) {
                        foreach($contactEmails as $contactEmail) {
                            $Emails[] = $contactEmail->emails;
                        }
                    }
                    $csvRecord[] = (count($Emails)) ? implode(', ', $Emails) : '';
                }
                else if($field['is_custom']){
                    $csvRecord[] = ($record['custom'] && isset($record['custom'][$name])) ? $record['custom'][$name] : '';
                } 
                else {                     
                    $csvRecord[] = $record[$name]; 
                }
            } 
            $csvRecords[] = $csvRecord;
        }

        $csv = Writer::createFromString();

        //insert the header
        $csv->insertOne($header);

        //insert all the records
        $csv->insertAll($csvRecords);

        //export the csv file
        return $csv->output($fileName.'.csv');

    }

    public function messageModuleRecord($search, $searchData) {

        $list_view_columns = [
            'id' => ['label' => __('Id'), 'type' => 'text'],
            'message' => ['label' => __('Content'), 'type' => 'textarea'],
            'company_name' => ['label' => __('Account name'), 'type' => 'text'],
            'msg_mode' =>['label' => __('Mode'), 'type' => 'text'],
            'sender' =>['label' => __('Sender'), 'type' => 'text'],
            'destination' =>['label' => __('Destination'), 'type' => 'text'],
            'status' => ['label' => __('Status'), 'type' => 'text'],
            'error_response'=> ['label' => 'Error' , 'type' => 'textarea'] ,
            'created_at' => ['label' => __('Date'), 'type' => 'text'],
        ];

        $query_columns = ['msgs.id', 'msgs.service', 'msgs.status', 'error_response', 'msgs.created_at', 'message', 'accounts.company_name', 'accounts.phone_number as account_phone_number', 'accounts.company_name', 'contacts.phone_number', 'contacts.facebook_username', 'contacts.instagram_username', 'msg_mode'];
        $query = Msg::select($query_columns)
            ->join('accounts', 'account_id', 'accounts.id')
            ->join('contacts', 'contacts.id', 'msgable_id');

        if($search) {
            $query->where(function ($query) use ($search, $list_view_columns) {  
                foreach($list_view_columns as $field_name => $field_info) {

                    if($field_name == 'company_name'){
                        $query->orWhere('accounts.company_name', 'like', '%' . $search . '%');
                    } elseif($field_name  == 'sender') {
                        $query->orWhere('contacts.phone_number', 'like', '%' . $search . '%');
                        $query->orWhere('accounts.phone_number', 'like', '%' . $search . '%');
                    } elseif($field_name  == 'destination') {
                    } else {
                        $field_name = "msgs.{$field_name}";
                        $query->orWhere($field_name, 'like', '%' . $search . '%');
                    }
                }    
            });
        } 
        $query = ($searchData) ? $this->prepareQuery($searchData, $query, 'msgs') : $query;    
        $messages = $query->orderBy('msgs.id', 'desc')->get();
        $messageList = [];

        foreach($messages as $message) {
            if($message->service == 'whatsapp') {
                if($message->msg_mode == 'incoming') {
                    $sender = $message->phone_number;
                    $destination = $message->account_phone_number;
                } else {
                    $sender = $message->account_phone_number;
                    $destination = $message->phone_number;
                }
            }
            else if($message->service == 'instagram') {
                if($message->msg_mode == 'incoming') {
                    $sender = $message->instagram_username;
                    $destination = $message->company_name;
                } else {
                  
                    $sender = $message->company_name;
                    $destination = $message->instagram_username;
                }
            }
            else if($message->service == 'facebook') {
                if($message->msg_mode == 'incoming') {
                    $sender = $message->facebook_username;
                    $destination = $message->company_name;
                } else {
                    $sender = $message->company_name;
                    $destination = $message->facebook_username;
                }
            }

            $messageList[] = [
                'id' => $message->id,
                'company_name' => $message->company_name,
                'message' => $message->message,
                'error_response' => $message->error_response,
                'status' => ucfirst($message->status),
                'msg_mode' => ucfirst($message->msg_mode),
                'sender' => $sender,
                'destination' => $destination,
                'created_at' => date_format($message->created_at, $this->dateListView),
            ];
        }

        return $messageList;
    }
}
