<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Api extends Model
{
    use HasFactory;

    protected $fillable = [ 'id', 'name', 'ip', 'read_only', 'write_only', 'api_key'];

    protected $casts = [
        'ip' => 'array',
    ];

    /**
     * Return list view fields
     */
    public function getListViewFields()
    {
        $list_view_columns = [
            'name' => ['label' => __('Name'), 'type' => 'text'],
            'ip' =>  ['label' => __('IP'), 'type' => 'selectable'],
            'api_key' =>  ['label' => __('API keys'), 'type' => 'text'],
            'read_only' =>  ['label' => __('Read only'), 'type' => 'checkbox'],
            'write_only' => ['label' => __('Write only'), 'type' => 'checkbox'],
        ];
        return $list_view_columns;
    }
}
