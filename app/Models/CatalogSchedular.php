<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatalogSchedular extends Model
{
    use HasFactory;

    protected $casts = [
        'business_id' => 'array',
        'fb_mapping_fields' => 'array'
    ];
}
