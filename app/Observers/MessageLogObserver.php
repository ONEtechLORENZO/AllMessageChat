<?php

namespace App\Observers;

use App\Models\MessageLog;
use App\Models\IncomingUrl;
use DateTime;

class MessageLogObserver
{

    private $apiKey = 'UfJj3x7ECaPvRyxDqjU4B6rNyTfV05aV';
    private $token = 'Basic djZWc3o1WkM6VUpIaGNkRE4zdkNUUjhmOQ==';
    private $origin = "+447797882221";
    private $platFormId = 'COMMON_API';
    private $platFormParentId = '19408';

    /**
     * Handle the MessageLog "created" event.
     *
     * @param  \App\Models\MessageLog  $messageLog
     * @return void
     */
    public function created(MessageLog $messageLog)
    {
        error_log( print_r( ' MessageLogObserver Message Created - '.$messageLog->status , true) );
        $this->sendMessageResponse($messageLog);
    }

    /**
     * Handle the MessageLog "updated" event.
     *
     * @param  \App\Models\MessageLog  $messageLog
     * @return void
     */
    public function updated(MessageLog $messageLog)
    {
        error_log( print_r( ' MessageLogObserver Message status Update - '.$messageLog->status , true) );
        if( $messageLog->status == 'Failed' || $messageLog->status == 'Delivered' )
            $this->sendMessageResponse($messageLog);
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
     * Post message data to CRM
     * 
     * @param \App\Models\MessageLog  $messageLog
     */
    public function sendMessageResponse($messageLog){
        $postData = [];
        if($messageLog){
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
          
            
            // Get CRM URL based on account 
            $callBackUrl = IncomingUrl::where('account_id' , $messageLog->account_id)->first();
            $curl = curl_init();
            curl_setopt_array($curl, array(
                              CURLOPT_URL => 'https://plustore.dashboard5.it//whatsapp-webhook.php?id=61653b499e3022.85191355&workflow_id=80&secret_key=fe9bruph',
               //         CURLOPT_URL => $callBackUrl->incoming_url,
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
                            'accessKey: KFI7IDWsrLV4iMW'
                            ),
                        ));

            $response = curl_exec($curl);
            curl_close($curl);
            return $response;
        }

    }
}
