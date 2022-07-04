<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMsgsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('msgs', function (Blueprint $table) {
            $table->id();
            $table->string('service_id');
            $table->string('service');
            $table->foreignId('account_id')->constrained('accounts');
            $table->text('message');
            $table->integer('msgable_id');
            $table->integer('receiver_id');
            $table->string('msgable_type');
            $table->string('msg_mode');
            $table->foreignId('parent_id')->nullable()->constrained('msgs');
            $table->string('template_id')->nullable();
            $table->string('status');
            $table->boolean('is_delivered');
            $table->boolean('is_read');
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
        Schema::dropIfExists('msgs');
    }
}
