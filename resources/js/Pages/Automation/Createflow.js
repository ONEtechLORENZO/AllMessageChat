import React, { useCallback, useState, useRef, useEffect } from 'react';
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
import Input from '@/Components/Forms/Input';
import { Inertia } from '@inertiajs/inertia'
import { Link } from '@inertiajs/inertia-react';

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
    data: { label: 'Select Trigger' },
    position: { x: 250, y: 0 },
    width: 150,
    height: 40,
}];

let initialEdges = [];
  
let startId = 1;

function AutomationFlow(props)
{
    const [automationData, setAutomationData] = useState({});

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
    const cancelButtonRef = useRef(null);
    const [rfInstance, setRfInstance] = useState(null);
    
    useEffect(() => {
        if(props.record) {
            console.log(props.record);
            var newData = Object.assign({}, automationData);
            newData['id'] = props.record.id;
            newData['name'] = props.record.name;
            
           // setNodes(props.record.nodes);
           // setEdges(props.record.edges);
            setAutomationData(newData);
        }
    },[]);

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
    function appendNodeData( trigger_type , type, nodeId)
    {
        console.log( ' rfInstance', rfInstance ); 
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
                            label: triggers[type].label,
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
                            label: actions[type].label,
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
     * If already action selected shows selected value
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

        if(nodeData || action_type) {
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
            setShowCondition(true);
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
        if(type == 'condition_action') {
            nodeType = 'action';
        }

        let newNode = {
            id: id,
            data: {
                label: label,
            },
            type: nodeType,
            position: { x: 300, y: 100 },
            width: 150,
            height: 40,
        };

        if(type == 'output') {
            newNode['data']['label'] = 'End Automation';
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
    }

    /**
     * Save data 
     * 
     * @param {Object} event 
     */
    function handleChange(event){
        var name = event.target.name;
        var value = event.target.value;

        var newData = Object.assign({}, automationData);
        newData[name] = value;
        setActionData(newData);
    }

    /**
     * Save Automation Data 
     */
    function saveAutomation()
    {    
        var data = Object.assign({}, automationData);

        var flow = '';
        if (rfInstance) {
            flow = rfInstance.toObject();
            flow = JSON.stringify(flow);
        }
            
        data['flow'] = flow;

        axios({
            method: 'post',
            url: route('update' + props.module, data.id),
            data: data
        })
        .then((response) => {
            if (response.data) {
                console.log(response.data)
            }
        });
    }

    return (
        <Authenticated 
            auth={props.auth}
        > 
            <div className="w-full">
                <div class="flex justify-between">
                    <div class="font-medium text-slate-900 mx-1 flex">
                        <span className='mt-2 mx-1'> Name: </span>
                        <Input
                            name="name"
                            value={automationData.name}
                            type="text" 
                            className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                            id={'name'}
                            handleChange={handleChange}
                        />
                    </div>
                    <div className='mx-4'>
                        
                        <Link
                            href={route('list'+props.module)}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            
                        >
                            Cancel
                        </Link>
                        <button
                            type="button"
                            onClick={() => saveAutomation()}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Save
                        </button>
                    </div>
                </div>
                <div class="flex justify-between h-screen min-w-max">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={onNodeClick}
                        onEdgeClick={onEdgeClick}
                        onInit={setRfInstance}
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
            </div>
            {showOptions &&
                <Trigger
                    heading={heading}
                    options={options}
                    type={(currentNode.type) ? currentNode.type : currentEdge.type}
                    nodeId={currentNode.id}
                    selected={(currentNode.data && currentNode.data.action) ? currentNode.data.action : ''}
                    saveData={appendNodeData}
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
                    translator={props.translator}
                    filter={props.filter}
                    module={props.parent}
                />
            }

        </Authenticated>
    );
};

export default AutomationFlow;