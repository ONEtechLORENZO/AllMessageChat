<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCampaignsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('status')->nullable();
            $table->string('service')->nullable();
            $table->longText('conditions')->nullable();
            $table->string('template_id')->nullable();
            $table->dateTime('scheduled_at')->nullable();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('current_page')->nullable();
            $table->string('account_id')->nullable();
            $table->integer('offset')->nullable();
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
        Schema::dropIfExists('campaigns');
    }
}
