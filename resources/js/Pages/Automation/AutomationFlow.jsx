import React, { useCallback, useState, useRef } from 'react';
import ReactFlow, {
    addEdge,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
} from 'react-flow-renderer';
import Authenticated from '@/Layouts/Authenticated';
import Trigger from "./Trigger";
import Action from "./Action";
import FilterGroups from '../Campaign/FilterGroups';

// Triggers
const triggers = {
  contact_created: { name: 'contact_created', label: 'New contact is added'},
  contact_list_related: { name: 'contact_list_related', label: 'New contact is added to list'},
  contact_tag_related: { name: 'contact_tag_related', label: 'New contact is added to tag' },
  remove_webhook: { name: 'remove_webhook', label: 'Webhook is removed' },
};

// Next process
const processTypes = {
  'action': {label : 'Action', name: 'action'},
  'condition': {label: 'Condition', name:'condition'},
};

// Actions
const actions = {
  'send_message': {label: 'Send Message' , name : 'send_message'},
  'tag_contact': {label: 'Add a tag to a contact', name: 'tag_contact'},
  'list_contact':{label: 'Add a list to a contact', name: 'list_contact'},
  'custom_field':{label: 'Set a custom field', name: 'custom_field'}
};

const initialNodes = [{
    id: "1",
    type: "input", // input node
    data: { label: (<> <strong>Select Trigger</strong></>) },
    position: { x: 250, y: 0 },
    width: 150,
    height: 40,
}];

let initialEdges = [];
  
let startId = 1;

