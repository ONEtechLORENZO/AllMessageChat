<?php

namespace App\Http\Controllers;

use App\Models\Field;
use Illuminate\Http\Request;

class FormController extends Controller
{
    function fetchModuleFields(Request $request)
    {
        $user = $request->user();
        if($user->role != 'admin' && $request->route('module') == 'Price') {
            abort(401);
        }

        $fields = Field::where('module_name', 'Price')->get();

        return response()->json(['fields' => $fields]);
    }
}
