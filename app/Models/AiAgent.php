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
        'assistant_id',
        'tone_preset_key',
        'system_instructions',
        'model',
        'locale',
        'openai_synced_at',
    ];

    protected $casts = [
        'openai_synced_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
