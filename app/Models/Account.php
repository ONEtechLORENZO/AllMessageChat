<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    use HasFactory;

    protected $casts = [
        'oauth_access_token_encrypted' => 'encrypted',
        'oauth_refresh_token_encrypted' => 'encrypted',
        'oauth_token_expires_at' => 'datetime',
        'instagram_user_access_token_encrypted' => 'encrypted',
        'instagram_token_expires_at' => 'datetime',
        'instagram_token_last_refreshed_at' => 'datetime',
        'sync_last_at' => 'datetime',
        'gmail_watch_expires_at' => 'datetime',
        'connection_metadata' => 'array',
        'instagram_meta_data' => 'array',
        'instagram_refresh_metadata' => 'array',
        'requires_reconnect' => 'boolean',
        'api_partner' => 'boolean',
    ];

    protected $hidden = [
        'service_token',
        'fb_token',
        'page_token',
        'meta_page_token',
        'oauth_access_token_encrypted',
        'oauth_refresh_token_encrypted',
        'instagram_user_access_token_encrypted',
    ];

    /**
     * Create new bot in Gupshup
     * 
     * @param object $account
     */
    public static function creatNewBot($account)
    {
        
    }

    public function chatThreads(): HasMany
    {
        return $this->hasMany(ChatListContact::class);
    }
}
