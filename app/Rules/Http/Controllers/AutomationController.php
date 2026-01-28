<?php

namespace App\Http\Controllers;

use App\Models\Automation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use App\Models\AutomationResult;
use App\Models\Account;
use App\Models\Template;
use App\Models\Tag;
use App\Models\Field;
use App\Models\Category;
use App\Models\Contact;
use App\Models\Lead;
use Inertia\Inertia;
use Log;
use DB;
use Cache;
use Str;

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
        $menuBar = $this->fetchMenuBar();

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
            'menuBar' => $menuBar
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

            $uniqueId = Str::uuid()->toString();
            $automation = new Automation();
            $automation->name = $name;
            $automation->status = $request->status;
            $automation->company_id = $companyId;
            $automation->uuid = $uniqueId;
            $automation->save();

            // Redirect to React flow page for create workflow
            return Redirect::route('createAutomation', $automation->id);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Request $request
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request , $id )
    {
        $result = AutomationResult::find($id);
        $data['flow'] = unserialize(base64_decode($result->flow));
        $data['parent'] = $result->automation_id;
        $data['translator']= $this->getTranslations();
        
        return Inertia::render('Automation/ResultPreview', $data);
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
            $automation->status = $request->status;
            $automation->save();
            return response()->json(['status' => true , 'result' => 'success']);
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
        // Delete Relate table entry
        DB::table('webhook_data')->where('automation_id' , $automation->id)->delete();

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

             // Collect Message requird data
            $getAccountList = Account::where('company_id', $companyId)->get();
            foreach($getAccountList as $account){
                $return['account_list'][$account->id] = $account->company_name;
            }
            $account_id = isset($return['accountList']) ? array_keys($return['accountList']) : [];
            $getTemplates = Template::where('company_id', $companyId)->get();
            foreach($getTemplates as $template){
                $return['template_list'][$template->template_uid] = $template->name;
            }
        } else if('tag_contact' == $_GET['action_type']){ 

            // Get tag list
            $getTags = Tag::where('company_id', $companyId)->get();
            foreach($getTags as $tag){
                $return['tag_list'][$tag->id] = $tag->name;
            }
        } else if('list_contact' == $_GET['action_type']){ 

            // Get category list
            $getList = Category::where('company_id', $companyId)->get();
            foreach($getList as $list){
                $return['list_list'][$list->id] = $list->name;
            }
        } else if('custom_field' == $_GET['action_type']){ 

            // Get custom field list
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
            
        } else if( in_array($_GET['action_type'] , ['create_contact', 'update_contact', 'create_lead', 'update_lead']) ){ 

            $automation = Automation::where([
                            'id' => $_GET['record'],
                        ])
                        ->first();
            
            $return['sample_data'] = $this->getSampleData($request , $automation->id , $automation->uuid , true);

        } 
        echo json_encode(['result' =>$return ]);
    }

    /**
     * Store action data
     */
    public function storeWebActionData(Request $request)
    {
       
        $recordId = $request->get('automation_id') ;
        $uuid = $request->get('unique_id') ;
        $automation = Automation::where([
                'id' => $recordId,
                'uuid' => $uuid,
            ])
            ->first();

        if($automation){
            $data = json_encode($_POST);

            // Store post data 
            DB::table('webhook_data')
                ->updateOrInsert(
                    ['automation_id' => $automation->id],
                    ['data' => $data]
                );
            $result = 'Data updated.';
            if($automation->trigger_mode == 'received_webhook' ){
                unset($_REQUEST['isFlowAction']);   // Reset the flow action
                
                $flow = json_decode($automation->flow);
              
                // by Default
                $bean = new Lead;
                $result = $automation->getFlowResult($flow , $bean);
              
            }
            return response()->json(['status' => true , 'result' => 'Webhook process works successfully. ']);
        }
        abort(403, 'Unauthorized action.');
    }


    /**
     * Return sample data 
     * 
     * @param {Integer} $automationId
     * @param {String} $uuid
     */
    public function getSampleData(Request $request, $automationId, $uuid, $functionCall = false)
    {
        $data = ''; 
        $automation = Automation::where([
            'automations.id' => $automationId,
            'uuid' => $uuid,
        ])
        ->join('webhook_data', 'automations.id' , 'automation_id')
        ->first('data');
        
        if($automation){
            $data = json_decode($automation->data);
        }
        if($functionCall){
            return $data;
        } else {
            return response()->json(['status' => true, 'result' => $data]);
        }
    }

    /**
     * Test post data
     */
    public function testPostData(Request $request)
    {
        $automation = new Automation;
        $url = $request->post_url;
        $data = $headers = [];
        if($request->data_headers) {
            foreach($request->data_headers as $header) {
                $headers[$header['header_type']] = $header['header_value']; 
            }
        }

        if($request->field_mapping) {
            foreach($request->field_mapping as $fieldMap){
                $fieldName = $automation->getModuleFieldName($fieldMap['map_field']);            
                $data[$fieldMap['field_name']] = $fieldMap['map_field'];
            }
        }

        $result = $automation->sendData( $request->method, $url, $headers, $data );
        
        return response()->json($result->body());
    }

    /**
     * Return Automation History list
     */
    public function getHistoryList(Request $request , $id)
    {
        
        $history = AutomationResult::select('automation_results.id', 'bean', 'bean_id' , 'automation_results.status' , 'automation_results.created_at')
            ->join('automations' , 'automations.id' , 'automation_id')
            ->where( 'automation_id', $id)
            ->orderBy('automation_results.created_at' , 'desc')
            ->get();

        $records = [];
        $name = '';
        foreach($history as $record){
            if($record->bean && $record->bean == 'Contact'){
                $contact = Contact::find($record->bean_id);
                $name = $contact->first_name. ' ' .$contact->last_name;
            }
            $records[] = [
                'id' => $record->id,
                'name' => $name,
                'status' => $record->status,
                'created_at' => date_format($record->created_at,"d-m-Y H:i:s"),
            ];   
        }
    

        return response()->json(['records' => $records]);
    }
}