<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMessageResponsesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('message_responses', function (Blueprint $table) {
            $table->id();
            
            $table->string('message_id')->nullable();
            $table->string('ref_id')->nullable();
            $table->string('type')->nullable();
            $table->longText('response')->nullable();

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
        Schema::dropIfExists('message_responses');
    }
}
