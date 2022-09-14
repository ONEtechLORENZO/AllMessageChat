<?php

namespace App\Observers;

use App\Models\User;

use App\Models\Field;
use App\Models\Wallet;

use App\Models\FieldGroup;

class UserObserver
{
    /**
     * Handle the User "created" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function created(User $user)
    {
        $company_id = $_REQUEST['company_id'];
       
        // Check whether field entries are already added for this company
        $isAdded = Field::where('company_id', $company_id)->first();
        if(!$isAdded) {
            $fields = $this->getModuleFields($user->id, $company_id);
            Field::insert($fields);
            
            //add amount in wallet 
            $wallet = $this->addWalletAmount($user->id, $company_id);
        }
    }

    /**
     * Handle the User "updated" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function updated(User $user)
    {
        // if(!$user->stripe_id) {
        //     $user->createAsStripeCustomer();
        // }
        // else {
        //     $user->updateStripeCustomer();
        // }
    }

    /**
     * Handle the User "deleted" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function deleted(User $user)
    {
        //
    }

    /**
     * Handle the User "restored" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function restored(User $user)
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function forceDeleted(User $user)
    {
        //
    }

    /**
     * Preparing field array for insertion
     */
    public function getModuleFields($user_id, $company_id) 
    {
        $current_datetime = date('Y-m-d H:i:s');
        $fieldGroup = new FieldGroup();
        $fieldGroup->module_name = 'Order';
        $fieldGroup->name = 'Address Details';
        $fieldGroup->company_id = $company_id;
        $fieldGroup->created_by = $user_id;
        $fieldGroup->save();
        $address_group_id = $fieldGroup->id;

        $fields = [
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
               'module_name' => 'Contact','field_name' => 'instagram_id','field_label' => 'Instagram id','field_type' => 'text','is_mandatory' => 0,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'','created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
            ],
            [
                'module_name' => 'Contact','field_name' => 'status','field_label' => 'Subscription status','field_type' => 'dropdown','is_mandatory' => 0,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'field_group' =>'','created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' => json_encode(['subscribed'=>'Subscribed', 'unsubscribed'=>'Unsubscribed'])
            ],
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
}
