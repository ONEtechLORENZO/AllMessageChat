<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FieldGroup extends Model
{
    use HasFactory;
    protected $table = 'field_groups';

    protected $fillable = ['name', 'module_name','company_id','created_by'];
}
