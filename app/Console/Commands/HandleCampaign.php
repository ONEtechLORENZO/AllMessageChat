<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use App\Models\Campaign;
use App\Models\Contact;
use App\Models\Account;
use App\Models\Msg;
use App\Http\Controllers\Controller;

class HandleCampaign extends Command
{

    public $limit = 1;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'command:HandleCampaign';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'handle campaign scheduling';

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

        // Look for campaign with in_progress status
        $status = 'Inprogress';
        $campaign = Campaign::where('status',$status)->first(); 
        if(!$campaign){
            // Look for new campaign
            $status = 'new';
            $campaign = Campaign::where('status',$status)->first();   
        }

        if($campaign){
            
            $channel = $campaign->service;
            $template = $campaign->template_id;
            $conditions = $campaign->conditions;
            $offset = $campaign->offset; 
            $searchData = json_decode($conditions);
            $schedulingTime = $campaign->scheduled_at;
            $today = time(); //Today time
            
            if($today >= strtotime($schedulingTime)){

                $count = 0;
                $module = new Contact();
                $account = Account::find($campaign->account_id);
                $limit = $this->limit;

                $fields = [
                    'first_name' => ['label' => __('First Name'), 'type' => 'text'],
                    'last_name' =>  ['label' => __('Last Name'), 'type' => 'text'],
                    'email' =>  ['label' => __('Email'), 'type' => 'text'],
                    'phone_number' => ['label' => __('Phone number'), 'type' => 'phone_number'],
                    'instagram_username' => ['label' =>_('Instagram Username'), 'type' => 'text'],
                ];       
                
                $Controller = new Controller;
                $contacts = $Controller->getContactRecords($module, $fields, $searchData, $limit, $offset);
            
                if(count($contacts)){
                    foreach($contacts as $contact){  
                        $count++;
                        if($channel == 'whatsapp'){
                            $mobileNumber = $contact->phone_number;
        
                            if($mobileNumber){
                                //Send Message to Whatsapp
                                $msg = new Msg();
                                $response = $msg->sendWhatsAppMessage('' , $mobileNumber, $account, $template);
                            }
        
                        }else{
                            $instagramId = $contact->instagram_id;
        
                            if($instagramId){
                                //Send Message to Instagram
                               $response = $msg->sendInstagramMessage('' , $instagramId, $account->src_name, $template);
                            }
                        }    
                    }
                   
                     // Next offset
                     $nextOffset = $offset + $count;

                     $campaign->offset = $nextOffset;
                     $campaign->status = 'Inprogress';
                     $campaign->save();

                }else{

                    $campaign->status = 'Completed';
                    $campaign->save();
                  
                }
            }
        }
    }
}
