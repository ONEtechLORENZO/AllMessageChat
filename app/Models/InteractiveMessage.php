<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InteractiveMessage extends Model
{
    use HasFactory;
    /**
     * Return list view fields
     */
    public function getListViewFields()
    {
        $list_view_columns = [
            'name' => ['label' => __('Template Name'), 'type' => 'text'],
            'is_active' => ['label' => 'Status' , 'type' => 'boolean'],
            'option_type' => ['label' => 'Template type' , 'type' => 'text'],
            'created_at' => ['label' => 'Created Date', 'type' => 'datetime']
        ];
        return $list_view_columns;
    }
}
