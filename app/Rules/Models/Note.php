<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Contact;
use App\Models\Lead;
use App\Models\SupportRequest;

class Note extends Model
{
    use HasFactory;
    public function notable()
    {
        return $this->morphTo();
    }
}
