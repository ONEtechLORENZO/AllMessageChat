<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSubscriptionPlan extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('plan')->nullable();
            $table->string('price')->nullable();
            $table->string('setup_workspace')->nullable();
            $table->string('monthly_workspace')->nullable();
            $table->string('accounts')->nullable();
            $table->string('users')->nullable();
            $table->string('include_users')->nullable();
            $table->string('extra_users')->nullable();
            $table->string('per_message')->nullable();
            $table->string('per_allegato')->nullable();
            $table->string('workflow')->nullable();
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
        Schema::dropIfExists('subscription_plan');
    }
}
