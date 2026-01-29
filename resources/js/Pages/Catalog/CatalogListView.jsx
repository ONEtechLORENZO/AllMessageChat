import React, { useEffect, useState } from 'react'
import { HiOutlineChevronRight } from "react-icons/hi";
import { AiOutlineVerticalLeft,AiOutlineVerticalRight,AiOutlineRight,AiOutlineLeft } from "react-icons/ai";
import notie from 'notie';
import nProgress from 'nprogress';
import { Button } from "reactstrap";
import { BriefcaseIcon, MagnifyingGlassIcon, SwatchIcon, ArrowDownTrayIcon, Square2StackIcon } from '@heroicons/react/24/solid';
import { router as Inertia } from "@inertiajs/react";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import ActionMenu from '@/Components/Views/List/ActionMenu';
import Search from '@/Components/Views/List/Search';
import Pagination from '@/Components/Pagination';
import Input from '@/Components/Forms/Input';
import Axios from 'axios';
import NewForm from '@/Components/Forms/NewForm';
import Dropdown from '@/Components/Forms/Dropdown';
import ImportCatalog from './ImportCatalog/ImportCatalog';

function classNames(...classes) {
   return classes.filter(Boolean).join(" ");
}

export default function CatalogListView (props) {

    const [catalogId, setCatalogId] = useState();
    const [showCatalog, setShowCatalog] = useState(true);
    const [showProduct, setShowProduct] = useState(false);
    const [productId, setProductId] = useState();
    const [showImport, setShowImport] = useState(false);

    useEffect( () => {
        if(props.catalog_id) {
            setCatalogId(props.catalog_id);
        }
        if(props.fbToken) {
            setShowImport(true);
        }
    },[props]);

    function deleteCatalog(record_id) {
        if(record_id) {
            let recordData = {id: record_id};

            confirmAlert({
                title: (props.translator['Confirm to Delete']),
                message: (props.translator['Are you sure to do this?']),
                buttons: [ {
                  label: (props.translator['Yes']),
                  onClick: () => {
                    nProgress.start(0.5);
                    nProgress.inc(0.2);
                    Inertia.delete(route('delete' + props.module, recordData), {}, {
                        onSuccess: (response) => { 
                            nProgress.done();
                            notie.alert({type: 'success', text: 'Record deleted successfully', time: 5});
                        },
                        onError: (errors) => {
                            nProgress.done();
                            notie.alert({type: 'error', text: errors.message, time: 5});
                        }
                    });
                  }
                },
                { label: 'No'}
              ]
            });
        }
    }

    function showProductDetail(product_id) {
        setProductId(product_id)
        setShowCatalog(false);
        setShowProduct(true);
    }

    function hideProductDetail() {
        setProductId('')
        setShowCatalog(true);
        setShowProduct(false);
    }

    return (
        <div>
            {showCatalog ? 
               <div className="mt-2 px-2 ml-3">
                    <div className="!mt-4 grid grid-cols-12 !gap-5 px-2">
                        <div className="col-span-4 flex flex-col !gap-2">
                            <div className='text-base text-[#363740] font-semibold'>Catalog List</div>
        
                            <div className="grid gap-2 grid-cols-2">
                                <Button 
                                    type = 'button'
                                    color='primary'
                                    onClick={() => props.setShowCatalog(true)}
                                > 
                                    <div className='flex justify-center items-center font-semibold'> <BriefcaseIcon className='h-4 w-4 mr-1' />Create New Catalog </div>
                                </Button>
                                <Button 
                                    type = 'button'
                                    color='primary'
                                    onClick={() => setShowImport(true)}
                                > 
                                    <div className='flex justify-center items-center font-semibold'> <ArrowDownTrayIcon className='h-4 w-4 mr-1' />Import Catalog </div>
                                </Button>
                            </div>
                            <div className="card !shadow-card justify-between items-center flex-row !px-4 !py-2.5">
                                <div className="flex items-center gap-1.5">
                                    <Search 
                                        module={props.module} 
                                        search={props.search}
                                        mod={props.mod}                             
                                        currentPage={props.paginator.currentPage}
                                        sort_by={props.sort_by}
                                        sort_order={props.sort_order}
                                        translator={props.translator}
                                    />
                                </div>
                                <div>
                                    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.9453 13.5703L14.8203 16.6953H14.8125C14.8047 16.7109 14.7891 16.7188 14.7734 16.7344L14.75 16.75L14.7188 16.7734L14.6953 16.7891L14.6719 16.8047H14.6406L14.6172 16.8203H14.5859L14.5547 16.8359H14.1953L14.1641 16.8203H14.1328L14.1094 16.8047H14.0781L14.0547 16.7891L14.0312 16.7734L14 16.75L13.9766 16.7344L13.9375 16.6953H13.9297L10.8047 13.5703C10.705 13.4489 10.6541 13.2947 10.6618 13.1378C10.6695 12.9809 10.7353 12.8325 10.8464 12.7214C10.9575 12.6103 11.1059 12.5445 11.2628 12.5368C11.4197 12.5291 11.5739 12.58 11.6953 12.6797L13.75 14.7422V8.75C13.75 8.58424 13.8158 8.42527 13.9331 8.30806C14.0503 8.19085 14.2092 8.125 14.375 8.125C14.5408 8.125 14.6997 8.19085 14.8169 8.30806C14.9342 8.42527 15 8.58424 15 8.75V14.7422L17.0547 12.6797C17.1761 12.58 17.3303 12.5291 17.4872 12.5368C17.6441 12.5445 17.7925 12.6103 17.9036 12.7214C18.0147 12.8325 18.0805 12.9809 18.0882 13.1378C18.0959 13.2947 18.045 13.4489 17.9453 13.5703ZM9.375 9.375H3.75C3.58424 9.375 3.42527 9.44085 3.30806 9.55806C3.19085 9.67527 3.125 9.83424 3.125 10C3.125 10.1658 3.19085 10.3247 3.30806 10.4419C3.42527 10.5592 3.58424 10.625 3.75 10.625H9.375C9.54076 10.625 9.69973 10.5592 9.81694 10.4419C9.93415 10.3247 10 10.1658 10 10C10 9.83424 9.93415 9.67527 9.81694 9.55806C9.69973 9.44085 9.54076 9.375 9.375 9.375ZM3.75 5.625H14.375C14.5408 5.625 14.6997 5.55915 14.8169 5.44194C14.9342 5.32473 15 5.16576 15 5C15 4.83424 14.9342 4.67527 14.8169 4.55806C14.6997 4.44085 14.5408 4.375 14.375 4.375H3.75C3.58424 4.375 3.42527 4.44085 3.30806 4.55806C3.19085 4.67527 3.125 4.83424 3.125 5C3.125 5.16576 3.19085 5.32473 3.30806 5.44194C3.42527 5.55915 3.58424 5.625 3.75 5.625ZM8.125 14.375H3.75C3.58424 14.375 3.42527 14.4408 3.30806 14.5581C3.19085 14.6753 3.125 14.8342 3.125 15C3.125 15.1658 3.19085 15.3247 3.30806 15.4419C3.42527 15.5592 3.58424 15.625 3.75 15.625H8.125C8.29076 15.625 8.44973 15.5592 8.56694 15.4419C8.68415 15.3247 8.75 15.1658 8.75 15C8.75 14.8342 8.68415 14.6753 8.56694 14.5581C8.44973 14.4408 8.29076 14.375 8.125 14.375Z" fill="black" />
                                    </svg>
                                </div>
                            </div>
        
                            <div className="space-y-2">
                                {(props.records).length === 0 &&
                                    <tr>
                                        <td className="px-6 py-4 border-t" colSpan="8"> {props.translator['No records found!']} </td>
                                    </tr>
                                }
                                {Object.entries(props.records).map( ([key, record]) => (
                                    <div className={classNames(catalogId == record.id ? 'border-1 border-indigo-500 relative rounded flex' :'card', ' !shadow-card flex-row justify-between items-center !py-2 !px-4 cursor-pointer')} onClick={() => setCatalogId(record.id)}>
                                        <div className="flex !gap-2">
                                            <div className="flex flex-col !gap-1">
                                                <span className="font-semibold text-sm text-black">{record.name}</span>
                                                <span className="text-[12px] text-[#878787]">ID : {record.catalog_id ? record.catalog_id : ''}</span>
                                            </div> 
                                            {record.business_id ?
                                                <span className="bg-[#9F9F9F] text-white !py-1 !px-2 !rounded self-start font-semibold">Facebook</span>
                                            : ''}
                                        </div>
                                        <div className='flex justify-end'>
                                            <ActionMenu record={record} deleteRecord={deleteCatalog} {...props}/>
                                        </div>
                                    </div>
                                ))}
                                {(props.records).length != 0 &&      
                                    <Pagination 
                                        module={props.module}
                                        paginator={props.paginator}
                                        {...props} 
                                    />
                                } 
                            </div>
                        </div>
        
                        {catalogId ?
                            <ProductList 
                                catalog_id={catalogId} 
                                translator={props.translator}
                                setCatalogId={setCatalogId}
                                showProductDetail={showProductDetail}
                            />
                        : ''}
                    </div>
                </div>
            : ''}

            {showProduct ? 
                <ProductContainer 
                    catalog_id={catalogId}
                    product_id={productId} 
                    translator={props.translator} 
                    options={props.options}
                    setCatalogId={setCatalogId}
                    hideProductDetail={hideProductDetail}
                />
            : ''}

            {showImport ? 
                <ImportCatalog 
                  setShowImport={setShowImport}
                  translator={props.translator}
                  fbToken={props.fbToken}
                />
            :''}
        </div>
    );
}

