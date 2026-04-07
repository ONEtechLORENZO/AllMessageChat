<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('msgs', function (Blueprint $table) {
            $table->unsignedBigInteger('interactive_message_id')->nullable()->after('template_id');
            $table->index('interactive_message_id');
        });

        DB::table('msgs')
            ->where('msg_type', 'interactive')
            ->whereNull('interactive_message_id')
            ->whereNotNull('template_id')
            ->where('template_id', '!=', '')
            ->update([
                'interactive_message_id' => DB::raw('CAST(template_id AS UNSIGNED)'),
            ]);
    }

    public function down(): void
    {
        Schema::table('msgs', function (Blueprint $table) {
            $table->dropIndex(['interactive_message_id']);
            $table->dropColumn('interactive_message_id');
        });
    }
};
