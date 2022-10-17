<?php

namespace App\Observers;

use App\Models\WebhookEvent;
use App\Models\Msg;
use App\Models\Account;
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
        if(! isset($_REQUEST['FROM_CRM'])){
            Log::info('MessageLogObserver Message Created - '.$msg);
            $status =  $this->sendMessageResponse($msg);
            Log::info('Send message log status - '. $status);
        }
    }

    /**
     * Handle the Msg "updated" event.
     *
     * @param  \App\Models\Msg  $msg
     * @return void
     */
    public function updated(Msg $msg)
    {
        //
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
        $postData = [];
        if($messageLog) {

            $account = Account::find($messageLog->account_id);
            $contact = Contact::find($messageLog->msgable_id);

            $from = ($account->service_engine == 'facebook') ? $account->fb_phone_number_id : $account->phone_number;
            $to = $contact->phone_number;
            $to = str_replace('+' , '', $to);
            
            $msgType = ($messageLog->msg_type) ? $messageLog->msg_type : 'TEXT';
            
            $date = new DateTime();
            $postData['reference'] = '';//$messageLog->refId;
            $postData['messageContext'] = $messageLog->message;
            $postData['from'] = [ 'number' => $from , 'name' => $from ];
            $postData['to'] = [ 'number' => $to ];
            $postData['message'] = [ 'text' => $messageLog->message , 'media' => ['mediaUri' => '', 'contentType' => $msgType , 'title' => '' ]  ];
            $postData['custom'] = (object)[];
            $postData['groupings'] = ['', '', ''];
            $postData['time'] = $date->format('Y-m-d H:i:s');
            $postData['timeUtc'] = $date->format('Y-m-d\TH:i:s');
            $postData['channel'] = 'WhatsApp';
                       
            // Get configured webhooks for the account
            $webhookEvents = WebhookEvent::where('account_id', $messageLog->account_id)->get();
            foreach($webhookEvents as $webhookEvent) {
                $callBackUrl = $webhookEvent->callback_url;

                if($callBackUrl) {
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
                        CURLOPT_HTTPHEADER => array(
                            'Content-Type: application/json',
                            'operation: login',
                            'username: admin',
                            'accessKey: wpfYKID7sbZGM61'
                        ),
                    ));

                    $response = curl_exec($curl);

                    Log::info(['webhook responnse ' => $response]);
                    curl_close($curl);
                }
            }
        }
    }
}
