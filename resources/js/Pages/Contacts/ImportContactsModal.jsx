import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Axios from "axios";
import notie from "notie";
import Select from "react-select";

function formatErrorRow(error) {
    if (!error) {
        return "";
    }

    const rowLabel =
        error.row && Number(error.row) > 0 ? `Row ${error.row}: ` : "";

    return `${rowLabel}${error.message ?? "Import failed"}`;
}

export default function ImportContactsModal(props) {
    const [file, setFile] = useState(null);
    const [tagOptions, setTagOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [tags, setTags] = useState([]);
    const [categorys, setCategorys] = useState([]);
    const [rowErrors, setRowErrors] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let mounted = true;

        Axios.get(route("tag_list_options"))
            .then((response) => {
                if (!mounted || response.data.status !== true) {
                    return;
                }

                setTagOptions(response.data.tagOptions ?? []);
                setCategoryOptions(response.data.categoryOptions ?? []);
            })
            .catch(() => {
                if (mounted) {
                    setRowErrors([
                        {
                            row: 0,
                            message: "Failed to load tag and list options",
                        },
                    ]);
                }
            })
            .finally(() => {
                if (mounted) {
                    setLoadingOptions(false);
                }
            });

        return () => {
            mounted = false;
        };
    }, []);

    const relationSelectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: 44,
            backgroundColor: "#0F0B1A",
            borderColor: state.isFocused
                ? "#1C9AE1"
                : "rgba(255,255,255,0.2)",
            boxShadow: state.isFocused
                ? "0 0 0 2px rgba(28,154,225,0.18)"
                : "none",
            "&:hover": {
                borderColor: "#1C9AE1",
            },
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: "#12041f",
            color: "#fff",
            zIndex: 30,
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
                ? "rgba(191,0,255,0.2)"
                : "#12041f",
            color: "#fff",
        }),
        singleValue: (base) => ({
            ...base,
            color: "#fff",
        }),
        input: (base) => ({
            ...base,
            color: "#fff",
        }),
        placeholder: (base) => ({
            ...base,
            color: "rgba(255,255,255,0.45)",
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: "rgba(191,0,255,0.18)",
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: "#fff",
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: "#fff",
            ":hover": {
                backgroundColor: "rgba(191,0,255,0.32)",
                color: "#fff",
            },
        }),
        indicatorSeparator: (base) => ({
            ...base,
            backgroundColor: "rgba(255,255,255,0.15)",
        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: "rgba(255,255,255,0.65)",
        }),
        clearIndicator: (base) => ({
            ...base,
            color: "rgba(255,255,255,0.65)",
        }),
    };

    const menuPortalTarget =
        typeof document !== "undefined" ? document.body : null;

    function handleFileChange(event) {
        const selectedFile = event.target.files?.[0] ?? null;

        setRowErrors([]);

        if (!selectedFile) {
            setFile(null);
            return;
        }

        const fileName = selectedFile.name?.toLowerCase() ?? "";

        if (!fileName.endsWith(".csv")) {
            setFile(null);
            setRowErrors([
                {
                    row: 0,
                    message: "Only CSV files are allowed",
                },
            ]);
            return;
        }

        setFile(selectedFile);
    }

    function buildSummary(result) {
        return `Imported ${result.imported_count}, updated ${result.updated_count}, skipped ${result.skipped_count}.`;
    }

    function handleSubmit() {
        if (!file) {
            setRowErrors([
                {
                    row: 0,
                    message: "Please select a CSV file",
                },
            ]);
            return;
        }

        setSubmitting(true);
        setRowErrors([]);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("tags", JSON.stringify(tags));
        formData.append("categorys", JSON.stringify(categorys));

        Axios.post(route("importContactCsv"), formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
            .then((response) => {
                const result = response.data;
                const hasErrors = Array.isArray(result.errors) && result.errors.length > 0;

                if (
                    Number(result.imported_count ?? 0) > 0 ||
                    Number(result.updated_count ?? 0) > 0
                ) {
                    props.onImported?.(result);
                }

                notie.alert({
                    type: hasErrors ? "warning" : "success",
                    text: buildSummary(result),
                    time: 5,
                });

                if (hasErrors) {
                    setRowErrors(result.errors);
                    return;
                }

                props.onClose();
            })
            .catch((error) => {
                const errorList = error.response?.data?.errors;

                if (Array.isArray(errorList) && errorList.length > 0) {
                    setRowErrors(errorList);
                } else {
                    setRowErrors([
                        {
                            row: 0,
                            message:
                                error.response?.data?.message ??
                                "Import failed",
                        },
                    ]);
                }

                notie.alert({
                    type: "error",
                    text:
                        error.response?.data?.errors?.[0]?.message ??
                        error.response?.data?.message ??
                        "Import failed",
                    time: 5,
                });
            })
            .finally(() => {
                setSubmitting(false);
            });
    }

    return (
        <Transition appear show={true} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={props.onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#140816] text-left align-middle text-white shadow-xl">
                                <div className="border-b border-white/10 px-6 py-5">
                                    <Dialog.Title className="text-xl font-semibold">
                                        Import Contacts
                                    </Dialog.Title>
                                </div>

                                <div className="space-y-6 px-6 py-5">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-white">
                                            CSV File
                                        </label>
                                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-black/20 px-6 py-8 text-center">
                                            <span className="text-sm text-white/80">
                                                {file?.name ?? "Choose .csv file"}
                                            </span>
                                            <span className="mt-2 text-xs text-white/45">
                                                Accepted columns: first_name, last_name, email, phone_number
                                            </span>
                                            <input
                                                type="file"
                                                accept=".csv,text/csv"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>

                                    {rowErrors.length > 0 ? (
                                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                                            <div className="mb-2 text-sm font-medium text-red-300">
                                                Import errors
                                            </div>
                                            <ul className="max-h-40 space-y-1 overflow-y-auto pl-4 text-sm text-red-100">
                                                {rowErrors.map((error, index) => (
                                                    <li key={`${error.row ?? 0}-${index}`} className="list-disc">
                                                        {formatErrorRow(error)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null}

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-white">
                                            Tags
                                        </label>
                                        <Select
                                            isMulti
                                            isDisabled={loadingOptions || submitting}
                                            isSearchable
                                            closeMenuOnSelect={false}
                                            value={tags}
                                            onChange={(value) => setTags(value ?? [])}
                                            options={tagOptions}
                                            styles={relationSelectStyles}
                                            menuPortalTarget={menuPortalTarget}
                                            noOptionsMessage={() => "No tags found"}
                                            placeholder={
                                                loadingOptions ? "Loading..." : "Select tags"
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-white">
                                            Lists
                                        </label>
                                        <Select
                                            isMulti
                                            isDisabled={loadingOptions || submitting}
                                            isSearchable
                                            closeMenuOnSelect={false}
                                            value={categorys}
                                            onChange={(value) => setCategorys(value ?? [])}
                                            options={categoryOptions}
                                            styles={relationSelectStyles}
                                            menuPortalTarget={menuPortalTarget}
                                            noOptionsMessage={() => "No lists found"}
                                            placeholder={
                                                loadingOptions ? "Loading..." : "Select lists"
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        onClick={props.onClose}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-primary px-6 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                    >
                                        {submitting ? "Importing..." : "Import"}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
