<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Msg;

class Contact extends Model
{
    use HasFactory;

    public function messages()
    {
        return $this->morphMany( Msg::class, 'msgable');
    }
}
