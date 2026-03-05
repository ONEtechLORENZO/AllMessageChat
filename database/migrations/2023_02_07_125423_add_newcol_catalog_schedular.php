<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddNewcolCatalogSchedular extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('catalog_schedulars', function (Blueprint $table) {
            $table->string('token_id')->nullable();
            $table->string('schedule')->nullable();
            $table->string('period')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('catalog_schedulars', function (Blueprint $table) {
            //
        });
    }
}
