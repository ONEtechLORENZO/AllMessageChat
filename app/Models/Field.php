<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Field extends Model
{
    use HasFactory;

    protected $table = 'fields';

    protected $fillable = ['module_name', 'field_name', 'field_label', 'field_type', 'is_mandatory', 'is_custom', 'user_id','created_at','updated_at'];
}
