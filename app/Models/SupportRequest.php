<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Note;


class SupportRequest extends Model
{
    use HasFactory;
    protected $table = 'supportrequests';
    protected $casts = [
        'custom' => 'array',       
    ];
    protected $fillable = ['subject', 'description', 'status', 'type','assigned_to', 'created_at', 'updated_at', 'custom'];

    public function notes()
    {
        return $this->morphMany(Note::class, 'notable');
    }

     /**
     * Return list view fields
     */
    public function getListViewFields()
    {
        $list_view_columns = [
            'subject' => ['label' => 'Subject', 'type' => 'text'],
            'description' =>  ['label' => 'Description', 'type' => 'text'],
            'status' =>  ['label' =>'Status', 'type' => 'dropdown'],
            'type' =>  ['label' =>'Type', 'type' => 'dropdown'],
        ];
        return $list_view_columns;
    }
}
