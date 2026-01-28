<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Catalog extends Model
{
    use HasFactory;

    protected $casts = [
        'business_id' => 'array',
    ];

    protected $with = ['products'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
