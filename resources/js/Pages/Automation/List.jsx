import React, { useMemo, useState } from "react";
import Authenticated from "@/Layouts/Authenticated";
import WorkflowBuilder from "@/Pages/Automation/WorkflowBuilder";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/solid";

const LOCAL_KEY = "wf-automations-v1";

function loadLocalAutomations() {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(LOCAL_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveLocalAutomations(items) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

function List(props) {
    const [search, setSearch] = useState("");
    const [builderOpen, setBuilderOpen] = useState(false);
    const [builderName, setBuilderName] = useState("Automation 1");
    const [builderStorageKey, setBuilderStorageKey] = useState(
        "workflow-blueprint-local",
    );
    const [localAutomations, setLocalAutomations] = useState(() =>
        loadLocalAutomations(),
    );

    const serverAutomations = Array.isArray(props.records) ? props.records : [];

    const automations = useMemo(() => {
        const local = localAutomations.map((item) => ({
            id: item.id,
            name: item.name,
            storageKey: item.storageKey,
            source: "local",
        }));

        const server = serverAutomations.map((item) => ({
            id: `srv-${item.id}`,
            name: item.name ?? `Automation ${item.id}`,
            storageKey: `workflow-blueprint-srv-${item.id}`,
            source: "server",
        }));

        return [...local, ...server];
    }, [localAutomations, serverAutomations]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return automations;
        return automations.filter((item) =>
            (item.name ?? "").toLowerCase().includes(q),
        );
    }, [automations, search]);

    const defaultAutomationName = useMemo(() => {
        let max = 0;
        for (const item of automations) {
            const match = /^Automation\s+(\d+)\s*$/i.exec(item.name ?? "");
            if (!match) continue;
            const n = Number(match[1]);
            if (Number.isFinite(n)) max = Math.max(max, n);
        }
        return `Automation ${max + 1}`;
    }, [automations]);

    const openAutomation = (item) => {
        setBuilderName(item.name ?? "Automation 1");
        setBuilderStorageKey(item.storageKey);
        setBuilderOpen(true);
    };

    const createAutomation = () => {
        const now = Date.now();
        const name = defaultAutomationName;
        const storageKey = `workflow-blueprint-local-${now}`;

        const next = [
            {
                id: `local-${now}`,
                name,
                storageKey,
                createdAt: new Date(now).toISOString(),
            },
            ...localAutomations,
        ];
        setLocalAutomations(next);
        saveLocalAutomations(next);
        openAutomation({ name, storageKey });
    };

    if (builderOpen) {
        return (
            <Authenticated
                auth={props.auth}
                errors={props.errors}
                current_page="Automations"
                navigationMenu={props.menuBar}
                hidePageTitle
            >
                <WorkflowBuilder
                    initialName={builderName}
                    storageKey={builderStorageKey}
                    onBack={() => setBuilderOpen(false)}
                />
            </Authenticated>
        );
    }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page="Automations"
            navigationMenu={props.menuBar}
            hidePageTitle
        >
            <div className="auto-page">
                <div className="auto-head">
                    <div>
                        <div className="auto-title">AUTOMATIONS</div>
                        <div className="auto-subtitle">
                            Create the workflows to automate the process
                        </div>
                    </div>

                    <button
                        type="button"
                        className="auto-create"
                        onClick={createAutomation}
                    >
                        <PlusIcon className="auto-create-icon" />
                        Create
                    </button>
                </div>

                <div className="auto-search">
                    <MagnifyingGlassIcon className="auto-search-icon" />
                    <input
                        type="text"
                        placeholder="search your workflow"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="auto-table">
                    <div className="auto-table-head">
                        <div>Workflow Automations</div>
                        <div className="auto-center">Automation Switch</div>
                        <div className="auto-center">Status</div>
                        <div className="auto-center">Actions</div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="auto-empty">No automations found.</div>
                    ) : (
                        filtered.map((item) => (
                            <div className="auto-row" key={item.id}>
                                <button
                                    type="button"
                                    className="auto-row-name"
                                    onClick={() => openAutomation(item)}
                                >
                                    {item.name}
                                </button>
                                <div className="auto-center">
                                    <div className="auto-pill disabled">
                                        Off
                                    </div>
                                </div>
                                <div className="auto-center">
                                    <div className="auto-pill">
                                        {item.source === "local"
                                            ? "Draft"
                                            : "Imported"}
                                    </div>
                                </div>
                                <div className="auto-center">
                                    <button
                                        type="button"
                                        className="auto-open"
                                        onClick={() => openAutomation(item)}
                                    >
                                        Open
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Authenticated>
    );
}

export default List;
