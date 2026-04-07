<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_agents', function (Blueprint $table) {
            $table->string('assistant_id', 120)->nullable()->after('name');
            $table->timestamp('openai_synced_at')->nullable()->after('locale');

            $table->index('assistant_id');
        });
    }

    public function down(): void
    {
        Schema::table('ai_agents', function (Blueprint $table) {
            $table->dropIndex(['assistant_id']);
            $table->dropColumn(['assistant_id', 'openai_synced_at']);
        });
    }
};
