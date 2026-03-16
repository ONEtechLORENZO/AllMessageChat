<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->string('smtp_host')->nullable()->after('fb_waba_name');
            $table->string('smtp_port')->nullable()->after('smtp_host');
            // tls | ssl | none
            $table->string('smtp_encryption')->nullable()->after('smtp_port');
        });
    }

    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropColumn(['smtp_host', 'smtp_port', 'smtp_encryption']);
        });
    }
};
