<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    /**
     * Return list view fields
     */
    public function getListViewFields()
    {
        $list_view_columns = [
            'name' => ['label' => 'Role name', 'type' => 'text'],
            'description' =>  ['label' => 'Description', 'type' => 'textarea'],
        ];
        return $list_view_columns;
    }
}
