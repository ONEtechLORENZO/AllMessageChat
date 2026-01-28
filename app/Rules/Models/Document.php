<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use App\Models\Contact;
use Log;

class Document extends Model
{
    use HasFactory;

    public function contact()  
    {  
        return $this->belongsTo('App\Model\Contact');  
    } 

    /**
     * Return list view fields
     */
    public function getListViewFields(Type $var = null)
    {
        $list_view_columns = [
            'title' => ['label' => 'Title', 'type' => 'text'],
            'type' =>  ['label' => 'Type', 'type' => 'text'],
            'size' =>  ['label' =>'Size', 'type' => 'text'],
        ];
        return $list_view_columns;
    }

    /**
     * Store Document and return file path
     */
    public function storeDocument($type = '' , $url , $parentId, $account)
    {
        if($type) {
            $fileUrl = explode('?', $url);
            $query_str = parse_url($url, PHP_URL_QUERY);
            parse_str($query_str, $query_params);
            $name = isset($query_params['fileName']) ? $query_params['fileName'] : '';
            if (($file = @file_get_contents($fileUrl[0])) === false) {
                $file = '';
            }
            if(!$name){
                $name = "onemessage_".time();
            }

        } else {
            $name = "onemessage_".time();
            $response = Http::get($url);
            $file = ($response->body());
        }

        $path = "document/{$account->id}/{$parentId}/incoming/{$name}";
        $docId = $this->saveDocument($name, $type , $file, $parentId, 'Contact', $path, $url);

        return ($docId);
    }

    /**
     * Store document from Facebook whatsapp API
     */
    public function storeFBDocument($account, $parentId , $fileData)
    {
        $url = config('app.fb.api_url');
        $url .= $fileData['id'];
    
        $user = User::find($account->user_id);
        $headers = [
            'Authorization' => 'Bearer '. $user->fb_token,
            'Content-Type' => 'application/json',
        ];

        $response = Http::withHeaders($headers)->get($url);
        $mediaData = json_decode($response->body());
        Log::info(['Media Data ' => $mediaData]);  
        
        // Remove unwanted header
        unset($headers['Content-Type']);
        
        $response = Http::withHeaders($headers)->get($mediaData->url);
        $file = $response->body();

        $type = $mediaData->mime_type;
        $name = ''; 
        if($type){
            $extension = explode('/', $type)[1];    
            $name = 'onemessage'. uniqid(). '.' .$extension;
        }
        $path = "public/document/{$account->id}/{$parentId}/incoming/{$name}";
        $docId = $this->saveDocument($name, $type , $file , $parentId, 'Contact', $path);
        
        $return['msg_type'] = explode('/', $type)[0];
        $return['file_path'] = $docId;
        $return['message'] = isset($mediaData->caption) ? $mediaData->caption : '';
        return ($return);
    }

    /**
     * Save Document
     */
    public function saveDocument($name = '', $type, $file, $parentId, $parentModule, $path, $url ='')
    {
        if($type){
            $extension = explode('/', $type)[1];
            if($name == '')
                $name = 'onemessage'. uniqid(). '.' .$extension;
        } else {
            $extension = '';
        }

        Storage::disk('public_uploads')->put($path, $file);
        $fileSize = Storage::disk('public_uploads')->size($path);

        $document = new Document();
        $document->title = $name;
        $document->type = $extension;
        $document->size = $fileSize;
        $document->path = $path;
        $document->parent_id = $parentId;
        $document->parent_module = $parentModule;
        $document->gupshup_path = $url;
        $document->save();

        return $document->id;
    }
    
}
