import React, { useState, useCallback } from "react";
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

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: {
      label: (
        <>
          <strong>Select Trigger</strong>
        </>
      ),
    },
    position: { x: 250, y: 0 },
  },
  {
    id: '2',
    data: {
      label: (
        <>
          This is a <strong>default node</strong>
        </>
      ),
    },
    position: { x: 100, y: 100 },
  },
  {
    id: '3',
    data: {
      label: (
        <>
          This one has a <strong>custom style</strong>
        </>
      ),
    },
    position: { x: 400, y: 100 },
    style: {
      background: '#D6D5E6',
      color: '#333',
      border: '1px solid #222138',
      width: 180,
    },
  },
  {
    id: '4',
    position: { x: 250, y: 200 },
    data: {
      label: 'Another default node',
    },
  },
  {
    id: '5',
    data: {
      label: 'Node id: 5',
    },
    position: { x: 250, y: 325 },
  },
  {
    id: '6',
    type: 'output',
    data: {
      label: (
        <>
            <strong>End Automation</strong>
        </>
      ),
    },
    position: { x: 100, y: 480 },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', label: 'this is an edge label' },
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

function Flow(props)
{
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

    const onInit = (reactFlowInstance) => console.log('flow loaded:', reactFlowInstance);

    const [showTrigger, setShowTrigger] = useState(false);

    /**
     * When user click on the node
     */
    function onNodeClick(event, node)
    {
        if(node.type == 'input') {
            // Show Modal and get the event
            setShowTrigger(true);
            alert('started');
        }
        
        console.log(event);
        console.log(node);
    }

    function onEdgeClick(event, node)
    {
        console.log(event);
        console.log(node);
    }
    
    return (
        <>
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
                    <Background color="#aaa" gap={16} />
                </ReactFlow>
            </div>

            {showTrigger ?
                <p>Show Modal</p>
            : ''}
        </>
      );
}

export default Flow;