<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFbMetaDataFields extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->longText('fb_meta_data')->nullable();
            $table->string('fb_user_id')->nullable();
            $table->string('fb_business_name')->nullable();
            $table->string('fb_waba_name')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropColumn(['fb_meta_data', 'fb_user_id' , 'fb_business_name', 'fb_waba_name']);
        });
    }
}
