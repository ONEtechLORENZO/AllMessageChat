import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function FieldSort(props)
{        
    const [groupList, setGroupList] = useState();

    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    /**
    * Moves an item from one list to another list.
    */
    const move = (source, destination, droppableSource, droppableDestination) => {
        const sourceClone = Array.from(source);
        const destClone = Array.from(destination);
        const [removed] = sourceClone.splice(droppableSource.index, 1);

        destClone.splice(droppableDestination.index, 0, removed);

        const result = {};
        result[droppableSource.droppableId] = sourceClone;
        result[droppableDestination.droppableId] = destClone;

        return result;
    };
    
    const grid = 5;

    const getItemStyle = (isDragging, draggableStyle) => ({
        // some basic styles to make the items look a bit nicer
        userSelect: "none",
        padding: grid * 2,
        margin: `0 0 ${grid}px 0`,

        // change background colour if dragging
        background: isDragging ? "lightgreen" : "white",
        border: '1px solid black',

        // styles we need to apply on draggables
        ...draggableStyle
    });
    const getListStyle = isDraggingOver => ({
        background: isDraggingOver ? "lightblue" : "white",
     //   padding: grid,
        width: 150
    });

  
    const [state, setState] = useState([]);

    function onDragEnd(result) {
        const { source, destination } = result;

        // dropped outside the list
        if (!destination) {
            return;
        }
        const sInd = +source.droppableId;
        const dInd = +destination.droppableId;
        
        if (sInd === dInd) {
            const items = reorder(state[sInd], source.index, destination.index);
            const newState = [...state];
            newState[sInd] = items;
            setState(newState);
            
            props.setFieldOrder(newState);
        } else {
            const result = move(state[sInd], state[dInd], source, destination);
            const newState = [...state];
            newState[sInd] = result[sInd];
            newState[dInd] = result[dInd];
            setState(newState);
         
            props.setFieldOrder(newState);
        }
    }
    
    useEffect(()=> {
       setFieldList();
    }, [props.groups]);

    function setFieldList(){
        if(props.groups){
            var fieldList = [];
            var groupList = [];
            Object.entries(props.groups).map(([id, group]) => {
                groupList.push(id);
                if(props.fields && props.fields.hasOwnProperty(id) ){
                    fieldList.push(props.fields[id]);   
                } else {
                    fieldList.push([]);   
                }
            });
            setState(fieldList);
            setGroupList(groupList);
            props.setGroups(groupList);
        }
    }

    return (
        <div>
            <div className="flex gap-2">
                <DragDropContext onDragEnd={onDragEnd}>
                {state.map((el, ind) => (
                    <Droppable key={ind} droppableId={`${ind}`}>
                    {(provided, snapshot) => (
                        <div
                            className="gap-4 ba-group-container flex-1 p-2"
                            group_id={(groupList[ind])? groupList[ind] : ''}
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                            {...provided.droppableProps}
                        >
                            {props.groups &&
                                <h2 className="text-lg font-bold leading-7 text-gray-900 sm:tracking-tight sm:truncate">
                                    {props.groups[groupList[ind]]}
                                </h2>
                            }   
                        {el.map((item, index) => (
                            <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}
                            >
                            {(provided, snapshot) => (
                                <div
                                className="rounded"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={getItemStyle(
                                    snapshot.isDragging,
                                    provided.draggableProps.style
                                )}
                                >
                                    <div
                                        field_id={item.id} 
                                        style={{
                                        display: "flex",
                                        justifyContent: "space-around"
                                        }}
                                    >
                                        {item.content}
                                    </div>
                                </div>
                            )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                        </div>
                    )}
                    </Droppable>
                ))}
                </DragDropContext>
   
            </div>
        </div>
    );
}
export default FieldSort;












