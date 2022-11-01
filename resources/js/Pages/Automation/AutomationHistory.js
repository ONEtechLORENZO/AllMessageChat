import React, { useEffect, useState } from "react";

function AutomationHistory(props){

    const [records , setRecords] = useState({});

    useEffect(() => {
        getHistoryList();
    }, []);

    /**
     * Fetch automation history
     */
    function getHistoryList(){

        axios({
            method: 'get',
            url: route('get_automation_history', props.record),
        })
        .then((response) => {
            if(response.data.records){
                setRecords(response.data.records);
            }
        });
    }

    return (
        <> 
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg my-4">
                <table className="min-w-full divide-y divide-[#D9D9D9]">
                    <thead>
                        <tr>
                            <th
                                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[#3D4459] sm:pl-6"
                            > Name </th>
                            <th
                                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[#3D4459] sm:pl-6"
                            > Status </th>
                            <th
                                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[#3D4459] sm:pl-6"
                            > Run at </th>
                        </tr>
                    </thead>
                    <tbody className=" bg-white">
                        {Object.entries(records).map(([key, record]) => {
                            return(
                                <tr>
                                   
                                    <td className='px-2 py-2'>
                                        <a href={route('automation_result', record.id)} className="group inline-flex">
                                            {record.name}
                                        </a>
                                    </td>
                                    <td className='px-2 py-2'>{record.status ? <>Success</> : <>Faild</>}</td>
                                    <td className='px-2 py-2'>{record.created_at}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </>
    )
}
export default AutomationHistory;