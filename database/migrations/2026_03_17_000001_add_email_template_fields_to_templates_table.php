<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->string('service')->nullable()->after('account_id');
            $table->longText('html_body')->nullable()->after('email_subject');
            $table->longText('text_body')->nullable()->after('html_body');
            $table->longText('sample_data')->nullable()->after('text_body');
        });
    }

    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropColumn([
                'service',
                'html_body',
                'text_body',
                'sample_data',
            ]);
        });
    }
};
