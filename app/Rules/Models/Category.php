<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Contact;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];
    
    public function contact()
    {
        return $this->morphToMany(Contact::class, 'categorables');
    }
}
