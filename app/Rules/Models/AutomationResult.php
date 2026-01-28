<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AutomationResult extends Model
{
    use HasFactory;
    protected $fillable = ['automation_id', 'bean_id', 'flow', 'status'];

}
