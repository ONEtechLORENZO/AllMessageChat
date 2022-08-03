<?php

namespace App\Http\Controllers;

use App\Models\Field;
use Illuminate\Http\Request;

class FormController extends Controller
{
    /**
     * Fetch module fields from Field model
     */
    function fetchModuleFields(Request $request)
    {        
        $user = $request->user();
        $module = $request->route('module');
        if($user->role != 'admin' && $module == 'Price') {
            abort(401);
        }

        $fields = Field::where('module_name', $module)
            ->where('user_id', $request->user()->id)
            ->get();
        return response()->json(['fields' => $fields]);
    }
}
