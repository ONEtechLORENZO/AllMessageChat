<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\Controller;
use App\Models\Field;
use App\Models\Contact;
use App\Models\AutomationResult;
use App\Models\Lead;
use Log;

class Automation extends Model
{
    use HasFactory;

    public $recordModal;
    public $enquiryNodes = [];
    public $nodes = [];
    public $edges = [];
    public $duplicate = ''; 

    /**
     * Return List view field
     */
    public function getListViewFields()
    {
        $list_view_columns = [
            'name' => ['label' => 'Name', 'type' => 'text'],
            'trigger_mode' => ['label' => 'Trigger Name', 'type' => 'text'],
            'status' =>  ['label' => 'Status', 'type' => 'checkbox'],
            'created_at' =>  ['label' => 'Created Date', 'type' => 'date'],
        ];
        return $list_view_columns;
    }
    
    /**
     * Return options
     */
    public function getTriggerOptions()
    {
        $return['triggers'] = array('contact_created' => array('name' => 'contact_created', 'label' => 'New contact is added'), 'lead_created' => array('name' => 'lead_created', 'label' => 'New lead is added'), 'lead_updated' => array('name' => 'lead_updated', 'label' => 'Lead updated'),'contact_list_related' => array('name' => 'contact_list_related', 'label' => 'New contact is added to list'), 'contact_tag_related' => array('name' => 'contact_tag_related', 'label' => 'New contact is added to tag'), 'received_webhook' => array('name' => 'received_webhook', 'label' => 'Webhook is received'));
        $return['processTypes'] = array('action' => array('label' => 'Action', 'name' => 'action'), 'condition' => array('label' => 'Condition', 'name' => 'condition'), 'exit' => array('label' => 'Exit', 'name' => 'exit'));        
        $return['actions'] = array('send_message' => array('label' => 'Send Message', 'name' => 'send_message'), 'tag_contact' => array('label' => 'Add a tag to a contact', 'name' => 'tag_contact'), 'list_contact' => array('label' => 'Add a list to a contact', 'name' => 'list_contact'), 'custom_field' => array('label' => 'Set a custom field', 'name' => 'custom_field'), 'send_request' => array('label' => 'Send HTTP Request', 'name' => 'send_request'));
        $return['webHookActions'] = array('create_contact' => array('label' => 'Create Contact', 'name' => 'create_contact' , 'module' => 'Contact'), 'update_contact' => array('label' => 'Update Contact', 'name' => 'update_contact' , 'module' => 'Contact'), 'create_lead' => array('label' => 'Create Lead', 'name' => 'create_lead', 'module' => 'Lead'),'update_lead' => array('label' => 'Update Lead', 'name' => 'update_lead', 'module' => 'Lead'));

        return $return;
    }

    /**
     * Handle flow result
     *
     * @param  Object  $flow
     * @param  Object  $recordModal
     * @return void
     */
    public function getFlowResult($flow , $recordModal )
    {
        if(! isset($_REQUEST['isFlowAction'])){

            $this->recordModal = $recordModal;
            
            $this->nodes = $flow->nodes;
            $this->edges = $flow->edges;
            $this->duplicate = $flow;

            $statnode = 0; 
            $edge = $this->edges[$statnode];
            $node = $this->getNextNode($edge->target);
            $this->processNodeAction($node, $statnode);
            
            $history = new AutomationResult();
            $history->automation_id = $this->id;
            $history->company_id = $this->company_id;
            $history->bean = class_basename($recordModal);
            $history->bean_id = $recordModal->id;
            $history->flow = base64_encode( serialize($this->duplicate));
            $history->status = true;
        //    dd($this->duplicate);
            $history->save();
        }
    }

