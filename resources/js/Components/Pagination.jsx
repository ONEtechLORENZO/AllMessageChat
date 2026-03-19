import React, { useEffect, useState } from 'react';
import { Link, router as Inertia } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { AiOutlineVerticalLeft, AiOutlineVerticalRight, AiOutlineRight, AiOutlineLeft } from "react-icons/ai";


function Pagination(props) {
    const translator = props.translator ?? {};
    const [pageLimit, setpageLimit] = useState(
        props.paginator.pageLimit ?? props.paginator.perPage ?? 10
    );

    const firstItem = props.paginator.firstItem ?? 0;
    const lastItem = props.paginator.lastItem ?? 0;
    const total = props.paginator.total ?? 0;

    function selecthandleChange(event) {
        setpageLimit(event.target.value)
        if (event.target.value != '') {
            Inertia.post(route('setPageLimit', [props.module]), { 'per_pagelimit': event.target.value });

        }
    }
    return (
        <div className='flex justify-end gap-10 !mt-5 items-center'>
            <div className='flex items-center'>{translator['Rows per page'] ?? 'Rows per page'}:
                <select
                    className="block border-0 focus:outline-none !bg-transparent !pr-[2rem] sm:text-sm appearance-none"
                    value={pageLimit}
                    onChange={selecthandleChange}
                >
                    {
                        [10, 25, 50, 100]
                            .map(i => <option key={i} value={i}>{i}</option>)
                    }
                </select>
            </div>
            <div>  <span>{firstItem}-{lastItem} of {total} </span>
            </div>
            <div className='flex gap-6'>
                <Link
                    href={props.paginator.firstPageUrl ? props.paginator.firstPageUrl : '#'}
                //className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100"
                >
                    <AiOutlineVerticalRight className='cursor-pointer' size={'1.2rem'} />
                </Link>

                <Link
                    href={props.paginator.previousPageUrl ? props.paginator.previousPageUrl : '#'}
                //  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100"
                >
                    <AiOutlineLeft className='cursor-pointer' size={'1.2rem'} />
                </Link>

                <Link
                    href={props.paginator.nextPageUrl ? props.paginator.nextPageUrl : '#'}
                //  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100"
                >
                    <AiOutlineRight className='cursor-pointer' size={'1.2rem'} />
                </Link>

                <Link
                    href={props.paginator.lastPageUrl ? props.paginator.lastPageUrl : '#'}
                //className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                    <AiOutlineVerticalLeft className='cursor-pointer' size={'1.2rem'} />
                </Link>
            </div>
        </div>
    );
}

export default Pagination;












