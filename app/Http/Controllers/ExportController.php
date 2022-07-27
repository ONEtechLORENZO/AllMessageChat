<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Field;
use App\Models\Contact;
use League\Csv\Writer;

class ExportController extends Controller
{
    public function exportFile(Request $request){
        
        $user_id = $request->user()->id;
        $where_conditon = [
            'user_id' => $user_id,
            'module_name' => 'Contact'
        ];
        $fields = Field::where($where_conditon)->get(['field_name','field_label']);
        
        if($fields){
            $field_name = [];
            $csvHeader = [];
            foreach($fields as $index => $field){
                $field_name[] = $field['field_name'];
                $csvHeader[] = $field['field_label']; 
            }
    
            $contact_records = Contact::all($field_name);
    
            $this->generateCSVfile($csvHeader, $contact_records, $field_name);
        }
    }

    public function generateCSVfile($header, $record, $fields){

       $fileName = 'Contact';
       $records = [];
         foreach($record as $index => $contact){
            $csvRecord = [];
              foreach($fields as $name){
                 $csvRecord[] = $contact[$name]; 
                }
            $records[] = $csvRecord;
        }
        $csv = Writer::createFromString();

        //insert the header
        $csv->insertOne($header);

        //insert all the records
        $csv->insertAll($records);

        //export the csv file
        return $csv->output($fileName.'.csv');

    }
}
