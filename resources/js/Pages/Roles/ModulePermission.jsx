import ToggleInput from '@/Components/Forms/ToggleInput'
import {useEffect, useState} from 'react'

export default function ModulePermission(props){

    const [rolePermission, setRolePermission] = useState({});

    useEffect(() => {
        if(props.data.ModulePermission) {
            setRolePermission(props.data.ModulePermission);
        }
        if(props.data.role_permission) {
            setRolePermission(props.data.role_permission);
        }
    })

    /**
     * Handle change event
     */
    function handleChange(name, value, parent){
        let newState = Object.assign({}, rolePermission);
        if(parent) {
            if(value){
                
                var actions = (parent && rolePermission.hasOwnProperty(parent)) ? rolePermission[parent] : [];
                actions.push(name);
                newState[parent] = actions;
            } else {
                actions = (parent && rolePermission.hasOwnProperty(parent)) ? rolePermission[parent] : [];
                if(actions.includes(name)) {
                    const index = actions.indexOf(name);
                    if (index > -1) { // only splice array when item is found
                        actions.splice(index, 1); // 2nd parameter means remove one item only
                    }
                    newState[parent] = actions;
                }
            }
        } else {
            if(value){
                var actions = (rolePermission.hasOwnProperty(name)) ? rolePermission[name] : [];                
                newState[name] = actions;
            } else {
                delete newState.name;
            }
        }
        props.DataHandler('role_permission', newState);
        setRolePermission(newState);
    }

    return(
        <>
            <div className="grid grid-cols-4 gap-4 text-center text-sm font-medium text-white">
                <div>Module Name</div>
                <div>Create</div>
                <div>Edit</div>
                <div>Delete</div>
            
                {Object.entries(props.modulePermissions).map(([module_name, actions]) => (
                    <>
                        <div>
                            <div className="sm:grid sm:grid-cols-12 sm:gap-4 flex">
                                <div className="mt-1 col-span-8 !sm:mt-0 flex">
                                    <div className=" mb-7 pl-0">
                                        <ToggleInput 
                                            label={module_name}
                                            value={(rolePermission && rolePermission.hasOwnProperty(module_name)) ? true : false}
                                            parent={''}
                                            name={module_name} 
                                            toggleChange={handleChange}
                                            readOnly={props.readOnly}
                                        />
                                    </div>
                                </div>
                            </div> 
                        </div>
                        {Object.entries(actions).map(([key, action]) => (
                            <div className=''>
                                <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                                    <div className="mt-1 col-span-8 !sm:mt-0">
                                        {((rolePermission).hasOwnProperty(module_name) || !rolePermission)&&
                                            <div className=" form-switch mb-7">
                                                <ToggleInput 
                                                    label=''
                                                    value={( rolePermission && (rolePermission.hasOwnProperty(module_name)) && (rolePermission[module_name]).includes(action)) ? true : false}
                                                    name={action} 
                                                    parent={module_name}
                                                    toggleChange={handleChange}
                                                    readOnly={props.readOnly}
                                                />
                                            </div>
                                        }
                                    </div>
                                </div> 
                            </div>
                        ))}
                    </>
                ))}
            </div>
        </>
    )
}












