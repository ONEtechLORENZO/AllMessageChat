<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateImportsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('imports', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('module_name')->nullale();
            $table->string('file_path')->nullable();
            $table->string('status')->nullable();
            $table->text('mapping')->nullable();
            $table->integer('total_records');
            $table->integer('imported_records');
            $table->string('error_message');
            $table->integer('offset');
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
        Schema::dropIfExists('imports');
    }
}
