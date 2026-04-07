import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Camera,
    Clock3,
    Copy,
    Download,
    FileText,
    Filter,
    Link2,
    Mail,
    MessageCircle,
    MessageSquare,
    MoreHorizontal,
    Play,
    Plus,
    RotateCcw,
    Save,
    Search,
    Send,
    Share2,
    Sparkles,
    StickyNote,
    Upload,
    X,
} from "lucide-react";

const NODE_WIDTH = 120;
const NODE_BOX_SIZE = 86;
const CANVAS_PADDING = 28;

const accentColors = {
    violet: "#9d4dff",
    pink: "#ff4fd8",
    blue: "#36b9ff",
    green: "#42d392",
    amber: "#ffbc4b",
    rose: "#ff5d7b",
    slate: "#7d86b2",
};

const iconMap = {
    send: Send,
    interactive: MessageSquare,
    note: StickyNote,
    webhook: Link2,
    whatsapp: MessageCircle,
    facebook: Share2,
    instagram: Camera,
    email: Mail,
    clock: Clock3,
    filter: Filter,
    router: Sparkles,
    plus: Plus,
};

const toolboxSections = [
    {
        title: "Choose Actions",
        items: [
            { label: "Send Message", iconKey: "send", accent: "blue" },
            {
                label: "Send Interactive Message",
                iconKey: "interactive",
                accent: "violet",
            },
            { label: "Add Note", iconKey: "note", accent: "amber" },
            { label: "Send Webhook", iconKey: "webhook", accent: "rose" },
        ],
    },
    {
        title: "Apps",
        items: [
            { label: "Whatsapp", iconKey: "whatsapp", accent: "green" },
            { label: "Facebook", iconKey: "facebook", accent: "blue" },
            { label: "Instagram", iconKey: "instagram", accent: "pink" },
            { label: "Email", iconKey: "email", accent: "amber" },
        ],
    },
    {
        title: "Timing",
        items: [{ label: "Time Delay", iconKey: "clock", accent: "slate" }],
    },
    {
        title: "Conditions",
        items: [
            { label: "Filter", iconKey: "filter", accent: "amber" },
            { label: "Router", iconKey: "router", accent: "pink" },
        ],
    },
];

