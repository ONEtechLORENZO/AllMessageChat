import React, { useEffect, useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import Input from '@/Components/Forms/Input';
import { SearchIcon } from '@heroicons/react/solid';

function Search(props)
{
    const [search, setSearch] = useState('');

    useEffect(() => {
        setSearch(props.search);
    }, [props.search]);
    const pathname = window.location.pathname;

    /**
     * Trigger search
     */
    function triggerSearch()
    {
        if(props.module=="Transaction")
        {
            Inertia.get(route('wallet') +'?current_page=Invoice&search_tab=Transaction&page='+ props.currentPage +'&search=' + search + '&sort_by=' + props.sort_by + '&sort_order=' + props.sort_order); 
        }
        if(props.module=="Msg")
        {
            Inertia.get(route('wallet') +'?current_page=Expenses&search_tab=Msg&page='+ props.currentPage +'&search=' + search + '&sort_by=' + props.sort_by + '&sort_order=' + props.sort_order); 
        }

       if(props.module=="Field" && props.mod!='')
       {
        Inertia.get(route('list' + props.module) +'?mod='+ props.mod + '&page='+ props.currentPage +'&search=' + search + '&sort_by=' + props.sort_by + '&sort_order=' + props.sort_order);
       }
        else 
        {
            // if(props.module=="Company" && !(pathname.includes('admin/'))) 
            //     Inertia.get(route('listAdminCompany') +'?page='+ props.currentPage +'&search=' + search + '&sort_by=' + props.sort_by + '&sort_order=' + props.sort_order); 
            // else
                Inertia.get(route('list' + props.module) +'?page='+ props.currentPage +'&search=' + search + '&sort_by=' + props.sort_by + '&sort_order=' + props.sort_order);
        }
    }

    return (
        <div className='flex gap-2 items-center'>            
            <div className="mt-1 relative align-self-start flex items-center gap-1.5">
                <div className="inline-flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">
                   <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" onClick={triggerSearch}/>
                </div>
                <Input 
                    name="search"
                    id="search"
                    placeholder="Search"
                    value={search}
                    handleChange={(event) => setSearch(event.target.value)}
                    className={`pl-9 appearance-none block w-full  py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`} 
                />
            </div>
            {/* <div>
                <button
                    type='button'
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-grey px-4 py-2 text-sm font-medium text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                 //  className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                    onClick={triggerSearch}
                >                        
                    {props.translator['Search']}                        
                </button>
            </div> */}
        </div>
    );
}

export default Search;