<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatListContact extends Model
{
    use HasFactory;

    protected $casts = [
        'is_archive' => 'boolean',
        'unread' => 'boolean',
        'unread_count' => 'integer',
        'last_message_at' => 'datetime',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Msg::class, 'chat_list_contact_id');
    }

    public function lastMessage(): BelongsTo
    {
        return $this->belongsTo(Msg::class, 'last_msg_id');
    }
}
