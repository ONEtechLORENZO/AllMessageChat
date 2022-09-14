<?php

namespace App\Http\Controllers;

use App\Models\Automation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use App\Models\Account;
use App\Models\Template;
use App\Models\Tag;
use App\Models\Field;
use App\Models\Category;
use Inertia\Inertia;
use Cache;

class AutomationController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $module = new Automation();
        $list_view_columns = $module->getListViewFields();
        $listViewData = $this->listView($request, $module, $list_view_columns);

        $moduleData = [
            'singular' => __('Automation'),
            'plural' => __('Automations'),
            'module' => 'Automation',
            'current_page' => 'Automations', 

            // Actions
            'actions' => [
                'create' => true,
                'detail' => false,
                'edit' => true,
                'delete' => true,
                'export' => false,
                'import' => false,
                'search' => false,
                'filter' => false,
                'select_field'=>false,
            ],
        ];
        
        $data = array_merge($moduleData, $listViewData);
        return Inertia::render('Automation/List', $data);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request , $id)
    {
    
        $user_id = $request->user()->id;
        $companyId = Cache::get('selected_company_' . $user_id);
        $filterData = $this->getFiltersInfo($companyId, $user_id, 'Automation', false);
        $automation = Automation::where('company_id', $companyId)->where('id', $id)->first();
        if(! $automation){
            abort('404');
        }
        $parent = 'Contact';
        $data = [
            'record' => $automation,
            'options' => $automation->getTriggerOptions(),
            'module' => 'Automation',
            'filter' => $filterData,
            'parent' => $parent,
            'translator' => $this->getTranslations(),
        ];

        return Inertia::render('Automation/Createflow', $data);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $companyId = Cache::get('selected_company_' . $request->user()->id);
        $name = $request->name;

        // $id = ($request->id) ? $request->id : '';
        // dd($request);
        // if($id){
        //     $automation = Automation::where('company_id', $companyId)->where('id', $id)->first();
        // } else {
            $automation = new Automation();
            $automation->name = $name;
            $automation->status = $request->status;
            $automation->company_id = $companyId;
            $automation->save();

            // Redirect to React flow page for create workflow
            return Redirect::route('createAutomation', $automation->id);
     //   }

        // dd($request);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Automation  $automation
     * @return \Illuminate\Http\Response
     */
    public function show(Automation $automation)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Automation  $automation
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request, $id)
    {
       
        $companyId = Cache::get('selected_company_' . $request->user()->id);
        $record = Automation::where('company_id', $companyId)->where('id', $id)->select('name', 'status')->first();
        if(!$record) {
            abort(401);
        }
      
        return response()->json(['status' => true, 'record' => $record]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Automation  $automation
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Automation $automation)
    {
       
        $companyId = Cache::get('selected_company_' . $request->user()->id);
        $id = $request->id;
        $automation = Automation::where('company_id', $companyId)->where('id', $id)->first();
        if(! $automation){
            abort('404');
        }
        if(! $request->flow){
            $automation->name = $request->name;
            if( $request->status){
                $automation->status = $request->status;
            }
            $automation->save();
            return Redirect::route('createAutomation', $automation->id);
        }
 
        $automation->flow = $request->flow;
        if( $request->trigger){
            $automation->trigger_mode = $request->trigger;
        }
        $automation->save();
     
        echo json_encode(['result' => 'success' ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Automation  $automation
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $user_id = $request->user()->id;
        $companyId = Cache::get('selected_company_' . $user_id);
        
        $automation = Automation::where('company_id', $companyId)->where('id', $id)->first();
        if(!$automation){
            abort(404);
        }
        $automation->delete();
        return Redirect::route('listAutomation');
    }

    /**
     * Automation
     */
    public function automation(Request $request)
    {
        return Inertia::render('Automation/AutomationFlow');
    }

    /**
     * Return account List based on the company
     */
    public function getActionData(Request $request)
    {
        $return = [];
        $companyId = Cache::get('selected_company_' . $request->user()->id);
        if( $_GET['action_type'] == 'send_message') {
            $getAccountList = Account::where('company_id', $companyId)->get();
            foreach($getAccountList as $account){
                $return['account_list'][$account->id] = $account->company_name;
            }
            $account_id = isset($return['accountList']) ? array_keys($return['accountList']) : [];
            $getTemplates = Template::whereIn('account_id', $account_id)->get();
            foreach($getTemplates as $template){
                $return['template_list'][$template->id] = $template->name;
            }
        } else if('tag_contact' == $_GET['action_type']){ 
            $getTags = Tag::where('company_id', $companyId)->get();
            foreach($getTags as $tag){
                $return['tag_list'][$tag->id] = $tag->name;
            }
        } else if('list_contact' == $_GET['action_type']){ 
            $getList = Category::where('company_id', $companyId)->get();
            foreach($getList as $list){
                $return['list_list'][$list->id] = $list->name;
            }
        } else if('custom_field' == $_GET['action_type']){ 
            $module = 'Contact';
            $getFields = Field::where('module_name', $module)
                ->where('company_id', $companyId)
                ->where('is_custom' , 1)
                ->groupBy('field_name')
                ->get();
            foreach($getFields as $field){
                $return['field_list'][$field->field_name] = $field->field_label;
              
                $option = $field->options;
                $options = [];
                if ($option) {
                    foreach ($option as $key) {
                        $options[$key['value']] = $key['value'];
                    }
                }
                $field->options = $options;
                $return['field_info'][$field->field_name] = $field;
            }
            
        } 
        echo json_encode(['result' =>$return ]);
    }

}
