<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\DB;

use App\Models\Field;

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
        $countryCodes = $this->getCountryCodeJson();
        $country = $this->getCountryJson();

        $moduleOptions = $this->getModuleName();
        $fieldTypes = $this->getFieldType();
        $msgMode = $this->getMessageMode();

        $billing_period = $this->getBillingPeriod();
        $price_model = $this->getPriceModel();
        $stripeCurrency = $this->currencyType();
        $timeZone = $this->timeZone();

        $this->createField('Price', 'country_code', 'Country', 'dropdown', '1', $countryCodes, 'false');
        $this->createField('Field', 'module_name', 'Module Name', 'dropdown', '1', $moduleOptions, 'true');
        $this->createField('Field', 'field_type', 'Field Type', 'dropdown', '1', $fieldTypes, 'true');
        $this->createField('Message', 'msg_mode', 'Mode', 'dropdown', '1', $msgMode, 'true');
        $this->createField('Plan', 'billing_period', 'Billing Period', 'dropdown', '1', $billing_period, 'true', '4');
        $this->createField('Plan', 'pricing_model', 'Price Model', 'dropdown', '1', $price_model, 'true', '5');
        $this->createField('Plan', 'currency', 'Currency Type', 'dropdown', '1', $stripeCurrency, 'true', '6');

        $this->createField('Company', 'company_country', 'Company Country', 'dropdown', '0', $country, 'false', 10);
        $this->createField('Company', 'currency', 'Currency', 'dropdown', '0', $stripeCurrency, 'false',11);
        $this->createField('Company', 'time_zone', 'Time zone', 'dropdown', '0', $timeZone, 'false',12);

        // Add Service entries
        DB::table('services')->insert([
            ['name' => 'Whatsapp', 'unique_name' => 'Whatsapp'],
            ['name' => 'Instagram', 'unique_name' => 'Instagram'],
        ]);

        DB::table('fields')->insert([
            
            //Price
            ['module_name' => 'Price', 'field_name' => 'user_initiated', 'field_label' => 'User Initiated', 'field_type' => 'amount', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],
            ['module_name' => 'Price', 'field_name' => 'business_initiated', 'field_label' => 'Business Initiated', 'field_type' => 'amount', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],
            ['module_name' => 'Price', 'field_name' => 'message', 'field_label' => 'Message', 'field_type' => 'amount', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],
            ['module_name' => 'Price', 'field_name' => 'media', 'field_label' => 'Media', 'field_type' => 'amount', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],
            ['module_name' => 'Price', 'field_name' => 'is_default', 'field_label' => 'Is default?', 'field_type' => 'checkbox', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],

            // Tag
            ['module_name' => 'Tag', 'field_name' => 'name', 'field_label' => 'Name', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],
            ['module_name' => 'Tag', 'field_name' => 'description', 'field_label' => 'Description', 'field_type' => 'textarea', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],
            
            // Category
            ['module_name' => 'Category', 'field_name' => 'name', 'field_label' => 'Name', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],
            ['module_name' => 'Category', 'field_name' => 'description', 'field_label' => 'Description', 'field_type' => 'textarea', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],
            
            // Field
            ['module_name' => 'Field', 'field_name' => 'field_label', 'field_label' => 'Field Label', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],
            ['module_name' => 'Field', 'field_name' => 'field_group', 'field_label' => 'Field Group', 'field_type' => 'dropdown', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],
            ['module_name' => 'Field', 'field_name' => 'is_mandatory', 'field_label' => 'Mandatory', 'field_type' => 'checkbox', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],
            ['module_name' => 'Field', 'field_name' => 'mass_edit', 'field_label' => 'Mass edit', 'field_type' => 'checkbox', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],

            // Company
            ['module_name' => 'Company', 'field_name' => 'name', 'field_label' => 'Name', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],
            ['module_name' => 'Company', 'field_name' => 'address_line_1', 'field_label' => 'Address Line 1', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '2'],
            ['module_name' => 'Company', 'field_name' => 'address_line_2', 'field_label' => 'Address Line 2', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '3'],
            ['module_name' => 'Company', 'field_name' => 'city', 'field_label' => 'City', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '4'],
            ['module_name' => 'Company', 'field_name' => 'state', 'field_label' => 'State', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '5'],
            ['module_name' => 'Company', 'field_name' => 'country', 'field_label' => 'Country', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '6'], 
            ['module_name' => 'Company', 'field_name' => 'status', 'field_label' => 'Status', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '7'],
            ['module_name' => 'Company', 'field_name' => 'company_address', 'field_label' => 'Company Address', 'field_type' => 'textarea', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '8'],
            ['module_name' => 'Company', 'field_name' => 'company_vat_id', 'field_label' => 'Company VAT ID', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '13'],
            ['module_name' => 'Company', 'field_name' => 'email', 'field_label' => 'Admin email for invoices', 'field_type' => 'email', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '9'], 
            ['module_name' => 'Company', 'field_name' => 'codice_destinatario', 'field_label' => 'Company Codice Destinatario', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '14'],

            // Campaign
            ['module_name' => 'Campaign', 'field_name' => 'name', 'field_label' => 'Name', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'sequence' => '1'],

            // LineItem
            ['module_name' => 'LineItem', 'field_name' => 'quantity', 'field_label' => 'Quantity', 'field_type' => 'number', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],
            ['module_name' => 'LineItem', 'field_name' => 'price', 'field_label' => 'Price', 'field_type' => 'amount', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],
            ['module_name' => 'LineItem', 'field_name' => 'total_amount', 'field_label' => 'Amount', 'field_type' => 'amount', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],
            ['module_name' => 'LineItem', 'field_name' => 'sequence', 'field_label' => 'Sequence', 'field_type' => 'number', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],
            ['module_name' => 'LineItem', 'field_name' => 'description', 'field_label' => 'Description', 'field_type' => 'textarea', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],

            // Automation
            ['module_name' => 'Automation', 'field_name' => 'name', 'field_label' => 'Name', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],
            ['module_name' => 'Automation', 'field_name' => 'status', 'field_label' => 'Status', 'field_type' => 'checkbox', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],

            // Msg 
            ['module_name' => 'Message', 'field_name' => 'message', 'field_label' => 'Content', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'sequence' => '1'],
            
            // Documennt
            ['module_name' => 'Document', 'field_name' => 'title', 'field_label' => 'Title', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'true', 'sequence' => '1'],
            ['module_name' => 'Document', 'field_name' => 'type', 'field_label' => 'Type', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'true', 'sequence' => '1'],
            ['module_name' => 'Document', 'field_name' => 'size', 'field_label' => 'Size', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'true', 'sequence' => '1'],

            //Plans
            ['module_name' => 'Plan', 'field_name' => 'name', 'field_label' => 'Name', 'field_type' => 'text', 'sequence' => '1','is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false'],
            ['module_name' => 'Plan', 'field_name' => 'description', 'field_label' => 'Description', 'field_type' => 'textarea', 'sequence' => '2', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false'],
            ['module_name' => 'Plan', 'field_name' => 'amount', 'field_label' => 'Amount', 'field_type' => 'number', 'sequence' => '3', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => 1, 'company_id' => 1,  'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'true'],
        ]);

        // DB::table('plans')->insert([
            
        //     // Subscription plan entires
        //     ['plan' => 'lite', 'price' => '0','target' => 'Freelance', 'setup_workspace' => '0', 'monthly_workspace' => '0' ,'channels' => 'Whatsapp, Instagram, Facebook', 'accounts' => '1', 'offical_whatsapp' => '0', 'unoffical_whatsapp' => '45', 'facebook' => '0', 'users' => '1', 'include_users' => '1', 'extra_users' => '-', 'crm_contacts' => 'infinite','chat_cost' => 'Different from Country to Country','per_message' => '0.0017', 'per_allegato' => '0.0027', 'fatturazione' => 'Prepagato', 'contacts' => 'true', 'lists_tags' => 'true', 'custom_fields' => 'true', 'multichannel_chat' => 'true', 'campaigns' => 'true', 'workflow' => 'false', 'opportunities' => 'false', 'category' => 'false','orders' => 'false', 'lead_webhook' => 'false', 'integrations' => 'false', 'api' => 'false', 'custom_integrations'=>'false', 'created_at' => $current_datetime, 'updated_at' => $current_datetime ], 
        //     ['plan' => 'pro', 'price' => '49','target' => 'Small business', 'setup_workspace' => '49', 'monthly_workspace' => '49' ,'channels' => 'Whatsapp, Instagram, Facebook', 'accounts' => '2', 'offical_whatsapp' => '0', 'unoffical_whatsapp' => '45', 'facebook' => '0', 'users' => '10', 'include_users' => '3', 'extra_users' => '5', 'crm_contacts' => 'infinite','chat_cost' => 'Different from Country to Country','per_message' => '0.0017', 'per_allegato' => '0.0027', 'fatturazione' => 'Prepagato', 'contacts' => 'true', 'lists_tags' => 'true', 'custom_fields' => 'true', 'multichannel_chat' => 'true', 'campaigns' => 'true', 'workflow' => '10000', 'opportunities' => 'true', 'category' => 'true','orders' => 'true', 'lead_webhook' => 'true', 'integrations' => 'true', 'api' => 'false', 'custom_integrations'=>'false', 'created_at' => $current_datetime, 'updated_at' => $current_datetime ], 
        //     ['plan' => 'business', 'price' => '99','target' => 'Medium Business', 'setup_workspace' => '99', 'monthly_workspace' => '99' ,'channels' => 'Whatsapp, Instagram, Facebook', 'accounts' => '3', 'offical_whatsapp' => '0', 'unoffical_whatsapp' => '45', 'facebook' => '0', 'users' => '25', 'include_users' => '5', 'extra_users' => '5', 'crm_contacts' => 'infinite','chat_cost' => 'Different from Country to Country','per_message' => '0.0017', 'per_allegato' => '0.0027', 'fatturazione' => 'Prepagato', 'contacts' => 'true', 'lists_tags' => 'true', 'custom_fields' => 'true', 'multichannel_chat' => 'true', 'campaigns' => 'true', 'workflow' => '25000', 'opportunities' => 'true', 'category' => 'true','orders' => 'true', 'lead_webhook' => 'true', 'integrations' => 'true', 'api' => 'false', 'custom_integrations'=>'false', 'created_at' => $current_datetime, 'updated_at' => $current_datetime ], 
        //     ['plan' => 'enterprise', 'price' => 'Custom','target' => 'Large Business', 'setup_workspace' => '350€/Max 10.000 messages month 500€ /max 25.000 messages month', 'monthly_workspace' => '350€/Max 10.000 messages month 500€ /max 25.000 messages month' ,'channels' => 'Whatsapp, Instagram, Facebook, Custom', 'accounts' => 'Custom', 'offical_whatsapp' => '0', 'unoffical_whatsapp' => 'NO', 'facebook' => '0', 'users' => 'Custom', 'include_users' => 'Custom', 'extra_users' => 'Custom', 'crm_contacts' => 'infinite','chat_cost' => 'Different from Country to Country','per_message' => 'Custom', 'per_allegato' => 'Custom', 'fatturazione' => 'Postpagato', 'contacts' => 'true', 'lists_tags' => 'true', 'custom_fields' => 'true', 'multichannel_chat' => 'true', 'campaigns' => 'true', 'workflow' => 'true', 'opportunities' => 'true', 'category' => 'true','orders' => 'true', 'lead_webhook' => 'true', 'integrations' => 'true', 'api' => 'true', 'custom_integrations'=>'true', 'created_at' => $current_datetime, 'updated_at' => $current_datetime ], 
        // ]);
    }

    /**
     * Retrun message mode
     */
    public function getMessageMode()
    {
        $msgMode = ['Incoming' => 'Incoming', 'Outgoing' => 'Outgoing'];
        return $msgMode;
    }

    /**
     * Return country code json
     */
    public function getCountryCodeJson()
    {
        $countryCode = array(
            '93' => 'Afghanistan',
            '358' => 'Finland',
            '355' => 'Albania',
            '213' => 'Algeria',
            '1684' => 'AmericanSamoa',
            '376' => 'Andorra',
            '244' => 'Angola',
            '1264' => 'Anguilla',
            '672' => 'Norfolk Island',
            '1268' => 'Antigua and Barbuda',
            '54' => 'Argentina',
            '374' => 'Armenia',
            '297' => 'Aruba',
            '61' => 'Cocos (Keeling) Islands',
            '43' => 'Austria',
            '994' => 'Azerbaijan',
            '1242' => 'Bahamas',
            '973' => 'Bahrain',
            '880' => 'Bangladesh',
            '1246' => 'Barbados',
            '375' => 'Belarus',
            '32' => 'Belgium',
            '501' => 'Belize',
            '229' => 'Benin',
            '1441' => 'Bermuda',
            '975' => 'Bhutan',
            '591' => 'Bolivia, Plurinational State of',
            '387' => 'Bosnia and Herzegovina',
            '267' => 'Botswana',
            '55' => 'Brazil',
            '246' => 'British Indian Ocean Territory',
            '673' => 'Brunei Darussalam',
            '359' => 'Bulgaria',
            '226' => 'Burkina Faso',
            '257' => 'Burundi',
            '855' => 'Cambodia',
            '237' => 'Cameroon',
            '1' => 'United States',
            '238' => 'Cape Verde',
            ' 345' => 'Cayman Islands',
            '236' => 'Central African Republic',
            '235' => 'Chad',
            '56' => 'Chile',
            '86' => 'China',
            '57' => 'Colombia',
            '269' => 'Comoros',
            '242' => 'Congo',
            '243' => 'Congo, The Democratic Republic of the Congo',
            '682' => 'Cook Islands',
            '506' => 'Costa Rica',
            '225' => 'Cote d\'Ivoire',
            '385' => 'Croatia',
            '53' => 'Cuba',
            '357' => 'Cyprus',
            '420' => 'Czech Republic',
            '45' => 'Denmark',
            '253' => 'Djibouti',
            '1767' => 'Dominica',
            '1849' => 'Dominican Republic',
            '593' => 'Ecuador',
            '20' => 'Egypt',
            '503' => 'El Salvador',
            '240' => 'Equatorial Guinea',
            '291' => 'Eritrea',
            '372' => 'Estonia',
            '251' => 'Ethiopia',
            '500' => 'South Georgia and the South Sandwich Islands',
            '298' => 'Faroe Islands',
            '679' => 'Fiji',
            '33' => 'France',
            '594' => 'French Guiana',
            '689' => 'French Polynesia',
            '241' => 'Gabon',
            '220' => 'Gambia',
            '995' => 'Georgia',
            '49' => 'Germany',
            '233' => 'Ghana',
            '350' => 'Gibraltar',
            '30' => 'Greece',
            '299' => 'Greenland',
            '1473' => 'Grenada',
            '590' => 'Saint Martin',
            '1671' => 'Guam',
            '502' => 'Guatemala',
            '44' => 'United Kingdom',
            '224' => 'Guinea',
            '245' => 'Guinea-Bissau',
            '595' => 'Paraguay',
            '509' => 'Haiti',
            '379' => 'Holy See (Vatican City State)',
            '504' => 'Honduras',
            '852' => 'Hong Kong',
            '36' => 'Hungary',
            '354' => 'Iceland',
            '91' => 'India',
            '62' => 'Indonesia',
            '98' => 'Iran, Islamic Republic of Persian Gulf',
            '964' => 'Iraq',
            '353' => 'Ireland',
            '972' => 'Israel',
            '39' => 'Italy',
            '1876' => 'Jamaica',
            '81' => 'Japan',
            '962' => 'Jordan',
            '77' => 'Kazakhstan',
            '254' => 'Kenya',
            '686' => 'Kiribati',
            '850' => 'Korea, Democratic People\'s Republic of Korea',
            '82' => 'Korea, Republic of South Korea',
            '965' => 'Kuwait',
            '996' => 'Kyrgyzstan',
            '856' => 'Laos',
            '371' => 'Latvia',
            '961' => 'Lebanon',
            '266' => 'Lesotho',
            '231' => 'Liberia',
            '218' => 'Libyan Arab Jamahiriya',
            '423' => 'Liechtenstein',
            '370' => 'Lithuania',
            '352' => 'Luxembourg',
            '853' => 'Macao',
            '389' => 'Macedonia',
            '261' => 'Madagascar',
            '265' => 'Malawi',
            '60' => 'Malaysia',
            '960' => 'Maldives',
            '223' => 'Mali',
            '356' => 'Malta',
            '692' => 'Marshall Islands',
            '596' => 'Martinique',
            '222' => 'Mauritania',
            '230' => 'Mauritius',
            '262' => 'Reunion',
            '52' => 'Mexico',
            '691' => 'Micronesia, Federated States of Micronesia',
            '373' => 'Moldova',
            '377' => 'Monaco',
            '976' => 'Mongolia',
            '382' => 'Montenegro',
            '1664' => 'Montserrat',
            '212' => 'Morocco',
            '258' => 'Mozambique',
            '95' => 'Myanmar',
            '264' => 'Namibia',
            '674' => 'Nauru',
            '977' => 'Nepal',
            '31' => 'Netherlands',
            '599' => 'Netherlands Antilles',
            '687' => 'New Caledonia',
            '64' => 'New Zealand',
            '505' => 'Nicaragua',
            '227' => 'Niger',
            '234' => 'Nigeria',
            '683' => 'Niue',
            '1670' => 'Northern Mariana Islands',
            '47' => 'Svalbard and Jan Mayen',
            '968' => 'Oman',
            '92' => 'Pakistan',
            '680' => 'Palau',
            '970' => 'Palestinian Territory, Occupied',
            '507' => 'Panama',
            '675' => 'Papua New Guinea',
            '51' => 'Peru',
            '63' => 'Philippines',
            '872' => 'Pitcairn',
            '48' => 'Poland',
            '351' => 'Portugal',
            '1939' => 'Puerto Rico',
            '974' => 'Qatar',
            '40' => 'Romania',
            '7' => 'Russia',
            '250' => 'Rwanda',
            '290' => 'Saint Helena, Ascension and Tristan Da Cunha',
            '1869' => 'Saint Kitts and Nevis',
            '1758' => 'Saint Lucia',
            '508' => 'Saint Pierre and Miquelon',
            '1784' => 'Saint Vincent and the Grenadines',
            '685' => 'Samoa',
            '378' => 'San Marino',
            '239' => 'Sao Tome and Principe',
            '966' => 'Saudi Arabia',
            '221' => 'Senegal',
            '381' => 'Serbia',
            '248' => 'Seychelles',
            '232' => 'Sierra Leone',
            '65' => 'Singapore',
            '421' => 'Slovakia',
            '386' => 'Slovenia',
            '677' => 'Solomon Islands',
            '252' => 'Somalia',
            '27' => 'South Africa',
            '211' => 'South Sudan',
            '34' => 'Spain',
            '94' => 'Sri Lanka',
            '249' => 'Sudan',
            '597' => 'Suriname',
            '268' => 'Swaziland',
            '46' => 'Sweden',
            '41' => 'Switzerland',
            '963' => 'Syrian Arab Republic',
            '886' => 'Taiwan',
            '992' => 'Tajikistan',
            '255' => 'Tanzania, United Republic of Tanzania',
            '66' => 'Thailand',
            '670' => 'Timor-Leste',
            '228' => 'Togo',
            '690' => 'Tokelau',
            '676' => 'Tonga',
            '1868' => 'Trinidad and Tobago',
            '216' => 'Tunisia',
            '90' => 'Turkey',
            '993' => 'Turkmenistan',
            '1649' => 'Turks and Caicos Islands',
            '688' => 'Tuvalu',
            '256' => 'Uganda',
            '380' => 'Ukraine',
            '971' => 'United Arab Emirates',
            '598' => 'Uruguay',
            '998' => 'Uzbekistan',
            '678' => 'Vanuatu',
            '58' => 'Venezuela, Bolivarian Republic of Venezuela',
            '84' => 'Vietnam',
            '1284' => 'Virgin Islands, British',
            '1340' => 'Virgin Islands, U.S.',
            '681' => 'Wallis and Futuna',
            '967' => 'Yemen',
            '260' => 'Zambia',
            '263' => 'Zimbabwe',
        );
        return $countryCode;
    }

    public function getModuleName()
    {
        $module = array(
            'Contact' => 'Contact',
            'Opportunity' =>'Opportunity',
            'Product' =>'Product' ,
            'Order' =>'Order'          
        );
        return $module;
    }

    public function getSalesStage()
    {
        $salesStage = array(
            'Prospecting' => 'Prospecting',
            'Qualification' =>'Qualification',
            'Need Analysis' => 'Need Analysis',
            'Closed Won' => 'Closed Won',
            'Closed Lost' => 'Closed Lost'
        );
        return $salesStage;
    }

    public function getProductCategory()
    {
        $productCategory = array(
            'Software' => 'Software',
            'Harddware' => 'Hardware',            
        );
        return $productCategory;
    }


    public function getFieldType()
    {
        $type = array(
            'text' => 'Text',
            'textarea' => 'Textarea',
            'checkbox' => 'checkBox',
            'dropdown' => 'Dropdown',
            'datetime' => 'Date & Time',
            'number' => 'Number',
            'amount' => 'Currency',
            'date' => 'Date',
            'time' => 'Time',
            'multiselect' => 'Multi Select',
            'relate' => 'Relate',
            'email' => 'Email'
        );
        return $type;
    }

    public function getOrderType()
    {
        $orderList = array(
            'created' => 'Created',
            'approved' => 'Approved',
            'delivered' => 'Delivered'
        );

        return $orderList;
    }

    public function getBillingPeriod() {

        $billing_period = array(
            'day' => 'Daily',
            'week' => 'Weekly',
            'month' => 'Monthly'
        );

        return $billing_period;

    }

    public function getPriceModel() {

        $price_model = array(
            'standard' => 'Standard'
        );

        return $price_model;
    }

    public function createField($module, $name, $label, $type, $mandatory, $options, $readOnly, $sequence = 0)
    {
        $current_datetime = gmdate('Y-m-d H:i:s');

        $field = new Field();
        $field->module_name = $module;
        $field->field_name = $name;
        $field->field_label = $label;
        $field->field_type = $type;
        $field->is_mandatory = $mandatory;
        $field->is_custom = 0;
        $field->user_id = 1;
        $field->company_id = 1;
        $field->created_at = $current_datetime;
        $field->updated_at = $current_datetime;
        $field->options = $options;
        $field->readonly_on_edit = $readOnly;
        $field->sequence = $sequence;
        $field->save();
    }

    public function currencyType () {

        $currency = array (
            'ALL' => 'Albania Lek',
            'AFN' => 'Afghanistan Afghani',
            'ARS' => 'Argentina Peso',
            'AWG' => 'Aruba Guilder',
            'AUD' => 'Australia Dollar',
            'AZN' => 'Azerbaijan New Manat',
            'BSD' => 'Bahamas Dollar',
            'BBD' => 'Barbados Dollar',
            'BDT' => 'Bangladeshi taka',
            'BYR' => 'Belarus Ruble',
            'BZD' => 'Belize Dollar',
            'BMD' => 'Bermuda Dollar',
            'BOB' => 'Bolivia Boliviano',
            'BAM' => 'Bosnia and Herzegovina Convertible Marka',
            'BWP' => 'Botswana Pula',
            'BGN' => 'Bulgaria Lev',
            'BRL' => 'Brazil Real',
            'BND' => 'Brunei Darussalam Dollar',
            'KHR' => 'Cambodia Riel',
            'CAD' => 'Canada Dollar',
            'KYD' => 'Cayman Islands Dollar',
            'CLP' => 'Chile Peso',
            'CNY' => 'China Yuan Renminbi',
            'COP' => 'Colombia Peso',
            'CRC' => 'Costa Rica Colon',
            'HRK' => 'Croatia Kuna',
            'CUP' => 'Cuba Peso',
            'CZK' => 'Czech Republic Koruna',
            'DKK' => 'Denmark Krone',
            'DOP' => 'Dominican Republic Peso',
            'XCD' => 'East Caribbean Dollar',
            'EGP' => 'Egypt Pound',
            'SVC' => 'El Salvador Colon',
            'EEK' => 'Estonia Kroon',
            'EUR' => 'Euro Member Countries',
            'FKP' => 'Falkland Islands (Malvinas) Pound',
            'FJD' => 'Fiji Dollar',
            'GHC' => 'Ghana Cedis',
            'GIP' => 'Gibraltar Pound',
            'GTQ' => 'Guatemala Quetzal',
            'GGP' => 'Guernsey Pound',
            'GYD' => 'Guyana Dollar',
            'HNL' => 'Honduras Lempira',
            'HKD' => 'Hong Kong Dollar',
            'HUF' => 'Hungary Forint',
            'ISK' => 'Iceland Krona',
            'INR' => 'India Rupee',
            'IDR' => 'Indonesia Rupiah',
            'IRR' => 'Iran Rial',
            'IMP' => 'Isle of Man Pound',
            'ILS' => 'Israel Shekel',
            'JMD' => 'Jamaica Dollar',
            'JPY' => 'Japan Yen',
            'JEP' => 'Jersey Pound',
            'KZT' => 'Kazakhstan Tenge',
            'KPW' => 'Korea (North) Won',
            'KRW' => 'Korea (South) Won',
            'KGS' => 'Kyrgyzstan Som',
            'LAK' => 'Laos Kip',
            'LVL' => 'Latvia Lat',
            'LBP' => 'Lebanon Pound',
            'LRD' => 'Liberia Dollar',
            'LTL' => 'Lithuania Litas',
            'MKD' => 'Macedonia Denar',
            'MYR' => 'Malaysia Ringgit',
            'MUR' => 'Mauritius Rupee',
            'MXN' => 'Mexico Peso',
            'MNT' => 'Mongolia Tughrik',
            'MZN' => 'Mozambique Metical',
            'NAD' => 'Namibia Dollar',
            'NPR' => 'Nepal Rupee',
            'ANG' => 'Netherlands Antilles Guilder',
            'NZD' => 'New Zealand Dollar',
            'NIO' => 'Nicaragua Cordoba',
            'NGN' => 'Nigeria Naira',
            'NOK' => 'Norway Krone',
            'OMR' => 'Oman Rial',
            'PKR' => 'Pakistan Rupee',
            'PAB' => 'Panama Balboa',
            'PYG' => 'Paraguay Guarani',
            'PEN' => 'Peru Nuevo Sol',
            'PHP' => 'Philippines Peso',
            'PLN' => 'Poland Zloty',
            'QAR' => 'Qatar Riyal',
            'RON' => 'Romania New Leu',
            'RUB' => 'Russia Ruble',
            'SHP' => 'Saint Helena Pound',
            'SAR' => 'Saudi Arabia Riyal',
            'RSD' => 'Serbia Dinar',
            'SCR' => 'Seychelles Rupee',
            'SGD' => 'Singapore Dollar',
            'SBD' => 'Solomon Islands Dollar',
            'SOS' => 'Somalia Shilling',
            'ZAR' => 'South Africa Rand',
            'LKR' => 'Sri Lanka Rupee',
            'SEK' => 'Sweden Krona',
            'CHF' => 'Switzerland Franc',
            'SRD' => 'Suriname Dollar',
            'SYP' => 'Syria Pound',
            'TWD' => 'Taiwan New Dollar',
            'THB' => 'Thailand Baht',
            'TTD' => 'Trinidad and Tobago Dollar',
            'TRY' => 'Turkey Lira',
            'TRL' => 'Turkey Lira',
            'TVD' => 'Tuvalu Dollar',
            'UAH' => 'Ukraine Hryvna',
            'GBP' => 'United Kingdom Pound',
            'USD' => 'United States Dollar',
            'UYU' => 'Uruguay Peso',
            'UZS' => 'Uzbekistan Som',
            'VEF' => 'Venezuela Bolivar',
            'VND' => 'Viet Nam Dong',
            'YER' => 'Yemen Rial',
            'ZWD' => 'Zimbabwe Dollar'
        );

        return $currency;
    }

    public function timeZone(){
        $timezones = array(
            'Pacific/Midway'       => "(GMT-11:00) Midway Island",
            'US/Samoa'             => "(GMT-11:00) Samoa",
            'US/Hawaii'            => "(GMT-10:00) Hawaii",
            'US/Alaska'            => "(GMT-09:00) Alaska",
            'US/Pacific'           => "(GMT-08:00) Pacific Time (US &amp; Canada)",
            'America/Tijuana'      => "(GMT-08:00) Tijuana",
            'US/Arizona'           => "(GMT-07:00) Arizona",
            'US/Mountain'          => "(GMT-07:00) Mountain Time (US &amp; Canada)",
            'America/Chihuahua'    => "(GMT-07:00) Chihuahua",
            'America/Mazatlan'     => "(GMT-07:00) Mazatlan",
            'America/Mexico_City'  => "(GMT-06:00) Mexico City",
            'America/Monterrey'    => "(GMT-06:00) Monterrey",
            'Canada/Saskatchewan'  => "(GMT-06:00) Saskatchewan",
            'US/Central'           => "(GMT-06:00) Central Time (US &amp; Canada)",
            'US/Eastern'           => "(GMT-05:00) Eastern Time (US &amp; Canada)",
            'US/East-Indiana'      => "(GMT-05:00) Indiana (East)",
            'America/Bogota'       => "(GMT-05:00) Bogota",
            'America/Lima'         => "(GMT-05:00) Lima",
            'America/Caracas'      => "(GMT-04:30) Caracas",
            'Canada/Atlantic'      => "(GMT-04:00) Atlantic Time (Canada)",
            'America/La_Paz'       => "(GMT-04:00) La Paz",
            'America/Santiago'     => "(GMT-04:00) Santiago",
            'Canada/Newfoundland'  => "(GMT-03:30) Newfoundland",
            'America/Buenos_Aires' => "(GMT-03:00) Buenos Aires",
            'Greenland'            => "(GMT-03:00) Greenland",
            'Atlantic/Stanley'     => "(GMT-02:00) Stanley",
            'Atlantic/Azores'      => "(GMT-01:00) Azores",
            'Atlantic/Cape_Verde'  => "(GMT-01:00) Cape Verde Is.",
            'Africa/Casablanca'    => "(GMT) Casablanca",
            'Europe/Dublin'        => "(GMT) Dublin",
            'Europe/Lisbon'        => "(GMT) Lisbon",
            'Europe/London'        => "(GMT) London",
            'Africa/Monrovia'      => "(GMT) Monrovia",
            'Europe/Amsterdam'     => "(GMT+01:00) Amsterdam",
            'Europe/Belgrade'      => "(GMT+01:00) Belgrade",
            'Europe/Berlin'        => "(GMT+01:00) Berlin",
            'Europe/Bratislava'    => "(GMT+01:00) Bratislava",
            'Europe/Brussels'      => "(GMT+01:00) Brussels",
            'Europe/Budapest'      => "(GMT+01:00) Budapest",
            'Europe/Copenhagen'    => "(GMT+01:00) Copenhagen",
            'Europe/Ljubljana'     => "(GMT+01:00) Ljubljana",
            'Europe/Madrid'        => "(GMT+01:00) Madrid",
            'Europe/Paris'         => "(GMT+01:00) Paris",
            'Europe/Prague'        => "(GMT+01:00) Prague",
            'Europe/Rome'          => "(GMT+01:00) Rome",
            'Europe/Sarajevo'      => "(GMT+01:00) Sarajevo",
            'Europe/Skopje'        => "(GMT+01:00) Skopje",
            'Europe/Stockholm'     => "(GMT+01:00) Stockholm",
            'Europe/Vienna'        => "(GMT+01:00) Vienna",
            'Europe/Warsaw'        => "(GMT+01:00) Warsaw",
            'Europe/Zagreb'        => "(GMT+01:00) Zagreb",
            'Europe/Athens'        => "(GMT+02:00) Athens",
            'Europe/Bucharest'     => "(GMT+02:00) Bucharest",
            'Africa/Cairo'         => "(GMT+02:00) Cairo",
            'Africa/Harare'        => "(GMT+02:00) Harare",
            'Europe/Helsinki'      => "(GMT+02:00) Helsinki",
            'Europe/Istanbul'      => "(GMT+02:00) Istanbul",
            'Asia/Jerusalem'       => "(GMT+02:00) Jerusalem",
            'Europe/Kiev'          => "(GMT+02:00) Kyiv",
            'Europe/Minsk'         => "(GMT+02:00) Minsk",
            'Europe/Riga'          => "(GMT+02:00) Riga",
            'Europe/Sofia'         => "(GMT+02:00) Sofia",
            'Europe/Tallinn'       => "(GMT+02:00) Tallinn",
            'Europe/Vilnius'       => "(GMT+02:00) Vilnius",
            'Asia/Baghdad'         => "(GMT+03:00) Baghdad",
            'Asia/Kuwait'          => "(GMT+03:00) Kuwait",
            'Africa/Nairobi'       => "(GMT+03:00) Nairobi",
            'Asia/Riyadh'          => "(GMT+03:00) Riyadh",
            'Europe/Moscow'        => "(GMT+03:00) Moscow",
            'Asia/Tehran'          => "(GMT+03:30) Tehran",
            'Asia/Baku'            => "(GMT+04:00) Baku",
            'Europe/Volgograd'     => "(GMT+04:00) Volgograd",
            'Asia/Muscat'          => "(GMT+04:00) Muscat",
            'Asia/Tbilisi'         => "(GMT+04:00) Tbilisi",
            'Asia/Yerevan'         => "(GMT+04:00) Yerevan",
            'Asia/Kabul'           => "(GMT+04:30) Kabul",
            'Asia/Karachi'         => "(GMT+05:00) Karachi",
            'Asia/Tashkent'        => "(GMT+05:00) Tashkent",
            'Asia/Kolkata'         => "(GMT+05:30) Kolkata",
            'Asia/Kathmandu'       => "(GMT+05:45) Kathmandu",
            'Asia/Yekaterinburg'   => "(GMT+06:00) Ekaterinburg",
            'Asia/Almaty'          => "(GMT+06:00) Almaty",
            'Asia/Dhaka'           => "(GMT+06:00) Dhaka",
            'Asia/Novosibirsk'     => "(GMT+07:00) Novosibirsk",
            'Asia/Bangkok'         => "(GMT+07:00) Bangkok",
            'Asia/Jakarta'         => "(GMT+07:00) Jakarta",
            'Asia/Krasnoyarsk'     => "(GMT+08:00) Krasnoyarsk",
            'Asia/Chongqing'       => "(GMT+08:00) Chongqing",
            'Asia/Hong_Kong'       => "(GMT+08:00) Hong Kong",
            'Asia/Kuala_Lumpur'    => "(GMT+08:00) Kuala Lumpur",
            'Australia/Perth'      => "(GMT+08:00) Perth",
            'Asia/Singapore'       => "(GMT+08:00) Singapore",
            'Asia/Taipei'          => "(GMT+08:00) Taipei",
            'Asia/Ulaanbaatar'     => "(GMT+08:00) Ulaan Bataar",
            'Asia/Urumqi'          => "(GMT+08:00) Urumqi",
            'Asia/Irkutsk'         => "(GMT+09:00) Irkutsk",
            'Asia/Seoul'           => "(GMT+09:00) Seoul",
            'Asia/Tokyo'           => "(GMT+09:00) Tokyo",
            'Australia/Adelaide'   => "(GMT+09:30) Adelaide",
            'Australia/Darwin'     => "(GMT+09:30) Darwin",
            'Asia/Yakutsk'         => "(GMT+10:00) Yakutsk",
            'Australia/Brisbane'   => "(GMT+10:00) Brisbane",
            'Australia/Canberra'   => "(GMT+10:00) Canberra",
            'Pacific/Guam'         => "(GMT+10:00) Guam",
            'Australia/Hobart'     => "(GMT+10:00) Hobart",
            'Australia/Melbourne'  => "(GMT+10:00) Melbourne",
            'Pacific/Port_Moresby' => "(GMT+10:00) Port Moresby",
            'Australia/Sydney'     => "(GMT+10:00) Sydney",
            'Asia/Vladivostok'     => "(GMT+11:00) Vladivostok",
            'Asia/Magadan'         => "(GMT+12:00) Magadan",
            'Pacific/Auckland'     => "(GMT+12:00) Auckland",
            'Pacific/Fiji'         => "(GMT+12:00) Fiji",
        );
        return $timezones;
    }
    public function getCountryJson()
    {
        $countryCode = array(
         'AF' =>   'Afghanistan',
         'AX' =>   'Aland Islands',
         'AL' =>   'Albania',
         'DZ' =>   'Algeria',
         'AS' =>   'American Samoa',
         'AD' =>   'Andorra',
         'AO' =>   'Angola',
         'AI' =>   'Anguilla',
         'AQ' =>   'Antarctica',
         'AG' =>   'Antigua and Barbuda',
         'AR' =>   'Argentina',
         'AM' =>   'Armenia',
         'AW' =>   'Aruba',
         'AU' =>   'Australia',
         'AT' =>   'Austria',
         'AZ' =>   'Azerbaijan',
         'BS' =>   'Bahamas',
         'BH' =>   'Bahrain',
         'BD' =>   'Bangladesh',
         'BB' =>   'Barbados',
         'BY' =>   'Belarus',
         'BE' =>   'Belgium',
         'BZ' =>   'Belize',
         'BJ' =>   'Benin',
         'BM' =>   'Bermuda',
         'BT' =>   'Bhutan',
         'BO' =>   'Bolivia',
         'BQ' =>   'Bonaire, Sint Eustatius and Saba',
         'BA' =>   'Bosnia and Herzegovina',
         'BW' =>   'Botswana',
         'BV' =>   'Bouvet Island',
         'BR' =>   'Brazil',
         'IO' =>   'British Indian Ocean Territory',
         'BN' =>   'Brunei Darussalam',
         'BG' =>   'Bulgaria',
         'BF' =>   'Burkina Faso',
         'BI' =>   'Burundi',
         'KH' =>   'Cambodia',
         'CM' =>   'Cameroon',
         'CA' =>   'Canada',
         'CV' =>   'Cape Verde',
         'KY' =>   'Cayman Islands',
         'CF' =>   'Central African Republic',
         'TD' =>   'Chad',
         'CL' =>   'Chile',
         'CN' =>   'China',
         'CX' =>   'Christmas Island',
         'CC' =>   'Cocos (Keeling) Islands',
         'CO' =>   'Colombia',
         'KM' =>   'Comoros',
         'CG' =>   'Congo',
         'CD' =>   'Congo, the Democratic Republic of the',
         'CK' =>   'Cook Islands',
         'CR' =>   'Costa Rica',
         'CI' =>   'Cote DIvoire',
         'HR' =>   'Croatia',
         'CU' =>   'Cuba',
         'CW' =>   'Curacao',
         'CY' =>   'Cyprus',
         'CZ' =>   'Czech Republic',
         'DK' =>   'Denmark',
         'DJ' =>   'Djibouti',
         'DM' =>   'Dominica',
         'DO' =>   'Dominican Republic',
         'EC' =>   'Ecuador',
         'EG' =>   'Egypt',
         'SV' =>   'El Salvador',
         'GQ' =>   'Equatorial Guinea',
         'ER' =>   'Eritrea',
         'EE' =>   'Estonia',
         'ET' =>   'Ethiopia',
         'FK' =>   'Falkland Islands (Malvinas)',
         'FO' =>   'Faroe Islands',
         'FJ' =>   'Fiji',
         'FI' =>   'Finland',
         'FR' =>   'France',
         'GF' =>   'French Guiana',
         'PF' =>   'French Polynesia',
         'TF' =>   'French Southern Territories',
         'GA' =>   'Gabon',
         'GM' =>   'Gambia',
         'GE' =>   'Georgia',
         'DE' =>   'Germany',
         'GH' =>   'Ghana',
         'GI' =>   'Gibraltar',
         'GR' =>   'Greece',
         'GL' =>   'Greenland',
         'GD' =>   'Grenada',
         'GP' =>   'Guadeloupe',
         'GU' =>   'Guam',
         'GT' =>   'Guatemala',
         'GG' =>   'Guernsey',
         'GN' =>   'Guinea',
         'GW' =>   'Guinea-Bissau',
         'GY' =>   'Guyana',
         'HT' =>   'Haiti',
         'HM' =>   'Heard Island and Mcdonald Islands',
         'VA' =>   'Holy See (Vatican City State)',
         'HN' =>   'Honduras',
         'HK' =>   'Hong Kong',
         'HU' =>   'Hungary',
         'IS' =>   'Iceland',
         'IN' =>   'India',
         'ID' =>   'Indonesia',
         'IR' =>   'Iran, Islamic Republic of',
         'IQ' =>   'Iraq',
         'IE' =>   'Ireland',
         'IM' =>   'Isle of Man',
         'IL' =>   'Israel',
         'IT' =>   'Italy',
         'JM' =>   'Jamaica',
         'JP' =>   'Japan',
         'JE' =>   'Jersey',
         'JO' =>   'Jordan',
         'KZ' =>   'Kazakhstan',
         'KE' =>   'Kenya',
         'KI' =>   'Kiribati',
         'KP' =>   'Korea Democratic Peoples Republic of',
         'KR' =>   'Korea, Republic of',
         'XK' =>   'Kosovo',
         'KW' =>   'Kuwait',
         'KG' =>   'Kyrgyzstan',
         'LA' =>   'Lao Peoples Democratic Republic',
         'LV' =>   'Latvia',
         'LB' =>   'Lebanon',
         'LS' =>   'Lesotho',
         'LR' =>   'Liberia',
         'LY' =>   'Libyan Arab Jamahiriya',
         'LI' =>   'Liechtenstein',
         'LT' =>   'Lithuania',
         'LU' =>   'Luxembourg',
         'MO' =>   'Macao',
         'MK' =>   'Macedonia, the Former Yugoslav Republic of',
         'MG' =>   'Madagascar',
         'MW' =>   'Malawi',
         'MY' =>   'Malaysia',
         'MV' =>   'Maldives',
         'ML' =>   'Mali',
         'MT' =>   'Malta',
         'MH' =>   'Marshall Islands',
         'MQ' =>   'Martinique',
         'MR' =>   'Mauritania',
         'MU' =>   'Mauritius',
         'YT' =>   'Mayotte',
         'MX' =>   'Mexico',
         'FM' =>   'Micronesia, Federated States of',
         'MD' =>   'Moldova, Republic of',
         'MC' =>   'Monaco',
         'MN' =>   'Mongolia',
         'ME' =>   'Montenegro',
         'MS' =>   'Montserrat',
         'MA' =>   'Morocco',
         'MZ' =>   'Mozambique',
         'MM' =>   'Myanmar',
         'NA' =>   'Namibia',
         'NR' =>   'Nauru',
         'NP' =>   'Nepal',
         'NL' =>   'Netherlands',
         'AN' =>   'Netherlands Antilles',
         'NC' =>   'New Caledonia',
         'NZ' =>   'New Zealand',
         'NI' =>   'Nicaragua',
         'NE' =>   'Niger',
         'NG' =>   'Nigeria',
         'NU' =>   'Niue',
         'NF' =>   'Norfolk Island',
         'MP' =>   'Northern Mariana Islands',
         'NO' =>   'Norway',
         'OM' =>   'Oman',
         'PK' =>   'Pakistan',
         'PW' =>   'Palau',
         'PS' =>   'Palestinian Territory, Occupied',
         'PA' =>   'Panama',
         'PG' =>   'Papua New Guinea',
         'PY' =>   'Paraguay',
         'PE' =>   'Peru',
         'PH' =>   'Philippines',
         'PN' =>   'Pitcairn',
         'PL' =>   'Poland',
         'PT' =>   'Portugal',
         'PR' =>   'Puerto Rico',
         'QA' =>   'Qatar',
         'RE' =>   'Reunion',
         'RO' =>   'Romania',
         'RU' =>   'Russian Federation',
         'RW' =>   'Rwanda',
         'BL' =>   'Saint Barthelemy',
         'SH' =>   'Saint Helena',
         'KN' =>   'Saint Kitts and Nevis',
         'LC' =>   'Saint Lucia',
         'MF' =>   'Saint Martin',
         'PM' =>   'Saint Pierre and Miquelon',
         'VC' =>   'Saint Vincent and the Grenadines',
         'WS' =>   'Samoa',
         'SM' =>   'San Marino',
         'ST' =>   'Sao Tome and Principe',
         'SA' =>   'Saudi Arabia',
         'SN' =>   'Senegal',
         'RS' =>   'Serbia',
         'CS' =>   'Serbia and Montenegro',
         'SC' =>   'Seychelles',
         'SL' =>   'Sierra Leone',
         'SG' =>   'Singapore',
         'SX' =>   'Sint Maarten',
         'SK' =>   'Slovakia',
         'SI' =>   'Slovenia',
         'SB' =>   'Solomon Islands',
         'SO' =>   'Somalia',
         'ZA' =>   'South Africa',
         'GS' =>   'South Georgia and the South Sandwich Islands',
         'SS' =>   'South Sudan',
         'ES' =>   'Spain',
         'LK' =>   'Sri Lanka',
         'SD' =>   'Sudan',
         'SR' =>   'Suriname',
         'SJ' =>   'Svalbard and Jan Mayen',
         'SZ' =>   'Swaziland',
         'SE' =>   'Sweden',
         'CH' =>   'Switzerland',
         'SY' =>   'Syrian Arab Republic',
         'TW' =>   'Taiwan, Province of China',
         'TJ' =>   'Tajikistan',
         'TZ' =>   'Tanzania, United Republic of',
         'TH' =>   'Thailand',
         'TL' =>   'Timor-Leste',
         'TG' =>   'Togo',
         'TK' =>   'Tokelau',
         'TO' =>   'Tonga',
         'TT' =>   'Trinidad and Tobago',
         'TN' =>   'Tunisia',
         'TR' =>   'Turkey',
         'TM' =>   'Turkmenistan',
         'TC' =>   'Turks and Caicos Islands',
         'TV' =>   'Tuvalu',
         'UG' =>   'Uganda',
         'UA' =>   'Ukraine',
         'AE' =>   'United Arab Emirates',
         'GB' =>   'United Kingdom',
         'US' =>   'United States',
         'UM' =>   'United States Minor Outlying Islands',
         'UY' =>   'Uruguay',
         'UZ' =>   'Uzbekistan',
         'VU' =>   'Vanuatu',
         'VE' =>   'Venezuela',
         'VN' =>   'Viet Nam',
         'VG' =>   'Virgin Islands, British',
         'VI' =>   'Virgin Islands, U.s.',
         'WF' =>   'Wallis and Futuna',
         'EH' =>   'Western Sahara',
         'YE' =>   'Yemen',
         'ZM' =>   'Zambia',
         'ZW' =>   'Zimbabwe'
      );
      return $countryCode;
  }
}
