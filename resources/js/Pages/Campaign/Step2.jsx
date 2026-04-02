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
        <div className="w-full overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_0%_0%,rgba(124,58,237,0.35),rgba(20,8,22,0.92)_55%,rgba(8,4,16,0.98)_100%)] shadow-[0_40px_140px_rgba(0,0,0,0.55)]">
            <div className="relative overflow-hidden bg-[linear-gradient(90deg,rgba(124,58,237,0.95),rgba(168,85,247,0.9))] px-8 py-6 sm:px-10">
                <div className="pointer-events-none absolute inset-y-0 right-0 w-[55%] opacity-70">
                    <div className="absolute -right-16 -bottom-40 h-[360px] w-[360px] rounded-full bg-white/12 ring-4 ring-white/10" />
                    <div className="absolute right-28 -top-10 h-48 w-48 rounded-full bg-white/12 ring-4 ring-white/10" />
                    <div className="absolute -right-10 -top-6 h-44 w-44 rounded-full bg-white/10 ring-4 ring-white/10" />
                </div>
                <div className="relative z-10 space-y-1">
                    <div className="text-3xl font-black uppercase tracking-tight text-white">
                        {props.translator["Contact"] ?? "Contact"}
                    </div>
                    <p className="text-sm text-white/85">
                        Select who will receive this campaign. Use filters to build your audience.
                    </p>
                </div>
            </div>

            <div className="bg-[linear-gradient(180deg,rgba(18,10,27,0.92),rgba(10,7,17,0.98))] px-8 py-10 sm:px-10">
                <div className="w-full max-w-none">
                    <div className="text-2xl font-black uppercase tracking-tight text-white">
                        {props.translator["Filter"] ?? "Filter"}
                    </div>
                    <p className="mt-1 text-sm text-white/55">
                        Search contacts, or narrow the audience by tag and list.
                    </p>

                    <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.3)]">
                        <div className="flex flex-wrap items-center gap-3">
                            <label className="relative block min-w-[360px] flex-1">
                                <MagnifyingGlassIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
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
                                    placeholder="Search"
                                    className="w-full rounded-[22px] border border-white/80 bg-transparent py-3 pl-14 pr-5 text-base text-white placeholder:text-white/45 focus:border-white focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={triggerSearch}
                                    className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white"
                                    aria-label="Search audience"
                                >
                                    <MagnifyingGlassIcon className="h-5 w-5" />
                                </button>
                            </label>

                            <div className="relative min-w-[140px]">
                                <select
                                    value={audienceState.tagValue}
                                    onChange={(event) => handleAudienceChange("tagValue", event.target.value)}
                                    className="w-full appearance-none rounded-none border border-white/80 bg-transparent px-5 py-3 pr-11 text-lg font-semibold text-white focus:border-white focus:outline-none"
                                >
                                    <option value="" className="bg-[#140816] text-white">Tag</option>
                                    {tagOptions.map((option) => (
                                        <option key={option.key} value={option.value} className="bg-[#140816] text-white">
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
                            </div>

                            <div className="relative min-w-[140px]">
                                <select
                                    value={audienceState.listValue}
                                    onChange={(event) => handleAudienceChange("listValue", event.target.value)}
                                    className="w-full appearance-none rounded-none border border-white/80 bg-transparent px-5 py-3 pr-11 text-lg font-semibold text-white focus:border-white focus:outline-none"
                                >
                                    <option value="" className="bg-[#140816] text-white">List</option>
                                    {listOptions.map((option) => (
                                        <option key={option.key} value={option.value} className="bg-[#140816] text-white">
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
                            </div>
                        </div>
                    </div>
                </div>

                {openList ? (
                    <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.3)]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="text-lg font-semibold text-white">
                                    {props.translator?.["Audience Preview"] ?? "Audience Preview"}
                                </div>
                                <div className="text-sm text-white/55">
                                    {recordCount != null
                                        ? `${recordCount} ${recordCount === 1 ? "contact" : "contacts"}`
                                        : ""}
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 max-h-[420px] overflow-auto rounded-xl border border-white/10">
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
                        </div>
                    </div>
                ) : null}

                <div className="mt-10 flex items-center justify-between gap-4">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-xl bg-white/10 px-6 py-2.5 text-sm font-semibold text-white/90 ring-1 ring-white/10 transition hover:bg-white/15"
                        onClick={() => props.previous(1)}
                    >
                        {props.translator["Previous"] ?? "Previous"}
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-xl bg-[linear-gradient(135deg,#A855F7,#D946EF)] px-8 py-2.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(168,85,247,0.26)] transition hover:translate-y-[-1px] hover:shadow-[0_20px_40px_rgba(168,85,247,0.32)]"
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
