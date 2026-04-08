<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('ai_agents', 'user_id')) {
            return;
        }

        $indexes = collect(DB::select('SHOW INDEX FROM ai_agents'))
            ->pluck('Key_name')
            ->unique()
            ->values()
            ->all();

        if (in_array('ai_agents_user_id_foreign', $indexes, true)) {
            Schema::table('ai_agents', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
        }

        if (in_array('ai_agents_user_id_created_at_index', $indexes, true)) {
            Schema::table('ai_agents', function (Blueprint $table) {
                $table->dropIndex('ai_agents_user_id_created_at_index');
            });
        }

        if (in_array('ai_agents_user_id_name_index', $indexes, true)) {
            Schema::table('ai_agents', function (Blueprint $table) {
                $table->dropIndex('ai_agents_user_id_name_index');
            });
        }

        Schema::table('ai_agents', function (Blueprint $table) {
            $table->dropColumn('user_id');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('ai_agents', 'user_id')) {
            return;
        }

        Schema::table('ai_agents', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'name']);
        });
    }
};
