import React, { useState, useEffect } from "react";
import Authenticated from "@/Layouts/Authenticated";
import { Link } from "@inertiajs/inertia-react";
import { Inertia } from "@inertiajs/inertia";
import { useForm } from "@inertiajs/inertia-react";
import PristineJS from "pristinejs";
import { defaultPristineConfig } from "../Constants";
import Step1 from "./Step1";
import Step2 from "./Step2";

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
                                        <Step1
                                            handleChange = {handleChange}
                                            importStep = {importStep}
                                            errors = {errors}
                                        />
                                    </div>
                                    <div
                                        className={
                                            openTab === 2 ? "block" : "hidden"
                                        }
                                        id="link2"
                                    >
                                        <Step2 
                                            View = {View}
                                            Onestep = {Onestep}
                                            CsvHeader = {CsvHeader}
                                            handleChange = {handleChange}
                                            importfileSave = {importfileSave}
                                        />    
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
