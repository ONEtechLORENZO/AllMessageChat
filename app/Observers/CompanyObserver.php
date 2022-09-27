<?php

namespace App\Observers;

use App\Models\Company;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Field;
use App\Models\FieldGroup;
use Auth;
use Illuminate\Support\Facades\Log;

class CompanyObserver
{
    /**
     * Handle the Company "created" event.
     *
     * @param  \App\Models\Company  $company
     * @return void
     */
    public function created(Company $company)
    {
        // Create user in Stripe
        // $this->createStripeCustomer($company);

        $user_id = Auth::id();
        $user = User::find($user_id);
          
        // Check whether field entries are already added for this company
        $isAdded = Field::where('company_id', $company->id)->first();
        if(!$isAdded) {
            $fields = $this->getModuleFields($user_id, $company->id);
            Field::insert($fields);
            
            //add amount in wallet 
            $wallet = $this->addWalletAmount($user_id, $company->id);
        }
    }

    /**
     * Handle the Company "updated" event.
     *
     * @param  \App\Models\Company  $company
     * @return void
     */
    public function updated(Company $company)
    {
        //
    }

    /**
     * Handle the Company "deleted" event.
     *
     * @param  \App\Models\Company  $company
     * @return void
     */
    public function deleted(Company $company)
    {
        //
    }

    /**
     * Handle the Company "restored" event.
     *
     * @param  \App\Models\Company  $company
     * @return void
     */
    public function restored(Company $company)
    {
        //
    }

    /**
     * Handle the Company "force deleted" event.
     *
     * @param  \App\Models\Company  $company
     * @return void
     */
    public function forceDeleted(Company $company)
    {
        //
    }

    /**
     * Create stripe customer 
     */
    public function createStripeCustomer(Company $company, $mode = '')
    {
        $secretId = config('stripe.stripe_secret');
        $stripe = new \Stripe\StripeClient($secretId);
        
        if(!$mode) {
            $result = $stripe->customers->create([
                'description' => $company->name,
            ]);
        } 
        else if($mode == 'update') {
            $result = $stripe->customers->update(
                $company->stripe_id,
                []
            );
        }
        
        /*$company->stripe_id = $result->id;
        $_REQUEST['is_stripe_action'] = true;
        $company->save();*/
        return true;
    }

    public function add_FieldGroup($group_name,$module_name,$user_id,$company_id) 
    {
        $fieldGroup = new FieldGroup();
        $fieldGroup->module_name = $module_name;
        $fieldGroup->name = $group_name;
        $fieldGroup->company_id = $company_id;
        $fieldGroup->created_by = $user_id;
        $fieldGroup->save();
        return ($fieldGroup->id);
    }