    /**
     * Process node action
     */
    public function processNodeAction($node, $i)
    {
       
        // Check the node already visited
        if( isset($node->id) && ! in_array($node->id,$this->enquiryNodes)){ 
            // Store visited nodes
            $this->enquiryNodes[] = $node->id; 

            $actionData = ($node->data && isset($node->data->action)) ? $node->data->action : '';
            
            // Check condition based end node
            if($node->type == 'output'){
                // Clear other nodes & edges
                $this->nodes = [];
                $this->edges = []; 
            } 

            if(!$actionData){
                return true;
            }

            if($node->type == 'action'){
                // Do action which one is selected
                if($actionData){
                    $this->doAction($actionData);
                }
                $nextEdge = $this->getNextEdge($node , 'source');
                $node = $this->getNextNode($nextEdge->target);
                $this->processNodeAction($node, $i);

            } elseif ($node->type == 'condition') {
                $recordModal = $this->recordModal;
                $baseTable = $recordModal->getTable();
                $query = $recordModal->where($baseTable.'.id' , $recordModal->id);
                $result = $this->checkCondition($actionData, $query, $baseTable);
                
                // Find current edge position
                $i = $this->getCurrentEdgeInex($node->id);

                if($result){
                    $i ++; // If the condition is true, move next node
                } else {
                    $i = $i + 2; // If the condition is false, move second node
                }

                // Upddadte duplicate flow 
                $this->updateDuplicateFlow($node , $result);

                $edge = $this->edges[$i];
                $currentNode = $this->getNextNode($edge->target);
                $this->enquiryNodes[] = $currentNode->id;
                $nextEdge = $this->getNextEdge($currentNode , 'source');
                $node = $this->getNextNode($nextEdge->target);
                
                $this->processNodeAction($node, $i);
            }
        }
    }

    /**
     * Return node's next edge
     */
    public function getNextEdge($node , $mode)
    {
        $return = '';
        $nodeId = $node->id;
        foreach($this->edges as $edge){
            if($mode == 'source' && $nodeId == $edge->source) {
                $return = $edge;
            } elseif($mode == 'target' && $nodeId == $edge->target) {
                $this->updateDuplicateFlow($node , true);
                $return = $edge;
            }
        }
        return $return;
    }

    /**
     *  Return next node
     */
    public function getNextNode($nodeId)
    {
        foreach($this->nodes as $node){
          
            if(isset($node->id) && $node->id == $nodeId){
                $this->updateDuplicateFlow($node , true);
                return $node;
            }
        }
    }

    /**
     * Return current edge index
     */
    public function getCurrentEdgeInex($nodeId)
    {
        foreach($this->edges as $key => $edge){
            if($edge->target == $nodeId){
                return $key;
            }
        }
    }

    /**
     * Check condition True or False
     */
    public function checkCondition($actionData, $baseQuery, $baseTable)
    {
        $query = clone $baseQuery;
        $controller = new Controller();
        $controller->prepareQuery($actionData, $query, $baseTable);
        $result = $query->first();
        
        return $result;
    }

