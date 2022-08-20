<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChatListContactsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('chat_list_contacts', function (Blueprint $table) {
            $table->id();

            $table->integer('contact_id')->nullable();
            $table->string('channel')->nullable();
            $table->boolean('is_archive')->nullable();
            $table->integer('user_id')->nullable();
            $table->boolean('unread')->nullable();

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
        Schema::dropIfExists('chat_list_contacts');
    }
}
