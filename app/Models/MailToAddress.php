<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MailToAddress extends Model
{
    use HasFactory;
    protected $fillable = [ 'to_email' , 'to_name' , 'user_id'];
}
