<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FaceBookAppToken extends Model
{
    use HasFactory;

    protected $casts = [
        'business_name' => 'array'
    ];
}
