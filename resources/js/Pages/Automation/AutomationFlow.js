import React, { useCallback, useState } from 'react';
import ReactFlow, {
    addEdge,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
} from 'react-flow-renderer';
import Authenticated from '@/Layouts/Authenticated';

export const initialNodes = [
    {
      id: '1',
      type: 'input',
      data: {
        label: (
          <>
            Welcome to <strong>React Flow!</strong>
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
            An <strong>output node</strong>
          </>
        ),
      },
      position: { x: 100, y: 480 },
    },
    {
      id: '7',
      type: 'output',
      data: { label: 'Another output node' },
      position: { x: 400, y: 450 },
    },
  ];
  
  export const initialEdges = [
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
      label: 'edge with arrow head',
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

let startId = 10;

function AutomationFlow(props)
{
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

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
     * When user click on the node
     */
    function onNodeClick(event, node)
    {

    }
 
    /**
     * When user click on the edge
     * 
     * @param {object} event 
     * @param {object} node 
     */
    function onEdgeClick(event, edge)
    {
        let type = 'condition';
        createNewNode(edge, type);
    }

    /**
     * Create new node
     * 
     * @param {object} edge 
     * @param {object} type 
     */
    function createNewNode(edge, type)
    {
        var id = getId();

        let newNode = {
            id: id,
            data: {
              label: (
                <>
                  Dummy Node
                </>
              ),
            },
            position: { x: 500, y: 500 },
            width: 150,
            height: 40,
        };

        // Create new node
        setNodes((nds) => nds.concat(newNode));
        if(type == 'action') {
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
        </Authenticated>
    );
};

export default AutomationFlow;