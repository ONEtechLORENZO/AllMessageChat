<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->longText('payload_json')->nullable()->after('sample_data');
            $table->longText('variables_json')->nullable()->after('payload_json');
            $table->boolean('is_active')->default(true)->after('variables_json');
        });
    }

    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropColumn([
                'payload_json',
                'variables_json',
                'is_active',
            ]);
        });
    }
};
