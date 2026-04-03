import React, { useEffect, useRef, useState } from "react";
import Axios from "axios";
import { MagnifyingGlassIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import ListViewTable from "@/Components/Views/List/ListViewTable";

const SEARCH_FIELDS = [
    "first_name",
    "last_name",
    "email",
    "phone_number",
    "instagram_username",
    "facebook_username",
];

function normalizeOptions(options = []) {
    if (!Array.isArray(options)) return [];

    return options
        .map((option, index) => {
            if (option && typeof option === "object") {
                const value = option.value ?? option.id ?? option.tag_id ?? option.category_id ?? option.name ?? option.label ?? "";
                const label = option.label ?? option.name ?? option.title ?? option.value ?? "";
                if (value === "" || label === "") return null;
                return {
                    key: `${value}-${index}`,
                    value: String(value),
                    label: String(label),
                };
            }

            if (option === null || option === undefined || option === "") return null;

            return {
                key: `${option}-${index}`,
                value: String(option),
                label: String(option),
            };
        })
        .filter(Boolean);
}

function parseAudienceConditions(rawConditions) {
    const state = {
        search: "",
        tagValue: "",
        listValue: "",
    };

    if (!Array.isArray(rawConditions)) {
        return state;
    }

    rawConditions.forEach((group) => {
        if (!group || typeof group !== "object") return;

        Object.values(group).forEach((conditions) => {
            if (!Array.isArray(conditions)) return;

            conditions.forEach((condition) => {
                const fieldName = String(condition?.field_name || "");
                const conditionValue = condition?.condition_value;

                if (fieldName === "tag_relation") {
                    if (Array.isArray(conditionValue)) {
                        state.tagValue = String(conditionValue[0] || "");
                    } else if (conditionValue) {
                        state.tagValue = String(conditionValue);
                    }
                }

                if (fieldName === "list_relation") {
                    if (Array.isArray(conditionValue)) {
                        state.listValue = String(conditionValue[0] || "");
                    } else if (conditionValue) {
                        state.listValue = String(conditionValue);
                    }
                }
            });

            const searchConditions = conditions.filter((condition) => {
                const fieldName = String(condition?.field_name || "");
                return SEARCH_FIELDS.includes(fieldName);
            });

            if (searchConditions.length > 0) {
                const firstValue = searchConditions[0]?.condition_value;
                if (firstValue !== null && firstValue !== undefined && firstValue !== "") {
                    state.search = String(firstValue);
                }
            }
        });
    });

    return state;
}

function buildAudienceConditions({ search = "", tagValue = "", listValue = "" }) {
    const groups = [];
    const relationConditions = [];

    if (tagValue) {
        relationConditions.push({
            field_name: "tag_relation",
            field_type: "tag",
            record_condition: "equal",
            condition_value: [String(tagValue)],
            condition_operator: "AND",
        });
    }

    if (listValue) {
        relationConditions.push({
            field_name: "list_relation",
            field_type: "tag",
            record_condition: "equal",
            condition_value: [String(listValue)],
            condition_operator: "AND",
        });
    }

    if (relationConditions.length > 0) {
        groups.push({ AND: relationConditions });
    }

    const trimmedSearch = String(search || "").trim();
    if (trimmedSearch) {
        groups.push({
            AND: SEARCH_FIELDS.map((fieldName, index) => ({
                field_name: fieldName,
                field_type: fieldName === "phone_number" ? "phone_number" : "text",
                record_condition: "contains",
                condition_value: trimmedSearch,
                condition_operator: index === 0 ? "AND" : "OR",
            })),
        });
    }

    return groups;
}

function ContactFilter(props) {
    const [headers, setHeader] = useState();
    const [records, setRecord] = useState();
    const [openList, setOpenlist] = useState(false);
    const [recordCount, setRecordCount] = useState(props.recordCount ?? 0);
    const [audienceState, setAudienceState] = useState(() =>
        parseAudienceConditions(props.data.conditions),
    );
    const searchTimeoutRef = useRef(null);

    const tagOptions = normalizeOptions(props.campagins.filter?.tag_list);
    const listOptions = normalizeOptions(props.campagins.filter?.category_list);

    useEffect(() => {
        const nextState = parseAudienceConditions(props.data.conditions);
        setAudienceState(nextState);
        props.setConditions(buildAudienceConditions(nextState));
        fetchAudience(nextState);
    }, [props.data.conditions]);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    function updateAudience(nextState) {
        setAudienceState(nextState);
        props.setConditions(buildAudienceConditions(nextState));
    }

    function clearPreview() {
        setOpenlist(false);
        setRecordCount(0);
        setHeader(undefined);
        setRecord([]);
        if (props.setRecordCount) {
            props.setRecordCount(0);
        }
    }

    function fetchAudience(state) {
        const conditions = buildAudienceConditions(state);
        props.setConditions(conditions);

        Axios.get(route("searchfilter"), {
            params: {
                filter: JSON.stringify(conditions),
                from: "campaignfilter",
            },
        }).then((response) => {
            setOpenlist(true);
            setRecordCount(response.data.total);
            if (props.setRecordCount) {
                props.setRecordCount(response.data.total);
            }
            setHeader(response.data.headers);
            setRecord(response.data.records);
        });
    }

    function handleAudienceChange(name, value) {
        const nextState = {
            ...audienceState,
            [name]: value,
        };
        updateAudience(nextState);

        if (name === "tagValue" || name === "listValue") {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            fetchAudience(nextState);
            return;
        }

        if (name === "search") {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            const trimmedSearch = String(value || "").trim();
            if (trimmedSearch.length >= 4) {
                searchTimeoutRef.current = setTimeout(() => {
                    fetchAudience(nextState);
                }, 250);
                return;
            }

            if (trimmedSearch.length === 0) {
                fetchAudience(nextState);
            }
        }
    }

    function triggerSearch() {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        fetchAudience(audienceState);
    }

    return (
        <div className="w-full overflow-hidden rounded-2xl bg-[#0d0516] shadow-[0_40px_140px_rgba(0,0,0,0.55)]">

            {/* Header */}
            <div className="relative overflow-hidden bg-[linear-gradient(135deg,#7c3aed,#9333ea)] px-8 py-7 sm:px-10">
                {/* Decorative circles */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-10 opacity-60">
                    <div className="relative h-24 w-24">
                        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/20" />
                        <div className="absolute left-0 top-2 h-14 w-14 rounded-full bg-white/20" />
                        <div className="absolute -right-2 bottom-0 h-12 w-12 rounded-full bg-white/20" />
                    </div>
                </div>
                <div className="relative z-10 space-y-1">
                    <div className="text-2xl font-black uppercase tracking-wide text-white">
                        {props.translator["Contact"] ?? "Contact"}
                    </div>
                    <p className="max-w-md text-sm text-white/85">
                        Select who will receive this campaign. Use filters to build your audience.
                    </p>
                </div>
            </div>

            {/* Body */}
            <div className="px-8 py-8 sm:px-10">

                {/* Filter header + search row */}
                <div className="mb-2">
                    <div className="text-lg font-black uppercase tracking-wide text-white">
                        {props.translator["Filter"] ?? "Filter"}
                    </div>
                    <p className="text-sm text-white/50">
                        Tip: AND narrows the audience - OR expands it.
                    </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    {/* Search input */}
                    <div className="relative min-w-[280px] flex-1">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
                        <input
                            type="text"
                            value={audienceState.search}
                            onChange={(event) => handleAudienceChange("search", event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    triggerSearch();
                                }
                            }}
                            placeholder="Search by name..."
                            className="w-full rounded-lg bg-[#1a0a2e] py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-[#220d3a] transition"
                        />
                    </div>

                    {/* Tag button-select */}
                    <div className="relative">
                        <select
                            value={audienceState.tagValue}
                            onChange={(event) => handleAudienceChange("tagValue", event.target.value)}
                            className="appearance-none rounded-lg bg-[#22d3ee] px-6 py-3 text-sm font-bold text-white focus:outline-none cursor-pointer hover:bg-[#06b6d4] transition"
                        >
                            <option value="" className="bg-[#0a0212] text-white">Tag</option>
                            {tagOptions.map((option) => (
                                <option key={option.key} value={option.value} className="bg-[#0a0212] text-white">
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* List button-select */}
                    <div className="relative">
                        <select
                            value={audienceState.listValue}
                            onChange={(event) => handleAudienceChange("listValue", event.target.value)}
                            className="appearance-none rounded-lg bg-[#3b0764] px-6 py-3 text-sm font-bold text-white focus:outline-none cursor-pointer hover:bg-[#4c1d95] transition"
                        >
                            <option value="" className="bg-[#0a0212] text-white">List</option>
                            {listOptions.map((option) => (
                                <option key={option.key} value={option.value} className="bg-[#0a0212] text-white">
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Filter results table */}
                <div className="mt-6 rounded-lg bg-[#0a0212] px-5 py-4">
                    <div className="mb-3">
                        <div className="text-sm font-black uppercase tracking-wide text-white">
                            {props.translator["Filter"] ?? "Filter"}
                        </div>
                        {openList && recordCount != null && (
                            <div className="text-xs text-white/45">
                                {recordCount} {recordCount === 1 ? "contact" : "contacts"}
                            </div>
                        )}
                    </div>

                    <div className="max-h-[320px] overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#7c3aed]/60 [&::-webkit-scrollbar-thumb:hover]:bg-[#9333ea]">
                        {openList ? (
                            <ListViewTable
                                records={records || []}
                                customHeader={(() => {
                                    if (!headers) return headers;
                                    const next = { ...headers };
                                    Object.entries(next).forEach(([key, value]) => {
                                        const label = String(value?.label ?? "").toLowerCase();
                                        if (key === "country" || key === "organization" || label === "country" || label === "organization") {
                                            delete next[key];
                                        }
                                    });
                                    return next;
                                })()}
                                fetchFields={false}
                                hideToolMenu={true}
                                disableSorting={true}
                                emptyStateText=""
                                renderCell={({ name }) => {
                                    const fieldName = String(name || "").toLowerCase();
                                    if (fieldName === "country" || fieldName === "organization") {
                                        return null;
                                    }
                                    return undefined;
                                }}
                            />
                        ) : (
                            <div className="py-8 text-center text-sm text-white/30">
                                Apply a filter to preview the audience.
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-between gap-4">
                    <button
                        type="button"
                        className="rounded-lg bg-[#5b21b6] px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4c1d95]"
                        onClick={() => props.previous(1)}
                    >
                        {props.translator["Previous"] ?? "Previous"}
                    </button>
                    <button
                        type="button"
                        className="rounded-lg bg-[#BF00FF] px-8 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(191,0,255,0.3)] transition hover:bg-[#a100df]"
                        onClick={props.saveCampaign}
                    >
                        {props.translator["Next"] ?? "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ContactFilter;
