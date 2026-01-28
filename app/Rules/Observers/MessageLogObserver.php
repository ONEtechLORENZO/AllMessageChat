<?php

namespace App\Observers;
use App\Models\MessageLog;
use App\Models\WebhookEvent;
use Illuminate\Support\Facades\Log;
use DateTime;

class MessageLogObserver
{
    /**
     * Handle the MessageLog "created" event.
     *
     * @param  \App\Models\MessageLog  $messageLog
     * @return void
     */
    public function created(MessageLog $messageLog)
    {
        Log::info('MessageLogObserver Message Created - '.$messageLog->status);
        $status =  $this->sendMessageResponse($messageLog);
        Log::info('Send message log status - '. $status);
    }

    /**
     * Handle the MessageLog "updated" event.
     *
     * @param  \App\Models\MessageLog  $messageLog
     * @return void
     */
    public function updated(MessageLog $messageLog)
    {
        Log::info('MessageLogObserver Message status Update - ' . $messageLog->status);

        if( $messageLog->status == 'Failed' || $messageLog->status == 'Delivered' ){
//            $staus = $this->sendMessageResponse($messageLog);
            Log::info('Send message log status - '. $messageLog->status);
        }
    }

    /**
     * Handle the MessageLog "deleted" event.
     *
     * @param  \App\Models\MessageLog  $messageLog
     * @return void
     */
    public function deleted(MessageLog $messageLog)
    {
        //
    }

    /**
     * Handle the MessageLog "restored" event.
     *
     * @param  \App\Models\MessageLog  $messageLog
     * @return void
     */
    public function restored(MessageLog $messageLog)
    {
        //
    }

    /**
     * Handle the MessageLog "force deleted" event.
     *
     * @param  \App\Models\MessageLog  $messageLog
     * @return void
     */
    public function forceDeleted(MessageLog $messageLog)
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
            $date = new DateTime();
            $postData['reference'] = '';//$messageLog->refId;
            $postData['messageContext'] = $messageLog->content;
            $postData['from'] = [ 'number' => $messageLog->sender , 'name' => $messageLog->sender ];
            $postData['to'] = [ 'number' => $messageLog->destinations ];
            $postData['message'] = [ 'text' => $messageLog->content , 'media' => ['mediaUri' => '', 'contentType' => $messageLog->type , 'title' => '' ]  ];
            $postData['custom'] = (object)[];
            $postData['groupings'] = ['', '', ''];
            $postData['time'] = $date->format('Y-m-d H:i:s');
            $postData['timeUtc'] = $date->format('Y-m-d\TH:i:s');
            $postData['channel'] = 'WhatsApp';

            Log::info(['Observer data log -', $postData]); 
            // Get configured webhooks for the account
            $webhookEvents = WebhookEvent::where('account_id', $messageLog->account_id)->get();
            foreach($webhookEvents as $webhookEvent) {
                $callBackUrl = $webhookEvent->callback_url;
                if($callBackUrl) {
                    // TODO check event is configured to receive
                    $curl = curl_init();
                    curl_setopt_array($curl, array(
                        CURLOPT_URL => 'https://demo.blackant.io/hub5/crm/whatsapp-webhook.php?id=624de9b9264142.67637801%20&workflow_id=80&secret_key=fe9bruph',
                        //CURLOPT_URL => $callBackUrl->incoming_url,
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

                    curl_exec($curl);
                    curl_close($curl);
                }
            }
        }
    }
}
