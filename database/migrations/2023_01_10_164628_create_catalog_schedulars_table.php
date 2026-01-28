<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCatalogSchedularsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('catalog_schedulars', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->longText('business_id')->nullable();
            $table->string('catalog_id')->nullable();
            $table->string('catalog_type')->nullable();
            $table->string('status')->nullable();
            $table->string('total_product')->default('0');
            $table->string('sync_count')->default('0');
            $table->longText('product_next_page_url')->nullable();
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
        Schema::dropIfExists('catalog_schedulars');
    }
}
