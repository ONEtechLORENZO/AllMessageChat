<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOpportunitiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('opportunities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->float('amount', 14, 4)->nullable();                  
            $table->foreignId('contact_id')->constrained('contacts')->nullable();
            $table->date('expected_close_date')->nullable();
            $table->foreignId('assigned_to')->constrained('users')->nullable();
            $table->string('sales_stage')->nullable();
            $table->string('description')->nullable();
            $table->foreignId('company_id')->constrained('companies');    
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
        Schema::dropIfExists('opportunities');
    }
}
