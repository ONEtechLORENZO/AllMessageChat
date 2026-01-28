<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserInvite extends Model
{
    use HasFactory;
    protected $fillable = [
        'email',
        'user_id',
        'company_id',
        'unique_id'
    ];
}
