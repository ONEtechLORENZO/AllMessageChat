<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAccountsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('service');
            $table->string('phone_number')->nullable();
            $table->string('display_name')->nullable();
            $table->string('business_manager_id')->nullable();
            $table->string('status');
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('company_id')->constrained('companies');            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('accounts');
    }
}
