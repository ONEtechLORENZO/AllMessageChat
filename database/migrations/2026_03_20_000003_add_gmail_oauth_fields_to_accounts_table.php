<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->string('google_provider_user_id')->nullable()->after('email');
            $table->text('oauth_access_token_encrypted')->nullable()->after('google_provider_user_id');
            $table->text('oauth_refresh_token_encrypted')->nullable()->after('oauth_access_token_encrypted');
            $table->timestamp('oauth_token_expires_at')->nullable()->after('oauth_refresh_token_encrypted');
            $table->text('oauth_scope')->nullable()->after('oauth_token_expires_at');
            $table->string('sync_last_history_id')->nullable()->after('oauth_scope');
            $table->timestamp('sync_last_at')->nullable()->after('sync_last_history_id');
            $table->timestamp('gmail_watch_expires_at')->nullable()->after('sync_last_at');
            $table->json('connection_metadata')->nullable()->after('gmail_watch_expires_at');

            $table->index(['service', 'service_engine'], 'accounts_service_engine_index');
            $table->index(['user_id', 'google_provider_user_id'], 'accounts_user_google_provider_index');
        });
    }

    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropIndex('accounts_service_engine_index');
            $table->dropIndex('accounts_user_google_provider_index');
            $table->dropColumn([
                'google_provider_user_id',
                'oauth_access_token_encrypted',
                'oauth_refresh_token_encrypted',
                'oauth_token_expires_at',
                'oauth_scope',
                'sync_last_history_id',
                'sync_last_at',
                'gmail_watch_expires_at',
                'connection_metadata',
            ]);
        });
    }
};