    /**
     * Preparing field array for insertion
     */
    public function getModuleFields($user_id, $company_id) 
    {
        $current_datetime = date('Y-m-d H:i:s');
          //order fieldgroup
        $address_group_id = $this->add_FieldGroup('Address Details','Order',$user_id,$company_id);
         //contact fieldgroup
        $contact_info_id = $this->add_FieldGroup('Contact info','Contact',$user_id,$company_id);
        $contact_subscription_id= $this->add_FieldGroup('Subscription status','Contact',$user_id,$company_id);
        $contact_address_id= $this->add_FieldGroup('Address info','Contact',$user_id,$company_id);
        $contact_source_id= $this->add_FieldGroup('Source info','Contact',$user_id,$company_id);
         //lead fieldgroup
        $Lead_info_id = $this->add_FieldGroup('Lead info','Lead',$user_id,$company_id);
        $Lead_address_id= $this->add_FieldGroup('Lead Address info','Lead',$user_id,$company_id);
        $Lead_source_id= $this->add_FieldGroup('Lead Source info','Lead',$user_id,$company_id);

        $countryCodes = $this->getCountryCodeJson();
        $fields = [
         //contact
               [
                  'module_name' => 'Contact','field_name' => 'first_name','field_label' => 'First Name','field_type' => 'text','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id,  'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
               ],
               [
                  'module_name' => 'Contact','field_name' => 'last_name','field_label' => 'Last Name','field_type' => 'text','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
               ],
               [
                  'module_name' => 'Contact','field_name' => 'email','field_label' => 'Email','field_type' => 'text','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
               ],
               [
                  'module_name' => 'Contact','field_name' => 'phone_number','field_label' => 'Phone Number','field_type' => 'phone_number','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id,'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
               ],
               [
                  'module_name' => 'Contact','field_name' => 'gender','field_label' => 'Gender','field_type' => 'dropdown','is_mandatory' => 0,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'','created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>json_encode(['male'=>'Male', 'female'=>'Female' ,'unknown'=>'Unknown'])
               ],
               
               [
                  'module_name' => 'Contact','field_name' => 'birth_date','field_label' => 'Birth Date','field_type' => 'date','is_mandatory' => 0,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id,'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
               ],
               [
                  'module_name' => 'Contact','field_name' => 'languages_spoken','field_label' => 'Languages Spoken','field_type' => 'multiselect','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id,'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>json_encode(['English'=>'English', 'Italy'=>'Italy' ,'French'=>'French','German'=>'German'])
               ],
               [
                  'module_name' => 'Contact','field_name' => 'assigned_to' ,'field_label' =>'Assigned to','field_type' => 'relate','is_mandatory' => 0,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id,'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' => json_encode(['module' => 'User']),
               ],
              

               [
                'module_name' => 'Contact','field_name' => 'organization_id','field_label' => 'Organization','field_type' => 'relate','is_mandatory' => 0,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'','created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' => json_encode(['module' => 'Organization'])
               ],
               
               [
                  'module_name' => 'Contact','field_name' => 'organization_role','field_label' => 'Organization Role','field_type' => 'text','is_mandatory' => 0,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'','created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' => ''
               ],
               [
                  'module_name' => 'Contact','field_name' => 'status','field_label' => 'Subscription status','field_type' => 'dropdown','is_mandatory' => 0,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $contact_subscription_id,'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' => json_encode(['subscribed'=>'Subscribed', 'unsubscribed'=>'Unsubscribed'])
               ],

                  //Contact Info
                  ['module_name' => 'Contact', 'field_name' => 'whatsapp_number', 'field_label' => 'Whatsapp Number', 'field_type' => 'phone_number', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $contact_info_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Contact', 'field_name' => 'telegram_number', 'field_label' => 'Telegram Number', 'field_type' => 'phone_number', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $contact_info_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Contact', 'field_name' => 'facebook_username', 'field_label' => 'Facebook Username', 'field_type' => 'url', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $contact_info_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Contact', 'field_name' => 'instagram_username', 'field_label' => 'Instagram Username', 'field_type' => 'url', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $contact_info_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Contact', 'field_name' => 'tiktok_username', 'field_label' => 'Tiktok Username', 'field_type' => 'url', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $contact_info_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Contact', 'field_name' => 'linkedin_username', 'field_label' => 'Linkedin Username', 'field_type' => 'url', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $contact_info_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Contact', 'field_name' => 'personal_website', 'field_label' => 'Personal Website', 'field_type' => 'url', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $contact_info_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
               
                  //Contact Address Info
                 ['module_name' => 'Contact', 'field_name' => 'country', 'field_label' => 'Country', 'field_type' => 'dropdown', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $contact_address_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => json_encode($countryCodes)],
                 ['module_name' => 'Contact', 'field_name' => 'state', 'field_label' => 'State', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $contact_address_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                 ['module_name' => 'Contact', 'field_name' => 'city', 'field_label' => 'City', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $contact_address_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                 ['module_name' => 'Contact', 'field_name' => 'street', 'field_label' => 'Street', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $contact_address_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                 ['module_name' => 'Contact', 'field_name' => 'zip_code', 'field_label' => 'Zip Code', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $contact_address_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''], 

                 //contact Source Info                
                 ['module_name' => 'Contact', 'field_name' => 'origin', 'field_label' => 'Origin', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $contact_source_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                 ['module_name' => 'Contact', 'field_name' => 'source', 'field_label' => 'Source', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $contact_source_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                 ['module_name' => 'Contact', 'field_name' => 'medium', 'field_label' => 'Medium', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $contact_source_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                 ['module_name' => 'Contact', 'field_name' => 'campaign', 'field_label' => 'Campaign', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $contact_source_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                 ['module_name' => 'Contact', 'field_name' => 'content', 'field_label' => 'Content', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $contact_source_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                 ['module_name' => 'Contact', 'field_name' => 'term', 'field_label' => 'Term', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $contact_source_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                 

            //Opportunity
             [
                'module_name' => 'Opportunity','field_name' => 'name' ,'field_label' =>'Opportunity Name','field_type' => 'text','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'','created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
             ],
             [
                'module_name' => 'Opportunity','field_name' => 'amount' ,'field_label' =>'Amount','field_type' => 'amount','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id,'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
             ],
             [
                'module_name' => 'Opportunity','field_name' => 'expected_close_date' ,'field_label' =>'Expected Close Date','field_type' => 'date','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
             ],
            ['module_name' => 'Opportunity', 'field_name' => 'contact_id' ,'field_label' =>'Contact','field_type' => 'relate','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'','created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' => json_encode(['module' => 'Contact'])],
             [
                'module_name' => 'Opportunity','field_name' => 'assigned_to' ,'field_label' =>'Assigned to','field_type' => 'relate','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id,'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' => json_encode(['module' => 'User']),
             ],
             [
                'module_name' => 'Opportunity','field_name' => 'sales_stage','field_label' => 'Sales Stage','field_type' => 'dropdown','is_mandatory' => 0,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'','created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' => json_encode(['prospecting'=>'Prospecting', 'qualification'=>'Qualification','need_analysis'=>'Need Analysis','Closed Won'=>'closed_won','closed_lost'=>'Closed Lost'])
            ],
            [
                'module_name' => 'Opportunity','field_name' => 'description' ,'field_label' =>'Description','field_type' => 'textarea','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'','created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
             ],
             [
                'module_name' => 'Product','field_name' => 'name' ,'field_label' =>'Product Name','field_type' => 'text','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'','created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
             ],
             [
                'module_name' => 'Product','field_name' => 'price' ,'field_label' =>'Price','field_type' => 'amount','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id,'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
             ],
             [
                'module_name' => 'Product','field_name' => 'description' ,'field_label' =>'Description','field_type' => 'textarea','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'','created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
             ],
             [
                'module_name' => 'Product','field_name' => 'product_category','field_label' => 'Product Category','field_type' => 'dropdown','is_mandatory' => 0,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id,'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' => json_encode(['software'=>'Software', 'hardware'=>'Hardware'])
            ],

            // Order
            ['module_name' => 'Order', 'field_name' => 'name', 'field_label' => 'Subject', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'', 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
            ['module_name' => 'Order', 'field_name' => 'due_date', 'field_label' => 'Due Date', 'field_type' => 'date', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'','created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'options' => ''],
            ['module_name' => 'Order', 'field_name' => 'description', 'field_label' => 'Description', 'field_type' => 'textarea', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id,'field_group' =>'', 'created_at' => $current_datetime, 'updated_at' => $current_datetime,'readonly_on_edit' => 'false', 'options' => ''],
            ['module_name' => 'Order', 'field_name' => 'opportunity', 'field_label' => 'Opportunity', 'field_type' => 'relate', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'', 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => json_encode(['module' => 'Opportunity'])],
            ['module_name' => 'Order', 'field_name' => 'contact', 'field_label' => 'Contact', 'field_type' => 'relate', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id,'field_group' =>'',  'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => json_encode(['module' => 'Contact'])],
               //Order Address Details
                  ['module_name' => 'Order', 'field_name' => 'billing_address', 'field_label' => 'Billing address', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $address_group_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Order', 'field_name' => 'billing_city', 'field_label' => 'Billing City', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $address_group_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Order', 'field_name' => 'billing_state', 'field_label' => 'Billing State', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $address_group_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Order', 'field_name' => 'billing_postal_code', 'field_label' => 'Billing Postalcode', 'field_type' => 'number', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $address_group_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],            
                  ['module_name' => 'Order', 'field_name' => 'billing_country', 'field_label' => 'Billing Country', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $address_group_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
            
                  ['module_name' => 'Order', 'field_name' => 'shipping_address', 'field_label' => 'Shipping address', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $address_group_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Order', 'field_name' => 'shipping_city', 'field_label' => 'Shipping City', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $address_group_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Order', 'field_name' => 'shipping_state', 'field_label' => 'Shipping State', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $address_group_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Order', 'field_name' => 'shipping_postal_code', 'field_label' => 'Shipping Postalcode', 'field_type' => 'number', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $address_group_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],            
                  ['module_name' => 'Order', 'field_name' => 'shipping_country', 'field_label' => 'Shipping Country', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $address_group_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
            //// Organization
                  ['module_name' => 'Organization', 'field_name' => 'name', 'field_label' => 'Organization Name', 'field_type' => 'text', 'is_mandatory' => 1, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'', 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Organization', 'field_name' => 'industry', 'field_label' => 'Industry', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'', 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Organization', 'field_name' => 'number_of_employees', 'field_label' => 'Number Of Employees', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'', 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Organization', 'field_name' => 'annual_turnover', 'field_label' => 'Annual Turnover', 'field_type' => 'amount', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'', 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Organization', 'field_name' => 'tax_id', 'field_label' => 'Tax ID', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'', 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Organization', 'field_name' => 'country', 'field_label' => 'Country', 'field_type' => 'dropdown', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'', 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => json_encode($countryCodes)],
                  ['module_name' => 'Organization', 'field_name' => 'state', 'field_label' => 'State', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'', 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Organization', 'field_name' => 'city', 'field_label' => 'City', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'', 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Organization', 'field_name' => 'street', 'field_label' => 'Street', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'', 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Organization', 'field_name' => 'email', 'field_label' => 'Email', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'', 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Organization', 'field_name' => 'website', 'field_label' => 'Website', 'field_type' => 'url', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'', 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  ['module_name' => 'Organization', 'field_name' => 'phone_number', 'field_label' => 'Phone Number', 'field_type' => 'phone_number', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'', 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],

                    //Lead
                    [
                     'module_name' => 'Lead','field_name' => 'first_name','field_label' => 'First Name','field_type' => 'text','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id,  'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
                  ],
                  [
                     'module_name' => 'Lead','field_name' => 'last_name','field_label' => 'Last Name','field_type' => 'text','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
                  ],
                  [
                     'module_name' => 'Lead','field_name' => 'email','field_label' => 'Email','field_type' => 'text','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
                  ],
                  [
                     'module_name' => 'Lead','field_name' => 'phone_number','field_label' => 'Phone Number','field_type' => 'phone_number','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id,'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
                  ],
                  [
                     'module_name' => 'Lead','field_name' => 'gender','field_label' => 'Gender','field_type' => 'dropdown','is_mandatory' => 0,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'','created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>json_encode(['male'=>'Male', 'female'=>'Female' ,'unknown'=>'Unknown'])
                  ],
                  
                  [
                     'module_name' => 'Lead','field_name' => 'birth_date','field_label' => 'Birth Date','field_type' => 'date','is_mandatory' => 0,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id,'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
                  ],
                  [
                     'module_name' => 'Lead','field_name' => 'languages_spoken','field_label' => 'Languages Spoken','field_type' => 'multiselect','is_mandatory' => 0,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id,'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>json_encode(['English'=>'English', 'Italy'=>'Italy' ,'French'=>'French','German'=>'German'])
                  ],
                  [
                     'module_name' => 'Lead','field_name' => 'assigned_to' ,'field_label' =>'Assigned to','field_type' => 'relate','is_mandatory' => 0,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id,'field_group' =>'', 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' => json_encode(['module' => 'User']),
                  ],
   
                  [
                   'module_name' => 'Lead','field_name' => 'organization_id','field_label' => 'Organization','field_type' => 'relate','is_mandatory' => 0,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'','created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' => json_encode(['module' => 'Organization'])
                  ],
                 
                  [
                     'module_name' => 'Lead','field_name' => 'organization_role','field_label' => 'Organization Role','field_type' => 'text','is_mandatory' => 0,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'','created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' => ''
                  ],
                 
   
                     //Lead Info
                     ['module_name' => 'Lead', 'field_name' => 'whatsapp_number', 'field_label' => 'Whatsapp Number', 'field_type' => 'phone_number', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $Lead_info_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                     ['module_name' => 'Lead', 'field_name' => 'telegram_number', 'field_label' => 'Telegram Number', 'field_type' => 'phone_number', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $Lead_info_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                     ['module_name' => 'Lead', 'field_name' => 'facebook_username', 'field_label' => 'Facebook Username', 'field_type' => 'url', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $Lead_info_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                     ['module_name' => 'Lead', 'field_name' => 'instagram_username', 'field_label' => 'Instagram Username', 'field_type' => 'url', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $Lead_info_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                     ['module_name' => 'Lead', 'field_name' => 'tiktok_username', 'field_label' => 'Tiktok Username', 'field_type' => 'url', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $Lead_info_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                     ['module_name' => 'Lead', 'field_name' => 'linkedin_username', 'field_label' => 'Linkedin Username', 'field_type' => 'url', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $Lead_info_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                     ['module_name' => 'Lead', 'field_name' => 'personal_website', 'field_label' => 'Personal Website', 'field_type' => 'url', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $Lead_info_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                  
                     //Lead Address Info
                    ['module_name' => 'Lead', 'field_name' => 'country', 'field_label' => 'Country', 'field_type' => 'dropdown', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $Lead_address_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => json_encode($countryCodes)],
                    ['module_name' => 'Lead', 'field_name' => 'state', 'field_label' => 'State', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $Lead_address_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                    ['module_name' => 'Lead', 'field_name' => 'city', 'field_label' => 'City', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $Lead_address_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                    ['module_name' => 'Lead', 'field_name' => 'street', 'field_label' => 'Street', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $Lead_address_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                    ['module_name' => 'Lead', 'field_name' => 'zip_code', 'field_label' => 'Zip Code', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $Lead_address_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''], 
   
                    //Lead Source Info                
                    ['module_name' => 'Lead', 'field_name' => 'origin', 'field_label' => 'Origin', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $Lead_source_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                    ['module_name' => 'Lead', 'field_name' => 'source', 'field_label' => 'Source', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $Lead_source_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                    ['module_name' => 'Lead', 'field_name' => 'medium', 'field_label' => 'Medium', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $Lead_source_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                    ['module_name' => 'Lead', 'field_name' => 'campaign', 'field_label' => 'Campaign', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $Lead_source_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                    ['module_name' => 'Lead', 'field_name' => 'content', 'field_label' => 'Content', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $Lead_source_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],
                    ['module_name' => 'Lead', 'field_name' => 'term', 'field_label' => 'Term', 'field_type' => 'text', 'is_mandatory' => 0, 'is_custom' => 0, 'user_id' => $user_id, 'company_id' => $company_id, 'field_group' => $Lead_source_id, 'created_at' => $current_datetime, 'updated_at' => $current_datetime, 'readonly_on_edit' => 'false', 'options' => ''],

         ];
       
        return $fields;
    }

    public function addWalletAmount($user_id, $company_id){

        if($user_id){
            $wallet = new Wallet;
  
            $wallet->balance_amount = 1;
            $wallet->user_id = $user_id;
            $wallet->company_id = $company_id;
            
            $wallet->save();
         }
    }

    public function getCountryCodeJson()
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