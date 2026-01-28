<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    use HasFactory;
    protected $table = 'organizations';
    protected $casts = [
        'custom' => 'array',
        'languages_spoken' =>'array'
    ];
    protected $fillable = ['name', 'industry', 'number_of_employees', 'annual_turnover', 'tax_id', 'country', 'state','street','email','website','phone_number','company_id','created_at', 'updated_at'];

   
    /**
     * Return list view fields
     */
    public function getListViewFields()
    {
        $list_view_columns = [
            'name' => ['label' => __('Organization Name'), 'type' => 'text'],
            'industry' =>  ['label' => __('Industry'), 'type' => 'text'],           
            'number_of_employees' => ['label' => __('Number Of Employees'), 'type' => 'text'],           
            'annual_turnover' => ['label' => __('Annual Turnover'), 'type' => 'text'],
            'country' =>  ['label' => __('Country'), 'type' => 'dropdown'],
            'phone_number' =>  ['label' => __('Phone Number'), 'type' => 'phone_number'],
        ];
        return $list_view_columns;
    }


}
