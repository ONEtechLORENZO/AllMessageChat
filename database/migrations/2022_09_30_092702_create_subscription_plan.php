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
            $table->string('users')->nullable();
            $table->string('free_accounts')->nullable();
            $table->string('accounts')->nullable();
            $table->string('crm_leads')->nullable();
            $table->string('crm_contacts')->nullable();
            $table->string('crm_organizations')->nullable();
            $table->string('crm_deals')->nullable();
            $table->string('crm_custom_fields')->nullable();
            $table->string('campaigns')->nullable();
            $table->string('chat_conversation')->nullable();
            $table->string('workflows')->nullable();
            $table->string('workflow_operations')->nullable();
            $table->string('product_category')->nullable();
            $table->string('sale_orders')->nullable();
            $table->string('reports')->nullable();
            $table->string('active_users')->nullable();
            $table->string('api_conversation')->nullable();
            $table->string('api_module_access')->nullable();
            $table->string('api_product_order')->nullable();
            $table->string('default_plan')->default('false')->nullable();
            $table->string('plan_id')->nullable();

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
