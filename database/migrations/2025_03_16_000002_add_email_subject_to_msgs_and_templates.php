<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('msgs', function (Blueprint $table) {
            // Stores the email subject for inbound/outbound email messages.
            $table->string('email_subject')->nullable()->after('is_read');
        });

        Schema::table('templates', function (Blueprint $table) {
            // Stores the default email subject for email-channel templates.
            $table->string('email_subject')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('msgs', function (Blueprint $table) {
            $table->dropColumn('email_subject');
        });

        Schema::table('templates', function (Blueprint $table) {
            $table->dropColumn('email_subject');
        });
    }
};
