import React, { useState, useCallback, useRef, Fragment, useEffect } from "react";
import Authenticated from '@/Layouts/Authenticated';

import ReactFlow, {
    addEdge,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
} from 'react-flow-renderer';

import { MarkerType } from 'react-flow-renderer';
import Trigger from "./Trigger";

const initialNodes = [
  {
    id: 'start',
    type: 'input',
    data: {
      label: (
        <>
          <strong>Select Trigger</strong>
        </>
      ),
    },
    position: { x: 150, y: 0 },
  }
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '6', label: '+' },
  { id: 'e1-3', source: '1', target: '3' },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    animated: true,
    label: 'animated edge',
  },
  {
    id: 'e4-5',
    source: '4',
    target: '5',
    label: '+',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
    type: 'smoothstep',
    label: 'smooth step edge',
  },
  {
    id: 'e5-7',
    source: '5',
    target: '7',
    type: 'step',
    style: { stroke: '#f6ab6c' },
    label: 'a step edge',
    animated: true,
    labelStyle: { fill: '#f6ab6c', fontWeight: 700 },
  },
];

const endNode = {
  id: 'end',
  type: 'output',
  data: {
    label: (
      <>
          <strong>End Automation</strong>
      </>
    ),
  },
  position: { x: 150, y: 300 },
};

function Flow(props)
{

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

    const onInit = (reactFlowInstance) => console.log('flow loaded:', reactFlowInstance);

    const [showTrigger, setShowTrigger] = useState(false);

    const [selectTrigger, setSelectedTriger] = useState();

    const [data , setData] = useState();

    const trigers = {
      contact_created: { name: 'contact_created', label: 'New contact is added'},
      contact_list_related: { name: 'contact_list_related', label: 'New contact is added to list'},
      contact_tag_related: { name: 'contact_tag_related', label: 'New contact is added to tag' },
      remove_webhook: { name: 'remove_webhook', label: 'Webhook is removed' },
    }
    /**
     * Store triger data
     */
    function saveData(value){
      setSelectedTriger(value);
      var newNodes = nodes; // Object.assign({}, nodes);
      Object.entries(nodes).map(([key, node]) => {
        if(node.id == 'start'){
          newNodes[key].data.label = <strong> {trigers[value].label} </strong>
        }
      });
      newNodes.push(endNode);
      console.log([ nodes , newNodes]);
      setNodes(newNodes);
      setShowTrigger(false);
    }

    /**
     * When user click on the node
     */
    function onNodeClick(event, node)
    {
        if(node.type == 'input') {
            // Show Modal and get the event
            setShowTrigger(true);
        }
        
        console.log(event);
        console.log(node);
    }

    function onEdgeClick(event, node)
    {
        console.log(event);
        console.log(node);
    }
    
    useEffect(()=>{

    },[nodes]);

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
                    onConnect={onConnect}
                    onInit={onInit}
                    onNodeClick={onNodeClick}
                    onEdgeClick={onEdgeClick}
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
                    <Background color="#aaa" gap={10} />
                </ReactFlow>
            </div>

            {showTrigger &&
              <Trigger
                setSelectedTriger={setSelectedTriger}
                trigers={trigers}
                saveData={saveData}
                setShowTrigger={setShowTrigger}
              />
                
            }
        </Authenticated>
      );
}

export default Flow;