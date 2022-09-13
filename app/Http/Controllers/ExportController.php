<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Field;
use League\Csv\Writer;
use App\Models\MessageLog;
use App\Models\Msg;
use Cache;

class ExportController extends Controller
{
    public $entity_modules = ['Contact', 'Product', 'Opportunity', 'Order', 'Campaign','Message'];

    public function exportFile(Request $request){
        $user_id = $request->user()->id;
        $company_id = Cache::get('selected_company_'. $user_id);

        $export_mod= $request->has('exportmod') && $request->get('exportmod') ? $request->get('exportmod') : '';
        $module = "App\Models\\{$export_mod}";

        if(in_array($export_mod, $this->entity_modules)) 
        {
           $where_condition = [
            'user_id' => $user_id,
            'module_name' => $export_mod
             ];
        }
        $fields = Field::where($where_condition)->get(['field_name','field_label','is_custom']);
        
        if($fields){
            $fieldList = [];
            $csvHeader = [];
            foreach($fields as $index => $field){
                $csvHeader[] = $field['field_label'];
                $fieldList[$field['field_name']] = ['label' => $field['field_label'], 'is_custom' => $field['is_custom']];
            }
          
            if($export_mod=='Message')
            {
                $query_columns = ['msgs.service', 'message', 'msgs.status', 'msgs.created_at', 'accounts.company_name','msg_mode'];
                $export_records = Msg::select( $query_columns)->join('accounts', 'account_id', 'accounts.id')
                ->join('contacts', 'contacts.id', 'msgable_id')
                ->where('accounts.user_id', $user_id)->get();   
                $csvHeader= ['Service','Message','Status','Created_at','Company name','Message Mode'];
                $fieldList=[
                    'service' => ['label' => 'Service', 'is_custom' => 0], 
                    'message' => ['label' => 'Message', 'is_custom' => 0],
                    'status' =>  ['label' => 'Status', 'is_custom' => 0],
                    'created_at' => ['label' => 'Created_at', 'is_custom' => 0],
                    'company_name' => ['label' => 'Company Name', 'is_custom' => 0],
                    'msg_mode' => ['label' => 'Message mode', 'is_custom' => 0],
                ];                
            }
            else
            {
                $export_records = $module::where('company_id' , $company_id)->get();
            }    
          
            $this->generateCSVfile($csvHeader, $export_records, $fieldList,$export_mod);
        }
    }

    public function generateCSVfile($header, $records, $fields,$modulename){
        
       $fileName = $modulename;
       $csvRecords = [];
         foreach($records as $index => $record){
            $csvRecord = [];
              foreach($fields as $name => $field){
                if($field['is_custom']){
                    $csvRecord[] = ($record['custom'] && isset($record['custom'][$name])) ? $record['custom'][$name] : '';
                } else {
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
}