function AutomationFlow(props)
{

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

    const [currentEdge, setCurrentEdge] = useState({});
    const [currentNode, setCurrentNode] = useState({});

    // Trigger
    const [options, setOptions] = useState();
    const [heading, setHeading] = useState();
    const [showOptions, setShowOptions] = useState(false);

    // Condition
    const [showCondition, setShowCondition] = useState(false);

    // Action
    const [showAction, setShowAction] = useState(false);
    const [actionData, setActionData] = useState();
    
    // Node position
    const yPos = useRef(0);

    /**
     * Generate ID
     * 
     * @returns int
     */
    function getId() {
        startId ++;
        return startId.toString();
    }

    /**
     * Update the Node and Edges based on the new input
     * 
     * @param {string} type 
     */
    function saveData( trigger_type , type, nodeId)
    {
        if(type == 'action' || type == 'condition') {

            var newCurrentEdge = createNewNode(currentEdge, type, processTypes[type].label);

            // For condition node
            if(newCurrentEdge && type == 'condition'){
                createNewNode(newCurrentEdge, 'condition_action', 'Yes');
            }
        }
        else if(trigger_type == 'input') {
            // Update the label and create new output node
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === '1') {
                        node.data = {
                            ...node.data, 
                            label: <strong> {triggers[type].label} </strong>,
                            action: type,
                        };
                    }
                    return node;
                })
            );

            createNewNode('', 'output');
        } 
        else if(trigger_type == 'action') {
            
            openActionNode(nodeId , type);

            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id == nodeId) {
                        node.data = {
                            ...node.data, 
                            label: <strong> {actions[type].label} </strong>,
                        };
                    }
                    return node;
                })
            );
        }
        setCurrentEdge({});
        setCurrentNode({});
        setShowOptions(false);
    }

    /**
     * 
     * @param {Integer} nodeId 
     */
    function openActionNode(nodeId , action_type = ''){
        // Get Action input
        var nodeData = {};
        nodes.map((node) => {
            if (node.id == nodeId) {
                nodeData = node.data.action;
            }
        });
        if(nodeData || action_type){
            action_type = (nodeData && nodeData.type) ? nodeData.type : action_type;
            let newData = Object.assign({}, actionData); 
            newData['heading'] = actions[action_type].label;
            newData['node_id'] = nodeId;
            newData['type'] = action_type;
            newData['node_data'] = nodeData;

            setActionData(newData);
            setShowAction(true);
        } else {
            setHeading('Actions')
            setOptions(actions);
            setShowOptions(true);
        }
    }
 
    /**
     * When user click on the node
     */
     function onNodeClick(event, node)
     {
        if(node.type == 'input') {
            // Show Modal and get the event
            setHeading('Triggers')
            setOptions(triggers);
            setShowOptions(true);
        } 
        else if(node.type == 'action'){
            openActionNode(node.id);
        } 
        else if(node.type == 'condition'){
            getFilterData();
            //setShowCondition(true);
        } 
         setCurrentNode(node);
         console.log(node);
     }

    /**
     * When user click on the edge
     * 
     * @param {object} event 
     * @param {object} node 
     */
    function onEdgeClick(event, edge)
    {
        if(edge.type == 'add_action'){
            setHeading('Actions')
            setOptions(processTypes);
            setShowOptions(true);
        }

        setCurrentEdge(edge);
    }

    /**
     * Create new node
     * 
     * @param {object} edge 
     * @param {object} type 
     * @param {string} type 
     */
    function createNewNode(edge, type, label = 'New Node')
    {
        var id = getId();
        yPos.current += 100;
        var nodeType = type;
        if(type == 'condition_action'){
            nodeType = 'action';
        }
        let newNode = {
            id: id,
            data: {
                label: (
                    <>
                        {label}
                    </>
                ),
            },
            type: nodeType,
            position: { x: 300, y: 100 },
            width: 150,
            height: 40,
        };

        if(type == 'output') {
            newNode['data']['label'] = <strong>End Automation</strong>;
        }

        /*else if(type == 'condition') {
            newNode['data']['label'] = <strong> {triggers[type].label} </strong>;
        }
        else if(type == 'action') {
            newNode['data']['label'] = <strong> {triggers[type].label} </strong>
        }*/

        // Create new node
        setNodes((nds) => nds.concat(newNode));
        if(type == 'action' || type == 'condition') {
            // Delete the current edge
            setEdges((edges) => edges.filter((ed) => ed.id !== edge.id));

            createNewEdge(edge.source, id);
          var newEdge = createNewEdge(id, edge.target);
            return newEdge;
        }
        else if(type == 'condition_action') {
            // Delete the current edge
            setEdges((edges) => edges.filter((ed) => ed.id !== edge.id));

            createNewEdge(edge.source, id);
            createNewEdge(id, edge.target);

            // Create another node and connect the edge
            createNewNode(edge, 'action', 'No');
        }
        else if(type == 'output') {
            createNewEdge('1', id);
        }
        return newNode;
    }

    /**
     * Create New Edge
     * 
     * @param {string} source 
     * @param {string} target 
     */
    function createNewEdge(source, target)
    {
        let newEdge = { 
            id: 'e' + source + '-' + target, 
            source: source.toString(), 
            target: target.toString(), 
            type: 'add_action', 
            label: '+' 
        };
        
        setEdges((eds) => eds.concat(newEdge));
        return newEdge;
    }

    /**
     * 
     * @param {Object} node_id 
     * @param {Object} data 
     */
    function saveActionData(node_id, data){
        if(data.node_data)
            delete data.node_data;

        setNodes((nds) =>
                nds.map((node) => {
                    if (node.id == node_id) {
                        node.data = {
                            ...node.data, 
                            action: data,
                        };
                    }
                    return node;
                })
            );
            setShowAction(false);
        console.log(nodes);
    }

    return (
        <Authenticated 
            auth={props.auth}
        > 
            <div className="h-screen min-w-max">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    onEdgeClick={onEdgeClick}
                    onConnect={onConnect}
                    fitView
                    attributionPosition="top-right"
                >
                    <MiniMap
                        nodeStrokeColor={(n) => {
                        if (n.style?.background) return n.style.background;
                        if (n.type === 'input') return '#0041d0';
                        if (n.type === 'output') return '#ff0072';
                        if (n.type === 'default') return '#1a192b';

                        return '#eee';
                        }}
                        nodeColor={(n) => {
                        if (n.style?.background) return n.style.background;

                        return '#fff';
                        }}
                        nodeBorderRadius={2}
                    />
                    <Controls />
                    <Background color="#aaa" gap={16} />
                </ReactFlow>
            </div>

            {showOptions &&
                <Trigger
                    heading={heading}
                    options={options}
                    type={(currentNode.type) ? currentNode.type : currentEdge.type}
                    nodeId={currentNode.id}
                    saveData={saveData}
                    setShowOptions={setShowOptions}
                />
            }
            {showAction &&
                <Action 
                    actionData={actionData}
                    saveActionData={saveActionData}
                    setShowAction={setShowAction}

                />
            }
            {showCondition &&
                <FilterGroups
                    translator={translator}
                    filter={filter}
                    module={'Contact'}
                />
            }

        </Authenticated>
    );
};

export default AutomationFlow;









