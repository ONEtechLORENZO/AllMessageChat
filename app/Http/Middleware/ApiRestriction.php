<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Api;

class ApiRestriction
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        if ($request->is('api/admin/*'))
        { 
            $apiKey = $request->header('api_key');

            if(! $apiKey) {
                return response()->json(['status' => false , 'message' => 'API token missing']);
            }
            if($apiKey != config('app.admin_api_key')) {
                return response()->json(['status' => false , 'message' => 'Invalid API token']);
            }
            return $next($request);
        } else {
            $flag = false; // API access flag
            $message = 'Invalid API token';

            $token = str_replace('Bearer ', '',$_SERVER['HTTP_AUTHORIZATION']);
            $type = $_SERVER['REQUEST_METHOD'];
            $userIp = $request->ip();
            $api = Api::where('api_key', $token )->first();
            $statusCode = 200;
            if($api){
                $readable = $api->read_only;
                $writeable = $api->write_only;
                $blockedIpData = $api->ip;
                $blockIps = [];
                if($blockedIpData){
                    foreach($blockedIpData as $ip){
                        $blockIps[] = $ip['value'];
                    }
                }
                
                if($type == 'GET' && $readable){
                    $flag = true;
                } else if(($type == 'POST' || $type == 'PUT' || $type == 'DELETE' ) && $writeable){
                    $flag = true;
                } else {
                    $statusCode = 403;
                    $message = 'API permission denied';
                }

                if(in_array($userIp , $blockIps)){
                    $flag = false;
                    $statusCode = 403;
                    $message = 'Invalid IP address.';
                } else if($flag){
                    $flag = true;
                }
            }
        
            if($flag){
                return $next($request);
            } else {
                return response()->json(['status' => false, 'message' => $message], $statusCode);
            }
        }
    }
}