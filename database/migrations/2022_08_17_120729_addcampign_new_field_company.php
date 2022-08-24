<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddcampignNewFieldCompany extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('campigns', function (Blueprint $table) {
            $table->foreignId('company_id')->constrained('companies');
            $table->string('current_page')->nullable();
            $table->string('account_id')->nullable();
            $table->integer('offset')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('campigns', function (Blueprint $table) {
            //
        });
    }
}
