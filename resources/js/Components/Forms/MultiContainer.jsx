import React, { useEffect, useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";

export default function MultiContainer(props) {
    const [numbers, setNumber] = useState([]);

    const types = [
        { name: "Home", label: props.translator["Home"] },
        { name: "Work", label: props.translator["Work"] },
        { name: "Others", label: props.translator["Others"] },
    ];

    useEffect(() => {
        const record = props.value;

        if (Array.isArray(record) && record.length > 0) {
            setNumber(record);
        } else {
            setNumber([{ [props.name]: "", type: "" }]);
        }
    }, [props.value, props.name]);

    function addNumber() {
        const newNumber = [...numbers, { [props.name]: "", type: "" }];
        props.DataHandler(props.name, newNumber);
        setNumber(newNumber);
    }

    function deleteNumber(index) {
        if (numbers.length === 1) return;

        const newNumber = numbers.filter((_, i) => i !== index);
        props.DataHandler(props.name, newNumber);
        setNumber(newNumber);
    }

    function phoneNumberHandler(event, index) {
        const { name, value } = event.target;

        const newNumber = numbers.map((item, i) =>
            i === index ? { ...item, [name]: value } : item
        );

        props.DataHandler(props.name, newNumber);
        setNumber(newNumber);
    }

    const isEmailField = props.name === "emails";
    const inputPlaceholder = isEmailField
        ? props.translator?.["Enter email"] ?? "Enter email"
        : props.translator?.["Enter phone number"] ?? "Enter phone number";

    return (
        <div>
            {numbers.map((number, index) => (
                <div key={index} className="flex w-full">
                    <div className="mt-1 col-span-8 !sm:mt-0">
                        <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-6">
                                <input
                                    type="text"
                                    id={`${props.name}-${index}`}
                                    name={props.name}
                                    value={number?.[props.name] ?? ""}
                                    placeholder={inputPlaceholder}
                                    className="block w-full rounded-md border border-white/20 bg-[#0F0B1A] px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-[#1C9AE1] focus:outline-none focus:ring-2 focus:ring-[#1C9AE1]"
                                    onChange={(e) => phoneNumberHandler(e, index)}
                                />
                            </div>

                            <div className="col-span-4">
                                <select
                                    id={`type-${index}`}
                                    name="type"
                                    value={number?.type ?? ""}
                                    className="h-10 w-full rounded-md border border-white/20 bg-[#0F0B1A] py-0 pl-3 pr-7 text-sm text-white focus:border-[#1C9AE1] focus:outline-none focus:ring-2 focus:ring-[#1C9AE1]"
                                    onChange={(e) => phoneNumberHandler(e, index)}
                                >
                                    <option
                                        value=""
                                        className="bg-[#0F0B1A] text-white"
                                    >
                                        {props.translator["Select"]}
                                    </option>
                                    {types.map((type) => (
                                        <option
                                            key={type.name}
                                            value={type.name}
                                            className="bg-[#0F0B1A] text-white"
                                        >
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-2">
                                <button
                                    type="button"
                                    className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-sm text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                                    onClick={() => deleteNumber(index)}
                                >
                                    <TrashIcon className="h-4 w-4 text-red-600 cursor-pointer" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <div className="flex gap-1 items-center text-[#545CD8] !mt-1 cursor-pointer">
                <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-sm text-[#545CD8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                    onClick={addNumber}
                >
                    <PlusIcon className="h-4 w-4 text-[#545CD8] cursor-pointer mr-2" />
                    {props.translator["Add"]}{" "}
                    {props.buttonTitle ? props.translator[props.buttonTitle] : ""}
                </button>
            </div>
        </div>
    );
}












