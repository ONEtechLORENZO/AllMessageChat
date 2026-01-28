<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Filter;
use Illuminate\Support\Facades\Redirect;
use Cache;

class FilterController extends Controller
{

    /**
     * Store Filter condition
     */
    public function storeFilter(Request $request)
    {
        if(isset($request->filter_id) && $request->filter_id ){
            $filter = Filter::FindOrFail($request->filter_id);
        } else {
            $filter = new Filter();
        }
        $filter->name = $request->filter_name;
        $filter->module_name = $request->module_name;
        $filter->user_id = $request->user()->id;
       // $filter->company_id = Cache::get('selected_company_'. $request->user()->id);
        $filter->condition = base64_encode( serialize( json_decode($request->filter) ));
        $filter->is_chat = ($request->is_chat) ?  true : false;
        $filter->save();

        if($request->is_chat){
            return Redirect::route('chat_list', ['filter_id' => $filter->id]);
        } else if ($request->module_name == 'Msg ' || $request->module_name == 'Transaction') {
            return Redirect::route('wallet', ['filter_id' => $filter->id]);
        } else if ($request->module_name == 'Message') {
            return Redirect::route('listMessage', ['filter_id' => $filter->id]);
        }else {
            return Redirect::route('listContact', ['filter_id' => $filter->id]);
        }
    }

    /**
     * Return Filter condition
     */
    public function getFilterData(Request $request)
    {
        $filterId = $_GET['filter_id'];
        $filter = Filter::find($filterId);
        $conditions = unserialize( base64_decode( $filter->condition) );
        echo json_encode([
            'conditions' => $conditions,
            'name' => $filter->name,
            'selectedFilter' => $filterId,
        ]); 
        die;
    }

    /**
     * Delete Filter
     */
    public function deleteFilter(Request $request)
    {
        $filter = Filter::find($request->filter_id);
        $filter->delete();
        return Redirect::route('listContact');
    }
}
