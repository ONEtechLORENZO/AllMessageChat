<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Opportunity extends Model
{
    use HasFactory;
    protected $table = 'opportunities';
    protected $casts = [
        'custom' => 'array',
    ];    

    protected $fillable = ['name', 'amount', 'contact_id', 'expected_close_date', 'assigned_to', 'sales_stage', 'description','created_at', 'updated_at'];

    public function product()
    {
        return $this->belongsToMany(Product::class,'opportunity_products');
    }
   
    /**
     * Return list view fields
     */
    public function getListViewFields()
    {
        $list_view_columns = [
            'name' => ['label' => __('Deal Name'), 'type' => 'text'],
            'amount' =>  ['label' => __('Amount'), 'type' => 'amount'],           
            'expected_close_date' => ['label' => __('Expected Close Date'), 'type' => 'date'],           
            'sales_stage' => ['label' => __('Sales Stage'), 'type' => 'dropdown'],
            'description' =>  ['label' => __('Description'), 'type' => 'textarea'],
        ];
        return $list_view_columns;
    }
}
