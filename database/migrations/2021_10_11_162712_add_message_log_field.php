<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddMessageLogField extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('message_logs', function (Blueprint $table) {
            $table->string('destinations')->nullable();
            $table->string('user_id')->nullable();
            $table->string('refId')->nullable();
            $table->string('messageId')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('message_logs', function (Blueprint $table) {
            $table->dropColumn(['messageId' , 'user_id' , 'refId' , 'destinations']);
        });
    }
}
