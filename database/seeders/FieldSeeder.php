<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\DB;

class FieldSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $current_datetime = gmdate('Y-m-d H:i:s');
        DB::table('fields')->insert([
            ['module_name' => 'Price', 'field_name' => 'country_code', 'field_label' => 'Country', 'field_type' => 'dropdown', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'created_at' => $current_datetime, 'updated_at' => $current_datetime],
            ['module_name' => 'Price', 'field_name' => 'user_initiated', 'field_label' => 'User Initiated', 'field_type' => 'amount', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'created_at' => $current_datetime, 'updated_at' => $current_datetime],
            ['module_name' => 'Price', 'field_name' => 'business_initiated', 'field_label' => 'Business Initiated', 'field_type' => 'amount', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'created_at' => $current_datetime, 'updated_at' => $current_datetime],
            ['module_name' => 'Price', 'field_name' => 'message', 'field_label' => 'Message', 'field_type' => 'amount', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'created_at' => $current_datetime, 'updated_at' => $current_datetime],
            ['module_name' => 'Price', 'field_name' => 'media', 'field_label' => 'Media', 'field_type' => 'amount', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'created_at' => $current_datetime, 'updated_at' => $current_datetime],
        ]);
    }
}
