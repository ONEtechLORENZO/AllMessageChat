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
            $table->string('company_type')->nullable();
            $table->string('website')->nullable();
            $table->string('email')->nullable();
            $table->date('estimated_launch_date')->nullable();
            $table->string('type_of_integration')->nullable();
            $table->string('service');
            $table->string('phone_number')->nullable();
            $table->string('display_name')->nullable();
            $table->string('business_manager_id')->nullable();
            $table->string('profile_picture')->nullable();
            $table->string('profile_description')->nullable();
            $table->boolean('oba');
            $table->string('status');
            $table->foreignId('user_id')->constrained('users');
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
