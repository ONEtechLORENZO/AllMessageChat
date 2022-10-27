<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Import;
use App\Models\Contact;
use App\Models\Field;
use App\Models\Notification;
use League\Csv\Reader;
use League\Csv\Statement;
use Illuminate\Support\Facades\Log;

class HandleImport extends Command
{
    public $limit = 1000;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'command:HandleImport';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'handle import files';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {   
        // Look for import with in_progress status
        $status = 'Inprogress';
        $import = Import::where('status',$status)->first(); 
        if(!$import){
            // Look for new imports
            $status = 'new';
            $import = Import::where('status',$status)->first();   
        }
        if($import){
            $record_id = $import->id;
            $offset = $import->offset;
            $file_path = $import->file_path;
            $total_record = $import->total_records;
            $user_id = $import->user_id;
            $company_id = $import->company_id;
            $current_date = date('Y-m-d H:i:s');
            $mapping_value = unserialize(base64_decode($import->mapping));
            $ImportName = $import->name;
            $module_name = $import->module_name;

            $stream = fopen($file_path, 'r');
            $csv = Reader::createFromStream($stream);
            $csv->setDelimiter(',');
            $csv->setHeaderOffset(0);
            
            //Build a statement
            $stmt = Statement::create()
            ->offset($offset)
            ->limit($this->limit);
           
            //Query your records from the document
            $csvRecords = $stmt->process($csv);

            $fields = Field::where('module_name', $module_name)
                     ->where('company_id', $company_id)
                     ->get(['field_name', 'is_custom']);

            $customFields = []; 
            foreach($fields as $field){
                if($field->is_custom == 1) {
                    $customFields[] = $field->field_name;
                }
            }

            $records = [];
            $count = 0;
            foreach ($csvRecords as $index =>  $csvRecord) {
                $count++;
                $records[$index] = ['created_at' => $current_date, 'updated_at' => $current_date, 'company_id' => $company_id ];

                // Add user_id in Contact module
                if($module_name == 'Contact') {  
                    $records[$index]['user_id'] = $user_id;
                }
            
                $customRecord = [];
                foreach($mapping_value as $name => $label){
                    if($label){
                        if(in_array($name , $customFields)){
                            $customRecord[$name] = $csvRecord[$label];
                        } else {
                            $records[$index][$name] = $csvRecord[$label];
                        }
                    }
                }
                if($customRecord){
                    $records[$index]['custom'] = json_encode($customRecord);
                }
            }

            $module = "App\Models\\{$module_name}"; 

            $module::insert($records);
            // Next offset
            $nextOffset = $offset + $count; 

            if($total_record == $nextOffset || $count == 0){
                Import::where('id',$record_id)->update([
                    'status' => 'Completed',
                    'offset' => $nextOffset,                
                ]);
                $UpdateNotificaton = $this->updateNotification($user_id,$record_id,$ImportName);
            }else{
                Import::where('id',$record_id)->update([
                    'status' => 'Inprogress',
                    'offset' => $nextOffset,                
                ]);
            }
        }
    }

    public function updateNotification($user_id, $record_id, $name){
        $notification = new Notification();
        $notification->notifier_id = $user_id;
        $notification->notification_id = $record_id;
        $notification->notification_type = $name;
        $notification->notification_content = 'completed';
        $notification->save();
    }
}
