import React from "react";
import ListTable from "../List/ListTable";
import Alert from '@/Components/Alert';
import Pagination from '@/Components/Pagination';
import { parseISOWithOptions } from "date-fns/fp";

function SubPanels(props){
console.log(props);

    return(
        <div>
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                           
                            <ListTable 
                                module={props.module}
                                headers={props.headers}
                                records={props.records}
                                actions={props.actions}
                            />
                            {Object.entries(props.records).length == 0 ?         
                                <Alert type='info' message= {'No record related yet.'} hideClose={true} />
                            : 
                                <Pagination paginator={props.paginator} />
                            }
                            
                            
                </div>
            </div>
        </div>
    );
}
export default SubPanels;