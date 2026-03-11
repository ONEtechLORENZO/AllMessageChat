import React, { useEffect, useState } from "react";
import ListViewTable from "@/Components/Views/List/ListViewTable";

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

    const historyHeaders = {
        name: { label: props.translator["Name"], type: "text" },
        status: { label: props.translator["Status"], type: "text" },
        created_at: { label: props.translator["Run at"], type: "text" },
    };

    return (
        <> 
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg my-4">
                <ListViewTable
                    records={records}
                    customHeader={historyHeaders}
                    fetchFields={false}
                    hideToolMenu={true}
                    disableSorting={true}
                    theme="light"
                    emptyStateText={props.translator["Automation not run yet."]}
                    renderCell={({ name, record }) => {
                        if (name === "name") {
                            return (
                                <a
                                    href={route("automation_result", record.id)}
                                    className="group inline-flex"
                                >
                                    {record.name}
                                </a>
                            );
                        }

                        if (name === "status") {
                            return record.status
                                ? props.translator["Success"]
                                : props.translator["Failed"];
                        }
                    }}
                />
            </div>
        </>
    )
}
export default AutomationHistory;












