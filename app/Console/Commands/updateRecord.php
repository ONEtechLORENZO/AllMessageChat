<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Import;
use App\Models\Contact;
use League\Csv\Reader;
use League\Csv\Statement;
use Illuminate\Support\Facades\Log;

class updateRecord extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'command:updateCsvRecord';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update record in contacts table';

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
        $limit = 200;
        // Look for import with in_progress status
        $import = Import::where('status', 'in_progress')->first();
        if(!$import) {
            // Look for new imports
            $import = Import::where('status', 'new')->first();   
        }

        if($import) {
            $record_id = $import->id;
            $offset = $import->offset;
            $file_path = $import->file_path;
            $total_record = $import->total_records;
            $user_id = $import->user_id;
            $current_date = gmdate('Y-m-d H:i:s');
            $mapping_value = unserialize(base64_decode($import->mapping));

            $stream = fopen($file_path, 'r');
            $csv = Reader::createFromStream($stream);
            $csv->setDelimiter(',');
            $csv->setHeaderOffset(0);
            
            // Build a statement
            $stmt = Statement::create()
                ->offset($offset)
                ->limit($limit);
            
            // Query your records from the document
            $records = $stmt->process($csv);
        
            foreach ($records as $record) {
                $data[] = $record;
            }
        
            $field = [];
            $count = 0;
            foreach($data as $index => $header) {  
                $count ++;
                $field[$index] = ['user_id' => $user_id, 'created_at' => $current_date, 'updated_at' => $current_date];
                foreach($mapping_value as $name => $label) {
                    if($label) {
                        $field[$index][$name] = $header[$label];
                    }
                }
            }

            Contact::insert($field);
            // Next offset
            $nextOffset = $offset + $count; 

            if($total_record == $nextOffset) {
                Import::where('id', $record_id)->update([
                    'status' => 'completed',
                    'offset' => $nextOffset,                
                ]);
            }
            else {
                Import::where('id', $record_id)->update([
                    'status' => 'in_progress',
                    'offset' => $nextOffset,                
                ]);
            }
        }
    }
}