const ProductContainer = (props) => {

    const [search, setSearch] = useState('');
    const [products, setProducts]= useState();
    const [paginator, setPaginator] = useState();
    const [showForm, setShowForm] = useState();
    const [sort_order, setSortOrder] = useState();
    const [productId, setProductId] = useState(props.product_id);
    const [recordId, setRecordId] = useState();

    useEffect( () => {
        if(props.catalog_id) {
            fetchCatalogProducts();
        }
        setSearch('');
    },[props]);

    function fetchCatalogProducts() {
        let url = route('catalog_product', {id : props.catalog_id});
        recordHandler(url);
    }

    function handleProductPagination(url) {
        if(url) recordHandler(url);
    }

    function searchHandler() {
        let url = route('catalog_product', {id : props.catalog_id, search : search, sort_order : sort_order});
        recordHandler(url);
    }

    function sortingHandler(name) {
        let order = (sort_order == 'desc') ? 'asc' : 'desc';
        setSortOrder(order);
        let url = route('catalog_product', {id : props.catalog_id, search : search, sort_order : order, sort_by : name});
        recordHandler(url);
    }

    function recordHandler(url) {
        Axios.get(url).then((response) => {
            if(response.data.status !== false) {
                setSortOrder(response.data.sort_order);
                setProducts(response.data.products);
                setPaginator(response.data.pagination);
            }
        });
    }

    function hideForm() {
        setShowForm(false);
    }

    function handleChange(event) {
        props.setCatalogId(event.target.value);
        setProductId('');
    }

    function deleteProduct(record_id) {
        if(record_id) {
            let recordData = {id: record_id, catalog_id : props.catalog_id};

            confirmAlert({
                title: (props.translator['Confirm to Delete']),
                message: (props.translator['Are you sure to do this?']),
                buttons: [ {
                  label: (props.translator['Yes']),
                  onClick: () => {
                    nProgress.start(0.5);
                    nProgress.inc(0.2);
                    Axios.post(route('deleteCatalogProduct', recordData)).then( (response) => {
                        nProgress.done();
                        if(response.data.status !== false) {
                            setProducts(response.data.products);
                            setProductId('');
                            notie.alert({type: 'success', text: 'Record deleted successfully', time: 5}); 
                        } else {
                            notie.alert({type: 'error', text: 'Record not founded.', time: 5}); 
                        }
                    });
                  }
                },
                { label: 'No'}
              ]
            });
        }
    }

    function showEditForm(id) {
        setRecordId(id);
        setShowForm(true);
    }

    return(
        <div className="mt-2 px-2 ml-3">
            <div className="!mt-4 grid grid-cols-12 !gap-5 px-2">
                <div className='col-span-6 space-y-2'>
                    {products ? 
                        <div className="col-span-8 space-y-2">
                            <div className='text-base text-[#363740] font-semibold'>All you Products</div>
                            <div className='grid grid-cols-2'>
                                <div className='flex justify-start'>
                                    <Button 
                                        type = 'button'
                                        color='primary'
                                        onClick={() => setShowForm(true)}
                                    > 
                                        <div className='flex justify-center items-center font-semibold'> <SwatchIcon className='h-4 w-4 mr-1' />Add product</div>
                                    </Button>
                                </div>
                                <div className='flex justify-end '>
                                    <Button 
                                        type = 'button'
                                        color='primary'
                                        onClick={() => props.hideProductDetail()}
                                    > 
                                        <div className='flex justify-center items-center font-semibold'> Back</div>
                                    </Button>
                                </div>
                            </div>
                            <div className="card !shadow-card justify-between items-center flex-row !px-4 !py-2">
                                <div className='flex justify-start font-semibold text-gray-700'>Select Catalog</div>
                                <div className='flex justify-end'>
                                    <Dropdown
                                        id={'catalog_id'}
                                        name={'catalog_id'}
                                        options={props.options ? props.options : {}}
                                        handleChange={handleChange}
                                        emptyOption={'Select'}
                                        value={props.catalog_id ? props.catalog_id : ''}
                                    />
                                </div>
                            </div>
                            <div className="card !shadow-card justify-between items-center flex-row !px-4 !py-2.5">
                                <div className="flex items-center gap-1.5">
                                    <div className='flex gap-2 items-center'>            
                                        <div className="mt-1 relative align-self-start flex items-center gap-1.5">
                                            <div className="inline-flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" onClick={searchHandler}/>
                                            </div>
                                            <Input 
                                                name="search"
                                                id="search"
                                                placeholder="Search"
                                                value={search}
                                                handleChange={(e) => setSearch(e.target.value)}
                                                className={`pl-9 appearance-none block w-full  py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`} 
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className='flex gap-1 items-center'>
                                    <button className=' items-center'>
                                        <a href={route('export',{'exportmod':'Product', 'related_id': props.catalog_id})} 
                                            className='d-flex gap-1 items-center px-4 py-2 font-semibold text-sm text-gray-900 hover:text-indigo-700'
                                        >
                                            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8.50129 9.98648L7.93579 10.552L12 14.6162L16.0643 10.552L15.4988 9.98648L12.3998 13.0855V0.427734H11.6003V13.0855L8.50129 9.98648Z" fill="#363740" />
                                                <path d="M13.9995 4.42578V5.22528H19.1978V18.8198H4.80377V5.22528H10.002V4.42578H4.00427V19.62H19.998V4.42578H13.9995Z" fill="#363740" />
                                            </svg>
                                            {props.translator['Export']} 
                                        </a>
                                    </button>
                                </div>
                            </div>
                            {props.catalog_id ?
                              <>
                                <div className='card !shadow-card !p-2'>
                                    <div className='grid grid-cols-2'>
                                        <div className='flex justity-start' onClick={() => sortingHandler('name')}>Title</div>
                                        <div className='flex justity-start' onClick={() => sortingHandler('price')}>Price</div>
                                    </div>
                                </div>
                                {(products).length === 0 &&
                                    <div>
                                        <div className="px-6 py-4 border-t" colSpan="8"> {props.translator['No records found!']} </div>
                                    </div>
                                }
                                {(products).map( (product) => (
                                    <div className={classNames(productId == product.id ? 'border-1 border-indigo-500 relative rounded flex' :'card', ' !shadow-card flex-row justify-between items-center !py-2 !px-4 cursor-pointer')} onClick={() => setProductId(product.id)}>
                                        <div className="flex !gap-2">
                                            <div className="flex flex-col !gap-1">
                                                <span className="font-semibold text-sm text-black">{product.name}</span>
                                                <span className="text-[12px] text-[#878787]">ID : {product.product_id  ? product.product_id: ''}</span>
                                            </div> 
                                        </div>
                                        <div>{product.price}</div>
                                        <div className='flex justify-end'>
                                            <ActionMenu 
                                              record={product} 
                                              translator={props.translator} 
                                              actions={{delete: true, edit:true}} 
                                              deleteRecord={deleteProduct} 
                                              showEditForm={showEditForm}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {products.length != 0 && paginator?
                                    <ProductPagination 
                                        module={'Product'}
                                        paginator={paginator}
                                        translator={props.translator}
                                        handleProductPagination={handleProductPagination}
                                    />
                                : ''}
                              </>
                            : ''}
                        </div>
                    : ''}

                    {showForm ? 
                        <NewForm 
                            recordId={recordId}
                            module={'Product'}
                            hideForm={hideForm}
                            translator={props.translator}
                            parent_id={props.catalog_id}
                            parent_module={'Catalog'}
                        />
                    : ''}
                </div>
                
                {productId && products? 
                  <ProductDetailView product_id={productId} options={props.options}/>
                : ''}
            </div>
        </div>
    )
}

const ProductDetailView = (props) => {
    
    const [record, setRecord] = useState({});

    useEffect( () => {
        fetchRecord();
    },[props]);

    function fetchRecord() {
        nProgress.start(0.5);
        nProgress.inc(0.2);
        let url = route('editProduct' ,{id : props.product_id});
        Axios.get(url).then( (response)=> {
            nProgress.done();
            setRecord(response.data.record);
        });
    }

    function clickToCopy (name) {
        let text = document.getElementById(name).value;
        if(text) {
            navigator.clipboard.writeText(text);
        }
    }

    return(
        <div className='col-span-6 space-y-2'>
            <div className='text-base text-[#363740] font-semibold text-center'>Product details</div>
            <div className='card !shadow-card !py-6 !px-4 !gap-4'>
                <div className='flex !gap-4'>
                    {record.media_id ? 
                      <div className='flex !gap-1 self-start space-y-2 '>
                      <img  src={route('preview_document', record.media_id)} className={'w-auto h-[150px]'}/>
                          <div className='flex flex-col justify-between'>
                            {record.media && Object.entries(record.media).map( ([key, image]) => {
                                if(key < 4 && record.media_id == image.id) return false;
                                return (
                                    <img  src={route('preview_document', image.id)} className={'w-8 h-8'}/>
                                );
                            })}
                            </div>
                        </div>
                    : ''}
                    <div className='space-y-2'>
                        <div>
                            <label className='font-semibold text-sm text-black block'>Product Title</label>
                            <span className='text-[#3D4459] text-[13px] pt-0.5'>{record['name']}</span>
                        </div>
                        <div>
                            <label className='font-semibold text-sm text-black block'>Category</label>
                            <span className='text-[#3D4459] text-[13px] pt-0.5'>{record['catalog_id'] ? props.options[record['catalog_id']] : '-'}</span>
                        </div>
                        <div>
                            <label className='font-semibold text-sm text-black block'>Price</label>
                            <span className='text-[#3D4459] text-[13px] pt-0.5'>{record['price']}</span>
                        </div>
                        <div>
                            <label className='font-semibold text-sm text-black block'>Retailer ID</label>
                            <span className='text-[#3D4459] text-[13px] pt-0.5'>{record['product_id'] ? record['product_id'] : '-'}</span>
                        </div>                                    
                    </div>
                </div>

                <div>
                    <label className='font-semibold text-sm text-black block'>Description</label>
                    <div className='flex !gap-1'>
                        <textarea
                            rows={4}
                            name="description"
                            id="description"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={record['description']}
                            readonly
                        />
                        <Square2StackIcon className='h-5 w-5 text-indigo-500 hover:text-indigo-700' onClick={() => clickToCopy('description')}/>
                    </div>

                </div>

                <div>
                    <label className='font-semibold text-sm text-black block'>Website link</label>
                    <div className='flex !gap-1'>
                        <input
                            type="url"
                            className="block w-full max-w-[300px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm"
                            value={record['url']}
                            readOnly
                        />
                        <Square2StackIcon className='h-5 w-5 text-indigo-500 hover:text-indigo-600' onClick={() => clickToCopy('url')}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

const ProductList = (props) => {
    
    const [search, setSearch] = useState('');
    const [products, setProducts]= useState();
    const [paginator, setPaginator] = useState();
    const [showForm, setShowForm] = useState();
    const [sort_order, setSortOrder] = useState();

    useEffect( () => {
        if(props.catalog_id) {
            fetchCatalogProducts();
        }
        setSearch('');
    },[props]);

    function fetchCatalogProducts() {
        let url = route('catalog_product', {id : props.catalog_id});
        recordHandler(url);
    }

    function handleProductPagination(url) {
        if(url) recordHandler(url);
    }

    function searchHandler() {
        let url = route('catalog_product', {id : props.catalog_id, search : search, sort_order : sort_order});
        recordHandler(url);
    }

    function sortingHandler(name) {
        let order = (sort_order == 'desc') ? 'asc' : 'desc';
        setSortOrder(order);
        let url = route('catalog_product', {id : props.catalog_id, search : search, sort_order : order, sort_by : name});
        recordHandler(url);
    }

    function recordHandler(url) {
        Axios.get(url).then((response) => {
            if(response.data.status !== false) {
                setSortOrder(response.data.sort_order);
                setProducts(response.data.products);
                setPaginator(response.data.pagination);
            }
        });
    }

    function hideForm() {
        setShowForm(false);
    }

    return(
        <>
          {products ? 
            <div className="col-span-8 space-y-2">
                <div className='text-base text-[#363740] font-semibold'>Products</div>
                <Button 
                    type = 'button'
                    color='primary'
                    onClick={() => setShowForm(true)}
                > 
                    <div className='flex justify-center items-center font-semibold'> <SwatchIcon className='h-4 w-4 mr-1' />Add product</div>
                </Button>
                <div className="card !shadow-card justify-between items-center flex-row !px-4 !py-2.5">
                    <div className="flex items-center gap-1.5">
                        <div className='flex gap-2 items-center'>            
                            <div className="mt-1 relative align-self-start flex items-center gap-1.5">
                                <div className="inline-flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" onClick={searchHandler}/>
                                </div>
                                <Input 
                                    name="search"
                                    id="search"
                                    placeholder="Search"
                                    value={search}
                                    handleChange={(e) => setSearch(e.target.value)}
                                    className={`pl-9 appearance-none block w-full  py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`} 
                                />
                            </div>
                        </div>
                    </div>
                    <div className='flex gap-1 items-center'>
                        <button className=' items-center'>
                            <a href={route('export',{'exportmod':'Product', 'related_id': props.catalog_id})} 
                                className='d-flex gap-1 items-center px-4 py-2 font-semibold text-sm text-gray-900 hover:text-indigo-700'
                            >
                                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.50129 9.98648L7.93579 10.552L12 14.6162L16.0643 10.552L15.4988 9.98648L12.3998 13.0855V0.427734H11.6003V13.0855L8.50129 9.98648Z" fill="#363740" />
                                    <path d="M13.9995 4.42578V5.22528H19.1978V18.8198H4.80377V5.22528H10.002V4.42578H4.00427V19.62H19.998V4.42578H13.9995Z" fill="#363740" />
                                </svg>
                                {props.translator['Export']} 
                            </a>
                        </button>
                    </div>
                </div>

                <div className='card !shadow-card !p-4'>
                    <table>
                        <thead>
                            <tr className='font-semibold text-[#3D4459]'>
                                <th className='!pb-2' onClick={() => sortingHandler('name')}>Title</th>
                                <th className='!pb-2' onClick={() => sortingHandler('price')}>Price</th>
                                <th className='!pb-2'></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? 
                                <tr>
                                    <td className="px-6 py-4 border-t" colSpan="8"> {props.translator['No records found!']} </td>
                                </tr>
                            :''}
                            {(products).map( (product) => (
                                <tr className='py-4'>
                                    <td>
                                        <div className='flex items-center !gap-2 '>
                                            <div>
                                                {(product.media_id) ? 
                                                    <div>
                                                        <img  src={route('preview_document', product.media_id)} className={'object-cover w-8 h-8 rounded-full'}/>
                                                    </div>
                                                    :
                                                    <div>
                                                        <span className="text-gray-900">
                                                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-500">
                                                                <span className="text-sm font-medium leading-none text-uppercase text-white">
                                                                    {(product.name).substring(0, 2)} 
                                                                </span>
                                                            </span>
                                                        </span>
                                                    </div> 
                                                }
                                            </div>
                                            <div className='flex flex-col'>
                                                <span className='text-sm font-semibold '>{product.name}</span>
                                                <span className='text-[12px] text-[#878787]'>{product.name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${product.price}</td>
                                    <td  className='cursor-pointer' onClick={() => props.showProductDetail(product.id)}><HiOutlineChevronRight className='text-[#545CD8]'/> </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {products.length != 0 && paginator?
                    <ProductPagination 
                        module={'Product'}
                        paginator={paginator}
                        translator={props.translator}
                        handleProductPagination={handleProductPagination}
                    />
                : ''}
            </div>
          : ''}

          {showForm ? 
                <NewForm 
                    module={'Product'}
                    hideForm={hideForm}
                    translator={props.translator}
                    parent_id={props.catalog_id}
                    parent_module={'Catalog'}
                />
          : ''}
        </>
    );
    
}

const ProductPagination = (props) => {

    return (
        <div className='flex justify-end gap-10 !mt-5 items-center'>
                <div className='flex items-center'>{props.translator['Rows per page']}:
                    {props.paginator.pageLimit}
                </div>
                <div>  
                    <span>{props.paginator.firstItem}-{props.paginator.lastItem} of {props.paginator.total} </span>                  
                </div>
               <div className='flex gap-6'>
                <div onClick={() => props.handleProductPagination(props.paginator.firstPageUrl ? props.paginator.firstPageUrl : '')}>
                    <AiOutlineVerticalRight className='cursor-pointer text-indigo-500' size={'1.2rem'}/>
                </div>
                <div onClick={() => props.handleProductPagination(props.paginator.previousPageUrl ? props.paginator.previousPageUrl : '')}>
                    <AiOutlineLeft className='cursor-pointer text-indigo-500' size={'1.2rem'}/>
                </div>
                <div onClick={() => props.handleProductPagination(props.paginator.nextPageUrl ? props.paginator.nextPageUrl : '')}>
                    <AiOutlineRight className='cursor-pointer text-indigo-500' size={'1.2rem'}/>
                </div>
                <div onClick={() => props.handleProductPagination(props.paginator.lastPageUrl ? props.paginator.lastPageUrl : '')}>
                    <AiOutlineVerticalLeft className='cursor-pointer text-indigo-500' size={'1.2rem'}/>
                </div>
            </div>
        </div>
    );

}










