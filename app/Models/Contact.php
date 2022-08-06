<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Msg;
use App\Models\Tag;
use App\Models\Category;

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

    protected $fillable = ['first_name', 'last_name', 'email', 'phone_number', 'instagram_id', 'user_id', 'created_at', 'updated_at'];

    public function messages()
    {
        return $this->morphMany(Msg::class, 'msgable');
    }

    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    public function categorys()
    {
        return $this->morphToMany(Category::class, 'categorable');
    }
}
