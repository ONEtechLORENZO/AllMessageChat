import React, { useEffect, useState } from 'react';
import Pagination from '@/Components/Pagination';
import Alert from '@/Components/Alert';
import Button from '@/Components/Forms/Button';
import Form from '@/Components/Forms/Form';

function ListView(props)
{
    const [showForm, setShowForm] = useState(false);

    const [records, setRecords] = useState([]);

    useEffect(() => {
        setRecords(props.records);
    }, [props.records]);

    /**
     * Fetch records
     */
    function fetchRecords() 
    {

    }

    return (
        <>
            <div className="px-4 sm:px-6 lg:px-8 bg-[#FBFBFBBF]">
                <div className="flex min-w-0 justify-between">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">{props.heading}</h2>
                    {props.create === true ?
                        <>
                            <Button 
                                type='button'
                                onClick={() => setShowForm(true)}
                            >
                                Add {props.heading}
                            </Button>
                        </>
                    : ''}
                </div>
                <div className="mt-2 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg my-4">
                                <table className="min-w-full divide-y divide-[#D9D9D9]">
                                    <thead>
                                        <tr>
                                            {Object.entries(props.headers).map(([name, label]) => (
                                                <th
                                                    key={name}
                                                    scope="col"
                                                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[#3D4459] sm:pl-6"
                                                >
                                                    {label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className=" bg-white">
                                        {Object.entries(props.records).map(([key, record]) => (
                                            <tr key={key}>
                                                {Object.entries(props.headers).map(([name]) => (
                                                    <>
                                                        <td key={name} className="whitespace-nowrap px-2 py-2 text-sm text-[#3D4459]">
                                                            {record[name]} 
                                                        </td>
                                                    </>
                                                ))}
                                            </tr>
                                        ))}

                                    </tbody>
                                </table>
                            </div>

                            {Object.entries(records).length == 0 ?         
                                <Alert type='info' message='No records' hideClose={true} />
                            : ''}

                            <Pagination paginator={props.paginator} />
                            
                        </div>
                    </div>
                </div>
            </div>

            {showForm ?
                <Form 
                    module={props.module}
                    heading={props.heading}
                    setShowForm={setShowForm}
                />
            : ''}
        </>
    )
}

export default ListView;