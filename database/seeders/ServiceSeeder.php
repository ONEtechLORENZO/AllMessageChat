<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\DB;

use App\Models\Service;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        //

        DB::table('services')->insert([           
            
           ['name' => 'Whatsapp', 'unique_name' => 'Whatsapp'],
           ['name' => 'Instagram', 'unique_name' => 'Instagram'],

        ]);
    
        }
}