    /**
     * Do action based on configuration
     */
    public function doAction($action)
    {
        // Currently created or updated record.
        $recordModal = $this->recordModal;

        switch($action->type) {
            case 'send_message':
                $this->sendMessage($action);
                break;
            case 'tag_contact':
                if($action->select_tag){
                    $existTags = ($recordModal->tags()) ? $recordModal->tags()->get() : [];
                    $existTagIds = [];
                    foreach($existTags as $tag){
                        $existTagIds[] = $tag->id;
                    }
                  
                    $existTagIds[] = $action->select_tag;
                
                    $recordModal->tags()->sync($existTagIds);
                   
                }
                break;
            case 'list_contact':
                if($action->select_list){
                    $existCategories = ($recordModal->categorys()) ? $recordModal->categorys()->get() : [];
                    $existCategoryIds = [];
                    foreach($existCategories as $category){
                        $existCategoryIds[] = $category->id;
                    }
                  
                    $existCategoryIds[] = $action->select_list;
                    $recordModal->categorys()->sync($existCategoryIds);
                }
                break;
           
            case 'custom_field':
                if($action->field_name) {
                    $custom_field[$action->field_name] = $action->field_value;
                    $recordModal->custom = $custom_field;
                    $_REQUEST['isFlowAction'] = true;
                    $recordModal->save();
                }
                break;

            case  (in_array($action->type , ['create_contact', 'update_contact', 'create_lead', 'update_lead'])):
                if($action->field_mapping) {
                    $bean = (str_contains( $action->type, 'lead')) ? new Lead : new Contact;
                    if( isset( $_POST['id']) ) {
                        $bean = $module->where([
                            'id' => $_POST['id'],
                            'company_id' => $this->company_id
                        ])->first();
                    }

                    $bean->creater_id = 1;
                    $bean->company_id = $this->company_id;
                    $this->recordModal = $bean;
                    
                    $this->storeRecord($action->field_mapping);
                }
                break;

            case 'send_request':
                if($action->post_url) {
                    $url = $action->post_url;
                    $headers = $data = [];
                    if(isset($action->data_headers) && $action->data_headers) {
                        foreach($action->data_headers as $header) {
                            $headers[$header->header_type] = $header->header_value; 
                        }
                    }

                    if(isset($action->field_mapping) && $action->field_mapping) {
                        foreach($action->field_mapping as $fieldMap) {
                            $fieldValue = $this->replaceFieldValue($fieldMap->map_field);
                            $data[$fieldMap->field_name] = $fieldValue;
                        }
                    }

                    $this->postRecordData($action->method, $url, $headers, $data);
                }
            break;
        }
    }   

    /**
     * Send message
     */
    public function sendMessage($data)
    {
        $msg = new Msg();
        $recordModal = $this->recordModal;
        $account = Account::find($data->select_account);
        $result = $msg->sendWhatsAppMessage('' , $recordModal->phone_number, $account , $data->select_template);
        return true;
    }

    /**
     * Create contact
     * 
     * @param {Object} $fieldMap
     */
    public function storeRecord($fieldMap)
    {
        try{
           
            $recordModal = $this->recordModal;
        
            foreach($fieldMap as $map){
                // Replace field name - field value
                $fieldValue = $this->checkMapFieldIsFieldName($map->map_field);

                $fieldName = $map->module_field;
                $recordModal->$fieldName = $fieldValue;
            }
            
            $recordModal->save();
            $result = ['status' => true, 'result' => 'Record save successfully.'];

            Log::info([ 'status' => 'Success', 'messgae' => 'Record stored successfully.']);
        }
        catch(\Exception $e){
            Log::info([ 'status' => 'Failed', 'messgae' => 'Record not stored, Please check mapping configuration']);
            Log::info('Cannot store the record ' . $e->getMessage());
            $result = ['status' => false, 'result' => 'Please fill the value or check automation mapping' , 'error' => $e->getMessage()];
           
           echo json_encode($result); die;
        }
        return $result;
       // return response()->json(['status' => true , 'result' => $result]);
    }

    /**
     * Find the field name between the curly braces
     */
    public function checkMapFieldIsFieldName($str)
	{
        $fieldValue = $str;
        // Fetch substring between the curly braces
        // $subtring_start = strpos($str, $starting_word);
        // $subtring_start += strlen($starting_word);
        // $size = strpos($str, $ending_word, $subtring_start) - $subtring_start;
        // $fieldName = substr($str, $subtring_start, $size);
        $fieldName = $this->getModuleFieldName($str);
        
        // Check post data contain field name
        if($fieldName && in_array($fieldName , array_keys($_POST))) {
            
            $value = $_POST[$fieldName];
            // Concat webhook value and input value
            $fieldValue = str_replace( "{{".$fieldName."}}", $value , $str );
        
            // Replace other variable value 
            $fieldValue = $this->checkMapFieldIsFieldName($fieldValue);
           
            return $fieldValue;
        }
        return $fieldValue;
  	}

