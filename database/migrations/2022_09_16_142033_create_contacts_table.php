<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateContactsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('country_code')->nullable();
            $table->string('gender')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('languages_spoken')->nullable();
            $table->string('status')->nullable();
            $table->string('lists')->nullable();
            $table->string('tags')->nullable();             
            $table->string('organization_role')->nullable();

            $table->foreignId('assigned_to')->nullable()->constrained('users');  
            $table->foreignId('organization_id')->nullable()->constrained('organizations');
            $table->foreignId('creater_id')->constrained('users'); 

            $table->LONGTEXT('custom')->nullable();
            
            //contact_info
            $table->string('whatsapp_number')->nullable();
            $table->string('telegram_number')->nullable();
            $table->string('facebook_username')->nullable();
            $table->string('instagram_username')->nullable();
            $table->string('tiktok_username')->nullable();
            $table->string('linkedin_username')->nullable();
            $table->string('personal_website')->nullable();
            //address_info
            $table->string('country')->nullable();
            $table->string('state')->nullable();
            $table->string('city')->nullable();
            $table->string('street')->nullable();
            $table->string('zip_code')->nullable();
            //source info
            $table->string('origin')->nullable();
            $table->string('source')->nullable();
            $table->string('medium')->nullable();
            $table->string('campaign')->nullable();
            $table->string('content')->nullable();
            $table->string('term')->nullable();

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
        Schema::dropIfExists('contacts');
    }
}