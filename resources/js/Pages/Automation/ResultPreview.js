import React, { useEffect, useState } from "react";
import ReactFlow, {
    addEdge,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
} from 'react-flow-renderer';
import { Link } from '@inertiajs/inertia-react';

function ResultPreview(props){

    const flow = props.flow;
    const graphStyles = { width: "100%", height: "450px" };
    const [nodes, setNodes, onNodesChange] = useNodesState();
    const [edges, setEdges, onEdgesChange] = useEdgesState();

    useEffect(() => {
        if(flow){
          
            Object.entries(flow.nodes).map(([key,node]) => {
                if(node.status == true){
                    node['style'] = {
                        background: "rgba(69, 170, 82, 0.52)",
                        width: 150,
                        color: "#1a192b",
                        fontSize: "16px",
                        fontFamily: "Helvetica",
                        boxShadow: "5px 5px 5px 0px rgba(0,0,0,.10)"
                      }
                } else if(node.status == false){
                    node['style'] = {
                        background: "rgba(247, 16, 16, 0.42)",
                        width: 150,
                        color: "#1a192b",
                        fontSize: "16px",
                        fontFamily: "Helvetica",
                        boxShadow: "5px 5px 5px 0px rgba(0,0,0,.10)"
                      }
                }
            });

//console.log(flow);
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
        }
    }, []);
    

    return (
        <> 
           <div className='mx-4'>
                <div class="flex justify-between float-right">     
                    <Link
                        href={route('createAutomation', props.parent)}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                        </svg>
                         Back
                    </Link>
                </div>
            </div>
            <div class="flex justify-between h-screen min-w-max">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    style={graphStyles}
                    fitView
                    attributionPosition="top-right"
                >
                    <MiniMap
                        nodeStrokeColor={(n) => {

                        if (n.style?.background) return n.style.background;
                        if (n.type === 'input') return '#0041d0';
                        if (n.type === 'output') return '#ff0072';
                        if (n.type === 'default') return '#1a192b';
                        if (n.status === false) return '#f71010 ';
                        if (n.status === true) return '#1cfa20 ';

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
        </>
    )
}
export default ResultPreview;