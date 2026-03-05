<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Field extends Model
{
    use HasFactory;

    protected $table = 'fields';

    protected $fillable = ['module_name', 'field_name', 'field_label', 'field_type', 'options', 'is_mandatory', 'is_custom', 'user_id', 'field_group','created_at', 'updated_at', 'readonly_on_edit'];


    /**
     * The attributes that should be cast.
     *
     * @param $casts array
     */
    protected $casts = [
        'options' => 'array',
    ];
}
