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
    ];

    protected $fillable = ['first_name', 'last_name', 'email', 'phone_number', 'instagram_id', 'user_id', 'created_at', 'updated_at', 'custom', 'country_code'];

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
            'tag' => ['label' => __('Tag'), 'type' => 'text'],
            'list' =>  ['label' => __('List'), 'type' => 'text'],
            'phone_number' => ['label' => __('Phone number'), 'type' => 'phone_number'],
            'instagram_id' =>  ['label' => 'Instagram Id', 'type' => 'text'],
        ];
        return $list_view_columns;
    }
}
