import React, { useEffect,useState } from "react";
import FilterGroups from "./FilterGroups";
import ListTable from "@/Components/Views/List/ListTable";
import Alert from "@/Components/Alert";

function ContactFilter(props){

    const [filterCondition, setfilterCondition] = useState(props.data.conditions);
    const [translator, setTranslator] = useState(props.campagins.translator);
    const [filter, setFilter] = useState(props.campagins.filter);
    const [headers, setHeader] = useState();
    const [records, setRecord] = useState();
    const [openList, setOpenlist] = useState(false);

    useEffect(() => {
        let condition = props.data.conditions;
        if (typeof condition === 'object' && condition !== null){
            setfilterCondition(condition);
        }
    },[props]);

 return(
    <div className="overflow-hidden shadow rounded-lg divide-y divide-gray-200 w-full content-center">
        <div className="px-4 py-5 sm:px-6 bg-green-200">
            {props.translator['Contact']}
        </div>
        <div className="px-4 py-5 sm:p-6">
            <div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                {props.translator['Filter']}
                    <div className="mt-2">
                        <FilterGroups 
                            translator={translator}
                            filter={filter}
                            module={'Contact'}
                            setRecordCount={props.setRecordCount}
                            setConditions={props.setConditions}
                            filterCondition={filterCondition}
                            setfilterCondition={setfilterCondition}
                            setHeader={setHeader}
                            setRecord={setRecord}
                            setOpenlist={setOpenlist}
                        />
                    </div>
                </div>
            </div>

            <div className="border m-10 h-50 rounded-lg">
               <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                 <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                  <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-lg font-medium text-gray-500">{props.translator['Total Records']}</dt>
                        {props.recordCount || props.recordCount >= 0 ? 
                        <>
                         <dd className="mt-1 text-lg text-gray-900 sm:mt-0 sm:col-span-2">{props.recordCount}</dd>
                        </>
                        : 
                        <>
                         <dd className="mt-1 text-lg text-gray-900 sm:mt-0 sm:col-span-2">-</dd>
                        </>
                        }
                    </div>
                  </dl>
                </div>
            </div>
            </div>
            
            {openList ? 
            <>
             <div className="border m-10 h-50 rounded-lg">
               <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="inline-block w-full py-2 align-middle md:px-6 lg:px-8">
                       {headers && records ? 
                        <>
                         <ListTable 
                               module={'Contact'}
                               headers={headers}
                               records={records}
                               actions={''}
                               translator = {props.translator}
                           />
                           {Object.entries(records).length == 0 ? <Alert type='info' message= {props.translator['No record related yet.']} hideClose={true} /> : ''}
                        </>
                       : ''} 
                    </div>
                </div>
              </div>
            </>
            : ''}

            <div className="pt-5">
                <div className="m-10 flex justify-between">
                        <button
                            type='button'
                            className="justify-start bg-indigo-600 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={(e) => props.previous(1)}
                    >
                            {props.translator['Previous']}
                        </button>
                        <button
                            type='button'
                            className="justify-end bg-indigo-600 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={props.saveCampaign} 
                    >
                            {props.translator['Next']}
                        </button>
                </div>
            </div>
            
        </div>
    </div>
    );
}

export default ContactFilter;









