import React, { useCallback, useState } from 'react';
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
    const [showOptions, setShowOptions] = useState(false);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

    const [currentEdge, setCurrentEdge] = useState({});
    const [currentNode, setCurrentNode] = useState({});

    const [options, setOptions] = useState();
    const [heading, setHeading] = useState();

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
     * @param {string} value 
     */
    function saveData(value)
    {
        if(value == 'action' || value == 'condition') {
            createNewNode(currentEdge, value);
        }
        else if(currentNode.type == 'input') {
            // Update the label and create new output node
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === '1') {
                        node.data = {
                            ...node.data, 
                            label: <strong> {triggers[value].label} </strong>
                        };
                    }
                    return node;
                })
            );

            createNewNode('', 'output');
        }
        
        setShowOptions(false);
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
            setHeading('Actions')
            setOptions(actions);
            setShowOptions(true);
        }

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
    function createNewNode(edge, type, value = '')
    {
        var id = getId();

        let newNode = {
            id: id,
            data: {
                label: (
                    <>
                        New Node
                    </>
                ),
            },
            position: { x: 300, y: 100 },
            width: 150,
            height: 40,
        };

        if(type == 'output') {
            newNode['data']['label'] = <strong>End Automation</strong>;
        }
        /*else if(type == 'condition') {
            newNode['data']['label'] = <strong> {triggers[value].label} </strong>;
        }
        else if(type == 'action') {
            newNode['data']['label'] = <strong> {triggers[value].label} </strong>
        }*/

        // Create new node
        setNodes((nds) => nds.concat(newNode));
        if(type == 'action') {
            // Delete the current edge
            setEdges((edges) => edges.filter((ed) => ed.id !== edge.id));

            createNewEdge(edge.source, id);
            createNewEdge(id, edge.target);
        }
        else if(type == 'condition') {
            // Delete the current edge
            setEdges((edges) => edges.filter((ed) => ed.id !== edge.id));

            createNewEdge(edge.source, id);
            createNewEdge(id, edge.target);

            // Create another node and connect the edge
            createNewNode(edge, 'action');
        }
        else if(type == 'output') {
            createNewEdge('1', id);
        }
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
                    saveData={saveData}
                    setShowOptions={setShowOptions}
                />
            }

        </Authenticated>
    );
};

export default AutomationFlow;