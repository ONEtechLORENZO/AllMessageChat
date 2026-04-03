<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            if (! Schema::hasColumn('accounts', 'instagram_initial_sync_started_at')) {
                $table->dateTime('instagram_initial_sync_started_at')->nullable()->after('instagram_token_last_refreshed_at');
            }

            if (! Schema::hasColumn('accounts', 'instagram_initial_sync_completed_at')) {
                $table->dateTime('instagram_initial_sync_completed_at')->nullable()->after('instagram_initial_sync_started_at');
            }

            if (! Schema::hasColumn('accounts', 'instagram_initial_sync_error')) {
                $table->text('instagram_initial_sync_error')->nullable()->after('instagram_initial_sync_completed_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            foreach ([
                'instagram_initial_sync_started_at',
                'instagram_initial_sync_completed_at',
                'instagram_initial_sync_error',
            ] as $column) {
                if (Schema::hasColumn('accounts', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
