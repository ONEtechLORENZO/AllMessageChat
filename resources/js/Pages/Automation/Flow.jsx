import React, { useState, useCallback, useRef, Fragment, useEffect } from "react";
import Authenticated from '@/Layouts/Authenticated';
import ReactFlow , {useEdgesState , useNodesState, Controls, Background} from "react-flow-renderer";
import Trigger from "./Trigger";
import Action from "./Action";

// Trigers
const trigers = {
  contact_created: { name: 'contact_created', label: 'New contact is added'},
  contact_list_related: { name: 'contact_list_related', label: 'New contact is added to list'},
  contact_tag_related: { name: 'contact_tag_related', label: 'New contact is added to tag' },
  remove_webhook: { name: 'remove_webhook', label: 'Webhook is removed' },
};

// Next process
const processTypes = {
  'action': {label : 'Action', name: 'action' },
  'condition': {label: 'Condition', name:'condition'},
};

// Actions
const actions = {
  'send_message': {label: 'Send Message' , name : 'send_message'},
  'tag_contact': {label: 'Add a tag to a contact', name: 'tag_contact'},
  'list_contact':{label: 'Add a list to a contact', name: 'list_contact'},
  'custom_field':{label: 'Set a custom field', name: 'custom_field'}
};

const initialElements = [
  {
    id: "1",
    type: "input", // input node
    data: { label: (<> <strong>Select Trigger</strong></>) },
    position: { x: 100, y: 0 }
  }

];
const endNode = {
  id: '2',
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
const initialEdges = [];
let startId = 1;

function Flow(props)
{
  const [nodes, setNodes, onNodesChange] = useNodesState(initialElements);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((connection) => setEdges((eds) => addEdge(connection, eds)), []);
  const onInit = (reactFlowInstance) => console.log('flow loaded:', reactFlowInstance);

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
    edgeUpdateSuccessful.current = true;
    setEdges((els) => updateEdge(oldEdge, newConnection, els));
  }, []);

  const onEdgeUpdateEnd = useCallback((_, edge) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeUpdateSuccessful.current = true;
  }, []);

  const [showOptions, setShowOptions] = useState(false);
  
  const [showAction, setShowAction] = useState(false);
  const [actionData, setActionData] = useState();

  const [data , setData] = useState();
  const [options , setOptions] = useState();
  const [heading  , setHeading] = useState();

  const [currentNode , setCurrentNode ] = useState();


  const yPos = useRef(0);
  
  function getId(){
    startId ++;

    return startId;
  }
  /**
   * Store triger data
   */
 function saveData(value){
    var newNodes = nodes; 
    Object.entries(nodes).map(([key, node]) => {
      if((node.type == currentNode.type) && currentNode.type == 'input' ){
        newNodes[key].data.label = <strong> {trigers[value].label} </strong>
        setNodes(newNodes);
        addNode(currentNode, 'End', 'output');
      } else if((currentNode.type == 'action') && node.type == currentNode.type ) {
        
        // Get Action input
        let newData = Object.assign({}, actionData); 
        newData['heading'] = actions[value].label;
        newData['type'] = value;
        setActionData(newData);
        setShowAction(true);


        newNodes[key].data.label = <strong> {actions[value].label} </strong>
        setNodes(newNodes);
      }  

    });
    setShowOptions(false);
    if(currentNode.type == 'add_action' ){

      setNodes(newNodes);
      addNode(currentNode, processTypes[value].label , value);
    }
    
  }

  /**
   * Add a new node & Join 
   */
  const addNode = useCallback((currentNode, label, type = '') => {
    yPos.current += 100;
    var id = getId()
    var nextNode = {
          id: id.toString(),
          type: type,
          position: { x: 100, y: yPos.current },
          data: { label: label }
        };
    var newNode = nodes;
    newNode.push(nextNode);
    setNodes(newNode);

    var source = ''; var target = '';
    
    if(currentNode.source){
    
      var newEdges = [];
      Object.entries(edges).map(([key, edge]) => {
          if(edge.id != currentNode.id){
            newEdges.push(edge);
          }
      });
      setEdges(newEdges);
      source = currentNode.source;
      target = id;
      addEdge(source , target);

      source = id;
      target = currentNode.target;
      addEdge(source , target);

    } else {
      source = currentNode.id;
      target = id;
      addEdge(source , target);
    }
    
  }, []);

  /**
   * Join between nodes
   * 
   * @param {interger} source 
   * @param {interger} target 
   */
  function addEdge (source, target){
    var newEdge =  { id: 'edge'+source+'-'+target, source: source.toString() , target: target.toString(), type:'add_action' , label: '+' };
    
    setEdges((eds) => eds.concat(newEdge) );
  }

  


  /**
   * When user click on the node
   */
  function onNodeClick(event, node)
  {
    if(node.type == 'input') {
      // Show Modal and get the event
      setHeading('Triggers')
      setOptions(trigers);
      setShowOptions(true);
    } else if(node.type == 'action'){
      setHeading('Actions')
      setOptions(actions);
      setShowOptions(true);
    }
    setCurrentNode(node);
    console.log(currentNode);

   }

   function onEdgeClick(event, node)
   {
      if(node.type == 'add_action'){
        setHeading('Actions')
        setOptions(processTypes);
        setShowOptions(true);
      }
      setCurrentNode(node);
      console.log(currentNode);

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
            onConnect={onConnect}
            // onEdgeUpdate={onEdgeUpdate}
            // onEdgeUpdateStart={onEdgeUpdateStart}
            // onEdgeUpdateEnd={onEdgeUpdateEnd}
            onInit={onInit}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            fitView
            className="touchdevice-flow"
            attributionPosition="top-right"
          >
      
          <Controls />
          <Background color="#aaa" gap={10} />
        </ReactFlow>
      </div>

     
        {showOptions &&
          <Trigger
            heading= {heading}
            options={options}
            saveData={saveData}
            setShowOptions={setShowOptions}
          />
        }

        {showAction &&
          <Action 
            actionData={actionData}
            setShowAction={setShowAction}

          />
        }

    </Authenticated>
  );
}
export default Flow;












