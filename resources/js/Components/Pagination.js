import React from 'react';
import { Link } from '@inertiajs/inertia-react';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';

function Pagination(props)
{
    return (
        <div class="p-5 text-center" >
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Link
                    href={props.paginator.firstPageUrl ? props.paginator.firstPageUrl : '#'}
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100"
                >
                    <ChevronDoubleLeftIcon className='h-6 w-6' />
                </Link>

                <Link
                    href={props.paginator.previousPageUrl ? props.paginator.previousPageUrl : '#'}
                    class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100"
                >
                    <ChevronLeftIcon className='h-6 w-6' />
                </Link>

                <span
                    class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100"
                >
                    {props.paginator.currentPage} of {props.paginator.lastPage}
                </span>

                <Link
                    href={props.paginator.nextPageUrl ? props.paginator.nextPageUrl : '#'}
                    class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100"
                >
                    <ChevronRightIcon className='h-6 w-6' />
                </Link>

                <Link
                    href={props.paginator.lastPageUrl ? props.paginator.lastPageUrl : '#'}
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                    <ChevronDoubleRightIcon className='h-6 w-6' />
                </Link>
            </nav>
        </div>
    );
}

export default Pagination;