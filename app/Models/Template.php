<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use DB;

class Template extends Model
{
    use HasFactory;

    protected $casts = [
        'languages' => 'array',
    ];

    /**
     * Submit the request on GupShup
     * 
     * @param string $url
     * @param string $method
     * @param array $headers
     * @param array $data 
     */
    public function submitData($url, $method, $headers, $data )
    {
        if($method == 'POST'){
            $response = Http::asForm()->withHeaders($headers)->post($url, $data);
        } else {
            $response = Http::asForm()->withHeaders($headers)->get($url);
        }
        $response_body = json_decode($response->body(), true);
        return $response_body;
    }

    /**
     * Fetch Gupshup templates based on Account
     * 
     * @param string $sourceName
     */
    public function fetchGupshupTemplates($sourceName, $appToken = '')
    {
        if(!$sourceName) {
            return ['status' => false , 'message' => 'App name is missing.'];
        }

	$url = config('app.partner_url') . 'app/' . $sourceName . '/templates'; 
        $headers = [
            'token' => $appToken
        ];
      
        $response = Http::asForm()->withHeaders($headers)->get($url);
        $response_body = json_decode($response->body(), true);
        if($response_body['status'] == 'error'){
            $message = isset($response_body['message']) ? $response_body['message'] : '';
            $message = (!$message && isset($response_body['reason']) )?  $response_body['reason']: '';
            return ['status' => false , 'message' => $message];
        }
      
        foreach($response_body['templates'] as $template){
            $checkExist = DB::table('gupshup_template_content')
                ->select('id')
                ->where('template_uid' , $template['id'] )
                ->first();
            
            if(! $checkExist){
                DB::table('gupshup_template_content')->insert([
                    'template_uid' => $template['id'],
                    'name' => $template['elementName'],
                    'content' => $template['data']
                ]);
            }
        }
        return $response_body;
    }

    /**
     * Return Facebook template list
     */
    public function fetchFacebookTemplates($account)
    {
        $templateList = [];
        $businessId = $account->business_manager_id;
        $version = config('app.fb.app_graph_version');
        $url = "https://graph.facebook.com/{$version}/{$businessId}/owned_whatsapp_business_accounts?fields=message_templates,message_template_namespace&access_token={$account->fb_token}";
        $response = Http::get($url);
        $result = json_decode($response->body(), true);
        if(isset($result['data'])) {
            $templateList = isset($result['data'][0]['message_templates']['data']) ? $result['data'][0]['message_templates']['data'] : [];
            foreach($templateList as $template){
                $checkExist = DB::table('gupshup_template_content')
                ->select('id')
                ->where('template_uid' , $template['id'] )
                ->first();
            
                if(! $checkExist){
                    DB::table('gupshup_template_content')->insert([
                        'template_uid' => $template['id'],
                        'name' => $template['name'],
                        'content' => isset($template['components'][1]['text']) ? $template['components'][1]['text'] : '',
                    ]);
                }
            }
        }
        return $templateList;
    }
}
