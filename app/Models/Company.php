<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    /**
     * The user that belong to the user.
     */
    public function user()
    {
        return $this->belongsToMany(User::class);
    }
}
