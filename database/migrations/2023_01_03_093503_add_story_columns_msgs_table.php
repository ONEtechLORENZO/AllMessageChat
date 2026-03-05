<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStoryColumnsMsgsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('msgs', function (Blueprint $table) {
            $table->boolean('is_reply')->nullable();
            $table->boolean('is_mention')->nullable();
            $table->boolean('is_expired')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('msgs', function (Blueprint $table) {
            $table->dropColumn(['is_reply', 'is_mention', 'is_expired']);
        });
    }
}
