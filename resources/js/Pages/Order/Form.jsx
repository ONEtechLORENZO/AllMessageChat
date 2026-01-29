import React, { useState, useEffect } from "react";
import axios from "axios";
import ItemTable from "./itemTable";

export default function LineItem(props)
{
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
        <ItemTable 
         lineItems={props.lineItems}
         getProductName={getProductName}
         addQuantity={addQuantity}
         deleteItem={deleteItem}
         addItem={addItem}
         productList={props.productList}
         totalPrice={props.totalPrice}
         view={'Form'}
         {...props}
        />
    );
}









