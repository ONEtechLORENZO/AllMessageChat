import React from "react";
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/solid';
import CreatableSelect from 'react-select';

export default function ItemTable(props){

    return(
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg p-8"> 
        <div className="border-solid border ">
            <table className="min-w-full divide-y divide-gray-300 ">
                <thead className="bg-gray-50 ">
                <tr>
                    <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6 w-1/2">
                    {props.translator['ITEM DETAILS']}
                    </th>
                    <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6 w-64">
                    {props.translator['QUANTITY']}
                    </th>
                    <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6 w-64">
                    {props.translator['RATE']}
                    </th>
                    <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6 w-64">
                    {props.translator['AMOUNT']}
                    </th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                {props.lineItems.map((items,index) => {  
                    return(
                    <tr key={index}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {props.view == 'Form' ? 
                         <CreatableSelect
                         value={items.name}
                         options={props.productList}
                         onChange={(value)=> props.getProductName(value,index)}
                         />
                        :
                        <input 
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md border-gray-300 mt-1 appearance-none  px-3 py-2 border shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm"
                        value={items.name}
                        />
                        }
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {props.view == 'Form' ? 
                         <input 
                         className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md border-gray-300 mt-1 appearance-none  px-3 py-2 border shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm"
                         value={items.quantity}
                         onChange={(e) => props.addQuantity(e,items.price,index)}
                         />
                         :
                         <input 
                         className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md border-gray-300 mt-1 appearance-none  px-3 py-2 border shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm"
                         value={items.quantity}
                         />
                         }
                       
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <input 
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md border-gray-300 mt-1 appearance-none  px-3 py-2 border shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm"
                        value={items.price}
                        readOnly
                        />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <input 
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md border-gray-300 mt-1 appearance-none  px-3 py-2 border shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm"
                        value={items.amount}
                        readOnly
                        />
                    </td>
                    {props.lineItems && props.lineItems.length > 1 && props.view == 'Form'? 
                    <>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" onClick={() => props.deleteItem(index)}>
                        <TrashIcon className='h-4 w-4 text-red-600 cursor-pointer' />
                    </td>
                    </>
                    : ''}
                    </tr>
                    )
                })}
                </tbody>
            </table>
        </div>

           <div className="pt-8 grid grid-cols-2">
            <div className="flex justify-start">
            {props.view == 'Form'? 
              <button 
              type='button'
              className='inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold shadow-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]'
              onClick={() => props.addItem()}
             >
                <PlusCircleIcon className="h-5 w-5"/> {props.translator['Add new item']}
              </button>
            :''}
            </div>
            <div className="grid grid-cols-2">
                <div className="flex justify-center p-2">{props.translator['Total']}($)</div>
                <div className="flex justify-end">
                    <input 
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md border-gray-300 mt-1 appearance-none  px-3 py-2 border shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm"
                        name='total_amount' 
                        value={props.totalPrice}
                    />
                </div>
            </div>
           </div> 
        </div>
    );
}