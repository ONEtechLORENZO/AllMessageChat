<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Field;
use App\Models\FieldGroup;

class AlterLeadTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropForeign('leads_organization_id_foreign');
            $table->dropForeign('leads_assigned_to_foreign');
            $table->dropForeign('leads_creater_id_foreign');

            $table->dropColumn(['first_name', 'last_name', 'email', 'phone_number', 
                'gender', 'birth_date', 'languages_spoken', 'organization_role', 'organization_id', 
                'creater_id', 'custom', 'whatsapp_number', 'telegram_number',  'assigned_to', 
                'facebook_username', 'instagram_username', 'tiktok_username', 
                'linkedin_username', 'personal_website', 'country', 'state', 'city', 
                'street', 'zip_code', 'origin', 'source', 'medium', 'campaign', 'content', 'term'
            ]);

            Field::where('module_name', 'Lead')->delete();
            FieldGroup::where('module_name', 'Lead')->delete();
            
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
