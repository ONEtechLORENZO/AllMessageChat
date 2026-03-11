import React from "react";
import { Link } from "@inertiajs/react";
import ListViewTable from "@/Components/Views/List/ListViewTable";

const lineItems = [
    {name : 'product' , label : 'Product'},
    {name : 'quantity', label : 'Quantity'},
];

function Step2(props){
    const mappingHeaders = {
        field_label: { label: "OneMessage Fields", type: "text" },
        csv_header: { label: "CSV Headers", type: "text" },
    };

    const mappingRecords = props.Onestep
        ? [
              ...Object.entries(props.Onestep).map(([key, record], index) => ({
                  id: record.field_name ?? index,
                  field_label: record.field_label,
                  csv_header: record.field_name,
                  field_name: record.field_name,
              })),
              ...(props.module == "Order"
                  ? lineItems.map((item) => ({
                        id: item.name,
                        field_label: item.label,
                        csv_header: item.name,
                        field_name: item.name,
                    }))
                  : []),
          ]
        : [];

    return(
     <>
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center justify-between">
                    <div className="sm:flex-auto">
                        <h1 className="text-xl font-semibold text-white">
                            Mapping
                        </h1>
                        <p className="mt-2 text-sm text-white/70">
                            Make CSV and portal
                            field
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href={route("listImport")}
                            className='inline-flex items-center px-4 py-2 border border-white/15 rounded-md font-semibold shadow-md text-sm text-white/80 bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0815] focus:ring-[#BF00FF]/60'
                        >
                            Back to list
                        </Link>

                        {props.View ? (" ") : (
                            <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-md border border-transparent bg-[#BF00FF] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#9c00d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0815] focus:ring-[#BF00FF]/60 sm:w-auto"
                                onClick={() => props.importfileSave()}
                            >
                                Save
                            </button>
                        )}
                    </div>
            </div>
            <div className="-mx-4 mt-8 overflow-hidden shadow ring-1 ring-white/10 sm:-mx-6 md:mx-0 md:rounded-lg">
                <ListViewTable
                    records={mappingRecords}
                    customHeader={mappingHeaders}
                    fetchFields={false}
                    hideToolMenu={true}
                    disableSorting={true}
                    emptyStateText=""
                    renderCell={({ name, record }) => {
                        if (name !== "csv_header") return undefined;

                        if (props.View) {
                            return (
                                <div>
                                    {props.CsvHeader.map((option, index) =>
                                        record.field_name == option.value ? (
                                            <p key={option.value ?? option.label ?? index}>
                                                {option.label}
                                            </p>
                                        ) : null,
                                    )}
                                </div>
                            );
                        }

                        return (
                            <select
                                id={record.field_name}
                                name={record.field_name}
                                className="mt-1 block w-full rounded-md border-white/10 bg-[#0F0B1A] py-2 pl-3 pr-10 text-base text-white focus:border-[#BF00FF]/60 focus:outline-none focus:ring-[#BF00FF]/60 sm:text-sm"
                                onChange={(e) => props.handleChange(e)}
                            >
                                <option value=""> select </option>
                                {props.CsvHeader.map((option, index) => (
                                    <option
                                        key={option.value ?? option.label ?? index}
                                        value={option}
                                    >
                                        {option}
                                    </option>
                                ))}
                            </select>
                        );
                    }}
                />
            </div>
        </div>
     </>
    );
}

export default Step2;












