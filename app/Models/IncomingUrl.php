<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncomingUrl extends Model
{
    use HasFactory;
        protected $casts = [
        'incoming_url' => 'array',
    ];

    
}
