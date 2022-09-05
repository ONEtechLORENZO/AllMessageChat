<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'status', 'service', 'conditions', 'action', 'scheduled_at', 'created_at', 'updated_at','company_id', 'current_page', 'account_id', 'offset'];

}
