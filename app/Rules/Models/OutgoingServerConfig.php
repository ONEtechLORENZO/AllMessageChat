<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OutgoingServerConfig extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'from_name',
        'from_email',
        'server_name',
        'driver',
        'port_type',
        'port_num',
        'user_name',
        'password'
    ];
}
