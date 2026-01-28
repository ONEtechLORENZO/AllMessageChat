<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddNewfieldPlans extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('plans', function (Blueprint $table) {

            // $table->string('plan')->nullable();
            // $table->string('price')->nullable();
            // $table->string('setup_workspace')->nullable();
            // $table->string('monthly_workspace')->nullable();
            // $table->string('accounts')->nullable();
            // $table->string('users')->nullable();
            // $table->string('include_users')->nullable();
            // $table->string('extra_users')->nullable();
            // $table->string('per_message')->nullable();
            // $table->string('per_allegato')->nullable();
            // $table->string('workflow')->nullable();

            // $table->string('target')->nullable();
            // $table->string('channels')->nullable();
            // $table->string('offical_whatsapp')->nullable();
            // $table->string('unoffical_whatsapp')->nullable();
            // $table->string('facebook')->nullable();
            // $table->string('crm_contacts')->nullable();
            // $table->string('chat_cost')->nullable();
            // $table->string('fatturazione')->nullable();
            // $table->string('contacts')->nullable();
            // $table->string('lists_tags')->nullable();
            // $table->string('custom_fields')->nullable();
            // $table->string('multichannel_chat')->nullable();
            // $table->string('campaigns')->nullable();
            // $table->string('opportunities')->nullable();
            // $table->string('category')->nullable();
            // $table->string('orders')->nullable();
            // $table->string('lead_webhook')->nullable();
            // $table->string('integrations')->nullable();
            // $table->string('api')->nullable();
            // $table->string('custom_integrations')->nullable();
            // $table->string('plan_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('plans', function (Blueprint $table) {
            //
        });
    }
}
