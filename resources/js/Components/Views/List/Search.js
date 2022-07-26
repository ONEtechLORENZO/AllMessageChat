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

    /**
     * Trigger search
     */
    function triggerSearch()
    {
        Inertia.get(route('list' + props.module) + '?page='+ props.currentPage +'&search=' + search);
    }

    return (
        <div className='flex gap-4'>
            <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                        <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                </div>
                <Input 
                    name="search"
                    id="search"
                    placeholder="Search"
                    value={search}
                    handleChange={(event) => setSearch(event.target.value)}
                    className={`pl-9 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`} 
                />
            </div>
            <div>
                <button
                    type='button'
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                    onClick={triggerSearch}
                >                        
                    Search                        
                </button>
            </div>
        </div>
    );
}

export default Search;