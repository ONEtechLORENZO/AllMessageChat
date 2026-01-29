import React, { useEffect, useState } from "react"; 
import { Disclosure } from '@headlessui/react'
import { ChevronUpIcon, PlusIcon } from '@heroicons/react/24/solid'
import nProgress from 'nprogress';
import ProgressBar from "./ProgressBar";

import { Row, Col, Card, CardBody, CardTitle } from "reactstrap";

function PlanUsage(props){
    const [data, setData] = useState({});

    useEffect(() => {
        getPlanData();
    },[]);

    /**
     * Fetch plan data
     */
    function getPlanData(){

        axios.get(route('get_plan_data' , props.currentPlan)).then((response) => {
            nProgress.done(true);
            if(response.data) {
                setData(response.data);
            }
            else {
                notie.alert({type: 'error', text: response.data.message, time: 5});
            }
        });
    }

    return(
       
         <Card>
            <CardBody>
                <div className=" w-full rounded-2xl bg-white p-2">
                    <Disclosure>
                        {({ open }) => (
                            <>
                            <Disclosure.Button className="flex w-full justify-between rounded-lg  px-4 py-2 text-left text-md font-medium text-purple-900 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                                <div className="flex">
                                    <span> {props.currentPlan} Plan</span>
                                    <ChevronUpIcon
                                    className={`${
                                        open ? 'rotate-180 transform' : ''
                                    } h-5 w-5 ml-5 mt-1 text-purple-500`}
                                    />
                                </div>
                                <div> <span> {props.balance}$ </span> </div>
                            </Disclosure.Button>
                            <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                                <div className="">
                                    {data.plan_data && Object.entries(data.plan_data).map(([key, plan]) => {
                                        return(
                                            <div className="mb-4 flex ">
                                                <div className="w-11/12 mr-2">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-base font-medium text-gray-700 dark:text-white">{plan.label}</span>
                                                        <span className="text-sm font-medium text-gray-700 dark:text-white">{plan.current}/{plan.limit} </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                                        
                                                        <ProgressBar
                                                            isLoading={false}
                                                            percent={plan.percentage}
                                                            size={"large"}
                                                            showInfo={true}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="">
                                                    <div>
                                                        <button
                                                            type="button"
                                                            className="inline-flex mt-2 items-center rounded border border-transparent bg-gray-300 p-1.5 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                        >
                                                            <PlusIcon className="h-5 w-5" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                </div>
            </CardBody>
        </Card>
       
    )
}
export default PlanUsage;












