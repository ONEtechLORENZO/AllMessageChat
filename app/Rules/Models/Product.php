<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    protected $casts = [
        'custom' => 'array',
    ];

    protected $with = ['media'];

    protected $fillable = ['name', 'price', 'description','product_category','company_id','created_at', 'updated_at'];
    
    public function opportunity()
    {
        return $this->belongsToMany(Opportunity::class,'opportunity_products');
    }
    
    public function lead()
    {
        return $this->belongsToMany(Opportunity::class,'lead_products');
    }

    /**
     * Get the line items of the organization
     *
     * @return void
     */
    public function lineItems()
    {
        return $this->hasMany(LineItem::class);
    }

    public function media() {
        return $this->hasMany(Document::class, 'parent_id');
    }
   
    /**
     * Return list view fields
     */
    public function getListViewFields()
    {
        $list_view_columns = [
            'name' => ['label' => __('Product Name'), 'type' => 'text'],
            'price' =>  ['label' => __('Price'), 'type' => 'amount'], 
            'description' =>  ['label' => __('Description'), 'type' => 'textarea'],
            'url' => ['label' => __('Website Url'), 'type' => 'text'],
            'brand' => ['label' => __('Brand'), 'type' => 'text'],
            'availability' => ['label' => __('Availability'), 'type' => 'checkbox'],
            'condition' => ['label' => __('Condition'), 'type' => 'dropdown'],
            'status' => ['label' => __('Status'), 'type' => 'checkbox'],
        ];
        return $list_view_columns;
    }
}
