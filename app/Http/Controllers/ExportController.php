<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Field;
use App\Models\Contact;
use League\Csv\Writer;
use Cache;

class ExportController extends Controller
{
    public function exportFile(Request $request){
        
        $user_id = $request->user()->id;
        $company_id = Cache::get('selected_company_'. $user_id);
        $where_conditon = [
            'user_id' => $user_id,
            'module_name' => 'Contact'
        ];
        $fields = Field::where($where_conditon)->get(['field_name','field_label','is_custom']);
   
        if($fields){
            $fieldList = [];
            $csvHeader = [];
            foreach($fields as $index => $field){
                $csvHeader[] = $field['field_label'];
                $fieldList[$field['field_name']] = ['label' => $field['field_label'], 'is_custom' => $field['is_custom']];
            }

            $contact_records = Contact::where('company_id' , $company_id)->get();
    
            $this->generateCSVfile($csvHeader, $contact_records, $fieldList);
        }
    }

    public function generateCSVfile($header, $records, $fields){

       $fileName = 'Contact';
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
