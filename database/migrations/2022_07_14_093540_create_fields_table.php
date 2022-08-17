<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFieldsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('fields', function (Blueprint $table) {
            $table->id();
            $table->string('module_name')->nullable();
            $table->string('field_name')->nullable();
            $table->string('field_label')->nullable();
            $table->string('field_type')->nullable();
            $table->boolean('is_mandatory')->nullable();
            $table->boolean('is_custom')->nullable();
            $table->foreignId('user_id')->constrained('users');
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
        Schema::dropIfExists('fields');
    }
}
