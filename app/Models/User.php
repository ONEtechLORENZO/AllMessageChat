<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Laravel\Cashier\Billable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    use Billable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'password',
        'role',
        'status',
        'language',
        'fb_token',
        'stripe_id',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * The company that belong to the user.
     */
    public function company()
    {
        return $this->belongsToMany(Company::class);
    }
    public function groups()
    {
        return $this->belongsToMany(Group::class, 'group_user');
    }

    public function getListViewFields()
    {
        $list_view_columns = [
            'first_name'  => ['label' => 'First Name', 'type' => 'text'],
            'last_name' => ['label' => 'Last Name', 'type' => 'text'],
            'email' => ['label' => 'Email', 'type' => 'text'],
            'phone_number'=> ['label' => 'Phone number', 'type' => 'phone_number'],  
            'role' => ['label' => 'Role' ,'type' => 'text'],
            
        ];
        return $list_view_columns;
    }
}