const defaultScenario = {
    id: "scenario-1",
    name: "Automation 1",
    notes: "",
    nodes: [
        {
            id: "node-1",
            label: "Send Message",
            iconKey: "send",
            accent: "blue",
            x: 180,
            y: 260,
        },
        {
            id: "node-2",
            label: "Send Interactive Message",
            iconKey: "interactive",
            accent: "violet",
            x: 380,
            y: 260,
        },
        {
            id: "node-3",
            label: "Add Note",
            iconKey: "note",
            accent: "amber",
            x: 580,
            y: 260,
        },
        {
            id: "node-4",
            label: "Send Webhook",
            iconKey: "webhook",
            accent: "rose",
            x: 380,
            y: 90,
        },
        {
            id: "node-5",
            label: "Time Delay",
            iconKey: "clock",
            accent: "slate",
            x: 380,
            y: 430,
        },
    ],
    links: [
        { id: "link-1", from: "node-1", to: "node-2" },
        { id: "link-2", from: "node-2", to: "node-3" },
    ],
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const makeId = () =>
    `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const toNumber = (value, fallback) => {
    const result = Number(value);
    return Number.isFinite(result) ? result : fallback;
};

function normalizeScenario(input) {
    const base = input && typeof input === "object" ? input : {};
    const fallbackNodes = clone(defaultScenario.nodes);

    const nodes =
        Array.isArray(base.nodes) && base.nodes.length > 0
            ? base.nodes.map((node, index) => ({
                  id: node.id ?? makeId(),
                  label: node.label ?? `Step ${index + 1}`,
                  iconKey: node.iconKey ?? "plus",
                  accent: node.accent ?? "violet",
                  x: toNumber(
                      node.x,
                      fallbackNodes[index % fallbackNodes.length]?.x ?? 240,
                  ),
                  y: toNumber(
                      node.y,
                      fallbackNodes[index % fallbackNodes.length]?.y ?? 240,
                  ),
              }))
            : clone(defaultScenario.nodes);

    const links =
        Array.isArray(base.links) && base.links.length > 0
            ? base.links
                  .map((link) => {
                      if (Array.isArray(link) && link.length >= 2) {
                          return { id: makeId(), from: link[0], to: link[1] };
                      }

                      if (link && link.from && link.to) {
                          return {
                              id: link.id ?? makeId(),
                              from: link.from,
                              to: link.to,
                          };
                      }

                      return null;
                  })
                  .filter(Boolean)
            : clone(defaultScenario.links);

    return {
        id: base.id ?? defaultScenario.id,
        name: base.name ?? defaultScenario.name,
        notes: base.notes ?? defaultScenario.notes,
        nodes,
        links,
    };
}

function getInitialScenario(storageKey, initialName) {
    if (typeof window === "undefined") {
        return normalizeScenario({ ...defaultScenario, name: initialName });
    }

    try {
        const stored = window.localStorage.getItem(storageKey);
        if (!stored) {
            return normalizeScenario({ ...defaultScenario, name: initialName });
        }
        const parsed = normalizeScenario(JSON.parse(stored));
        return { ...parsed, name: initialName ?? parsed.name };
    } catch {
        return normalizeScenario({ ...defaultScenario, name: initialName });
    }
}

export default function WorkflowBuilder({
    initialName = "Automation 1",
    storageKey = "workflow-blueprint",
    onBack,
}) {
    const [scenario, setScenario] = useState(() =>
        getInitialScenario(storageKey, initialName),
    );
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [history, setHistory] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [notesOpen, setNotesOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [dragging, setDragging] = useState(null);
    const [addMode, setAddMode] = useState(false);
    const [pendingInsert, setPendingInsert] = useState(null);

    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const menuRef = useRef(null);
    const runTimeoutRef = useRef(null);
    const toastTimeoutRef = useRef(null);

    useEffect(() => {
        document.body.classList.add("wf-builder-open");
        return () => document.body.classList.remove("wf-builder-open");
    }, []);

    useEffect(() => {
        if (!scenario.nodes.some((node) => node.id === selectedNodeId)) {
            setSelectedNodeId(
                scenario.nodes[1]?.id ?? scenario.nodes[0]?.id ?? null,
            );
        }
    }, [scenario.nodes, selectedNodeId]);

    useEffect(() => {
        window.localStorage.setItem(storageKey, JSON.stringify(scenario));
    }, [scenario, storageKey]);

    useEffect(() => {
        return () => {
            window.clearTimeout(runTimeoutRef.current);
            window.clearTimeout(toastTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        window.addEventListener("mousedown", handleOutsideClick);
        return () =>
            window.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    useEffect(() => {
        const handleMove = (event) => {
            if (!dragging || !canvasRef.current) return;

            const rect = canvasRef.current.getBoundingClientRect();

            const x = Math.max(
                CANVAS_PADDING,
                Math.min(
                    event.clientX - rect.left - dragging.offsetX,
                    rect.width - NODE_WIDTH - CANVAS_PADDING,
                ),
            );

            const y = Math.max(
                CANVAS_PADDING,
                Math.min(
                    event.clientY - rect.top - dragging.offsetY,
                    rect.height - NODE_WIDTH - CANVAS_PADDING,
                ),
            );

            setScenario((current) => ({
                ...current,
                nodes: current.nodes.map((node) =>
                    node.id === dragging.id ? { ...node, x, y } : node,
                ),
            }));
        };

        const handleUp = () => {
            if (!dragging) return;
            setHistory((items) => [dragging.snapshot, ...items].slice(0, 50));
            setDragging(null);
        };

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);

        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };
    }, [dragging]);

    const showToast = (message) => {
        setToast(message);
        window.clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = window.setTimeout(() => {
            setToast("");
        }, 2200);
    };

    const commitScenario = (updater, message = "") => {
        setScenario((current) => {
            const snapshot = clone(current);
            const nextValue =
                typeof updater === "function" ? updater(current) : updater;

            setHistory((items) => [snapshot, ...items].slice(0, 50));
            return normalizeScenario(nextValue);
        });

        if (message) showToast(message);
    };

    const saveBlueprint = () => {
        window.localStorage.setItem(storageKey, JSON.stringify(scenario));
        showToast("Blueprint saved locally");
    };

    const exportBlueprint = () => {
        const payload = {
            ...scenario,
            exportedAt: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], {
            type: "application/json",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${scenario.name.toLowerCase().replace(/\s+/g, "-") || "workflow"}-blueprint.json`;
        link.click();
        URL.revokeObjectURL(url);

        setMenuOpen(false);
        showToast("Blueprint exported");
    };

    const importBlueprint = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const content = await file.text();
            const parsed = JSON.parse(content);
            const nextScenario = normalizeScenario(parsed.scenario ?? parsed);

            setHistory((items) => [clone(scenario), ...items].slice(0, 50));
            setScenario(nextScenario);
            setSelectedNodeId(nextScenario.nodes[0]?.id ?? null);
            showToast("Blueprint imported");
        } catch {
            showToast("Invalid blueprint file");
        } finally {
            event.target.value = "";
            setMenuOpen(false);
        }
    };

    const copyBlueprint = async () => {
        try {
            await navigator.clipboard.writeText(
                JSON.stringify(scenario, null, 2),
            );
            showToast("Blueprint copied to clipboard");
        } catch {
            showToast("Clipboard is not available");
        }
        setMenuOpen(false);
    };

    const runScenario = () => {
        if (isRunning) return;

        setIsRunning(true);
        showToast("Running scenario...");

        window.clearTimeout(runTimeoutRef.current);
        runTimeoutRef.current = window.setTimeout(() => {
            setIsRunning(false);
            showToast("Scenario finished");
        }, 1500);
    };

    const undoLastChange = () => {
        setHistory((items) => {
            if (items.length === 0) {
                showToast("Nothing to undo");
                return items;
            }

            const [latest, ...rest] = items;
            setScenario(normalizeScenario(latest));
            return rest;
        });
    };

    const removeNode = (nodeId) => {
        commitScenario(
            (current) => ({
                ...current,
                nodes: current.nodes.filter((node) => node.id !== nodeId),
                links: current.links.filter(
                    (link) => link.from !== nodeId && link.to !== nodeId,
                ),
            }),
            "Step removed",
        );

        if (selectedNodeId === nodeId) {
            setSelectedNodeId(null);
        }
    };

    const addModule = (module, insert = null) => {
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        const nextId = makeId();

        commitScenario(
            (current) => {
                const fromId = insert?.fromId ?? selectedNodeId;
                const direction = insert?.direction ?? "right";
                const fromNode = current.nodes.find((node) => node.id === fromId);
                const outgoingCount = fromNode
                    ? current.links.filter((link) => link.from === fromNode.id)
                          .length
                    : 0;

                const canvasWidth = canvasRect?.width ?? 1000;
                const canvasHeight = canvasRect?.height ?? 650;

                const baseX = fromNode
                    ? fromNode.x
                    : Math.max(
                          CANVAS_PADDING,
                          canvasWidth / 2 -
                              NODE_WIDTH / 2 +
                              (current.nodes.length % 3) * 24,
                      );
                const baseY = fromNode
                    ? fromNode.y
                    : Math.max(
                          CANVAS_PADDING,
                          canvasHeight / 2 -
                              NODE_WIDTH / 2 +
                              (current.nodes.length % 3) * 18,
                      );

                const directionOffsets = {
                    right: {
                        dx: 200,
                        dy: outgoingCount === 0 ? 0 : outgoingCount * 105 - 52,
                    },
                    left: {
                        dx: -200,
                        dy: outgoingCount === 0 ? 0 : outgoingCount * 105 - 52,
                    },
                    up: { dx: 0, dy: -170 },
                    down: { dx: 0, dy: 170 },
                };
                const { dx, dy } =
                    directionOffsets[direction] ?? directionOffsets.right;

                const x = Math.max(
                    CANVAS_PADDING,
                    Math.min(
                        baseX + dx,
                        canvasWidth - NODE_WIDTH - CANVAS_PADDING,
                    ),
                );
                const y = Math.max(
                    CANVAS_PADDING,
                    Math.min(
                        baseY + dy,
                        canvasHeight - NODE_WIDTH - CANVAS_PADDING,
                    ),
                );

                return {
                    ...current,
                    nodes: [
                        ...current.nodes,
                        {
                            id: nextId,
                            label: module.label,
                            iconKey: module.iconKey,
                            accent: module.accent,
                            x,
                            y,
                        },
                    ],
                    links: fromNode
                        ? [
                              ...current.links,
                              {
                                  id: makeId(),
                                  from: fromNode.id,
                                  to: nextId,
                              },
                          ]
                        : current.links,
                };
            },
            `${module.label} added`,
        );

        setSelectedNodeId(nextId);
        setAddMode(false);
        setPendingInsert(null);
    };

    const addQuickStep = () => {
        const fromId = selectedNodeId ?? scenario.nodes[0]?.id ?? null;
        setPendingInsert(fromId ? { fromId, direction: "right" } : null);
        setAddMode(true);
    };

    const nodeMap = useMemo(
        () => Object.fromEntries(scenario.nodes.map((node) => [node.id, node])),
        [scenario.nodes],
    );

    const selectedNode = useMemo(
        () => scenario.nodes.find((node) => node.id === selectedNodeId) ?? null,
        [scenario.nodes, selectedNodeId],
    );

    const filteredSections = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return toolboxSections;

        return toolboxSections
            .map((section) => ({
                ...section,
                items: section.items.filter((item) =>
                    item.label.toLowerCase().includes(term),
                ),
            }))
            .filter((section) => section.items.length > 0);
    }, [search]);

    const connectionPaths = useMemo(() => {
        return scenario.links
            .map((link) => {
                const source = nodeMap[link.from];
                const target = nodeMap[link.to];
                if (!source || !target) return null;

                const startX = source.x + NODE_WIDTH / 2;
                const startY = source.y + NODE_BOX_SIZE / 2;
                const endX = target.x + NODE_WIDTH / 2;
                const endY = target.y + NODE_BOX_SIZE / 2;
                const curve = Math.max(90, Math.abs(endX - startX) / 2);

                return {
                    id: link.id,
                    d: `M ${startX} ${startY} C ${startX + curve} ${startY}, ${endX - curve} ${endY}, ${endX} ${endY}`,
                    active:
                        selectedNodeId &&
                        (link.from === selectedNodeId ||
                            link.to === selectedNodeId),
                };
            })
            .filter(Boolean);
    }, [scenario.links, nodeMap, selectedNodeId]);

    const insertSlots = useMemo(() => {
        if (!addMode) return null;
        const node = scenario.nodes.find((n) => n.id === selectedNodeId);
        if (!node) return null;

        const slotSize = 64;
        const offsets = {
            left: { dx: -200, dy: 0 },
            right: { dx: 200, dy: 0 },
            up: { dx: 0, dy: -170 },
            down: { dx: 0, dy: 170 },
        };

        const findOccupant = (candidateX, candidateY) => {
            const threshold = 70;
            return scenario.nodes.find((n) => {
                if (n.id === selectedNodeId) return false;
                return (
                    Math.abs(n.x - candidateX) < threshold &&
                    Math.abs(n.y - candidateY) < threshold
                );
            });
        };

        return Object.entries(offsets).map(([direction, { dx, dy }]) => {
            const candidateX = node.x + dx;
            const candidateY = node.y + dy;
            const occupant = findOccupant(candidateX, candidateY);

            return {
                direction,
                fromId: selectedNodeId,
                size: slotSize,
                x: candidateX + (NODE_WIDTH - slotSize) / 2,
                y: candidateY + (NODE_BOX_SIZE - slotSize) / 2,
                disabled: Boolean(occupant),
            };
        });
    }, [addMode, scenario.nodes, selectedNodeId]);

    return (
        <div className="wf-app-shell">
            <aside className="wf-sidebar">
                <div className="wf-sidebar-head">
                    <div>
                        <div className="wf-eyebrow">Workflow Studio</div>
                        <h1>Scenario Builder</h1>
                    </div>
                    <div className="wf-status-pill">Simple UI</div>
                </div>

                <div className="wf-search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search actions"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                {filteredSections.map((section) => (
                    <div className="wf-tool-section" key={section.title}>
                        <div className="wf-section-title">{section.title}</div>

                        <div className="wf-tool-list">
                            {section.items.map((item) => {
                                const Icon = iconMap[item.iconKey] ?? Sparkles;

                                return (
                                    <button
                                        key={`${section.title}-${item.label}`}
                                        className="wf-tool-card"
                                        onClick={() =>
                                            addModule(item, pendingInsert)
                                        }
                                    >
                                        <span
                                            className="wf-tool-icon"
                                            style={{
                                                "--accent":
                                                    accentColors[item.accent] ??
                                                    accentColors.violet,
                                            }}
                                        >
                                            <Icon size={18} />
                                        </span>
                                        <span className="wf-tool-label">
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </aside>

            <main className="wf-workspace">
                <header className="wf-topbar">
                    <div className="wf-topbar-left">
                        <div className="wf-topbar-row">
                            <button
                                type="button"
                                className="wf-back"
                                onClick={() => onBack?.()}
                            >
                                Back
                            </button>
                            <div className="wf-scenario-badge">Scenario</div>
                        </div>

                        <input
                            className="wf-scenario-name"
                            value={scenario.name}
                            onChange={(event) =>
                                setScenario((current) => ({
                                    ...current,
                                    name: event.target.value,
                                }))
                            }
                        />
                        <div className="wf-scenario-meta">
                            {scenario.nodes.length} steps • dotted canvas • local blueprint save
                        </div>
                    </div>

                    <div className="wf-topbar-right" ref={menuRef}>
                        <button
                            className="wf-menu-button"
                            onClick={() => setMenuOpen((prev) => !prev)}
                            aria-label="Menu"
                        >
                            <MoreHorizontal size={18} />
                        </button>

                        {menuOpen && (
                            <div className="wf-menu-dropdown">
                                <button
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <Upload size={16} />
                                    Import Blueprint
                                </button>
                                <button onClick={exportBlueprint}>
                                    <Download size={16} />
                                    Export Blueprint
                                </button>
                                <button onClick={copyBlueprint}>
                                    <Copy size={16} />
                                    Copy Blueprint
                                </button>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/json"
                            hidden
                            onChange={importBlueprint}
                        />
                    </div>
                </header>

                <section
                    ref={canvasRef}
                    className={`wf-canvas ${isRunning ? "is-running" : ""}`}
                    onClick={() => {
                        setSelectedNodeId(null);
                        setMenuOpen(false);
                        setAddMode(false);
                        setPendingInsert(null);
                    }}
                >
                    <svg className="wf-connections" width="100%" height="100%">
                        {connectionPaths.map((path) => (
                            <path
                                key={path.id}
                                d={path.d}
                                className={
                                    path.active
                                        ? "wf-connection active"
                                        : "wf-connection"
                                }
                            />
                        ))}
                    </svg>

                    {insertSlots?.map((slot) => (
                        <button
                            key={slot.direction}
                            type="button"
                            className={`wf-insert-slot ${
                                slot.disabled ? "disabled" : ""
                            } ${
                                pendingInsert?.direction === slot.direction
                                    ? "active"
                                    : ""
                            }`}
                            style={{
                                left: slot.x,
                                top: slot.y,
                                width: slot.size,
                                height: slot.size,
                            }}
                            disabled={slot.disabled}
                            onClick={(event) => {
                                event.stopPropagation();
                                setPendingInsert({
                                    fromId: slot.fromId,
                                    direction: slot.direction,
                                });
                            }}
                            aria-label={`Add step ${slot.direction}`}
                        >
                            <Plus size={28} />
                        </button>
                    ))}

                    {scenario.nodes.map((node) => {
                        const Icon = iconMap[node.iconKey] ?? Sparkles;
                        const isSelected = node.id === selectedNodeId;

                        return (
                            <div
                                key={node.id}
                                className={`wf-node ${
                                    isSelected ? "selected" : ""
                                }`}
                                style={{
                                    left: node.x,
                                    top: node.y,
                                    "--node-accent":
                                        accentColors[node.accent] ??
                                        accentColors.violet,
                                }}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedNodeId(node.id);
                                }}
                                onMouseDown={(event) => {
                                    event.stopPropagation();
                                    const rect =
                                        event.currentTarget.getBoundingClientRect();

                                    setDragging({
                                        id: node.id,
                                        offsetX: event.clientX - rect.left,
                                        offsetY: event.clientY - rect.top,
                                        snapshot: clone(scenario),
                                    });
                                }}
                            >
                                <button
                                    className={`wf-remove-node ${
                                        isSelected ? "visible" : ""
                                    }`}
                                    onMouseDown={(event) =>
                                        event.stopPropagation()
                                    }
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        removeNode(node.id);
                                    }}
                                    aria-label="Remove node"
                                >
                                    <X size={14} />
                                </button>

                                <div className="wf-node-box">
                                    <Icon size={28} />
                                </div>

                                <div className="wf-node-label">
                                    {node.label}
                                </div>
                            </div>
                        );
                    })}

                    <div className="wf-canvas-tip">
                        {selectedNode
                            ? `Selected: ${selectedNode.label}`
                            : "Tip: select any step, then click an item on the left to connect it"}
                    </div>
                </section>

                <aside className={`wf-notes ${notesOpen ? "open" : ""}`}>
                    <div className="wf-notes-header">
                        <div>
                            <div className="wf-eyebrow">Scenario Notes</div>
                            <h3>Blueprint Notes</h3>
                        </div>

                        <button
                            className="wf-notes-close"
                            onClick={() => setNotesOpen(false)}
                            aria-label="Close notes"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <textarea
                        placeholder="Add simple notes for this workflow..."
                        value={scenario.notes}
                        onChange={(event) =>
                            setScenario((current) => ({
                                ...current,
                                notes: event.target.value,
                            }))
                        }
                    />

                    <div className="wf-notes-foot">
                        Notes are saved in local storage with the blueprint.
                    </div>
                </aside>

                <div className="wf-bottom-toolbar">
                    <button
                        className={`wf-toolbar-btn primary ${
                            isRunning ? "running" : ""
                        }`}
                        onClick={runScenario}
                    >
                        <Play size={16} />
                        {isRunning ? "Running..." : "Run Scenario"}
                    </button>

                    <button className="wf-toolbar-btn" onClick={saveBlueprint}>
                        <Save size={16} />
                        Save
                    </button>

                    <button className="wf-toolbar-btn" onClick={undoLastChange}>
                        <RotateCcw size={16} />
                        Undo
                    </button>

                    <button
                        className={`wf-toolbar-btn ${
                            notesOpen ? "active" : ""
                        }`}
                        onClick={() => setNotesOpen((prev) => !prev)}
                    >
                        <FileText size={16} />
                        Notes
                    </button>

                    <button
                        className="wf-toolbar-btn add-btn"
                        onClick={() => {
                            if (addMode) {
                                setAddMode(false);
                                setPendingInsert(null);
                                return;
                            }
                            addQuickStep();
                        }}
                        aria-label="Add module"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                {toast && <div className="wf-toast">{toast}</div>}
            </main>
        </div>
    );
}
