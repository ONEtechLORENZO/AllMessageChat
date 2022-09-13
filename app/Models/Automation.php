<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Http\Controllers\Controller;

class Automation extends Model
{
    use HasFactory;

    public $recordModal = '';
    public $enquiryNodes = [];
    public $nodes = [];
    public $edges = [];

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
        $return['triggers'] = array('contact_created' => array('name' => 'contact_created', 'label' => 'New contact is added'), 'contact_list_related' => array('name' => 'contact_list_related', 'label' => 'New contact is added to list'), 'contact_tag_related' => array('name' => 'contact_tag_related', 'label' => 'New contact is added to tag'), 'remove_webhook' => array('name' => 'remove_webhook', 'label' => 'Webhook is removed'));
        $return['processTypes'] = array('action' => array('label' => 'Action', 'name' => 'action'), 'condition' => array('label' => 'Condition', 'name' => 'condition'), 'exit' => array('label' => 'Exit', 'name' => 'exit'));        
        $return['actions'] = array('send_message' => array('label' => 'Send Message', 'name' => 'send_message'), 'tag_contact' => array('label' => 'Add a tag to a contact', 'name' => 'tag_contact'), 'list_contact' => array('label' => 'Add a list to a contact', 'name' => 'list_contact'), 'custom_field' => array('label' => 'Set a custom field', 'name' => 'custom_field'));

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
            $statnode = 0; 
            $edge = $this->edges[$statnode];
            $node = $this->getNextNode($edge->target);
            $this->processNodeAction($node, $statnode);
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
                $nextEdge = $this->getNextEdge($node->id , 'source');
                $node = $this->getNextNode($nextEdge->target);
                $this->processNodeAction($node, $i);

            } elseif ($node->type == 'condition') {
                $recordModal = $this->recordModal;
                $baseTable = $recordModal->getTable();
                $query = $recordModal->where($baseTable.'.id' , $recordModal->id);
                $result = $this->checkCondition($actionData, $query, $baseTable);

                if($result){
                // If the condition is true
                    $i = $this->getCurrentEdgeInex($node->id);
                    $i ++;
                    $trueEdge = $this->edges[$i];
                    $trueNode = $this->getNextNode($trueEdge->target);
                    $this->enquiryNodes[] = $trueNode->id;
                    $nextEdge = $this->getNextEdge($trueNode->id , 'source');
                    $node = $this->getNextNode($nextEdge->target);
                    $this->processNodeAction($node, $i);

                } else {
                   
                // If the condition is false
                    $i = $this->getCurrentEdgeInex($node->id);
                    $i = $i + 2;
                    $falseEdge = $this->edges[$i];
                    $falseNode = $this->getNextNode($falseEdge->target);
                    $this->enquiryNodes[] = $falseNode->id;
                    $nextEdge = $this->getNextEdge($falseNode->id , 'source');

                   
                    $node = $this->getNextNode($nextEdge->target);
                    
                    $this->processNodeAction($node, $i);

                }
            }
        }
    }

    /**
     * Return node's next edge
     */
    public function getNextEdge($nodeId , $mode)
    {
        $return = '';
        foreach($this->edges as $edge){
            if($mode == 'source' && $nodeId == $edge->source) {
                $return = $edge;
            } elseif($mode == 'target' && $nodeId == $edge->target) {
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

        switch($action->type){
            case 'send_message':
                $this->sendMessage();
                break;
            case 'tag_contact':
                if($action->select_tag){
                    $recordModal->tags()->sync(array($action->select_tag));
                }
                break;
            case 'list_contact':
                if($action->select_list){
                    $recordModal->categorys()->sync(array($action->select_list));
                }
                break;
           
            case 'custom_field':
                if($action->field_name){

                    $custom_field[$action->field_name] = $action->field_value;
                    $recordModal->custom = $custom_field;
                    $_REQUEST['isFlowAction'] = true;
                    $recordModal->save();
                }
                break;
        }
    }   
}
