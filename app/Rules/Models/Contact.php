<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Msg;
use App\Models\Tag;
use App\Models\Service;
use App\Models\Category;
use App\Models\Note;

class Contact extends Model
{
    use HasFactory;

    protected $table = 'contacts';

    protected $with = [
        '0' => 'tags',
        '1' => 'categorys',
        '2' => 'phones',
        '3' => 'emails'
    ];

    protected $casts = [
        'custom' => 'array',
        'languages_spoken' =>'array'
    ];

    protected $fillable = ['first_name', 'last_name', 'email', 'phone_number', 'gender','birth_date', 'languages_spoken','lists','tags','organization_id','organization_role','user_id', 'created_at', 'updated_at', 'custom', 'country_code'];

    public function messages()
    {
        return $this->morphMany(Msg::class, 'msgable');
    }

    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
    public function services()
    {
        return $this->morphToMany(Service::class, 'serviceable');
    }


    public function categorys()
    {
        return $this->morphToMany(Category::class, 'categorable');
    }
    public function notes()
    {
        return $this->morphMany(Note::class, 'notable');
    }

    public function document()  
    {  
      return $this->hasOne('App\Models\Document', 'parent_id');  
    }  

    public function phones()
    {
        return $this->morphMany(Phone::class, 'phoneable');
    }

    public function emails()
    {
        return $this->morphMany(Email::class, 'emailable');
    }

    /**
     * Return list view fields
     */
    public function getListViewFields()
    {
        $list_view_columns = [
            'first_name' => ['label' => __('First Name'), 'type' => 'text'],
            'last_name' =>  ['label' => __('Last Name'), 'type' => 'text'],
            'updated_at' => ['label' => __('Last Modified'), 'type' => 'date'], 
            'whatsapp_number'  => ['label' => __('Whatsapp Number'), 'type' => 'phone_number'],
            'telegram_number'  => ['label' => __('Telegram Number'), 'type' => 'phone_number'],
            'facebook_username'  => ['label' => __('Facebook Username'), 'type' => 'url'],
            'instagram_username'  => ['label' => __('Instagram Username'), 'type' => 'url'],
            'tiktok_username'  => ['label' => __('Tiktok Username'), 'type' => 'url'],
            'linkedin_username' => ['label' => __('Linkedin Username'), 'type' => 'url'],
            'country' => ['label' => __('Country'), 'type' => 'dropdown'],
            'organization_id' => ['label' => __('Organization'), 'type' => 'relate'],
        ];
        return $list_view_columns;
    }
}
