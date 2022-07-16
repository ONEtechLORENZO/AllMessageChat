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
        $record = $this->insertUserfield($user->id);
        Field::insert($record);
    }

    /**
     * Handle the User "updated" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function updated(User $user)
    {
        //
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

    public function insertUserfield($user_id){
        $field = [
            [
               'module_name' => 'Contact','field_name' => 'first_name','field_label' => 'First Name','field_type' => 'string','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id,'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s')
            ],
            [
               'module_name' => 'Contact','field_name' => 'last_name','field_label' => 'Last Name','field_type' => 'string','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id,'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s')
            ],
            [
               'module_name' => 'Contact','field_name' => 'email','field_label' => 'Email','field_type' => 'string','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id,'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s')
            ],
            [
               'module_name' => 'Contact','field_name' => 'phone_number','field_label' => 'Phone Number','field_type' => 'string','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id,'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s')
            ],
            [
               'module_name' => 'Contact','field_name' => 'instagram_id','field_label' => 'Instagram id','field_type' => 'string','is_mandatory' => 1,'is_custom' => 0,'user_id' => $user_id,'created_at' => date('Y-m-d H:i:s'),'updated_at' => date('Y-m-d H:i:s')
            ],
       ];

       return $field;
    }
}
