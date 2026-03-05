<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFaceBookAppTokensTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('face_book_app_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('user_id')->nullable();
            $table->longText('token')->nullable();
            $table->longText('business_name')->nullable();
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
        Schema::dropIfExists('face_book_app_tokens');
    }
}
