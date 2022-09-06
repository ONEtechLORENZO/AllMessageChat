<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Automation extends Model
{
    use HasFactory;

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
        $return['processTypes'] = array('action' => array('label' => 'Action', 'name' => 'action'), 'condition' => array('label' => 'Condition', 'name' => 'condition'));        
        $return['actions'] = array('send_message' => array('label' => 'Send Message', 'name' => 'send_message'), 'tag_contact' => array('label' => 'Add a tag to a contact', 'name' => 'tag_contact'), 'list_contact' => array('label' => 'Add a list to a contact', 'name' => 'list_contact'), 'custom_field' => array('label' => 'Set a custom field', 'name' => 'custom_field'));

        return $return;
    }

    /**
     * Handle flow result
     *
     * @param  Object  $flow
     * @param  Object  $contact
     * @return void
     */
    public function getFlowResult($flow , $contact )
    {
        $nodes = $flow->nodes;
        $edges = $flow->edges;
        foreach($edges as $edge){
            foreach($nodes as $node){
                if($node->id == $edge->target){
                    if($node->type == 'action'){
                        $action = $node->data->action;
                        
                        switch($action->type){
                            case 'send_message':
                                $this->sendMessage();
                                break;
                            case 'tag_contact':
                                $contact->tags()->sync(array($action->select_tag));
                                
                                break;
                            case 'list_contact':
                                $contact->categorys()->sync(array($action->select_tag));
                                
                                break;
                            case 'custom_field':
                                $this->customFieldValue();
                                break;
                        }
                    }
                }
            }
        }
    }

    public function tagContact($contact, $tag_id)
    {
        $contact->categorys()->sync(array($tag_id));
    }
}
