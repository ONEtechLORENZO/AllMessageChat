<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Company;
use App\Models\UserInvite;
use Inertia\Inertia;
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

        $company->save();
        if(!$request->id){
            DB::table('company_user')->insert([
                'user_id' => $request->user()->id,
                'company_id' => $company->id
            ]);
        }
        return Redirect::route('listCompany');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $company = Company::find($id);

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
}
