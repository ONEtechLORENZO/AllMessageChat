import React, { useEffect, useState } from "react";
import axios from "axios";
import { currencies } from '@/Pages/Constants';
import CreatableSelect from 'react-select';
import nProgress from 'nprogress';

import { AiOutlineInfoCircle } from "react-icons/ai";

import {
    PopoverHeader,
    PopoverBody,
    UncontrolledPopover,
} from "reactstrap";

const defaultValue = {
    'currency': { value: "EUR", label: "Euro" }, 'time_zone': { value: "Europe/Rome", label: "(GMT+01:00) Rome" }
};

export default function Workspace(props) {

    const [workspaceInformation, setWorkspaceInformation] = useState(props.company);
    const [timeZone, setTimezone] = useState([]);
    const [currencyType, setCurrency] = useState([]);

    useEffect(() => {
        getTimezones();
        getCurrencies();
        setWorkspaceInformation((prev) => ({
            ...prev,
            ...defaultValue,
            name: props.company?.name ?? prev?.name ?? "",
        }));
    }, []);

    // Get Time Zone
    function getTimezones() {
        var url = route('get_timezone');
        axios.get(url).then((response) => {
            setTimezone(response.data.time_zone);
            liveTimezone(response.data.time_zone);
        });
    }

    function liveTimezone(time_zone) {
        const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const matchedZone = time_zone?.find((z) => z.value === currentTimezone);

        setWorkspaceInformation((prev) => ({
            ...prev,
            name: props.company?.name ?? prev?.name ?? "",
            currency: { value: "EUR", label: "Euro" },
            time_zone: matchedZone ?? prev?.time_zone,
        }));
    }

    function getCurrencies() {
        const newCurrency = Object.entries(currencies).map(([key, currency]) => ({
            value: key,
            label: currency,
        }));
        setCurrency(newCurrency);
    }

    function searchHandler(event, name) {
        let newWorkspace = Object.assign({}, workspaceInformation);
        newWorkspace[name] = event;
        setWorkspaceInformation(newWorkspace);
    }

    function updateWorkspaceInformation() {
        nProgress.start(0.5);
        nProgress.inc(0.2);

        let url = route('workspace_information');
        axios.post(url, workspaceInformation).then((response) => {
            nProgress.done(true);
            props.setOpenTab(7);
        });
    }

    return (
        <>
            <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
                <div className="sm:max-w-md w-full p-2 flex justify-center items-center flex-col">
                    <img src="/img/OneMessage.ChatLOGO.png" alt="One Message" />
                    <h1 className="text-[32px] leading-5 font-bold !mt-6 mb-0">
                        Land!
                    </h1>
                    <p className="text-base !mt-4 mb-0">Ready to disembark</p>

                    <div className="!mt-12 w-full">
                        <h2 className="text-base font-bold text-[#878787] text-center flex justify-center items-center gap-2">
                            Give your workspace a name{" "}
                            <AiOutlineInfoCircle
                                id="WorkspaceNamePopover"
                                className="cursor-pointer "
                            />
                        </h2>
                        <UncontrolledPopover
                            placement="top"
                            target="WorkspaceNamePopover"
                            trigger="hover"
                        >
                            <PopoverHeader></PopoverHeader>
                            <PopoverBody>
                                In OneMessage you can create multiple workspaces
                                to manage multiple xxxx, you can give it the
                                name you prefer and you can change it whenever
                                you want
                            </PopoverBody>
                        </UncontrolledPopover>
                        <div className="card !rounded-2xl !p-8 w-full space-y-4 !mt-6 text-base">
                            <input
                                type="text"
                                className="w-full p-2  border-b !border-t-0 !border-r-0 !ring-offset-0 !ring-0 !border-l-0 border-[#D3D3D3] !outline-none placeholder:text-[#B4B5BF] focus:border-primary"
                                placeholder="Workspace Name"
                                value={workspaceInformation?.name ?? ""}
                                onChange={(e) => searchHandler(e.target.value, "name")}
                            />
                        </div>
                    </div>
                    <div className="!mt-6 w-full">
                        <h2 className="text-base font-bold text-[#878787] text-center flex justify-center items-center gap-2">
                            Set the currency{" "}
                            <AiOutlineInfoCircle
                                id="currencyPopover"
                                className="cursor-pointer "
                            />
                        </h2>
                        <UncontrolledPopover
                            placement="top"
                            target="currencyPopover"
                            trigger="hover"
                        >
                            <PopoverHeader></PopoverHeader>
                            <PopoverBody>
                                Set the currency in which you want to display
                                data on expenses and earnings within your
                                Oneessage workspace
                            </PopoverBody>
                        </UncontrolledPopover>
                        <div className="card !rounded-2xl !p-8 w-full space-y-4 !mt-6 text-base">
                            <div className="w-full pt-2  border-b !border-t-0 !border-r-0 !ring-offset-0 !ring-0 !border-l-0 border-[#D3D3D3] !outline-none placeholder:text-[#B4B5BF] focus:border-primary">
                                <CreatableSelect
                                    value={workspaceInformation?.currency ?? null}
                                    options={currencyType}
                                    onChange={(e) => searchHandler(e, 'currency')}
                                    classNamePrefix="creatableselect-inner"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="!mt-6 w-full">
                        <h2 className="text-base font-bold text-[#878787] text-center flex justify-center items-center gap-2">
                            Select the time zone{" "}
                            <AiOutlineInfoCircle
                                id="timeZonePopover"
                                className="cursor-pointer "
                            />
                        </h2>
                        <UncontrolledPopover
                            placement="top"
                            target="timeZonePopover"
                            trigger="hover"
                        >
                            <PopoverHeader></PopoverHeader>
                            <PopoverBody>
                                Set the timezone you want to display within your
                                OneMessage workspace
                            </PopoverBody>
                        </UncontrolledPopover>
                        <div className="card !rounded-2xl !p-8 w-full space-y-4 !mt-6 text-base">
                            <div className="w-full pt-2  border-b !border-t-0 !border-r-0 !ring-offset-0 !ring-0 !border-l-0 border-[#D3D3D3] !outline-none placeholder:text-[#B4B5BF] focus:border-primary">
                                <CreatableSelect
                                    value={workspaceInformation?.time_zone ?? null}
                                    options={timeZone}
                                    onChange={(e) => searchHandler(e, 'time_zone')}
                                    classNamePrefix="creatableselect-inner"
                                />
                            </div>
                        </div>
                    </div>

                    <div className='!mt-6 w-full'>
                        <div className="flex justify-center">
                            <button
                                type="button"
                                className="w-full inline-flex justify-end rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary hover:bg-primary/80 text-semibold font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm mt-4"
                                onClick={() => updateWorkspaceInformation()}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}












