<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSupportrequestsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('supportrequests', function (Blueprint $table) {
            $table->id();            
            $table->string('subject');
            $table->string('description');
            $table->string('status');
            $table->string('type');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('company_id')->constrained('companies'); 
            $table->foreignId('assigned_to')->constrained('users');
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
        Schema::dropIfExists('supportrequests');
    }
}
