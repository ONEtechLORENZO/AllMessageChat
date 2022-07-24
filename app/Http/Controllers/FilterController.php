<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Filter;

class FilterController extends Controller
{
    public function getFilterData(Request $request)
    {
        $filterId = $_GET['selected_filter'];
        $filter = Filter::find($filterId);
        $conditions = unserialize( base64_decode( $filter->condition) );
        echo json_encode([
            'conditions' => $conditions,
            'name' => $filter->name,
            'selectedFilter' => $filterId,
        ]); 
        die;
    }
}
