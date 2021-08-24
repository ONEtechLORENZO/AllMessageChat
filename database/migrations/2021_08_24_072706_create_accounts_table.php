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
            $table->string('company_type');
            $table->string('website');
            $table->string('email');
            $table->date('estimated_launch_date');
            $table->string('type_of_integration');
            $table->string('phone_number');
            $table->string('display_name');
            $table->string('business_manager_id');
            $table->string('profile_picture');
            $table->string('profile_description');
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
