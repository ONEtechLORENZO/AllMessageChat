<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $table = 'groups';

    protected $casts = [
        'custom' => 'array',
        'users' => 'array'
    ];    

    protected $fillable = ['group_name', 'group_description', 'users','created_at', 'updated_at'];

    public function product()
    {
        return $this->belongsToMany(Product::class,'lead_products');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'group_user');
    }
   
    /**
     * Return list view fields
     */
    public function getListViewFields()
    {
        $list_view_columns = [
            'name' => ['label' => __('Group Name'), 'type' => 'text'],           
            'description' =>  ['label' => __('Group Description'), 'type' => 'textarea'],
        ];
        return $list_view_columns;
    }
}
