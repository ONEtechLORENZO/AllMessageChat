<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMessageButtonsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('message_buttons', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('message_id');
            $table->string('button_type')->nullable();
            $table->string('body')->nullable();
            $table->string('action')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('url_type')->nullable();
            $table->text('url')->nullable();
            $table->timestamps();
            $table->foreign('message_id')->references('id')->on('messages');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('message_buttons');
    }
}
