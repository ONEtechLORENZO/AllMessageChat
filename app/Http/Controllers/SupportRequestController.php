<?php

namespace App\Http\Controllers;

use App\Models\SupportRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Cache;
use App\Models\Field;
use App\Models\User;
use DB;


class SupportRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $module = new SupportRequest();       
        
        $list_view_columns = $module->getListViewFields();
        $listViewData = $this->listView($request, $module, $list_view_columns);

        $moduleData = [
            'singular' => 'Support Request',
            'plural' => ( $request->is('admin/*') ) ?  'Global Support Requests':'Support Requests',
            'module' => 'SupportRequest',
            'current_page' => 'Support Requests', 
            'current_user' => $request->user(),
            // Actions
            'actions' => [
                'create' => true,
                'detail' => true,
                'edit' => true,
                'delete' => true,
                'export' => false,
                'import' => false,
                'search' => true,
                'filter' => true,
                'select_field'=>true,                
            ],
        ];
        
        $data = array_merge($moduleData, $listViewData);
        return Inertia::render('SupportRequest/List', $data);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {        
        $supportRequest_id = $this->saveSupportRequest($request);
        return Redirect::route('listSupportRequest');
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\SupportRequest  $supportRequest
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request,$supportRequestID)
    {
        $module = new SupportRequest();
        $supportRequest = SupportRequest::findorFail($request->id);       
        if(!$supportRequest) {
            abort('404');
        }
        $companyId = Cache::get('selected_company_'. $request->user()->id);
        $headers = $this->getModuleHeader($companyId, 'SupportRequest');

        //assign user details
         $user = User::where('id', $supportRequest->assigned_to)->first();
         if($user){
            $supportRequest['assigned_to'] = [ 'label' => $user['name'] , 'value' => $user['id'], 'module' => 'User'];
        }  
        return Inertia::render('SupportRequest/Detail', [
            'record' => $supportRequest,            
            'headers' => $headers,
            'current_user' => $request->user(),
            'current_userid' => $request->user()->id, 
            'translator' => [
                'Detail' => __('Detail'),
                'Notes' => __('Notes'),
                'Edit'  =>__('Edit')
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\SupportRequest  $supportRequest
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request, $id)
    {
        $module = new SupportRequest();
        $SupportRequest = $this->checkAccessPermission($request, $module, $id);

        if(!$SupportRequest) {
            return response()->json(['status' => false, 'message' => 'Record not found']);   
        }

      /*  //related field pre-fill       
        if($SupportRequest->assigned_to){
            $user = User::findOrFail($SupportRequest->assigned_to);
            $SupportRequest['assigned_to'] = ['value' => $user->id, 'label' => $user->name];
        }        */
        return response()->json(['record' => $SupportRequest]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\SupportRequest  $supportRequest
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $currentUser = $request->user();         
        $module = new SupportRequest();
       
        $supportRequest = $this->checkAccessPermission($request, $module, $request->id);
        if(!$supportRequest) {
            abort('404');
        }
        $supportRequest_id = $this->saveSupportRequest($request);
        return Redirect::route('listSupportRequest');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\SupportRequest  $supportRequest
     * @return \Illuminate\Http\Response
     */
    public function destroy(SupportRequest $supportRequest,$supportRequestID)
    {
        $supportRequest = SupportRequest::find($supportRequestID);
        $supportRequest->delete();
        return Redirect::route('listSupportRequest');
    }

    public function saveSupportRequest($request){
        $current_user = $request->user();   

        if ($request->id) {           
            $supportRequest = SupportRequest::findOrFail($request->id);
        } else {            
            $supportRequest = new SupportRequest();
        }
        
        $company_id = Cache::get('selected_company_'. $request->user()->id);
         
       
            
        
            $supportRequest->subject= $request->subject;
            $supportRequest->description = $request->description;
            $supportRequest->type = $request->type;
            $supportRequest->assigned_to =1;
            $supportRequest->status='New';
            $supportRequest->company_id = $company_id;
            $supportRequest->created_by = $request->user()->id;
            $supportRequest->save();
       
        return  $supportRequest->id;
    }  
}
