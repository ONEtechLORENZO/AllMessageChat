<?php

namespace App\Observers;

use App\Models\User;

use App\Models\Field;

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
        // Create user in Stripe
        $user->createAsStripeCustomer();

        $company_id = $_REQUEST['company_id'];
       
        // Check whether field entries are already added for this company
        $isAdded = Field::where('company_id', $company_id)->first();
        if(!$isAdded) {
            $fields = $this->insertUserfield($user->id, $company_id);
            Field::insert($fields);
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
        if(!$user->stripe_id) {
            $user->createAsStripeCustomer();
        }
        else {
            $user->updateStripeCustomer();
        }
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
    public function insertUserfield($user_id, $company_id) {
        $fields = [
            [
               'module_name' => 'Contact','field_name' => 'first_name','field_label' => 'First Name','field_type' => 'text','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
            ],
            [
               'module_name' => 'Contact','field_name' => 'last_name','field_label' => 'Last Name','field_type' => 'text','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
            ],
            [
               'module_name' => 'Contact','field_name' => 'email','field_label' => 'Email','field_type' => 'text','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
            ],
            [
               'module_name' => 'Contact','field_name' => 'phone_number','field_label' => 'Phone Number','field_type' => 'phone_number','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
            ],
            [
               'module_name' => 'Contact','field_name' => 'instagram_id','field_label' => 'Instagram id','field_type' => 'text','is_mandatory' => 0,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
            ],
            [
                'module_name' => 'Contact','field_name' => 'status','field_label' => 'Subscription status','field_type' => 'dropdown','is_mandatory' => 0,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' => json_encode(['subscribed'=>'Subscribed', 'unsubscribed'=>'Unsubscribed'])
            ],
             [
                'module_name' => 'Opportunity','field_name' => 'name' ,'field_label' =>'Opportunity Name','field_type' => 'text','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
             ],
             [
                'module_name' => 'Opportunity','field_name' => 'amount' ,'field_label' =>'Amount','field_type' => 'amount','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
             ],
             [
                'module_name' => 'Opportunity','field_name' => 'expected_close_date' ,'field_label' =>'Expected Close Date','field_type' => 'date','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
             ],
             [
                'module_name' => 'Opportunity','field_name' => 'assigned_to' ,'field_label' =>'Assigned to','field_type' => 'text','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
             ],
             [
                'module_name' => 'Opportunity','field_name' => 'sales_stage','field_label' => 'Sales Stage','field_type' => 'dropdown','is_mandatory' => 0,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' => json_encode(['prospecting'=>'Prospecting', 'qualification'=>'Qualification','need_analysis'=>'Need Analysis','Closed Won'=>'closed_won','closed_lost'=>'Closed Lost'])
            ],
            [
                'module_name' => 'Opportunity','field_name' => 'description' ,'field_label' =>'Description','field_type' => 'textarea','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id, 'company_id' => $company_id, 'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s'),'readonly_on_edit' => 'false', 'options' =>''
             ],


       ];

       return $fields;
    }
}
