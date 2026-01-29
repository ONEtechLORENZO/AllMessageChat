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
import { router as Inertia } from "@inertiajs/react";
import { Link } from '@inertiajs/react';
import FlowCondition from './FlowCondition';
import WebHook from './WebHook';
import {  PencilSquareIcon, CheckIcon } from '@heroicons/react/24/solid';
import Input from '@/Components/Input';
import { Switch } from '@headlessui/react'
import AutomationHistory from './AutomationHistory';



let initialEdges = [];
  
let startId = 1;

function AutomationFlow(props)
{
    const [actions , setActions] = useState() ;
    const [processTypes, setProcessTypes] = useState() ;
    const [triggers, setTriggers] = useState() ;
    const initialNodes = [{
        id: "1",
        type: "input", // input node
        data: { label: props.translator['Select Trigger'] },
        position: { x: 250, y: 0 },
        width: 150,
        height: 40,
    }];

    // Edit name & status
    const [showInput, setShowInput] = useState(false);
    const [automationStatus , setAutomationStatus] = useState(props.record.status);
    const [automationName , setAutomationName] = useState(props.record.name);

    const [automationData, setAutomationData] = useState({});
    const [trigger , setTrigger ] = useState(); 
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
    const [showWebhook, setShowWebhook] = useState(false);

    // Action
    const [showAction, setShowAction] = useState(false);
    const [actionData, setActionData] = useState();
    
    // Node position
    const yPos = useRef(0);
    const cancelButtonRef = useRef(null);
    const [rfInstance, setRfInstance] = useState(null);


    const tabs = [
        { label: props.translator['Flow'], name: 'Detail', href: '#' },
        { label: props.translator['History'], name: 'History', href: '#' },
    ];
    const [activeTab, setActiveTab] = useState('Detail');

    useEffect(() => {
        if(props.options){
            setActions(props.options.actions);
            setProcessTypes(props.options.processTypes);
            setTriggers(props.options.triggers);
        }
        if(props.record) {
            var newData = Object.assign({}, automationData);
            newData['id'] = props.record.id;
            newData['name'] = props.record.name;

            const flow = JSON.parse(props.record.flow);
            if (flow) {
                setNodes(flow.nodes || []);
                setEdges(flow.edges || []);
            }
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
        if(type == 'action' || type == 'condition') {

            var newCurrentEdge = createNewNode(currentEdge, type, processTypes[type].label);

            // For condition node
            if(newCurrentEdge && type == 'condition'){
                createNewNode(newCurrentEdge, 'condition_action', 'Yes');
            }
        }
        else if(trigger_type == 'input') {
            setTrigger(type);
            // Update the label and create new output node
            setNodeData(1, triggers[type].label, type)

            // Check alreay exist
            var existNode = false;
            nodes.map((node) => {
                if (node.type == 'output' && nodeId == 1) {
                    existNode = true;
                }
            })
            if(!existNode){
                createNewNode('', 'output');    // Create end node
            }

            // Show web hook form
            if(type == 'received_webhook'){
                setHeading('WebHook');
                setShowWebhook(true);
                setShowOptions(false);
                return false;
            }

        } 
        else if(type == 'exit') {
            createNewNode(currentEdge, type, 'End');
        }
        else if(trigger_type == 'action') {
            // Open modal for get the input for the action
            openActionNode(nodeId , type);
            setNodeData(nodeId, actions[type].label);
        }
        setCurrentEdge({});
        setCurrentNode({});
        setShowOptions(false);
    }

    /**
     * Set Nodes
     */
    function setNodeData(nodeId, label, type = ''){
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id == nodeId) {
                    node.data = {
                        ...node.data, 
                        label: label,
                    };
                    if(nodeId == 1 && type){
                        node.data = {
                            ...node.data, 
                            type: type,
                        };
                    }
                }
                return node;
            })
        );
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

        if(nodes[0].data.type && nodes[0].data.type == 'webhook'){
            setOptions(props.options.webHookActions);
            setActions(props.options.webHookActions);
            var actionType = props.options.webHookActions;
        } else {
            setOptions(props.options.actions);
            setActions(props.options.actions);
            var actionType = props.options.actions
        }
        
        if(nodeData || action_type) {
            action_type = (nodeData && nodeData.type) ? nodeData.type : action_type;
            let newData = Object.assign({}, actionData); 
            newData['heading'] = (actionType[action_type] && actionType[action_type].label) ? actionType[action_type].label : '';
            newData['node_id'] = nodeId;
            newData['type'] = action_type;
            newData['node_data'] = nodeData;

            setActionData(newData);
            setShowAction(true);
        } else {
            setHeading('Actions');
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
    //    console.log('node:', node);
        setCurrentNode(node);
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
        var isCondition = false;
        if(type == 'condition_action' ) {
            nodeType = label;
            if(label == 'Yes'){
                isCondition = true;
            } else if( label == 'No'){
                type = 'action';
            }
        }
        if(type == 'exit') {
            nodeType = 'output';
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
        else if(isCondition) {
            // Delete the current edge
            setEdges((edges) => edges.filter((ed) => ed.id !== edge.id));

            createNewEdge(edge.source, id);
            createNewEdge(id, edge.target);

            // Create another node and connect the edge
            createNewNode(edge, 'condition_action', 'No');
        }
        else if(type == 'exit') {
            // Delete the current edge
            setEdges((edges) => edges.filter((ed) => ed.id !== edge.id));
            createNewEdge(edge.source, id);
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
     * Append web hook sample data
     * 
     * @param {Object} data 
     * @param {Integer} nodeId 
     */
    function saveWebHookData(data , nodeId){
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id == nodeId) {
                    node.data = {
                        ...node.data, 
                        type:'webhook',
                        sample_data: data,
                    };
                }
                return node;
            })
        );
        setShowWebhook(false);
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
        console.log();
        setActionData(newData);
    }

    /**
     * Update node condition
     */
    function updateNodeCondition(nodeId, condition){
        saveActionData(nodeId, condition);
        setShowCondition(false);
    }

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    /**
     * Save automation name & status 
     * 
     * @param {String} name 
     * @param {String} value 
     */
    function saveAutomationField(name , value){
        var data = {};
        data[name] = value;
        data['id'] = props.record.id;

        if(name == 'status'){
            setAutomationStatus(value);
            data['name'] = automationName;
        } else {
            data['status'] = automationStatus;
        }

        axios({
            method: 'post',
            url: route('update' + props.module, data.id),
            data: data
        })
        .then((response) => {
            setShowInput(false)
        });
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
        data['trigger'] = trigger;
        
        axios({
            method: 'post',
            url: route('update' + props.module, data.id),
            data: data
        })
        .then((response) => {
            if (response.data && response.data.result == 'success' ) {
                Inertia.get(route('list'+ props.module))
            }
        });
    }

    return (
        <Authenticated 
            auth={props.auth}
        > 
            <div className="w-full">

            <div className="bg-white px-4 py-6 shadow sm:rounded-lg sm:px-6">
                <ul id="tabs" className="inline-flex w-full px-1 pt-2 ">
                    {Object.entries(tabs).map(([key, tab]) => {
                        var activeClassName = "px-4 py-2 -mb-px font-semibold text-gray-800 rounded-t opacity-50";
                        if (activeTab == tab.name) {
                            activeClassName += ' border-b-2 border-blue-400';
                        }
                        return (
                            <li className={activeClassName} onClick={() => setActiveTab(tab.name)}>
                                <a id="default-tab" href={"#" + tab.name}> {tab.label} </a>
                            </li>
                        )
                    })}
                </ul>    
                <div id="tab-contents">
                    {activeTab == 'Detail' ?
                        <>
                            <div className="flex justify-between">
                                <div className="font-medium text-slate-900 mx-1 flex">
                                    <span className='mt-2 mx-1'> {props.translator['Name']}: </span>
                                    {!showInput && <label className='mt-2 mx-1'> {automationName} </label> }
                                    
                                    {showInput &&
                                        <div className=' flex'>
                                            <Input
                                                name="name"
                                                value={automationName}
                                                type="text" 
                                                className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                id={'name'}
                                                handleChange={(e) => setAutomationName(e.target.value)}
                                            /> 
                                            <CheckIcon 
                                                onClick={() => saveAutomationField('name' , automationName)}
                                                className='h-4 w-4 cursor-pointer mt-2 mx-1' 
                                            />
                                        </div>
                                    }
                                    <span className='mt-3 mx-1'>
                                        {!showInput &&
                                            <PencilSquareIcon 
                                                onClick={() => setShowInput(true)}
                                                className='h-4 w-4 cursor-pointer' 
                                            />
                                        }
                                    </span>
                                    <span>
                                        <Switch.Group as="div" className="flex items-center ml-12 mt-2">
                                            <Switch
                                                checked={automationStatus}
                                                onChange={(value) => saveAutomationField('status', value)}
                                                className={classNames(
                                                    automationStatus ? 'bg-indigo-600' : 'bg-gray-200',
                                                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                                                )}
                                            >
                                                <span className="sr-only">Status</span>
                                                <span
                                                    aria-hidden="true"
                                                    className={classNames(
                                                    automationStatus ? 'translate-x-5' : 'translate-x-0',
                                                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                                                    )}
                                                />
                                            </Switch>
                                            <Switch.Label as="span" className="ml-3">
                                                <span className="text-sm font-medium text-gray-900"> {props.translator['Active']}</span>
                                            </Switch.Label>
                                        </Switch.Group>
                                    </span>
                                </div>
                                <div className='mx-4'>
                                    
                                    <Link
                                        href={route('list'+props.module)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        
                                    >
                                        {props.translator['Cancel']}
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => saveAutomation()}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        {props.translator['Save']}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between h-screen min-w-max">
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

                            {showOptions &&
                                <Trigger
                                    heading={heading}
                                    options={options}
                                    type={(currentNode.type) ? currentNode.type : currentEdge.type}
                                    nodeId={currentNode.id}
                                    selected={(currentNode.data && currentNode.data.action) ? currentNode.data.action : ''}
                                    saveData={appendNodeData}
                                    setShowOptions={setShowOptions}
                                    triggerType={trigger}
                                />
                            }
                            {showAction &&
                                <Action 
                                    actionData={actionData}
                                    saveActionData={saveActionData}
                                    setShowAction={setShowAction}
                                    record={props.record}
                                />
                            }

                            {showCondition &&
                                <FlowCondition
                                    translator={props.translator}
                                    filter={props.filter}
                                    module={props.parent}
                                    setShowCondition={setShowCondition}
                                    nodeId={currentNode.id}
                                    is_flow={true}
                                    filterCondition={(currentNode.data && currentNode.data.action) ? currentNode.data.action : ''}
                                    updateNodeCondition={updateNodeCondition}
                                />
                            }

                            {showWebhook &&
                                <WebHook
                                    heading={heading}
                                    node={currentNode}
                                    record={props.record}
                                    saveWebHookData={saveWebHookData}
                                    setShowWebhook={setShowWebhook}
                                />
                            }

                        </>
                    :
                        <> 
                            <AutomationHistory 
                                record={props.record.id}
                                translator={props.translator}
                            />
                        </>
                    }
                </div>
            </div>

            </div>
            
        </Authenticated>
    );
};

export default AutomationFlow;









