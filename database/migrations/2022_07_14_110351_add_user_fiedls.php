<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddUserFiedls extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('company_name')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('language')->nullable();
            $table->string('currency')->nullable();
            $table->string('time_zone')->nullable();
            $table->text('company_address')->nullable();
            $table->string('company_country')->nullable();
            $table->string('company_vat_id')->nullable();
            $table->string('codice_destinatario')->nullable();
            $table->string('admin_email')->nullable();

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumns(['company_name', 'phone_number', 'language', 'currency']);
            $table->dropColumns(['time_zone', 'company_address', 'company_country', 'company_vat_id']);
            $table->dropColumns(['codice_destinatario', 'admin_email']);
        });
    }
}
