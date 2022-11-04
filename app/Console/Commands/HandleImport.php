<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Import;
use App\Models\Contact;
use App\Models\Field;
use App\Models\Notification;
use App\Models\Product;
use App\Models\Order;
use League\Csv\Reader;
use League\Csv\Statement;
use Illuminate\Support\Facades\Log;
use DB;


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
            $import = Import::where('status', $status)->first();   
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
            $mapping_items = unserialize(base64_decode($import->line_item_mapping));
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
                     ->get(['field_name', 'is_custom', 'field_type']);
        
            $customFields = [];
            $fieldType = [];

            foreach($fields as $field){
                if($field->is_custom == 1) {
                    $customFields[] = $field->field_name;
                }
                if($field->field_type == 'date') {
                    $fieldType[] = $field->field_name;
                }
            }

            $records = [];
            $lineItems = [];
            $count = 0;    //Initial count is zero

            foreach ($csvRecords as $index =>  $csvRecord) {
                $count++;
                $records[$index] = ['created_at' => $current_date, 'updated_at' => $current_date, 'company_id' => $company_id ];

                // Add creater_id in Contact module
                if($module_name == 'Contact') {  
                    $records[$index]['creater_id'] = $user_id;
                }

                if($module_name == 'Order') {
                    $order = Order::orderBy('id', 'desc')->first();
                    if(!$order) {
                        $order_id = $index;
                    } else {
                        $order_id = $order->id + $index;
                    }
                    $records[$index]['id'] = $order_id;
                }
         
                $customRecord = [];
                foreach($mapping_value as $name => $label){
                    if($label){
                        
                        $value =  $csvRecord[$label];
                        // Check if the field type is date&Time
                        if(in_array($name, $fieldType)) { 
                            $converter = Date_create($value);
                            $value = Date_format($converter, "d/m/Y");
                        }

                        if(in_array($name , $customFields)){
                            $customRecord[$name] = $value;
                        } else {
                            $records[$index][$name] = $value;
                        }
                    }
                }
                if($customRecord){
                    $records[$index]['custom'] = json_encode($customRecord);
                }

                if($module_name == 'Order') {
                    $lineItems[] = $this->createLineItems($order_id,$company_id, $mapping_items, $csvRecord, $lineItems, $current_date);
                }
            }

            $module = "App\Models\\{$module_name}"; 

            $module::insert($records);

            if($module_name == 'Order' && $lineItems) {
                foreach($lineItems as $key => $items) {
                    if($items) {
                        $insert_Items = DB::table('line_items')->insert($items);                        
                    }
                }
            }

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

    public function createLineItems($order_id, $company_id, $fields, $records, $items, $current_date) {

        $product_name = '';
        $quantity = 0;  // Quantity has been initially zero

        foreach($fields as $name => $label) {
            if($label) {
                if($name == 'product') {
                    $product_name = $records[$label];
                }
                if($name == 'quantity'){
                    $quantity = $records[$label];
                }
            }
        }
        
        if($product_name){
            $product = Product::where('name', $product_name)->where('company_id', $company_id)->first(); // Check the product details

            if($product) {
                $price = $product->price;  // Product price

                $items = [
                    'order_id' => $order_id,
                    'quantity' => $quantity,
                    'price' => $price,
                    'total_amount' => $price * $quantity,
                    'company_id' => $company_id,
                    'product_id' => $product->id,
                    'created_at' => $current_date,
                    'updated_at' => $current_date
                ];

                return $items;
            }
        }
    }
}
