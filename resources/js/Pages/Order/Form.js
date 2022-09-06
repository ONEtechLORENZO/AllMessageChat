import React, { useState, useEffect } from "react";
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/solid';
import CreatableSelect from 'react-select';
import axios from "axios";

export default function LineItem(props)
{
    const [productList, setProductList] = useState(props.productList);

    useEffect(()=>{
        addItem();
        addTotalPrice(); 
    },[]);

    useEffect(() => {
        addTotalPrice();
    },[props]);
    
    //add New LineItem
    function addItem(){
        var newLineItem = Object.assign([], props.lineItems);
        let addItem = {
            name : '', quantity: 0, price: '0.00', amount: '0.00' 
        };
        newLineItem.push(addItem); 
        props.setLineItems(newLineItem);
    }
    
    //delete the LineItem
    function deleteItem(index){
        let confirmDeleteItem = window.confirm('Are you sure you want to delete the item?');
        if(!confirmDeleteItem) {
            return;
        }
        var newLineItem = Object.assign([], props.lineItems);
        newLineItem.splice(index, 1);
        props.setLineItems(newLineItem);
        addTotalPrice();
    }
    
    //get product price using Product Name
    function getProductName(event,index){
        var newItems = Object.assign([],props.lineItems);
        var product_id = event.id;
        if(!product_id){
            newItems[index] = {name : '', quantity: 0, price: '0.00', amount: '0.00' };
            props.setLineItems(newItems);
            return false;
        }
        var url = route('get_product_price' , {'id' : product_id})
        axios.get(url).then((response) => {
            newItems[index] = (response.data);
            props.setLineItems(newItems);
        });
        
    }

    //handle quantity control
    function addQuantity(event,price,index){
        var newLineItem = Object.assign([], props.lineItems);
        const quantity = event.target.value.replace(/\D/g, '');
        let productPrice = quantity * price;
        newLineItem[index]['quantity'] = quantity;
        newLineItem[index]['amount'] =  productPrice;
        props.setLineItems(newLineItem);
        addTotalPrice();
    }
    
    //handle the total price
    function addTotalPrice(){
        var newLineItem = Object.assign([], props.lineItems);
        var total_amount = '0.00';
        (newLineItem).map((items) => {
              var amount = parseInt(items.amount);
              total_amount = parseInt(total_amount) + amount;
        });
        props.setTotalPrice(total_amount);
    }

    return(
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg p-8"> 
            <div className="border-solid border ">
                <table className="min-w-full divide-y divide-gray-300 ">
                    <thead className="bg-gray-50 ">
                    <tr>
                        <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6 w-1/2">
                        ITEM DETAILS
                        </th>
                        <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6 w-64">
                        QUANTITY
                        </th>
                        <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6 w-64">
                        RATE
                        </th>
                        <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6 w-64">
                        AMOUNT
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                    {props.lineItems.map((items,index) => {  
                        return(
                        <tr key={index}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            <CreatableSelect
                                value={items.name}
                                options={productList}
                                onChange={(value)=> getProductName(value,index)}
                            />
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <input 
                            className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md border-gray-300 mt-1 appearance-none  px-3 py-2 border shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm"
                            value={items.quantity}
                            onChange={(e) => addQuantity(e,items.price,index)}
                            />
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
                        {props.lineItems && props.lineItems.length > 1 ? 
                        <>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" onClick={() => deleteItem(index)}>
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
                    <button 
                        type='button'
                        className='inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold shadow-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]'
                        onClick={() => addItem()}
                    >
                        <PlusCircleIcon className="h-5 w-5"/> Add new item
                    </button>
                </div>
                <div className="grid grid-cols-2">
                    <div className="flex justify-center p-2">Total($)</div>
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