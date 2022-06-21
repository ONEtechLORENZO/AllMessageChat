<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWebhookEventsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('webhook_events', function (Blueprint $table) {
            $table->id();
            $table->boolean('enqueued');
            $table->boolean('failed');
            $table->boolean('read');
            $table->boolean('sent');
            $table->boolean('delivered');
            $table->boolean('delete');
            $table->boolean('template_events');
            $table->boolean('account_related_events');
            $table->string('callback_url')->nullable();
            $table->foreignId('account_id')->constrained('accounts');
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
        Schema::dropIfExists('webhook_events');
    }
}
