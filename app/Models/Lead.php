<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Note;

class Lead extends Model
{
    use HasFactory;

    protected $table = 'leads';

    

    protected $casts = [
        'custom' => 'array',
        'languages_spoken' =>'array'
    ];

    protected $fillable = ['first_name', 'last_name', 'email', 'phone_number', 'gender','birth_date', 'languages_spoken','lists','tags','organization_id','organization_role','user_id', 'created_at', 'updated_at', 'custom', 'country_code'];

    
    public function notes()
    {
        return $this->morphMany(Note::class, 'notable');
    }

    /**
     * Return list view fields
     */
    public function getListViewFields()
    {
        $list_view_columns = [
            'first_name' => ['label' => __('First Name'), 'type' => 'text'],
            'last_name' =>  ['label' => __('Last Name'), 'type' => 'text'],
            'email' =>  ['label' => __('Email'), 'type' => 'text'],
            'phone_number' => ['label' => __('Phone number'), 'type' => 'phone_number'],          
        ];
        return $list_view_columns;
    }
}
