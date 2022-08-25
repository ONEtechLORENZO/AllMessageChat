<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Campign;
use App\Models\Contact;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Redirect;
use Cache;
use App\Models\Taggable;
use App\Models\Msg;
use App\Http\Controllers\MsgController;
use App\Models\Account;

class CampignController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $list_view_columns = [
            'name' => ['label' => __('Name'), 'type' => 'text'],
            'status' =>  ['label' => __('Status'), 'type' => 'text'],
            'service' =>  ['label' => __('Service'), 'type' => 'text'],
            'scheduled_at' => ['label' => __('Scheduled'), 'type' => 'text'],
        ];

        $module = new Campign();
        $listViewData = $this->listView($request, $module, $list_view_columns);

        $moduleData = [
            'singular' => __('Campaign'),
            'plural' => __('Campaigns'),
            'module' => 'Campign',
            'current_page' => 'Campaigns', 
            // Actions
            'actions' => [
                'create' => true,
                'detail' => true,
                'edit' => false,
                'delete' => true,
                'export' => false,
                'import' => false,
                'search' => true,
                'filter' => true,
            ],
        ];
        
        $data = array_merge($moduleData, $listViewData);
        return Inertia::render('Campign/List', $data);
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
    public function store(Request $request, Campign $campaign)
    { 
        if($request){
            $request->validate([
                'name' => 'required'
            ]);
        }

        $user_id = $request->user()->id;
        $company_id = Cache::get('selected_company_'.$user_id);
        $translator = Controller::getTranslations();
        $filter = Controller::getFiltersInfo($company_id, $user_id, 'Campign', '');
        $count = '';

        if($request->id){
 
            $campaign = Campign::findOrFail($request->id);
            $currentPage = $request->tab;
                 
            if($request->name){
                $campaign->name = $request->name;
                $campaign->service = $request->service;
                $campaign->action = $request->action;
                $campaign->account_id = $request->account_id;
            }
            if($request->conditions){
                $conditions = json_encode($request->conditions);
                $campaign->conditions = $conditions;
            }
            if($request->scheduled_at){
                $scheduledTime = $request->scheduled_at;
                if($scheduledTime == 'now'){
                    $currentDate = gmdate('Y-m-d h:i:s');
                    $campaign->scheduled_at = $currentDate;
                }else{
                    $scheduledTime = date( 'Y-m-d h:i:s', strtotime( $scheduledTime) );
                    $campaign->scheduled_at = $scheduledTime;
                } 
            }
                
            if($currentPage == 4){
                $campaign->offset = 0;
                $campaign->current_page = $currentPage;
                $campaign->status = 'new';
                $campaign->save();

                return Redirect::route('listCampign');
            }

            $campaign->current_page = $currentPage + 1;
            $campaign->save();

            if($campaign->conditions){
                $searchData = json_decode($campaign->conditions);
                $contacts = $this->getTotalContact($searchData);
                $count = count($contacts);
                $campaign->conditions = $searchData;
            }

        }else{
            $campaign->name = $request->name;
            $campaign->status = 'draft';
            $campaign->company_id = $company_id;
            $campaign->current_page = 1;
            $campaign->save();
        }

        return Inertia::render('Campign/Form',[
            'translator' => $translator, 
            'filter' => $filter,
            'campign' => $campaign,
            'status' => $campaign->status,
            'count' => $count,
        ]); 
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Campign  $campign
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $user_id = $request->user()->id;
        $company_id = Cache::get('selected_company_'.$user_id);
        $campign = Campign::where('id',$request->id)
                   ->where('company_id', $company_id)
                   ->first();
         
        if(!$campign){
            about(401);
        } 
        
        $count = '';
        $companyName = [];
        $status = $campign->status;
        $conditions = $campign->conditions;
   
        if($conditions){
            $searchData = json_decode($conditions);
            $campign->conditions = $searchData;
            $contacts = $this->getTotalContact($searchData);
            $count = count($contacts);
        };
      
        if($campign->service){
            $accounts = Account::where('company_id',$company_id)
                        ->where('service',$campign->service)          
                        ->get();

            foreach($accounts as $account){
                  $companyName[$account->id] = $account->company_name;
            }
        }

        $user_id = $request->user()->id;
        $translator = Controller::getTranslations();
        $filter = Controller::getFiltersInfo($company_id, $user_id, 'Campign', '');
    
        return Inertia::render('Campign/Form',[
            'translator' => $translator, 
            'filter' => $filter, 
            'campign' => $campign, 
            'status' => $status,
            'count' => $count, 
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Campign  $campign
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request,$id)
    {     
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Campign  $campign
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Campign $campign)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Campign  $campign
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $campign = Campign::find($id);
        $campign->delete();
        return Redirect::route('listCampign');
    }

    public function searchRecords(Request $request){

        $list_view_columns = [];
        $module = new Contact();
        $listViewData = $this->listView($request, $module, $list_view_columns);

        echo $listViewData;
    } 

    public function getTotalContact($searchData){

        $module = new Contact(); 

        $fields = [
            'first_name' => ['label' => __('First Name'), 'type' => 'text'],
            'last_name' =>  ['label' => __('Last Name'), 'type' => 'text'],
            'email' =>  ['label' => __('Email'), 'type' => 'text'],
            'phone_number' => ['label' => __('Phone number'), 'type' => 'phone_number'],
            'instagram_id' =>  ['label' => 'Instagram Id', 'type' => 'text'],
        ];       
        
        $contacts = $this->getContactRecords($module, $fields, $searchData, '', '');
        
        return $contacts;
    }

    public function getCompanyName(Request $request, $service){
        
        if($service){
            $user_id = $request->user()->id;
            $company_id = Cache::get('selected_company_'.$user_id);

            $accounts = Account::where('company_id',$company_id)
                        ->where('service',$service)          
                        ->get();

            foreach($accounts as $account){
                  $companyName[$account->id] = $account->company_name;
            }
        }

        echo json_encode($companyName); die;
    }
}
