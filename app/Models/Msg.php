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
     * Send message to Instagram user
     */
    public function sendWhatsAppMessage($content, $destination, $account)
    {        

        $url = config('app.api_url');
        $post_data =[
            'channel' => 'whatsapp',
            'source' => $account->phone_number,
            'destination' => $destination,
            'src.name' => $account->src_name,
            'disablePreview' => null
        ];
        if(isset($_POST['template'])){
            $template = Message::where('template_id', $_POST['template'])->first();
            if($template){
                $content = $template->body;
            }
            $message = [
                'id' => $_POST['template'],
                'params' => []
            ];
            $post_data['template'] = (json_encode($message));

            $url = str_replace('msg', 'template/msg', $url);
        } else {
            $message = [
                "type" => "text",
                "text" => $content
            ];
            $post_data['message'] = (json_encode($message));
        }

       // $post_data['message'] = (json_encode($message));
        
        $headers = [
            'Accept' => 'application/json',
            'apikey' => config('app.apiKey')
        ];

        $response = Http::asForm()->withHeaders($headers)->post($url, $post_data);
        $response_body = json_decode($response->body(), true);
        if ($response_body['status'] != 'error' ) {
            $data = $post_data;
            $data['account_id'] = $account->id;
            $data['content'] = $content;
            $result = ($response_body);
            $data['result'] = $result;
        } else {
            echo json_encode($response_body);die;
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
