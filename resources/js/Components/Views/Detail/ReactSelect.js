import React from "react";
import Creatable from 'react-select/creatable';

function ReactSelect(props)  {

    return(
        <>
        {props.openTag ? 
        <>
            <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 w-96" >
            <Creatable
            isMulti 
            value={props.value}
            defaultValue={props.defaultValue}
            onChange={props.onChange}
            options={props.options}
            />
            </div> 
            <div className="inline-flex items-center px-2.5 py-1.5 border-0 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]">
                <span >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" onClick={() => props.save()}>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </span>
                <span >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" onClick={() => props.setOpen(false)}>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </span>
            </div>
        </>
        : 
        <>
         {props.value && props.value.map((tag, key) => {
                return(
                    <div className="mt-1 mx-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {tag.label} 
                        {(props.value).length > (key+1) && 
                            <> , </>
                        }
                    </div>
                )
            })}
            <div className="inline-flex items-center px-2.5 py-1.5 border-0 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]" onClick={() => props.setOpen(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
            </div>
        </>
        }
        </>
    )
}

export default ReactSelect;