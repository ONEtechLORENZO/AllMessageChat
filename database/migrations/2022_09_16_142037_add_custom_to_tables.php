<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddCustomToTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $tables=['opportunities','products','orders'];  
    for($i=0;$i<count($tables);$i++){
        Schema::table($tables[$i], function (Blueprint $table) {
            $table->longtext('custom')->nullable();            
        });
    }


    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        $tables=['opportunities','products','orders'];  
        for($i=0;$i<count($tables);$i++){
            Schema::table($tables[$i], function (Blueprint $table) {
                $table->dropColumn('custom');            
            });
        }
    }
}
