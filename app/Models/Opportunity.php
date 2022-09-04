<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Tag;
use App\Models\Service;
use App\Models\Category;
use App\Models\Note;

class Opportunity extends Model
{
    use HasFactory;
    protected $table = 'opportunities';

    protected $casts = [
        'custom' => 'array',
    ];

    protected $fillable = ['name', 'amount', 'contact_id', 'expected_close_date', 'assigned_to', 'sales_stage', 'description','created_at', 'updated_at'];

   
    /**
     * Return list view fields
     */
    public function getListViewFields()
    {
        $list_view_columns = [
            'name' => ['label' => ('Opportunity Name'), 'type' => 'text'],
            'amount' =>  ['label' => ('Amount'), 'type' => 'amount'],
            'contact_id' =>  ['label' => ('Email'), 'type' => 'text'],
            'expected_close_date' => ['label' => ('Expected Close Date'), 'type' => 'date'],
            'assigned_to' =>  ['label' => ('Assigned To'), 'type' => 'text'],
            'sales_stage' => ['label' => ('Sales Stage'), 'type' => 'dropdown'],
            'description' =>  ['label' => 'Description', 'type' => 'textarea'],
        ];
        return $list_view_columns;
    }
}
