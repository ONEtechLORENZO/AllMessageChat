<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            if (! Schema::hasColumn('accounts', 'connection_model')) {
                $table->string('connection_model')->nullable()->after('meta_provider');
            }

            if (! Schema::hasColumn('accounts', 'requires_reconnect')) {
                $table->boolean('requires_reconnect')->default(false)->after('connection_error');
            }

            if (! Schema::hasColumn('accounts', 'instagram_app_scoped_user_id')) {
                $table->string('instagram_app_scoped_user_id')->nullable()->after('instagram_account_id');
            }

            if (! Schema::hasColumn('accounts', 'instagram_user_access_token_encrypted')) {
                $table->text('instagram_user_access_token_encrypted')->nullable()->after('instagram_meta_data');
            }

            if (! Schema::hasColumn('accounts', 'instagram_token_expires_at')) {
                $table->dateTime('instagram_token_expires_at')->nullable()->after('instagram_user_access_token_encrypted');
            }

            if (! Schema::hasColumn('accounts', 'instagram_refresh_metadata')) {
                $table->json('instagram_refresh_metadata')->nullable()->after('instagram_token_expires_at');
            }

            if (! Schema::hasColumn('accounts', 'instagram_token_last_refreshed_at')) {
                $table->dateTime('instagram_token_last_refreshed_at')->nullable()->after('instagram_refresh_metadata');
            }
        });

        DB::table('accounts')
            ->where('service', 'instagram')
            ->whereNull('connection_model')
            ->update([
                'meta_provider' => 'instagram',
                'connection_model' => 'legacy_page_linked',
                'requires_reconnect' => true,
            ]);

        DB::table('accounts')
            ->where('service', 'instagram')
            ->where('connection_model', 'legacy_page_linked')
            ->whereNull('instagram_account_id')
            ->update([
                'connection_status' => 'needs_instagram',
                'setup_state' => 'incomplete',
                'connection_error' => 'Legacy page-linked Instagram connection. Reconnect to upgrade.',
                'status' => 'Draft',
            ]);

        DB::table('accounts')
            ->where('service', 'instagram')
            ->where('connection_model', 'legacy_page_linked')
            ->whereNotNull('instagram_account_id')
            ->update([
                'connection_status' => DB::raw("COALESCE(connection_status, 'connected')"),
                'setup_state' => DB::raw("COALESCE(setup_state, 'complete')"),
            ]);
    }

    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            foreach ([
                'connection_model',
                'requires_reconnect',
                'instagram_app_scoped_user_id',
                'instagram_user_access_token_encrypted',
                'instagram_token_expires_at',
                'instagram_refresh_metadata',
                'instagram_token_last_refreshed_at',
            ] as $column) {
                if (Schema::hasColumn('accounts', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
