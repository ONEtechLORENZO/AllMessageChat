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

    protected $fillable = ['name', 'price', 'description','product_category','company_id','created_at', 'updated_at'];
    
    public function opportunity()
    {
        return $this->belongsToMany(Opportunity::class,'opportunity_products');
    }
   
    /**
     * Return list view fields
     */
    public function getListViewFields()
    {
        $list_view_columns = [
            'name' => ['label' => ('Product Name'), 'type' => 'text'],
            'price' =>  ['label' => ('Price'), 'type' => 'amount'], 
            'description' =>  ['label' => 'Description', 'type' => 'textarea'],
            'product_category' => ['label' => ('Product Category'), 'type' => 'dropdown'],            
        ];
        return $list_view_columns;
    }
}