    /**
     * Return field name from a sting
     * 
     * @param {String} $str  
     */
    public function getModuleFieldName($str)
    {
        $starting_word = "{{"; 
        $ending_word = "}}";
        $fieldName = $str;
        if(strpos($str , '{{')  !== false && strpos($str , '}}')  !== false){
            // Fetch substring between the curly braces
            $subtring_start = strpos($str, $starting_word);
            $subtring_start += strlen($starting_word);
            $size = strpos($str, $ending_word, $subtring_start) - $subtring_start;
            $fieldName = substr($str, $subtring_start, $size);
        }
        return $fieldName;
    }

    /**
     * Relpace field value instand of field name
     * 
     * @param {String} $string 
     */
    public function replaceFieldValue($str)
    {
        $fieldValue = $str;
        $fieldName = $this->getModuleFieldName($str);
        if($fieldName && strpos($str , '{{')  !== false && strpos($str , '}}')  !== false ){
            $value = $this->recordModal->$fieldName;
            $fieldValue = str_replace( "{{".$fieldName."}}", $value, $str);
            $fieldValue = $this->replaceFieldValue($fieldValue);
            return $fieldValue;
        }
        return $fieldValue;
    }

    /**
     * Post data to action url
     */
    public function postRecordData($method, $postUrl, $header, $postData)
    {
        try {
            // $recordModal = $this->recordModal;
            // $moduleName = 

            // $fields = $this->fetchModuleFields($moduleName);
            // foreach($fields as $field){
            //     $fieldName = $field->field_name;
            //     if($field->field_type != 'relate' ){
            //         $postData[$fieldName] = $recordModal->$fieldName;
            //     }
            // }
          
            $postData['module_name'] = class_basename($this->recordModal);
            $this->sendData($method, $postUrl, $header, $postData);
        }
        catch(Exception $e){
            Log::info('Cannot send the record data' . $e->getMessage());
        }
    }
    /**
     * Send Data
     */
    public function sendData($method, $url, $headers, $data)
    {
        $time_out = 10;
        try {
            log::info(['headers ' => $headers, 'url' => $url, 'data' => $data]);
            switch($method) {
                case 'POST':
                    $response = Http::timeout($time_out)->withHeaders($headers)->post($url, $data);
                    break;
                case 'GET':
                    $response = Http::timeout($time_out)->withHeaders($headers)->get($url, $data);
                    break;
                case 'PUT':
                    $response = Http::timeout($time_out)->withHeaders($headers)->put($url, $data);
                    break;
            }
        } catch(\Exception $e) {
            $response = ['status' => false, 'message' => $e->getMessage()];
        }
        return $response;
    }
    
    /**
     * Fetch module fields
     */
    public function fetchModuleFields( $module)
    {
        $whereCondition = [
            'module_name' => $module, 
            'company_id' => $this->recordModal->company_id
        ];

        $fields = Field::where($whereCondition)->groupBy('field_name')->orderBy('sequence')->orderBy('id')->get();
        foreach($fields as $field) {
            if(($field['is_custom'] == '1' && $field['field_type'] == 'dropdown') 
                || $field['field_name'] == 'field_group'
                || ($field['is_custom'] == '1' && $field['field_type'] == 'multiselect')) {

                $option = $field['options'];
                $options = [];
                if ($option) {
                    foreach ($option as $key) {
                        $options[$key['value']] = $key['value'];
                    }
                }
               
                $field->options = $options;
            } 
        }
        return $fields;
    }
    
    /**
     * Update duplicate flow for detail view
     * 
     * @param {Object} $node
     * @param {Boolean} $flag
     */
    public function updateDuplicateFlow($node , $flag)
    {
        $currentEdgeIndex = $this->getCurrentEdgeInex($node->id);
        $currentNodeIndex = '';
        foreach($this->duplicate->nodes as $key => $element){
            if($element->id == $node->id){
                $currentNodeIndex = $key;
            }
        }
        $status = false;

        if($flag){
            $status = true;
        }

        $this->duplicate->nodes[$currentNodeIndex]->status = $status;
        $this->duplicate->edges[$currentEdgeIndex]->status = true;

    }
}
