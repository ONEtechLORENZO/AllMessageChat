<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Automation extends Model
{
    use HasFactory;

    /**
     * Return List view field
     */
    public function getListViewFields()
    {
        $list_view_columns = [
            'name' => ['label' => 'Name', 'type' => 'text'],
            'status' =>  ['label' => 'Status', 'type' => 'checkbox'],
            'created_at' =>  ['label' => 'Created Date', 'type' => 'date'],
        ];
        return $list_view_columns;
    }
}
