<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMessageLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('message_logs', function (Blueprint $table) {
            $table->id();

            $table->integer('account_id')->nullable();
            $table->string('channel')->nullable();
            $table->mediumText('content')->nullable();
            $table->string('type')->nullable();
            $table->string('direction')->nullable();
            $table->string('sender')->nullable();
            $table->string('country')->nullable();
            $table->string('recipient')->nullable();
            $table->string('status')->nullable();

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
        Schema::dropIfExists('message_logs');
    }
}
