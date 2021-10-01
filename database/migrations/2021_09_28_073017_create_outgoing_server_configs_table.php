<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOutgoingServerConfigsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('outgoing_server_configs', function (Blueprint $table) {
            $table->id();
            
            $table->integer('user_id')->nullable();
            $table->string('from_name')->nullable();
            $table->string('from_email')->nullable();
            $table->string('driver')->nullable();
            $table->string('server_name')->nullable();
            $table->string('port_type')->nullable();
            $table->string('port_num')->nullable();
            $table->string('user_name')->nullable();
            $table->longText('password')->nullable();

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
        Schema::dropIfExists('outgoing_server_configs');
    }
}
