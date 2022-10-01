<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
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
    public function storeDocument($type , $url , $parent)
    {

        $extension = explode('/', $type)[1];
        $file = file_get_contents($url);
        $name = 'ba_document_'.time().'-'. uniqid().'.'.$extension;

        $path = "public/document/{$name}";
        $file = Storage::put($path  , $file);
     
        $fileUrl = url(Storage::url($path));
        $fileSize = Storage::size($path);

        $document = new Document();
        $document->title = $name;
        $document->type = $extension;
        $document->size = $fileSize;
        $document->path = $fileUrl;
        $document->parent_id = $parent;
        $document->parent_module = 'Contact';
        $document->save();

        return ($fileUrl);
    }
}
