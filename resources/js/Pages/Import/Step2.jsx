import React from "react";
import { Link } from "@inertiajs/react";

const lineItems = [
    {name : 'product' , label : 'Product'},
    {name : 'quantity', label : 'Quantity'},
];

function Step2(props){

    return(
     <>
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center justify-between">
                    <div className="sm:flex-auto">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Mapping
                        </h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Make CSV and portal
                            field
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href={route("listImport")}
                            className='inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold shadow-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]'
                        >
                            Back to list
                        </Link>

                        {props.View ? (" ") : (
                            <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                                onClick={() => props.importfileSave()}
                            >
                                Save
                            </button>
                        )}
                    </div>
            </div>
            <div className="-mx-4 mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6" >
                                OneMessage Fields
                            </th>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6" >
                                CSV Headers
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        { props.Onestep ? (
                            <>
                                {Object.entries(props.Onestep).map(([key,record]) => (
                                        <tr key={record.field_name} >
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                {record.field_label}
                                            </td>
                                            <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell">
                                                {props.View ? (
                                                    <div>
                                                        {props.CsvHeader.map((option) => (
                                                                <>
                                                                    {record.field_name == option.value ? (
                                                                        <p>{option.label}</p>
                                                                    ) : 
                                                                    ""
                                                                    }
                                                                </>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <select
                                                            id={record.field_name}
                                                            name={record.field_name}
                                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                            onChange={(e) => props.handleChange(e) }
                                                        >
                                                            <option value=""> select </option>
                                                            {props.CsvHeader.map((option) =>(
                                                                    <option value={option}>        
                                                                        {option}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                )}
                                {props.module == 'Order' && lineItems.map( (item) => (
                                    <tr key={item.name} >
                                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                          {item.label}
                                      </td>
                                      <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell">
                                          {props.View ? (
                                              <div>
                                                  {props.CsvHeader.map((option) => (
                                                          <>
                                                              {item.name == option.value ? (
                                                                  <p>{option.label}</p>
                                                              ) : 
                                                              ""
                                                              }
                                                          </>
                                                      ))}
                                              </div>
                                          ) : (
                                              <div>
                                                  <select
                                                      id={item.name}
                                                      name={item.name}
                                                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                      onChange={(e) => props.handleChange(e) }
                                                  >
                                                      <option value=""> select </option>
                                                      {props.CsvHeader.map((option) =>(
                                                              <option value={option}>        
                                                                  {option}
                                                              </option>
                                                          )
                                                      )}
                                                  </select>
                                              </div>
                                          )}
                                      </td>
                                  </tr>    
                                ))}
                            </>
                        ) : (
                            ""
                        )}
                    </tbody>
                </table>
            </div>
        </div>
     </>
    );
}

export default Step2;









