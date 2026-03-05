<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Field;

class AddLeadTableNewFields extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->string('name');
            $table->float('amount', 14, 4)->nullable();                
            $table->foreignId('contact_id')->nullable()->constrained('contacts');
            $table->date('expected_close_date')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->string('sales_stage')->nullable();
            $table->string('description')->nullable();

            $fields = [
                [ 'module_name' => 'Lead','field_name' => 'name' ,'field_label' =>'Lead Name','field_type' => 'text','is_mandatory' => 1,'is_custom' => 0, 'field_group' =>'','created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>'' ],
                [ 'module_name' => 'Lead','field_name' => 'amount' ,'field_label' =>'Amount','field_type' => 'amount','is_mandatory' => 0,'is_custom' => 0,'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>'' ],
                [ 'module_name' => 'Lead','field_name' => 'expected_close_date' ,'field_label' =>'Expected Close Date','field_type' => 'date','is_mandatory' => 0,'is_custom' => 0, 'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>'' ],
                [ 'module_name' => 'Lead', 'field_name' => 'contact_id' ,'field_label' =>'Contact','field_type' => 'relate','is_mandatory' => 0,'is_custom' => 0, 'field_group' =>'','created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' => json_encode(['module' => 'Contact'])],
                [ 'module_name' => 'Lead','field_name' => 'assigned_to' ,'field_label' =>'Assigned to','field_type' => 'relate','is_mandatory' => 0,'is_custom' => 0,'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' => json_encode(['module' => 'User']), ],
                [ 'module_name' => 'Lead','field_name' => 'sales_stage','field_label' => 'Sales Stage','field_type' => 'dropdown','is_mandatory' => 0,'is_custom' => 0, 'field_group' =>'','created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' => json_encode(['prospecting'=>'Prospecting', 'qualification'=>'Qualification','need_analysis'=>'Need Analysis','closed_won'=>'Closed Won','closed_lost'=>'Closed Lost']) ],
                [ 'module_name' => 'Lead','field_name' => 'description' ,'field_label' =>'Description','field_type' => 'textarea','is_mandatory' => 0,'is_custom' => 0, 'field_group' =>'','created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>'' ],
            ];

            Field::insert($fields);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('leads', function (Blueprint $table) {
            //
        });
    }
}
