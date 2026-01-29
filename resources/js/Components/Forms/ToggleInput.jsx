import { useState } from 'react'
import { Switch } from '@headlessui/react'

export default function ToggleInput(props) {   
    const [enabled, setEnabled] = useState(props.value);
    
    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }
    
    /**
     * Update toggle button On/Off
     */
    function handleChange(value){
        if(props.readOnly === true){
            setEnabled(value);
            props.toggleChange(props.name , value, props.parent);
        }
    }

    return (
        <Switch.Group as="div" className="flex items-center">
            <Switch
                checked={enabled}
                onChange={handleChange}
                className={classNames(
                enabled ? 'bg-indigo-600' : 'bg-gray-200',
                'relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                )}
            >
            <span className="sr-only">Use setting</span>
            <span
            aria-hidden="true"
            className={classNames(
                enabled ? 'translate-x-5' : 'translate-x-0',
                'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
            )}
            />
            </Switch>
                <Switch.Label as="span" className="ml-3">
                <span className="text-sm font-medium text-gray-900">{props.label}</span>
            </Switch.Label>
        </Switch.Group>
    );
}












