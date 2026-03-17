<?php

namespace App\Http\Controllers;

use Cache;
use Inertia\Inertia;
use App\Models\Account;
use App\Models\Campaign;
use App\Models\Contact;
use App\Http\Controllers\Controller;
use App\Models\Msg;
use App\Http\Controllers\MsgController;
use App\Models\Taggable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use App\Models\Template;

class CampaignController extends Controller
{
    protected function getCampaignAccountsForUser(int $userId, ?string $service = null)
    {
        return Account::where('user_id', $userId)
            ->when($service, function ($query) use ($service) {
                $query->where('service', $service);
            })
            ->orderBy('company_name')
            ->get();
    }

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

        $module = new Campaign();
        $listViewData = $this->listView($request, $module, $list_view_columns);
        $menuBar = $this->fetchMenuBar();

        $moduleData = [
            'singular' => __('Campaign'),
            'plural' => __('Campaigns'),
            'module' => 'Campaign',
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
                'select_field'=>true
            ],
            'menuBar' => $menuBar
        ];
        
        $data = array_merge($moduleData, $listViewData);
        return Inertia::render('Campaign/List', $data);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
        $user_id = $request->user()->id;
        $company_id = Cache::get('selected_company_' . $user_id);

        $campaign = new Campaign();
        $campaign->current_page = 1;
        $campaign->status = 'draft';

        $translator = Controller::getTranslations();
        $filter = Controller::getFiltersInfo($company_id, $user_id, 'Campaign', '');

        return Inertia::render('Campaign/Form', [
            'translator' => $translator,
            'filter' => $filter,
            'campaign' => $campaign,
            'status' => $campaign->status,
            'count' => '',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, Campaign $campaign)
    { 
        if($request){
            $request->validate([
                'name' => 'required'
            ]);
        }

        $user_id = $request->user()->id;
        $company_id = 1;
        $translator = Controller::getTranslations();
        $filter = Controller::getFiltersInfo($company_id, $user_id, 'Campaign', '');
        $count = '';

        if($request->id){
 
            $campaign = Campaign::findOrFail($request->id);
            $currentPage = $request->tab;
                 
            if($request->name){
                $campaign->name = $request->name;
                $campaign->service = $request->service;
                $campaign->account_id = $request->account_id;
                $campaign->template_id = $request->template_id;
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

                return Redirect::route('campaign_success', ['id' => $campaign->id]);
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

        return Inertia::render('Campaign/Form',[
            'translator' => $translator, 
            'filter' => $filter,
            'campaign' => $campaign,
            'status' => $campaign->status,
            'count' => $count,
        ]); 
    }

    public function success(Request $request, $id = null)
    {
        $translator = Controller::getTranslations();
        $menuBar = $this->fetchMenuBar();
        $summary = null;

        if ($id) {
            $campaign = Campaign::find($id);

            if ($campaign) {
                $accountName = null;
                if ($campaign->account_id) {
                    $account = Account::find($campaign->account_id);
                    if ($account) {
                        $accountName = $account->company_name;
                    }
                }

                $summary = [
                    'name' => $campaign->name,
                    'account' => $accountName,
                    'channel' => $campaign->service,
                    'scheduled_at' => $campaign->scheduled_at,
                    'audience' => $campaign->conditions ? 'Filtered' : 'All contacts',
                ];
            }
        }

        return Inertia::render('Campaign/Success', [
            'translator' => $translator,
            'menuBar' => $menuBar,
            'current_page' => 'Campaigns',
            'campaign' => $summary,
        ]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Campaign  $campaign
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $module = new Campaign();
        $campaign = $this->checkAccessPermission($request, $module, $id);

        if(!$campaign){
            abort('404');
        } 

        $company_id = Cache::get('selected_company_'.$request->user()->id);
        
        $count = '';
        $companyName = [];
        $status = $campaign->status;
        $conditions = $campaign->conditions;
  
        if($conditions){
            $searchData = json_decode($conditions);
            $campaign->conditions = $searchData;
            $contacts = $this->getTotalContact($searchData);
            $count = count($contacts);
        };
      
        if($campaign->service){
            $accounts = $this->getCampaignAccountsForUser(
                (int) $request->user()->id,
                $campaign->service
            );

            foreach($accounts as $account){
                  $companyName[$account->id] = $account->company_name;
            }
        }

        $user_id = $request->user()->id;
        $translator = Controller::getTranslations();
        $filter = Controller::getFiltersInfo($company_id, $user_id, 'Campaign', '');
    
        return Inertia::render('Campaign/Form',[
            'translator' => $translator, 
            'filter' => $filter, 
            'campaign' => $campaign, 
            'status' => $status,
            'count' => $count, 
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Campaign  $campaign
     * @return \Illuminate\Http\Response
     */
    public function edit(Campaign $campaign)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Campaign  $campaign
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Campaign $campaign)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Campaign  $campaign
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $campaign = Campaign::find($id);
        $campaign->delete();
        return Redirect::route('listCampaign');
    }

    public function searchRecords(Request $request){

        $module = new Contact();
        $list_view_columns = $module->getListViewFields();
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
            'instagram_username' => ['label' => __('Instagram Username'), 'type' => 'text'],
        ];       
        
        $contacts = $this->getContactRecords($module, $fields, $searchData, '', '');
        
        return $contacts;
    }

    public function getCompanyName(Request $request, $service){
        $companyName = [];

        if($service){
            $accounts = $this->getCampaignAccountsForUser(
                (int) $request->user()->id,
                $service
            );

            foreach($accounts as $account){
                  $companyName[$account->id] = $account->company_name;
            }
        }

        return response()->json($companyName);
    }

    /**
     * Get template list
     */
    public function getTemplateList(Request $request, $account)
    {
        $templateList = [];
        $templates = Template::where('account_id', $account)
            ->orderBy('name')
            ->get();
        foreach($templates as $template){
            $templateList[$template->id] = $template->name;
        }
        return response()->json(['templates' => $templateList]);
    }
}
