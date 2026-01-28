<?php

namespace App\Observers;

use Illuminate\Support\Facades\Log;
use App\Models\WebhookEvent;
use App\Models\Template;
use App\Models\Message;

class TemplateObserver
{
    /**
     * Handle the Template "created" event.
     *
     * @return void
     */
    public function created( $template)
    {
        $status =  $this->sendTemplateResponse($template);
    }

    /**
     * Handle the Template "updated" event.
     *
     * @return void
     */
    public function updated( $template)
    {
        $status =  $this->sendTemplateResponse($template);
    }

    /**
     * Handle the Template "deleted" event.
     *
     * @param  \App\Models\Template  $template
     * @return void
     */
    public function deleted()
    {
        //
    }

    /**
     * Handle the Template "restored" event.
     *
     * @param  \App\Models\Template  $template
     * @return void
     */
    public function restored(Template $template)
    {
        //
    }

    /**
     * Handle the Template "force deleted" event.
     *
     * @param  \App\Models\Template  $template
     * @return void
     */
    public function forceDeleted(Template $template)
    {
        //
    }

    /**
     * Send template event details using webhooks 
     */
    public function sendTemplateResponse($data)
    {
        $template = $message = '';
        $module = class_basename($data);
        if($module == 'Template'){
            $template = $data;
            $message = Message::where('template_id' , $template->id)->first();
        } else {
            $message = $data;
            $template = Template::find($data->template_id);
        }
       
       if(! $template || ! $message || !$template->template_uid ){
        return false;
       }

        $webhookEvents = WebhookEvent::where('account_id', $template->account_id)->get();
        if($webhookEvents){
            foreach($webhookEvents as $webhookEvent) {
                if($webhookEvent->template_events != 0 ) {
                    $callBackUrl = $webhookEvent->callback_url;

                    // Set Template details
                    $postData = [
                        'name' => $template->name,
                        'template_uid' => $template->template_uid,
                        'category' => $template->category,
                        'languages' => $template->languages,
                        'status' => $template->status,
                        'type' => $template->type,
                        'header' => $message->header_content,
                        'body' => $message->body,
                        'footer' => $message->footer_content,
                    ];

                    log::info([ 
                        'webhook - Template status' => $template->status , 
                        'webhook - Template response ' => json_encode($postData),
                        'webhook url' => $callBackUrl,
                    ]);

                    
                    $curl = curl_init();
                    curl_setopt_array($curl, array(
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
                    Log::info(['webhook responnse ' => $response]);
                    
                }
            }
        }
    }
}
