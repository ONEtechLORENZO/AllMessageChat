<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Contact;

class Service extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'unique_name','id'];
    public function contacts()
    {
        return $this->morphToMany(Contact::class, 'serviceable');
    }

}
