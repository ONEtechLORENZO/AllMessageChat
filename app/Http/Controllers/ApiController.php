<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Api;
use Laravel\Sanctum\PersonalAccessToken;

class ApiController extends Controller
{
    
     /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $module = new Api();
        $list_view_columns = $module->getListViewFields();
        $listViewData = $this->listView($request, $module, $list_view_columns);
      
        if ($request->is('api/*')) // API call check
        {            
            unset($listViewData['related_records_header'],$listViewData['search'],$listViewData['filter'],$listViewData['compact_type'],$listViewData['list_view_columns'],$listViewData['sort_by'],$listViewData['sort_order'],$listViewData['translator']);
            return response()->json($listViewData);
        }
        else
        {     
            $moduleData = [
                'singular' => __('Api'),
                'plural' => __('Api keys'),
                'module' => 'Api',
                'current_page' => 'Api Reference',
                // Actions
                'actions' => [
                    'create' => true,
                    'detail' => true,
                    'edit' => true,
                    'delete' => true,
                    'export' => false,                
                    'search' => false,                
                    'select_field'=>false,
                    'merge' => false,
                ],
            ];

            $records =  $this->listViewRecord($request, $listViewData, 'Api');
            
            $data = array_merge($moduleData, $records);
            return Inertia::render('Api/List', $data);
        }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Contact  $contact
     * @return \Illuminate\Http\Response
     */ 
    public function create(Request $request, $id)
    {
        $api = Api::firstOrNew(['id' => $id]);
        
        return response()->json(['status' => true, 'record' => $api]);
        //$contact = $this->checkAccessPermission($request, $module, $request->id);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Contact  $contact
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
       $api = Api::find($id);
       $headers = $this->getModuleHeader( 'API');
       $headers['default']['api_key'] = [ 'label' => 'API key' , 'type' => 'text', 'name' => 'api_key', 'custom' => '0', 'read_only' => true ];

       return Inertia::render('Api/Detail', [
            'record' => $api,
            'current_userid' => $request->user()->id,
            'headers' => $headers,
            'translator' => Controller::getTranslations(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|max:255',
        ]);

        $api = Api::firstOrNew(['id' => $request->id]);
        $api->name = $request->name;
        if($request->id){
            $api->ip = $request->ip;   // Update a ip's
        } else {
            $api->ip = $request->options;  // New ip's

            $token = $request->user()->createToken('API_TOKEN');
            $request->api_key = $token->plainTextToken;
        }
        $api->read_only = ($request->read_only == 'Yes') ? true : $request->read_only ;
        $api->write_only = ($request->write_only == 'Yes') ? true : $request->write_only ;
        $api->api_key = $request->api_key;
        $api->save();
       
        return Redirect::route('detailApi' , $api->id );
    }

    public function destroy($id)
    {
       $api = Api::find($id);
       if(!$api){
        abort(404);
       }
       $api->delete();
       
       return Redirect::route('wallet_subscription');
    }

    public function linkApiToken(Request $request) {
        
        $api = Api::find($request->id);
        $api->api_key = $request->token;
        $api->save();

        // $token = new Token();
        // $token->token = $request->token;
        // $api->tokens()->save($token);

        return Redirect::route('detailApi', ['id' => $request->id]);
    }

    public function deleteApiToken(Request $request) {

        $token = PersonalAccessToken::find($request->token_id);

        if ($token) {
            $token->delete();
        }

        return Redirect::route('detailApi', ['id' => $request->record_id]);
    }
}
