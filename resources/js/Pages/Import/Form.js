import React, { useState, useEffect } from "react";
import Authenticated from "@/Layouts/Authenticated";
import { Link } from "@inertiajs/inertia-react";
import { Inertia } from "@inertiajs/inertia";
import { useForm } from "@inertiajs/inertia-react";
import Input from "@/Components/Forms/Input";
import PristineJS from "pristinejs";
import { defaultPristineConfig } from "../Constants";
import InputError from "@/Components/Forms/InputError";

const Tabs = (props) => {
    const [openTab, setOpenTab] = useState(1);
    const [Onestep, setOnestep] = useState();
    const [CsvHeader, setCsvHeader] = useState();
    const [View, setView] = useState(false);
    const { data, setData, errors } = useForm({});
    

    useEffect(() => {
        if (props.data.Onestepfield) {
            setOnestep(props.data.Onestepfield);
            setCsvHeader(props.data.csvHeader);
            setData(props.data);
        }

        if (props.data.editcsvHeader) {
            setOpenTab(2);
            setOnestep(props.data.editOneStepfield);
            setCsvHeader(props.data.editcsvHeader);
            setData(props.data);
      
            if(props.data.status != 'draft'){
                setView(true);
            }
        }

    }, [props]);

    function importStep() {
        var pristine = new PristineJS(
            document.getElementById("update_csv"),
            defaultPristineConfig
        );
        let is_validated = pristine.validate(
            document.querySelectorAll(
                'input[data-pristine-required="true"], input[data-pristine-required="required"]'
            )
        );

        if (!is_validated) {
            return false;
        } else {
            getFileRecord();
        }
    }

    function getFileRecord() {
        Inertia.post(route("handleFileImport"), data, {
            onSuccess: (response) => {
                setOpenTab(2);
            },
        });
    }

    function handleChange(event) {
        const name = event.target.name;
        let newData = Object.assign({}, data);
        if (event.target.type == "file" && event.target.files) {
            newData[name] = event.target.files[0];
        } else {
            newData[name] = event.target.value;
        }
        setData(newData);
    }

    function importfileSave() {
        Inertia.post(route("import_save"), data, {
            onSuccess: (response) => {
                
            },
        });
    }

    return (
        <>
            <Authenticated
                auth={props.auth}
                errors={props.errors}
            >
                <div className="flex flex-wrap">
                    <div className="w-full">
                        <ul
                            className="flex mb-0 list-none flex-wrap pt-3 pb-4 flex-row"
                            role="tablist"
                        >
                            <li className="-mb-px mr-2 last:mr-0 flex-auto text-left">
                                <Link
                                    className={ "text-lg font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal bg-white-600" +
                                        (openTab === 1
                                            ? "border-indigo-500 text-indigo-700 "
                                            : "")
                                    }
                                    data-toggle="tab" href="#" role="tablist"
                                >
                                    STEP 1
                                    <div className="text-black font-medium text-base">
                                        Import
                                    </div>
                                </Link>
                            </li>
                            <li className="-mb-px mr-2 last:mr-0 flex-auto text-left">
                                <Link
                                    className={ "text-lg font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal bg-white-600" +
                                        (openTab === 2
                                            ? "border-indigo-500 text-indigo-700 "
                                            : "")
                                    }
                                    data-toggle="tab" href="#" role="tablist"
                                >
                                    STEP 2
                                    <div className="text-base font-medium text-black">
                                        Mapping
                                    </div>
                                </Link>
                            </li>
                        </ul>
                        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
                            <div className="px-4 py-5 flex-auto">
                                <div className="tab-content tab-space">
                                    <div
                                        className={
                                            openTab === 1 ? "block" : "hidden"
                                        }
                                        id="link1"
                                    >
                                        <form className="space-y-8 divide-y divide-gray-200" id="update_csv" >
                                            <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
                                                <div>
                                                    <div>
                                                        <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                                                            <div className="form-group col-span-6 sm:col-span-4">
                                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700" >
                                                                    Name <span className="text-sm text-red-700"> *</span>
                                                                </label>
                                                                <div className="mt-1 flex rounded-md shadow-sm">
                                                                    <Input
                                                                        name="name"
                                                                        required={true}
                                                                        id="module"
                                                                        placeholder="Name"
                                                                        handleChange={handleChange}
                                                                    />
                                                                </div>
                                                                <InputError message={errors.module} />
                                                            </div>
                                                        </div>
                                                        <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                                                            <div className="mt-1 sm:mt-0 sm:col-span-2">
                                                                <div className="max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                                                    <div className="space-y-1 text-center">
                                                                        <svg
                                                                            className="mx-auto h-12 w-12 text-gray-400"
                                                                            stroke="currentColor"
                                                                            fill="none"
                                                                            viewBox="0 0 48 48"
                                                                            aria-hidden="true"
                                                                        >
                                                                            <path
                                                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                                                strokeWidth={2}
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                            />
                                                                        </svg>
                                                                        <div className="flex text-sm text-gray-600 form-group">
                                                                            <label
                                                                                htmlFor="file-upload"
                                                                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                                                            >
                                                                                <span>Upload a CSV file</span>
                                                                                <Input
                                                                                    name="fileUpload"
                                                                                    required={true}
                                                                                    id="file-upload"
                                                                                    type="file"
                                                                                    className="sr-only"
                                                                                    handleChange={handleChange}
                                                                                />
                                                                                <InputError message={errors.fileUpload} />
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-5">
                                                <div className="flex justify-end">
                                                    <Link
                                                        href={route("listImport")}
                                                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        Cancel
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                        onClick={() =>
                                                            importStep()
                                                        }
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <div
                                        className={
                                            openTab === 2 ? "block" : "hidden"
                                        }
                                        id="link2"
                                    >
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

                                                    {View ? (" ") : (
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                                                            onClick={() => importfileSave()}
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
                                                        { Onestep ? (
                                                            <>
                                                                {Object.entries(Onestep).map(([key,record]) => (
                                                                        <tr key={record.field_name} >
                                                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                                                {record.field_label}
                                                                            </td>
                                                                            <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell">
                                                                                {View ? (
                                                                                    <div>
                                                                                        {CsvHeader.map((option) => (
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
                                                                                            defaultValue="Canada"
                                                                                            onChange={(e) => handleChange(e) }
                                                                                        >
                                                                                            <option value=""> select </option>
                                                                                            {CsvHeader.map((option) =>(
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
                                                            </>
                                                        ) : (
                                                            ""
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Authenticated>
        </>
    );
};

export default function createImport(props) {
    return (
        <>
            <Tabs data={props} />;
        </>
    );
}
