<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

use App\Models\Message;

class Msg extends Model
{
    use HasFactory;

    public $api_url = 'https://api.gupshup.io';


    public function msgable()
    {
        return $this->morphTo();
    }

    /**
     * Send message to WhatsApp
     */
    public function sendWhatsAppMessage($content, $destination, $account, $template = '' , $attachment = '')
    {        
        
        if($account->service_engine == 'facebook'){
            // remove + (plus) symbol
            $destination = str_replace('+' , '', $destination);

            // create URL
            $url = config('app.fb.api_url');
            $url .= $account->fb_phone_number_id . '/messages' ;

            // set headers
            $headers = [
                'Authorization' => 'Bearer '. $account->service_token,
                'Content-Type' => 'application/json',
            ];
            $post_data = [
                'messaging_product' => 'whatsapp',
                'to' => $destination,
            ];

            // set data if is template  
            if($template && $template != "undefined" ){  
                $template = Template::where('template_uid' , $template)->first();
                $message = [
                    'name' => strtolower(str_replace( ' ', '_', $template->name)),
                    'language' => [ 'code' => 'en_US']
                ];
                $post_data['type'] = 'template';
                $post_data['template'] = (json_encode($message));
            } else if($attachment) { 
                // set attachment
                $post_data['type'] = $attachment['type'];
                $post_data[$attachment['type']] = ['link' => $attachment['file_url']];
               
            } else {
                $post_data['type'] = 'text'; 
                $post_data['text'] = (json_encode(['body' => $content]));
            }

            // send message 
            $response = Http::asForm()->withHeaders($headers)->post($url, $post_data);
            $response_body = json_decode($response->body(), true);
           
            if(isset($response_body['messages'][0]['id'])) {
                $messageId = $response_body['messages'][0]['id'];
                $response_body = [ 
                    'status' => 'submitted',
                    'messageId' => $messageId
                ];
                if($attachment) { 
                    $response_body['msg_type'] = $attachment['type'];
                    $response_body['file_path'] = $attachment['file_url'];
                }
                $data['result'] = $response_body;
            } else {
                $response_body = [ 
                    'status' => 'error',
                    'error' => $response_body['error']['message'],
                ];
                
                $data['result'] = $response_body;
            }
        
            return $data;

        } else {
            $url = config('app.api_url');
            if(strpos($destination, '+') === true){
                $destination = str_replace('+', '' , $destination);
            }

            $post_data = [
                'channel' => 'whatsapp',
                'source' => $account->phone_number,
                'destination' => $destination,
                'src.name' => $account->src_name,
                'disablePreview' => null
            ];

            if(isset($_POST['template']) || $template) {
                // Set template type object
                $message = [
                    'id' => $template,
                    'params' => []
                ];
                $post_data['template'] = (json_encode($message));
                $url = str_replace('msg', 'template/msg', $url);
            } else if($attachment) { 
                // Set attachment
                $post_data['message'] = (json_encode($attachment));
                $data['msg_type'] = $attachment['type'];
                $data['file_path'] = $attachment['originalUrl'];
            } else {
                // Set text type object
                $message = [
                    "type" => "text",
                    "text" => $content
                ];
                $post_data['message'] = (json_encode($message));
            }

            $headers = [
                'Accept' => 'application/json',
                'apikey' => config('app.apiKey')
            ];

            log::info(['send_message_info', $post_data]);
            $response = Http::asForm()->withHeaders($headers)->post($url, $post_data);
            $response_body = json_decode($response->body(), true);
        
            if( $response_body && $response_body['status'] != 'error') {
                $data = $post_data;
                $data['account_id'] = $account->id;
                $data['content'] = $content;
            } 
            if($attachment) { 
                $response_body['msg_type'] = $attachment['type'];
                $response_body['file_path'] = $attachment['originalUrl'];
            }
        }
        $data['result'] = $response_body;
        return $data;
    }

    /**
     * Send message to Instagram user
     */
    public function sendInstagramMessage($message, $context_id, $bot_name)
    {        
        $url = $this->api_url . "/sm/api/bot/{$bot_name}/msg";
        $api_key = config('app.apiKey');
        $headers = [
            'apikey' => $api_key,
        ];

        $post_data = [
            'context' => json_encode([
                'channeltype' => 'instagram',
                'contexttype' => 'p2p',
                'contextid' => $context_id,
                'botname' => $bot_name,
            ]),
            'message' => $message,
        ];
        Log::info(['send message data' => $post_data] );
        $response = Http::asForm()->withHeaders($headers)->post($url, $post_data);
        $response_body = json_decode($response->body(), true);
        Log::info( ['response' =>  $response_body]);

        if($response_body['status'] == 'success') {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Return Instagra profile info
     */
    public function getProfileDetail($channelid)
    {
        $endPoint = $this->api_url.'/sm/api/bot/InstaGupshupTesting/fetch_profile?';
   
        $param = [
            'context' => json_encode([
                'contextid' => $channelid,
                'channeltype' => 'instagram',
                "contexttype" => "p2p",
                "botname" =>  "InstaGupshupTesting"
            ]),
            'sender' => json_encode([
                'channeltype' => 'instagram',
                'channelid' => $channelid,
            ])
        ];

        $endPoint .= http_build_query($param);

        log::info(['url'  => $endPoint]);

        $api_key = config('app.apiKey');
        $headers = [
            'apikey' => $api_key,
        ];

        $response = Http::withHeaders($headers)->get($endPoint);
        $response_body = json_decode($response->body(), true);

        log::info(['profile_dat'  => $response_body]);
        return ($response_body);
    }

}
