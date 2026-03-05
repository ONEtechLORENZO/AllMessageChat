<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\LineItem;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';

    protected $fillable = ['name', 'due_date', 'status','opportunity','company_id', 'description','created_at', 'updated_at'];

    protected $with = ['lineItem'];
  
    /**
     * Return list view fields
     */
    public function getListViewFields()
    {
        $list_view_columns = [
            'name' => ['label' => __('Subject'), 'type' => 'text'],
            'due_date' =>  ['label' => __('Due Date'), 'type' => 'date'],
            'status' =>  ['label' => __('Status'), 'type' => 'dropdown'],
            'description' => ['label' => __('Description'), 'type' => 'textarea'],
        ];
        return $list_view_columns;
    }

    public function lineItem()
    {
        return $this->hasMany(LineItem::class);
    }
}
