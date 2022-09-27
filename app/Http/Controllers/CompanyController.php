<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Company;
use App\Models\UserInvite;
use Inertia\Inertia;
use Cache;
use Mail;
use DB;

class CompanyController extends Controller
{

    public $list_view_columns = [
        'name' => ['label' => 'Name', 'type' => 'text'],
        'address_line_1' =>  ['label' => 'Address 1', 'type' => 'text'],
        'address_line_2' =>  ['label' => 'Address 2', 'type' => 'text'],
        'city' => ['label' =>'City', 'type' => 'text'],
        'state' => ['label' =>'State', 'type' => 'text'],
        'country' => ['label' =>'Country', 'type' => 'text'],
       
    ];

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
      
        $module = new Company();
        $columnlist=Cache::get('Company'.'selected_column_list_'. $request->user()->id);       
        $listViewData = $this->listView($request, $module, $this->list_view_columns);
        $moduleData = [
            'singular' => 'Company',
            'plural' => 'Companies',
            'module' => 'Company',
            'current_page' => 'Company', 
            // Actions
            'actions' => [
                'create' => true,
                'detail' => true,
                'edit' => true,
                'delete' => true,
                'export' => false,
                'import' => false,
                'search' => true,
                'filter' => false,
                'select_field'=>true,
            ],
            'translator' => [],
        ];

        $data = array_merge($moduleData, $listViewData);
        
        return Inertia::render('Company/List', $data);
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
    
        $request->validate([
            'name' => 'required|max:255',
        ]);

        $company = Company::firstOrNew(['id' => $request->id]);

        $company->name = $request->name;
        $company->address_line_1 = $request->address_line_1;
        $company->address_line_2 = $request->address_line_2;
        $company->city = $request->city;
        $company->state = $request->state;
        $company->country = $request->country;

        $company->currency = $request->get('currency');
        $company->time_zone = $request->get('time_zone');
        $company->company_address = $request->get('company_address');
        $company->company_country = $request->get('company_country');
        $company->company_vat_id = $request->get('company_vat_id');
        $company->codice_destinatario = $request->get('codice_destinatario');
        $company->admin_email = $request->get('admin_email');

        $company->save();
        if(!$request->id){
            DB::table('company_user')->insert([
                'user_id' => $request->user()->id,
                'company_id' => $company->id
            ]);
        }
       // return Redirect::route('detailCompany', $company->id );
       return Redirect::route('dashboard');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $company = Company::find($id);
        $users = $company->user;

        // Check user can access the record
        $access = $this->checkPermissin($id, $user);
        if(!$access){
            abort('401');
        }

        $companyId = Cache::get('selected_company_'. $user->id);
        $headers = $this->getModuleHeader(1 , 'Company');
        
        $data = [
            'record' => $company,
            'users' => $users,
            'headers' => $headers,
            'translator' => [
                'Detail' => __('Detail'),
                'Notes' => __('Notes'),
                'Edit'  =>__('Edit')
                ]
        ];
        return Inertia::render('Company/Detail', $data);
       
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $company = Company::findOrFail($id);
        echo json_encode(['record' => $company]);
        die;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $company = Company::find($id);
        $company->delete();
        return Redirect::route('listCompany');
    }

    /**
     * Send invite users via mail
     */
    public function sendInvitation(Request $request)
    {
        $emailAddress = [];
        $user = $request->user();
        $company = $user->company[0];

        foreach($request->email as $email){
            $emailAddress = $email['value'];
            $emailAddress = filter_var($emailAddress, FILTER_SANITIZE_EMAIL);

            if (filter_var($emailAddress, FILTER_VALIDATE_EMAIL)) {
                
                $uuid = Str::uuid()->toString();
                $url = url('/') . '/user-invite?unique_id='.$uuid;
                $data['url'] = $url;

                Mail::send('InviteUser', $data, function($message) use($emailAddress) {
                    $message->to($emailAddress)->subject
                    ('User invitation ');
                });
                
                $userInvite = new UserInvite();
                $userInvite->email = $emailAddress;
                $userInvite->user_id = $user->id;
                $userInvite->company_id = $company->id;
                $userInvite->unique_id = $uuid;
                $userInvite->save();
            }
        }
        echo json_encode(['result' => 'success']); die;
    }

    /**
     * Set Base company to the user data
     */
    public function setBaseCompany(Request $request)
    {
        $companyId = $request->company_id;
        Cache::put('selected_company_'. $request->user()->id  , $companyId);
        
        return Redirect::to(url()->previous());
    }
    public function showColumn(Request $request,$module)
    {
        $columnList = $request->columns;       
        Cache::put($module.'selected_column_list_'. $request->user()->id  , $columnList);              
        return Redirect::to(url()->previous());
    }


    /**
     * Check permission to user can access the record
     */
    public function checkPermissin( $recordId , $user)
    {
        $companyId = Cache::get('selected_company_'.$user->id);
        $userCompanies = $user->company;
        $return = false; 
        foreach($userCompanies as $company){
            if($company->id == $recordId ){
                $return = true;
            }
        }
        return $return;
    }

    public function saveWorkspace(Request $request) {
        
        $request->validate([
            'name' => 'required|max:255',
            'currency' => 'required',
            'time_zone' => 'required'
        ]);

        $company = new Company;

        $company->name = $request->name;
        $company->currency = $request->currency;
        $company->time_zone = $request->time_zone;
        $company->save();

       if($request->user()){
            DB::table('company_user')->insert([
                'user_id' => $request->user()->id,
                'company_id' => $company->id
            ]);
       }

       if($company->id){
          Cache::put('selected_company_'. $request->user()->id  , $company->id);
       }

       return response()->json(['status' => true]);
    }
}
