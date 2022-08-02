<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Import;
use App\Models\Contact;
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
        
        $status = 'Inprogress';
        $import = Import::where('status',$status)->first(); 
        if(!$import){
            $status = 'new';
            $import = Import::where('status',$status)->first();   
        }
        if($import){
            $record_id = $import->id;
            $offset = $import->offset;
            $file_path = $import->file_path;
            $total_record = $import->total_records;
            $user_id = $import->user_id;
            $current_date = date('Y-m-d H:i:s');
            $mapping_value = unserialize(base64_decode($import->mapping));

            $stream = fopen($file_path, 'r');
            $csv = Reader::createFromStream($stream);
            $csv->setDelimiter(',');
            $csv->setHeaderOffset(0);
            
            //build a statement
            $stmt = Statement::create()
            ->offset($offset)
            ->limit($limit);
            
            //query your records from the document
            $records = $stmt->process($csv);
        
            $field = [];
            $count = 0;
            foreach ($records as $index =>  $record) {
                $count++;
                $field[$index] = ['user_id' => $user_id,'created_at' => $current_date, 'updated_at' => $current_date ];
                foreach($mapping_value as $name => $label){
                    if($label){
                        $field[$index][$name] = $record[$label];
                    }
                }
            }
        
            Contact::insert($field);
            //importedfile count
            $nextOffset = $offset + $count; 

            if($total_record == $nextOffset || $count == 0){
                Import::where('id',$record_id)->update([
                    'status' => 'Completed',
                    'offset' => $nextOffset,                
                ]);
            }else{
                Import::where('id',$record_id)->update([
                    'status' => 'Inprogress',
                    'offset' => $nextOffset,                
                ]);
            }
        }
    }
}
