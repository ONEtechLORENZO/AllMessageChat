<?php

namespace App\Observers;

use App\Models\WebhookEvent;
use App\Models\Msg;
use App\Models\Account;
use App\Models\Document;
use App\Models\Contact;
use DateTime;
use Log;

class MsgObserver
{
    /**
     * Handle the Msg "created" event.
     *
     * @param  \App\Models\Msg  $msg
     * @return void
     */
    public function created(Msg $msg)
    {
        $status =  $this->sendMessageResponse($msg);
    }

    /**
     * Handle the Msg "updated" event.
     *
     * @param  \App\Models\Msg  $msg
     * @return void
     */
    public function updated(Msg $msg)
    {
        $status =  $this->sendMessageResponse($msg);
    }

    /**
     * Handle the Msg "deleted" event.
     *
     * @param  \App\Models\Msg  $msg
     * @return void
     */
    public function deleted(Msg $msg)
    {
        //
    }

    /**
     * Handle the Msg "restored" event.
     *
     * @param  \App\Models\Msg  $msg
     * @return void
     */
    public function restored(Msg $msg)
    {
        //
    }

    /**
     * Handle the Msg "force deleted" event.
     *
     * @param  \App\Models\Msg  $msg
     * @return void
     */
    public function forceDeleted(Msg $msg)
    {
        //
    }

    /**
     * Post data to configured webhook URL
     * 
     * @param \App\Models\MessageLog  $messageLog
     */
    public function sendMessageResponse($messageLog)
    {
        if( isset($_REQUEST['FROM_CRM']) ){
            return true;
        }
        
        $postData = [];
        if($messageLog) {

            $account = Account::find($messageLog->account_id);
            $contact = Contact::find($messageLog->msgable_id);
            
            $from = ($account->service_engine == 'facebook') ? $account->fb_phone_number_id : $account->phone_number;
            $to = $contact->phone_number;
            $to = str_replace('+' , '', $to);
            
            $fromName = $account->company_name;
            $toName = $contact->first_name .' '.$contact->last_name;
            $accountNumber = '';
            if($account->service == 'whatsapp'){
                $accountNumber = $account->phone_number;
            } else if($account->service == 'facebook'){
                $accountNumber = $account->fb_phone_number_id;
            } else if($account->service == 'instagram'){
                $accountNumber = $account->ig_phone_number_id;
            } 

            $type = ($messageLog->msg_mode != 'outgoing') ? 'Incoming' : 'Outgoing';
            if($messageLog->msg_mode != 'outgoing'){
                list($from , $to) = array($to , $from);
                list($fromName , $toName) = array($toName , $fromName);
            }

            $msgType = ($messageLog->msg_type) ? $messageLog->msg_type : 'TEXT';
            
            $documentPath = '';
            if($msgType != 'TEXT'){
                $document = Document::find($messageLog->file_path);
                if($document){
                    $documentPath = urlencode($document->gupshup_path);
                }
            }

            $date = new DateTime();
            
            $storyType = '';
            if($messageLog->is_reply){
                $storyType = 'story_reply';
            }
            if($messageLog->story_mention){
                $storyType = 'story_mention';
            }
            
            $moreInfo = [];
            if($storyType){
                $moreInfo = [
                    'type' => $storyType,
                ];
            }
            
            $postData = [
                'content' => $messageLog->message,
                'sender_name' => $fromName,
            //    'whatsapp_chatid' => $messageLog->service_id,
                'mode' => $type,
            //    'body' => $messageLog->message,
                'message_type' => ($messageLog->status),
                'customer_phone' => $contact->phone_number,
                'message_id' => $messageLog->service_id,
            //    'your_phone_number' => $accountNumber,
                'error_response' => $messageLog->error_response,
            //    'from_portal' => true,
                'file_path' => $documentPath,
                'contact_id' => $messageLog->msgable_id,
                'session_id' => $messageLog->session_id,
                'social_profile_id' => $messageLog->account_id,
                'social_profile_phone_number' => $accountNumber,
                'content_type' => $msgType,
                'more_info' => json_encode($moreInfo),
            ];
            
            if($messageLog->reply_to) {
                $postData['quick_reply'] = true;
                $postData['template_id'] = $messageLog->template_id;
            }

            // Get configured webhooks for the account
            $webhookEvents = WebhookEvent::where('account_id', $messageLog->account_id)->get();
            foreach($webhookEvents as $webhookEvent) {
                $canSendAccess = false;
                $callBackUrl = $webhookEvent->callback_url;
                $status = strtolower($messageLog->status);
                if(($messageLog->msg_mode == 'incoming' && $webhookEvent->received) && $callBackUrl ){
                    $canSendAccess = true;
                }
                if(($webhookEvent->$status != 0 ) && $callBackUrl ){
                    $canSendAccess = true;
                }
                if(($webhookEvent->enqueued != 0 && $status == 'queued' ) && $callBackUrl ){
                    $canSendAccess = true;
                }
                if(($webhookEvent->delivered != 0 && $messageLog->is_delivered ) && $callBackUrl ){
                    $canSendAccess = true;
                    $postData['onemessage_status'] = 'Delivered';

                }
                if(($webhookEvent->read != 0 && $messageLog->is_read ) && $callBackUrl ){
                    $canSendAccess = true;
                    $postData['onemessage_status'] = 'Read';
                }
             
                $postData['message_type'] = (isset($postData['onemessage_status'])) ? ucfirst($postData['onemessage_status']) : ucfirst($messageLog->status) ;
                unset($postData['onemessage_status']);
                
                if($canSendAccess) {
                    // Log::info([ 'Webhook action type - ' => $status , 'URL' => $callBackUrl , 'Webhook action post data - ' => json_encode($postData)]);
                    // TODO check event is configured to receive
                    $curl = curl_init();
                    curl_setopt_array($curl, array(
                       // CURLOPT_URL => 'https://demo.blackant.io/hub5/crm/whatsapp-webhook.php?id=624de9b9264142.67637801%20&workflow_id=80&secret_key=fe9bruph',
                        CURLOPT_URL => $callBackUrl,
                        CURLOPT_RETURNTRANSFER => true,
                        CURLOPT_ENCODING => '',
                        CURLOPT_MAXREDIRS => 10,
                        CURLOPT_TIMEOUT => 0,
                        CURLOPT_FOLLOWLOCATION => true,
                        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                        CURLOPT_CUSTOMREQUEST => 'POST',
                        CURLOPT_POSTFIELDS => json_encode($postData),
                    ));

                    $response = curl_exec($curl);
                    curl_close($curl);
                    //Log::info(['webhook responnse ' => $response]);
                }
            }
        }
    }
}
