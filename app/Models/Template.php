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