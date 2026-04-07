<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiAgent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'key',
        'name',
        'tone_preset_key',
        'system_instructions',
        'model',
        'locale',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
