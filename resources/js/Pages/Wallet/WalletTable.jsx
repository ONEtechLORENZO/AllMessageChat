import React, { useEffect, useState } from 'react';
import { Head,Link } from '@inertiajs/react';
import Axios from "axios";
import Checkbox from '@/Components/Forms/Checkbox';
import Dropdown from '@/Components/Forms/Dropdown';
import { CalenderIcon } from '../icons';
import { router as Inertia } from "@inertiajs/react";
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Search } from 'heroicons-react'; 
import {HiOutlineAdjustmentsVertical } from "react-icons/hi2";
import Filter from  '@/Components/Views/List/Filter2';
import { BiImport } from "react-icons/bi";
import { AiOutlineVerticalLeft,AiOutlineVerticalRight,AiOutlineRight,AiOutlineLeft } from "react-icons/ai";

import {
  Row,
  Col,
  Button,
  Nav,
  Container,
  NavItem,
  ListGroup,
  ListGroupItem,
  Card,
  CardBody,
  CardHeader,
  NavLink,
  TabContent,
  TabPane,
  Progress,
  ButtonGroup,
  CardFooter,
  Table,
  Popover,
  PopoverBody,
} from "reactstrap";

function WalletTable(props){    
    const [search, setSearch] = useState('');
    const [records, setRecords] = useState(props.records);
    const [pageLimit, setpageLimit] = useState(props.paginator.page_limit);


    function triggerSearch()
      {
        Inertia.get(route('wallet') +'?search=' + search,{
            onSuccess: () => {
                console.log('success')
            }
        });
      }
      function selecthandleChange(event){
        setpageLimit(event.target.value)
        if(event.target.value!=''){
             Inertia.post(route('setPageLimit', [props.module]), {'per_pagelimit':event.target.value});
          
         } 
        }
    return(
        <>       
       <div className='flex justify-between items-center w-full'>
                    <div className='flex gap-10 items-center'>
                            <div className='flex items-center gap-3'>
                                <CalenderIcon/>
                                <div className='flex items-center'>This mount <ChevronDownIcon style={{width : "20px" , height : "20px"}}/> </div>
                            </div>
                            <div className='flex justify-center items-center gap-3'>
                                <Search/>
                                <input 
                                type={'text'} 
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                              //  onKeyDown={triggerSearch}
                                className="form-control" />
                            </div>
                            <div>
                <button
                    type='button'
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-grey px-4 py-2 text-sm font-medium text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                    onClick={triggerSearch}
                >                        
                    {props.translator['Search']}                        
                </button>
            </div>
            
                          </div>
                    <div className='flex !gap-2 items-center text-[#363740]'>
                    <a href={route('export',{'exportmod':props.module})} 
                                    className='d-flex gap-1 items-center px-4 py-2 font-semibold shadow-md text-sm btn btn-light'
                                >
                        <BiImport  size={'1.5rem'}/>
                        Export
                        </a>
                    </div>
                </div>
                <div className='card p-4 mt-[20px]'>
                <Table
                className='gio-table'
                    >
                    <thead>
                        <tr>
                            <th>
                                <input type={'checkbox'} />
                            </th>
                            {Object.entries(props.headers).map(([name, field]) => {
                                return(
                            <th key={name}>
                           {field.label}
                            </th>);
                            })}
                        </tr>
                    </thead>
                 
                    <tbody>
                       
                    {Object.entries(records).map(([key, record]) => ( 
                        <tr key={key}>
                             <td>
                                <input type={'checkbox'} />
                            </td>                            
                            {Object.entries(props.headers).map(([name, field],index) => {                                     
                                    let column_value = record[name];
                             return (
                                        <td key={name} title={column_value} className="whitespace-nowrap px-2 py-2 text-sm text-[#3D4459]">
                                            {column_value}
                                        </td>
                                    );
                                })}                          
                        </tr>
                        ))}
                        {(props.records).length === 0 && (
                                        <tr>
                                            <td
                                                className="px-6 py-4 border-t"
                                                colSpan="4"
                                            >
                                            No records found!
                                            </td>
                                        </tr>
                                    )}
                    </tbody>
                    </Table>

                </div>
                {(props.records).length !== 0 &&
                        <>
                <div className='flex justify-end gap-10 !mt-5'>
                        <div className='flex'>Rows per page:
                        <select 
                            className="block border border-gray-300 bg-gray rounded-md shadow-sm focus:outline-none focus:ring-indigo-200 focus:border-indigo-200 sm:text-sm"
                            value={pageLimit} 
                            onChange={selecthandleChange}
                        >
                        {
                         [...Array(10)].map((_, i) => i + 1)
                        .map(i => <option key={i} value={i}>{i}</option>)
                        }
                          </select>
                        
                        
                        </div>
                       
                        <div>  <span>{props.paginator.firstItem}-{props.paginator.lastItem} of {props.paginator.total} </span>                  
               </div>
                        <div className='flex gap-6'>
                        <Link href={props.paginator.firstPageUrl ? props.paginator.firstPageUrl : '#'}>
                            <AiOutlineVerticalRight className='cursor-pointer' size={'1.2rem'}/></Link>
                        <Link href={props.paginator.previousPageUrl ? props.paginator.previousPageUrl : '#'}>              
                             <AiOutlineLeft className='cursor-pointer' size={'1.2rem'}/></Link> 
                        <Link href={props.paginator.nextPageUrl ? props.paginator.nextPageUrl : '#'} >             
                            <AiOutlineRight className='cursor-pointer' size={'1.2rem'}/></Link>
                            <Link href={props.paginator.lastPageUrl ? props.paginator.lastPageUrl : '#'}>                    
                            <AiOutlineVerticalLeft className='cursor-pointer' size={'1.2rem'}/></Link>                            
                        </div>
                </div></>}
        </>
    );
}

export default WalletTable;












