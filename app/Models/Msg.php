<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class Msg extends Model
{
    use HasFactory;

    public $api_url = 'https://api.gupshup.io';


    public function msgable()
    {
        return $this->morphTo();
    }

    /**
     * Send message to Instagram user
     */
    public function sendWhatsAppMessage($content, $destination, $account)
    {        
          $data['account_id'] = $account->id;
          $data['apiKey'] = config('app.apiKey');
          $data['priority'] = 'NORMAL';
          $data['source'] = $account->phone_number; 
          $data['destination'] = $destination;
          $data['content'] = $content;
          $data['refId'] = uniqid();
          $data['srcName'] = config('app.src_name'); 
          
          $content = [
              "type" => "text",
              "text" => $content
          ];
          $message = urlencode(json_encode($content));
  
          log::info('Sent text message using GupShup - start');
          // Post message to Whatsapp with linkmobility
          $curl = curl_init();
          curl_setopt_array($curl, array(
                      CURLOPT_URL => config('app.api_url'),
                      CURLOPT_RETURNTRANSFER => true,
                      CURLOPT_ENCODING => '',
                      CURLOPT_MAXREDIRS => 10,
                      CURLOPT_TIMEOUT => 0,
                      CURLOPT_FOLLOWLOCATION => true,
                      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                      CURLOPT_CUSTOMREQUEST => 'POST',
                      CURLOPT_POSTFIELDS => 'channel=whatsapp&source='.$data['source'].'&destination='.$data['destination'].'&src.name='.config('app.src_name').'&message='.$message,
                      CURLOPT_HTTPHEADER => array(
                          'Content-Type: application/x-www-form-urlencoded',
                          'apikey: '. $data['apiKey']
                          ),
                      ));
  
          $response = curl_exec($curl);
          curl_close($curl);
          if ($response) {
              $result = json_decode($response);
              $data['result'] = $result;
          }
          Log::info('Message send successfully.');
          return $data;

    }

    /**
     * Send message to Instagram user
     */
    public function sendInstagramMessage($message, $context_id)
    {
        $bot_name = 'InstaBlackant';
        
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
        Log::info(['data' => $post_data] );
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
}
