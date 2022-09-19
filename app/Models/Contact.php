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
        '1' => 'categorys'
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

    /**
     * Return list view fields
     */
    public function getListViewFields()
    {
        $list_view_columns = [
            'first_name' => ['label' => __('First Name'), 'type' => 'text'],
            'last_name' =>  ['label' => __('Last Name'), 'type' => 'text'],
            'email' =>  ['label' => __('Email'), 'type' => 'text'],
            'tag' => ['label' => __('Tags'), 'type' => 'text'],
            'list' =>  ['label' => __('Lists'), 'type' => 'text'],
            'phone_number' => ['label' => __('Phone number'), 'type' => 'phone_number'],          
        ];
        return $list_view_columns;
    }
}
