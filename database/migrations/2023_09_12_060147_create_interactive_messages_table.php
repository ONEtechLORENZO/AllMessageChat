<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Field;

class CreateInteractiveMessagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('interactive_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('is_active')->default(0);
            $table->longText('content');
            $table->string('option_type')->nullable();
            $table->longText('options')->nullable();
            $table->timestamps();

            $fields = [
                ['module_name' => 'InteractiveMessage', 'field_name' => 'name', 'field_label' => 'Name', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'field_group' =>'', 'sequence' => 1, 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''],
                ['module_name' => 'InteractiveMessage', 'field_name' => 'is_active', 'field_label' => 'Is Active', 'field_type' => 'checkbox', 'is_mandatory' => 0, 'is_custom' => 0, 'field_group' =>'', 'sequence' => 2,'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''],
                ['module_name' => 'InteractiveMessage', 'field_name' => 'option_type', 'field_label' => 'Template Type', 'field_type' => 'dropdown', 'is_mandatory' => 1, 'is_custom' => 0, 'field_group' =>'', 'sequence' => 3, 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' => json_encode(['quick_reply'=>'Reply Button', 'list_option'=>'Menu List'])], 
                ['module_name' => 'InteractiveMessage', 'field_name' => 'content', 'field_label' => 'Content', 'field_type' => 'textarea', 'is_mandatory' => 1, 'is_custom' => 0, 'field_group' =>'', 'sequence' => 4, 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''], 
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
        Schema::dropIfExists('interactive_messages');
    }
}
