import React from "react";
import Creatable from 'react-select/creatable';

function ReactSelect(props)  {
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderColor: state.isFocused ? '#BF00FF' : 'rgba(255, 255, 255, 0.14)',
            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 0, 255, 0.45)' : 'none',
            '&:hover': {
                borderColor: '#BF00FF',
            },
        }),
        valueContainer: (base) => ({
            ...base,
            color: '#ffffff',
        }),
        input: (base) => ({
            ...base,
            color: '#ffffff',
        }),
        placeholder: (base) => ({
            ...base,
            color: 'rgba(255, 255, 255, 0.55)',
        }),
        singleValue: (base) => ({
            ...base,
            color: '#ffffff',
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: 'rgba(255, 255, 255, 0.14)',
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: '#ffffff',
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: 'rgba(255, 255, 255, 0.75)',
            ':hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.25)',
                color: '#ffffff',
            },
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: '#1b1328',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            overflow: 'hidden',
        }),
        menuList: (base) => ({
            ...base,
            backgroundColor: '#1b1328',
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? 'rgba(191, 0, 255, 0.35)'
                : state.isFocused
                    ? 'rgba(255, 255, 255, 0.08)'
                    : '#1b1328',
            color: '#ffffff',
            ':active': {
                backgroundColor: 'rgba(191, 0, 255, 0.45)',
            },
        }),
        indicatorSeparator: (base) => ({
            ...base,
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            color: state.isFocused ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
            ':hover': {
                color: '#ffffff',
            },
        }),
        clearIndicator: (base) => ({
            ...base,
            color: 'rgba(255, 255, 255, 0.7)',
            ':hover': {
                color: '#ffffff',
            },
        }),
    };

    return(
        <>
        {props.openTag ? 
        <>
            <div className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2 w-96" >
            <Creatable
            isMulti 
            value={props.value}
            defaultValue={props.defaultValue}
            onChange={props.onChange}
            options={props.options}
            styles={selectStyles}
            placeholder={props.translator?.Select ?? 'Select'}
            />
            </div> 
            <div className="inline-flex items-center px-2.5 py-1.5 border border-white/10 shadow-sm text-sm font-medium rounded text-white bg-white/10 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0815] focus:ring-[#BF00FF]/60">
                <span >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" onClick={() => props.save()}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </span>
                <span >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" onClick={() => props.setOpen(false)}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </span>
            </div>
        </>
        : 
        <>
            <div className="flex flex-wrap items-center gap-2">
             {props.value && props.value.map((tag, key) => {
                    return(
                        <div className="mt-1 mx-1 text-sm text-white sm:mt-0 sm:col-span-2">
                            {tag.label} 
                            {(props.value).length > (key+1) && 
                                <span className="text-white/60">,</span>
                            }
                        </div>
                    )
                })}
                {!props.value?.length &&
                    <div className="mt-1 mx-1 text-sm text-white/45 sm:mt-0 sm:col-span-2">
                        {props.translator?.Select ?? 'Select'}
                    </div>
                }
                <div className="inline-flex items-center px-2.5 py-1.5 border border-white/10 shadow-sm text-sm font-medium rounded text-white bg-white/10 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0815] focus:ring-[#BF00FF]/60" onClick={() => props.setOpen(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                </div>
                </div>
        </>
        }
        </>
    )
}

export default ReactSelect;












