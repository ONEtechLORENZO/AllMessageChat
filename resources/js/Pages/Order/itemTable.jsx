import React from "react";
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/solid';
import CreatableSelect from 'react-select';
import ListViewTable from "@/Components/Views/List/ListViewTable";

export default function ItemTable(props){
    const itemHeaders = {
        name: { label: props.translator['ITEM DETAILS'], type: 'text' },
        quantity: { label: props.translator['QUANTITY'], type: 'text' },
        price: { label: props.translator['RATE'], type: 'text' },
        amount: { label: props.translator['AMOUNT'], type: 'text' },
    };

    return(
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg p-8"> 
        <div className="border-solid border ">
            <ListViewTable
                records={props.lineItems}
                customHeader={itemHeaders}
                fetchFields={false}
                hideToolMenu={true}
                disableSorting={true}
                theme="light"
                forceActionColumn={props.lineItems && props.lineItems.length > 1 && props.view == 'Form'}
                renderCell={({ name, record, rowIndex }) => {
                    if (name === 'name') {
                        return props.view == 'Form' ? (
                            <CreatableSelect
                                value={record.name}
                                options={props.productList}
                                onChange={(value) => props.getProductName(value, rowIndex)}
                            />
                        ) : (
                            <input
                                className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md border-gray-300 mt-1 appearance-none px-3 py-2 border shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm"
                                value={record.name}
                                readOnly
                            />
                        );
                    }

                    if (name === 'quantity') {
                        return (
                            <input
                                className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md border-gray-300 mt-1 appearance-none px-3 py-2 border shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm"
                                value={record.quantity}
                                onChange={props.view == 'Form' ? (e) => props.addQuantity(e, record.price, rowIndex) : undefined}
                                readOnly={props.view != 'Form'}
                            />
                        );
                    }

                    if (name === 'price' || name === 'amount') {
                        return (
                            <input
                                className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md border-gray-300 mt-1 appearance-none px-3 py-2 border shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm"
                                value={record[name]}
                                readOnly
                            />
                        );
                    }
                }}
                renderActionCell={({ rowIndex }) =>
                    props.lineItems && props.lineItems.length > 1 && props.view == 'Form' ? (
                        <div className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" onClick={() => props.deleteItem(rowIndex)}>
                            <TrashIcon className='h-4 w-4 text-red-600 cursor-pointer' />
                        </div>
                    ) : null
                }
            />
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












