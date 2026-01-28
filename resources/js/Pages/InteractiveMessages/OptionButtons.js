
import {useEffect, useState, useRef} from 'react'
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/solid';
import Input from '@/Components/Forms/Input';
import TextArea from '@/Components/Forms/TextArea';


export default function OptionButtons(props) 
{
    const [buttons, setButtons] = useState([]);
    const [menuItem, setMenuItem] = useState({
        'title': '', 'body': '', 'button_title': ''
    });
    const cancelButtonRef = useRef(null); 
    
    var divClassName = 'grid-cols-2 ';
    var buttonFormTitle = 'Add quick reply buttons';
    if(props.data.option_type && props.data.option_type == 'list_option'){
        divClassName = 'grid-cols-3 ';
        buttonFormTitle = 'Add Menu List Data';
    }

    useEffect(() => {
        //console.log('props.data.options' , props.data);

        if(props.data.options) {
            if( props.data.option_type && props.data.option_type  == 'list_option' ){
                setButtons(props.data.options['list_option']);
                setMenuItem(props.data.options['menu_data']);
            } else {
                setButtons(props.data.options);
            }
        }

        if(props.data.list_options) {
            setButtons(props.data.list_options);
        }
        
        if(props.data.menu_items) {
            setMenuItem(props.data.menu_items)   
        }
        
    });

    function addButton(){
        var newState = Object.assign([], buttons);

        if(props.data.option_type && props.data.option_type == 'list_option'){
            var button = { 'type': 'text', 'title' : '', 'description': ''};
        } else {
            var button = { 'type': 'text', 'title' : ''};
        }
        newState.push(button);
        
        props.DataHandler('list_options', newState);
        setButtons(newState);
    }

    function handleChange(event){
        var value = event.target.value;
        var key = event.target.id;
        var name = event.target.name;

        let newState = Object.assign([], buttons);
        newState[key][name] = value;
      
        props.DataHandler('list_options', newState);
        setButtons(newState);
    }

    function deleteRow(key){
        let newState = Object.assign([], buttons);
        newState.splice(key, 1);

        props.DataHandler('list_options', newState);
        setButtons(newState);
    }

    function dataChange(event){
        var value = event.target.value;
        var name = event.target.name;

        var newState = Object.assign({}, menuItem);
        newState[name] = value

        props.DataHandler('menu_items', newState);
        setMenuItem(newState);
    }

    return (
        <div className='mb-5'>

            <div className='text-lg font-medium text-gray-900'> {buttonFormTitle} </div>
                        
            {(props.data.option_type && props.data.option_type == 'list_option') &&
                <> 
                    <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                        <label className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"> Title </label>
                        <div className="mt-1 col-span-8 !sm:mt-0">
                            <Input
                                type="text" 
                                className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                name={'title'}
                                value={menuItem.title}
                                handleChange={dataChange}
                                
                            />
                        </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                        <label className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"> Body </label>
                        <div className="mt-1 col-span-8 !sm:mt-0">
                            <TextArea
                                name={'body'}
                                rows="2"
                                className={`mt-1 max-w-lg shadow-sm block w-full focus:ring-skin-primary focus:border-skin-primary sm:text-sm border border-gray-300 rounded-md`}
                                value={menuItem.body}
                                handleChange={dataChange}
                            />
                        </div>
                    </div>
                    <div className="sm:grid sm:grid-cols-12 sm:gap-4 mb-5">
                        <label className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"> Button Title </label>
                        <div className="mt-1 col-span-8 !sm:mt-0">
                            <Input
                                type="text" 
                                className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                name={'button_title'}
                                value={menuItem.button_title}
                                handleChange={dataChange}
                            />
                        </div>
                    </div>
                </>
            }

            <div class={"grid gap-4 text-center text-sm font-medium text-gray-900 m-4 "+ divClassName} >
              
                    <div>Title</div>
                    {(props.data.option_type && props.data.option_type == 'list_option') &&
                        <div>Description</div>
                    }
                    <div>Action</div>
              
                
                {Object.entries(buttons).map(([key, label]) => (
                    <>
                        <Input
                            type="text" 
                            className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                            id={key}
                            name={'title'}
                            value={label.title}
                            handleChange={handleChange}
                        />
                         {(props.data.option_type && props.data.option_type == 'list_option') &&
                            <TextArea
                                name={'description'}
                                id={key}
                                rows="2"
                                className={`mt-1 max-w-lg shadow-sm block w-full focus:ring-skin-primary focus:border-skin-primary sm:text-sm border border-gray-300 rounded-md`}
                                value={label.description}
                                handleChange={handleChange}
                            />
                        }
                        <div className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" onClick={() => deleteRow(key)}>
                            <TrashIcon className='h-4 w-4 text-red-600 cursor-pointer' />
                        </div>
                        
                    </>
                ))}
            </div>
            <div className="w-full flex justify-end mt-4">
                <button 
                    type="button" 
                    class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => addButton()}
                    ref={cancelButtonRef}
                >
                    <PlusCircleIcon className="h-5 w-5"/>
                    Add item
                </button>
            </div>
        </div>
    )
}