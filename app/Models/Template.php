<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;

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
     * Fetch templates based on Account
     * 
     * @param string $sourceName
     */
    public function fetchTemplates($sourceName)
    {
        if(!$sourceName) {
            return ['status' => 'failed', 'message' => 'App name is missing.'];
        }

        $url = str_replace('msg', 'template/list/' . $sourceName, config('app.api_url'));
        $headers = [
            'apikey' => config('app.apiKey')
        ];
        
        $response = Http::asForm()->withHeaders($headers)->get($url);
        $response_body = json_decode($response->body(), true);
        return $response_body;
    }
}