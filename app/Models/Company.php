<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'address_line_1', 'address_line_2', 'city', 'state', 'country'];

    /**
     * The user that belong to the user.
     */
    public function user()
    {
        return $this->belongsToMany(User::class);
    }
}
