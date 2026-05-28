import { useState, useEffect, useRef } from "react";
import type { Video, Invoice, ColumnKey, ColumnWidths } from "./types";
import {
  Plus,
  Circle,
  Trash2,
  Globe,
  ChevronDown,
  ChevronRight,
  Download,
  Upload,
  FileText,
  Calendar,
  Check,
  Copy,
  Sun,
  Moon,
  Pipette,
  GripVertical,
  Search,
} from "lucide-react";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
const STORAGE_KEY = "ugc_tracker_data";
const THEME_KEY = "ugc_tracker_theme";

const INITIAL_CREATORS = ["krystof"];

const TAG_COLOR_PRESETS = [
  "#64748b", // Gray
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#eab308", // Yellow
  "#84cc16", // Lime
  "#22c55e", // Green
  "#10b981", // Emerald
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#0ea5e9", // Sky
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#a855f7", // Purple
  "#d946ef", // Fuchsia
  "#ec4899", // Pink
  "#f43f5e", // Rose
];

const DEFAULT_TAG_CONFIGS: { name: string; color: string }[] = [
  { name: "recenze", color: "#10b981" },
  { name: "cz", color: "#22c55e" },
  { name: "cs", color: "#22c55e" },
  { name: "reels", color: "#a855f7" },
  { name: "titulky", color: "#8b5cf6" },
  { name: "feed", color: "#0ea5e9" },
  { name: "pub", color: "#3b82f6" },
  { name: "en", color: "#6366f1" },
];

const DEFAULT_COLUMN_ORDER: ColumnKey[] = [
  "title",
  "url",
  "status",
  "lang",
  "tags",
  "notes",
];

const DEFAULT_COLUMN_WIDTHS: ColumnWidths = {
  title: 250,
  url: 200,
  status: 220,
  lang: 140,
  tags: 200,
  notes: 180,
};

const SortableRow = ({
  video,
  selectedIds,
  toggleSelection,
  columnOrder,
  columnWidths,
  updateVideoField,
  editingField,
  setEditingField,
  showToast,
  deleteVideo,
  updateNotes,
  toggleVideoStep,
  renderTagSelector,
  getTagStyle,
  selectorRef,
}: {
  video: Video;
  selectedIds: string[];
  toggleSelection: (id: string) => void;
  columnOrder: ColumnKey[];
  columnWidths: ColumnWidths;
  updateVideoField: (id: string, field: keyof Video, value: any) => void;
  editingField: any;
  setEditingField: (val: any) => void;
  showToast: (m: string, s?: string) => void;
  deleteVideo: (id: string) => void;
  updateNotes: (id: string, n: string) => void;
  toggleVideoStep: (id: string, step: any) => void;
  renderTagSelector: any;
  getTagStyle: any;
  selectorRef: any;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 9999 : 1,
    opacity: isDragging ? 0.6 : 1,
    background: isDragging ? "var(--table-hover)" : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={editingField?.id === video.id ? "is-editing-row" : ""}
      {...attributes}
    >
      <td
        className="col-drag"
        {...listeners}
        style={{ cursor: "grab", width: "24px", textAlign: "center" }}
      >
        <GripVertical size={14} style={{ opacity: 0.3 }} />
      </td>
      <td className="col-select">
        <input
          type="checkbox"
          checked={selectedIds.includes(video.id)}
          onChange={() => toggleSelection(video.id)}
        />
      </td>
      {columnOrder.map((key) => {
        const width = columnWidths[key];
        switch (key) {
          case "title":
            return (
              <td key={key} className="col-title" style={{ width }}>
                <div className="title-edit-group">
                  <input
                    className="table-editable-field title-field"
                    value={video.title}
                    onChange={(e) =>
                      updateVideoField(video.id, "title", e.target.value)
                    }
                  />
                </div>
              </td>
            );
          case "url":
            const isEditingUrl =
              editingField?.id === video.id &&
              editingField?.field === "videoUrl";
            return (
              <td key={key} className="col-url" style={{ width }}>
                <div
                  className={`url-edit-wrapper ${isEditingUrl ? "is-editing" : ""}`}
                >
                  <input
                    className="table-editable-field url-field"
                    placeholder="Vložte odkaz..."
                    value={video.videoUrl || ""}
                    onFocus={() =>
                      setEditingField({
                        id: video.id,
                        field: "videoUrl",
                      })
                    }
                    onBlur={() => setEditingField(null)}
                    onChange={(e) =>
                      updateVideoField(video.id, "videoUrl", e.target.value)
                    }
                  />
                  {!isEditingUrl && video.videoUrl && (
                    <button
                      className="copy-link-btn"
                      title="Kopírovat cestu"
                      onClick={() => {
                        if (video.videoUrl) {
                          navigator.clipboard.writeText(video.videoUrl);
                          showToast(
                            "Cesta zkopírována! 🚀",
                            "Cmd+Shift+G ve Finderu",
                          );
                        }
                      }}
                    >
                      <Copy size={14} />
                    </button>
                  )}
                </div>
              </td>
            );
          case "status":
            return (
              <td key={key} className="col-status" style={{ width }}>
                <div className="table-checklist">
                  {[
                    {
                      key: "isDubbing",
                      label: "Dabing",
                    },
                    {
                      key: "isSubtitles",
                      label: "Titulky",
                    },
                    {
                      key: "isPublished",
                      label: "Pub",
                    },
                  ].map((step) => {
                    const isDone = video[step.key as keyof Video] as boolean;
                    return (
                      <div
                        key={step.key}
                        className={`table-check-item ${isDone ? "done" : ""} status-${step.key.replace("is", "").toLowerCase()}`}
                        onClick={() =>
                          toggleVideoStep(video.id, step.key as any)
                        }
                        title={step.label}
                      >
                        <Circle
                          size={16}
                          fill={isDone ? "currentColor" : "none"}
                        />
                      </div>
                    );
                  })}
                </div>
              </td>
            );
          case "lang":
            return (
              <td
                key={key}
                className="col-lang"
                style={{ width }}
                onClick={() =>
                  setEditingField({
                    id: video.id,
                    field: "language",
                  })
                }
              >
                {editingField?.id === video.id &&
                editingField?.field === "language" ? (
                  <div className="inline-selector-wrapper" ref={selectorRef}>
                    {renderTagSelector(
                      video.language,
                      (val: string) =>
                        updateVideoField(video.id, "language", val),
                      "lang",
                    )}
                    <button
                      className="close-selector-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingField(null);
                      }}
                    >
                      Hotovo
                    </button>
                  </div>
                ) : (
                  <div className="chips-container">
                    <Globe size={12} className="url-icon" />
                    {(video.language || "").split(",").map((l, i) => {
                      const tag = l.trim();
                      if (!tag) return null;
                      const { className, style } = getTagStyle(tag);
                      return (
                        <span
                          key={i}
                          className={`chip lang-chip ${className}`}
                          style={style}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                )}
              </td>
            );
          case "tags":
            return (
              <td
                key={key}
                className="col-tags"
                style={{ width }}
                onClick={() =>
                  setEditingField({
                    id: video.id,
                    field: "tags",
                  })
                }
              >
                {editingField?.id === video.id &&
                editingField?.field === "tags" ? (
                  <div className="inline-selector-wrapper" ref={selectorRef}>
                    {renderTagSelector(
                      video.tags,
                      (val: string) => updateVideoField(video.id, "tags", val),
                      "other",
                    )}
                    <button
                      className="close-selector-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingField(null);
                      }}
                    >
                      Hotovo
                    </button>
                  </div>
                ) : (
                  <div className="chips-container">
                    {(video.tags || "").split(",").map((t, i) => {
                      const tag = t.trim();
                      if (!tag) return null;
                      const { className, style } = getTagStyle(tag);
                      return (
                        <span
                          key={i}
                          className={`chip tag-chip ${className}`}
                          style={style}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                )}
              </td>
            );
          case "notes":
            return (
              <td key={key} className="col-notes" style={{ width }}>
                <div className="table-notes-container">
                  {editingField?.id === video.id &&
                  editingField?.field === "notes" ? (
                    <textarea
                      autoFocus
                      className="table-editable-notes"
                      placeholder="..."
                      value={video.notes}
                      onBlur={() => setEditingField(null)}
                      onChange={(e) => updateNotes(video.id, e.target.value)}
                    />
                  ) : (
                    <div
                      className="notes-preview"
                      onClick={() =>
                        setEditingField({
                          id: video.id,
                          field: "notes",
                        })
                      }
                      title={video.notes}
                    >
                      {video.notes || "..."}
                    </div>
                  )}
                </div>
              </td>
            );
          default:
            return null;
        }
      })}
      <td className="col-actions">
        <button
          onClick={() => deleteVideo(video.id)}
          className="delete-btn"
          title="Smazat"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
};

function App() {
  const [apps, setApps] = useState<string[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [creators, setCreators] = useState<string[]>(INITIAL_CREATORS);
  const [tagConfigs, setTagConfigs] =
    useState<{ name: string; color: string }[]>(DEFAULT_TAG_CONFIGS);
  const [columnOrder, setColumnOrder] =
    useState<ColumnKey[]>(DEFAULT_COLUMN_ORDER);
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(
    DEFAULT_COLUMN_WIDTHS,
  );
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [currentApp, setCurrentApp] = useState<string>("");
  const [collapsedCreators, setCollapsedCreators] = useState<string[]>([]);
  const [collapsedVideos, setCollapsedVideos] = useState<string[]>([]);
  const [collapsedInvoices, setCollapsedInvoices] = useState<string[]>([]);
  const [collapsedPublished, setCollapsedPublished] = useState<string[]>([]);
  const [invoiceLimits, setInvoiceLimits] = useState<Record<string, number>>(
    {},
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [editingField, setEditingField] = useState<{
    id: string;
    field: "tags" | "language" | "notes" | "videoUrl";
  } | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    submessage?: string;
    id: number;
  } | null>(null);
  const [globalSearch, setGlobalSearch] = useState("");

  const selectorRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef<{
    key: ColumnKey;
    startX: number;
    startWidth: number;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setVideos((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Column Resizing Logic
  const startResizing = (key: ColumnKey, e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(key);
    resizingRef.current = {
      key,
      startX: e.clientX,
      startWidth: columnWidths[key],
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizingRef.current || !appRef.current) return;
    const { key, startX, startWidth } = resizingRef.current;

    // Maximální šířka, kterou má tabulka k dispozici (vnitřní šířka šedého boxu)
    const containerWidth = appRef.current.clientWidth - 64; // 64px je padding (2rem + 2rem)

    // Šířka fixních sloupců, které nejsou v columnWidths (Select: 40px, Actions: 30px) + rezerva na bordery (cca 10px)
    const staticColumnsWidth = 40 + 30 + 10;

    // Součet šířek všech ostatních dynamických sloupců (kromě toho co měníme a kromě poznámek)
    const otherColumnsSum = Object.entries(columnWidths)
      .filter(([k]) => k !== key && k !== "notes")
      .reduce((sum, [_, w]) => sum + w, 0);

    // Rezerva pro flexibilní sloupec "Poznámky", aby nezmizel (min 180px)
    const minNotesWidth = 220;

    // x představuje limit, kam až můžeme sloupec rozšířit
    const x =
      containerWidth - staticColumnsWidth - otherColumnsSum - minNotesWidth;

    const deltaX = e.clientX - startX;
    const requestedWidth = startWidth + deltaX;

    // Výsledná šířka s ohledem na limit x, minimální 80px a maximální 700px
    const newWidth = Math.min(700, Math.max(80, Math.min(requestedWidth, x)));

    setColumnWidths((prev) => ({ ...prev, [key]: newWidth }));
  };

  const stopResizing = () => {
    setIsResizing(null);
    resizingRef.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
  };

  // Click outside to close selector
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node)
      ) {
        setEditingField(null);
      }
    };

    if (editingField) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingField]);

  const getTagStyle = (text: string) => {
    const t = text.toLowerCase().trim();

    // 1. Exact match (highest priority)
    let colorConfig = tagConfigs.find((c) => c.name.toLowerCase() === t);
    let color = colorConfig?.color;

    // 2. Smart partial match (word boundaries)
    if (!color) {
      for (const config of tagConfigs) {
        // Only match as a whole word or significant part to avoid "en" matching "recenze"
        const regex = new RegExp(`\\b${config.name}\\b`, "i");
        if (regex.test(t)) {
          color = config.color;
          break;
        }
      }
    }

    if (!color) return { className: "color-default" };

    // If it's a legacy class name, return it
    if (color.startsWith("color-")) return { className: color };

    // It's a HEX color - generate dynamic theme-aware styles
    return {
      className: "custom-color",
      style: {
        "--tag-bg": theme === "light" ? `${color}15` : `${color}25`,
        "--tag-text": color,
        "--tag-border": `${color}40`,
      } as React.CSSProperties,
    };
  };

  const showToast = (message: string, submessage?: string) => {
    const id = Date.now();
    setToast({ message, submessage, id });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 5000);
  };

  // Apply theme class
  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Filter State
  const [tagFilter, setTagFilter] = useState("");
  const [langFilter, setLangFilter] = useState("");

  // App Setup State
  const [tempApps, setTempApps] = useState(["", "", ""]);

  // Add Video Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCreatorManager, setShowCreatorManager] = useState(false);
  const [showAppManager, setShowAppManager] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [expandedTag, setExpandedTag] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState<string | null>(null);
  const [editingTagValue, setEditingTagValue] = useState("");
  const [newVideo, setNewVideo] = useState({
    title: "",
    creator: INITIAL_CREATORS[0],
    app: "",
    language: "",
    videoUrl: "",
    tags: "",
    notes: "",
  });

  const migrateTagConfigs = (saved: any) => {
    if (!saved) return DEFAULT_TAG_CONFIGS;
    if (Array.isArray(saved)) return saved;
    return Object.entries(saved).map(([name, color]) => ({
      name,
      color: color as string,
    }));
  };

  const migrateVideos = (videos: any[]) => {
    return (videos || []).map((v: any) => {
      let isDubbing = v.isDubbing ?? false;
      let isSubtitles = v.isSubtitles ?? false;
      let isPublished = v.isPublished ?? false;

      // If migrating from sequential status
      if (v.status !== undefined) {
        isDubbing =
          v.status === "dubbing" ||
          v.status === "subtitles" ||
          v.status === "published";
        isSubtitles = v.status === "subtitles" || v.status === "published";
        isPublished = v.status === "published";
      } else if (v.dubbingDone !== undefined) {
        isDubbing = v.dubbingDone;
        isSubtitles = v.subtitlesDone;
        isPublished = v.published;
      }

      const {
        status,
        dubbingDone,
        subtitlesDone,
        published,
        invoiceStatus,
        invoiceReceived,
        invoicePaid,
        ...rest
      } = v;

      let finalTags = v.tags;
      if (Array.isArray(v.tags)) {
        finalTags = v.tags.join(", ");
      } else if (v.tags === undefined || v.tags === null) {
        finalTags = "";
      }

      return { ...rest, isDubbing, isSubtitles, isPublished, tags: finalTags };
    });
  };

  // Load data
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as "light" | "dark";
    if (savedTheme) setTheme(savedTheme);

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const {
        apps,
        videos,
        invoices: savedInvoices,
        creators,
        tagConfigs: savedTagConfigs,
        currentApp,
        collapsedCreators,
        collapsedVideos: savedCollapsedVideos,
        collapsedInvoices: savedCollapsedInvoices,
        collapsedPublished: savedCollapsedPublished,
        columnOrder: savedColumnOrder,
        columnWidths: savedColumnWidths,
      } = parsed;

      setApps(apps || []);
      setVideos(migrateVideos(videos));
      setInvoices(savedInvoices || []);
      setCreators(creators || INITIAL_CREATORS);
      setTagConfigs(migrateTagConfigs(savedTagConfigs));
      setCurrentApp(currentApp || (apps && apps[0]) || "");

      setCollapsedCreators(collapsedCreators || []);
      setCollapsedVideos(savedCollapsedVideos || []);
      setCollapsedInvoices(savedCollapsedInvoices || []);
      setCollapsedPublished(savedCollapsedPublished || []);
      setColumnOrder(savedColumnOrder || DEFAULT_COLUMN_ORDER);
      setColumnWidths(savedColumnWidths || DEFAULT_COLUMN_WIDTHS);
      if (apps && apps.length > 0) setIsConfigured(true);
    }
  }, []);

  // Save data
  useEffect(() => {
    if (isConfigured) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          apps,
          videos,
          invoices,
          creators,
          tagConfigs,
          currentApp,
          collapsedCreators,
          collapsedVideos,
          collapsedInvoices,
          collapsedPublished,
          columnOrder,
          columnWidths,
        }),
      );
    }
  }, [
    apps,
    videos,
    invoices,
    creators,
    tagConfigs,
    currentApp,
    collapsedCreators,
    collapsedVideos,
    collapsedInvoices,
    collapsedPublished,
    columnOrder,
    columnWidths,
    isConfigured,
  ]);

  const toggleCollapse = (creator: string) => {
    setCollapsedCreators((prev) =>
      prev.includes(creator)
        ? prev.filter((c) => c !== creator)
        : [...prev, creator],
    );
  };

  const handleSetup = () => {
    const validApps = tempApps.filter((a) => a.trim() !== "");
    if (validApps.length > 0) {
      setApps(validApps);
      setCurrentApp(validApps[0]);
      setIsConfigured(true);
    }
  };

  const addApp = (name: string) => {
    if (name && !apps.includes(name)) {
      setApps([...apps, name]);
    }
  };

  const updateAppName = (oldName: string, newName: string) => {
    if (!newName || oldName === newName || apps.includes(newName)) return;

    setApps(apps.map((a) => (a === oldName ? newName : a)));
    if (currentApp === oldName) setCurrentApp(newName);

    // Migrate videos and invoices
    setVideos(
      videos.map((v) => (v.app === oldName ? { ...v, app: newName } : v)),
    );
    setInvoices(
      invoices.map((inv) =>
        inv.app === oldName ? { ...inv, app: newName } : inv,
      ),
    );
  };

  const deleteApp = (name: string) => {
    if (apps.length <= 1) {
      alert("Musíte mít alespoň jednu aplikaci.");
      return;
    }
    const appVideos = videos.filter((v) => v.app === name);
    if (appVideos.length > 0) {
      alert("Nelze smazat aplikaci, která má přiřazená videa.");
      return;
    }
    if (window.confirm(`Smazat aplikaci "${name}"?`)) {
      const newApps = apps.filter((a) => a !== name);
      setApps(newApps);
      if (currentApp === name) setCurrentApp(newApps[0]);
    }
  };

  const addVideo = () => {
    if (!newVideo.title) return;

    // Safety check: ensure the selected creator exists, otherwise use the first one available
    const finalCreator = creators.includes(newVideo.creator)
      ? newVideo.creator
      : creators[0] || "";

    if (!finalCreator) {
      alert(
        "Před přidáním videa musíte mít vytvořeného alespoň jednoho tvůrce.",
      );
      return;
    }

    const video: Video = {
      id: Date.now().toString(),
      title: newVideo.title,
      creator: finalCreator,
      app: currentApp,
      language: newVideo.language,
      videoUrl: newVideo.videoUrl,
      tags: newVideo.tags,
      notes: newVideo.notes,
      isDubbing: false,
      isSubtitles: false,
      isPublished: false,
      createdAt: Date.now(),
    };

    setVideos([video, ...videos]);
    setShowAddForm(false);
    // Reset form completely
    setNewVideo({
      title: "",
      creator: finalCreator,
      app: "",
      language: "",
      videoUrl: "",
      tags: "",
      notes: "",
    });
  };

  const toggleVideoStep = (
    id: string,
    step: "isDubbing" | "isSubtitles" | "isPublished",
  ) => {
    setVideos(
      videos.map((v) => {
        if (v.id === id) {
          return { ...v, [step]: !v[step] };
        }
        return v;
      }),
    );
  };

  const bulkUpdateStatus = (
    action: "reset" | "isDubbing" | "isSubtitles" | "isPublished",
  ) => {
    if (selectedIds.length === 0) return;
    setVideos(
      videos.map((v) => {
        if (!selectedIds.includes(v.id)) return v;
        if (action === "reset") {
          return {
            ...v,
            isDubbing: false,
            isSubtitles: false,
            isPublished: false,
          };
        }
        return { ...v, [action]: true };
      }),
    );
    setSelectedIds([]);
  };

  const bulkDeleteVideos = () => {
    if (selectedIds.length === 0) return;
    if (
      window.confirm(
        `Opravdu chcete smazat ${selectedIds.length} vybraných videí?`,
      )
    ) {
      setVideos(videos.filter((v) => !selectedIds.includes(v.id)));
      setSelectedIds([]);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const deleteVideo = (id: string) => {
    if (window.confirm("Opravdu smazat toto video?")) {
      setVideos(videos.filter((v) => v.id !== id));
    }
  };

  const updateNotes = (id: string, notes: string) => {
    setVideos(videos.map((v) => (v.id === id ? { ...v, notes } : v)));
  };

  const updateVideoField = (id: string, field: keyof Video, value: any) => {
    setVideos(
      videos.map((v) => {
        if (v.id === id) {
          return { ...v, [field]: value };
        }
        return v;
      }),
    );
  };
  const exportData = () => {
    const data = JSON.stringify(
      {
        apps,
        videos,
        invoices,
        creators,
        tagConfigs,
        currentApp,
        collapsedCreators,
        collapsedVideos,
        collapsedInvoices,
        collapsedPublished,
      },
      null,
      2,
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ugc-tracker-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);

        if (
          window.confirm(
            "Import dat nahradí všechna aktuální data. Chcete pokračovat?",
          )
        ) {
          // Robust video migration
          const migratedVideos = migrateVideos(imported.videos);

          setApps(imported.apps || []);
          setVideos(migratedVideos);
          setInvoices(imported.invoices || []);
          setCreators(imported.creators || INITIAL_CREATORS);
          setTagConfigs(migrateTagConfigs(imported.tagConfigs));
          setCurrentApp(
            imported.currentApp || (imported.apps && imported.apps[0]) || "",
          );
          setCollapsedCreators(imported.collapsedCreators || []);
          setCollapsedVideos(imported.collapsedVideos || []);
          setCollapsedInvoices(imported.collapsedInvoices || []);
          setCollapsedPublished(imported.collapsedPublished || []);
          setInvoiceLimits({}); // Reset limits on import
          setIsConfigured(true);
        }
      } catch (err) {
        alert(
          "Chyba při nahrávání souboru. Ujistěte se, že jde o platný JSON zálohy.",
        );
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const addCreator = (name: string) => {
    if (name && !creators.includes(name)) {
      setCreators([...creators, name]);
    }
  };

  const updateCreatorName = (oldName: string, newName: string) => {
    if (oldName === newName) return;
    if (newName && creators.includes(newName)) {
      // Don't alert while typing, just don't update if it's a duplicate of ANOTHER creator
      return;
    }

    setCreators(creators.map((c) => (c === oldName ? newName : c)));
    setVideos(
      videos.map((v) =>
        v.creator === oldName ? { ...v, creator: newName } : v,
      ),
    );
    setInvoices(
      invoices.map((inv) =>
        inv.creator === oldName ? { ...inv, creator: newName } : inv,
      ),
    );
    if (collapsedCreators.includes(oldName)) {
      setCollapsedCreators(
        collapsedCreators.map((c) => (c === oldName ? newName : c)),
      );
    }
    if (collapsedVideos.includes(oldName)) {
      setCollapsedVideos(
        collapsedVideos.map((c) => (c === oldName ? newName : c)),
      );
    }
    if (collapsedInvoices.includes(oldName)) {
      setCollapsedInvoices(
        collapsedInvoices.map((c) => (c === oldName ? newName : c)),
      );
    }
    if (collapsedPublished.includes(oldName)) {
      setCollapsedPublished(
        collapsedPublished.map((c) => (c === oldName ? newName : c)),
      );
    }
  };

  const deleteCreator = (name: string) => {
    const creatorVideos = videos.filter((v) => v.creator === name);
    if (creatorVideos.length > 0) {
      alert("Nelze smazat tvůrce, který má přiřazená videa.");
      return;
    }
    if (window.confirm(`Smazat tvůrce "${name}"?`)) {
      setCreators(creators.filter((c) => c !== name));
    }
  };

  const togglePublishedCollapse = (creator: string) => {
    setCollapsedPublished((prev) =>
      prev.includes(creator)
        ? prev.filter((c) => c !== creator)
        : [...prev, creator],
    );
  };

  const addInvoice = (creator: string) => {
    const date = new Date().toISOString().split("T")[0];
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      creator,
      app: currentApp,
      date,
      isReceived: false,
      isPaid: false,
    };
    setInvoices([newInvoice, ...invoices]);
  };

  const updateInvoice = (id: string, field: keyof Invoice, value: any) => {
    setInvoices(
      invoices.map((inv) => (inv.id === id ? { ...inv, [field]: value } : inv)),
    );
  };

  const toggleInvoiceStatus = (id: string) => {
    setInvoices(
      invoices.map((inv) => {
        if (inv.id !== id) return inv;

        // Cycle: Nothing -> Received -> Paid -> Nothing
        if (!inv.isReceived && !inv.isPaid) {
          return { ...inv, isReceived: true, isPaid: false };
        } else if (inv.isReceived && !inv.isPaid) {
          return { ...inv, isReceived: true, isPaid: true };
        } else {
          return { ...inv, isReceived: false, isPaid: false };
        }
      }),
    );
  };

  const deleteInvoice = (id: string) => {
    if (window.confirm("Opravdu smazat tuto fakturu?")) {
      setInvoices(invoices.filter((inv) => inv.id !== id));
    }
  };

  const toggleInvoiceCollapse = (creator: string) => {
    setCollapsedInvoices((prev) =>
      prev.includes(creator)
        ? prev.filter((c) => c !== creator)
        : [...prev, creator],
    );
  };

  const toggleVideosCollapse = (creator: string) => {
    setCollapsedVideos((prev) =>
      prev.includes(creator)
        ? prev.filter((c) => c !== creator)
        : [...prev, creator],
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    if (!year || !month || !day) return dateStr;
    return `${day}.${month}.${year}`;
  };

  const toggleTagInString = (currentStr: string, tag: string) => {
    const tags = currentStr
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");
    const index = tags.findIndex((t) => t.toLowerCase() === tag.toLowerCase());

    if (index > -1) {
      tags.splice(index, 1);
    } else {
      tags.push(tag);
    }
    return tags.join(", ");
  };

  const renderTagSelector = (
    currentValue: string,
    onToggle: (newValue: string) => void,
    filterType: "lang" | "other",
  ) => {
    const languages = ["cz", "cs", "en", "sk", "de", "fr", "es", "it", "pl"];
    const allConfigsForType = tagConfigs.filter((c) => {
      const isLang = languages.includes(c.name.toLowerCase().trim());
      return filterType === "lang" ? isLang : !isLang;
    });

    const activeTagNames = currentValue
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    const selectedTags = allConfigsForType.filter((c) =>
      activeTagNames.some((n) => n.toLowerCase() === c.name.toLowerCase()),
    );
    const availableTags = allConfigsForType.filter(
      (c) =>
        !activeTagNames.some((n) => n.toLowerCase() === c.name.toLowerCase()),
    );

    return (
      <div className="tag-selection-container">
        {selectedTags.length > 0 && (
          <div className="tag-group-area selected">
            <div className="tag-group-label">Vybrané:</div>
            <div className="tag-selector-grid">
              {selectedTags.map((t) => {
                const { className, style } = getTagStyle(t.name);
                return (
                  <span
                    key={t.name}
                    className={`chip selectable-chip active ${className}`}
                    style={style}
                    onClick={() =>
                      onToggle(toggleTagInString(currentValue, t.name))
                    }
                    title="Odebrat"
                  >
                    {t.name} ×
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="tag-group-area available">
          <div className="tag-group-label">K výběru:</div>
          <div className="tag-selector-grid">
            {availableTags.map((t) => {
              const { className } = getTagStyle(t.name);
              return (
                <span
                  key={t.name}
                  className={`chip selectable-chip ${className}`}
                  style={{ opacity: 0.7 }}
                  onClick={() =>
                    onToggle(toggleTagInString(currentValue, t.name))
                  }
                  title="Přidat"
                >
                  + {t.name}
                </span>
              );
            })}
            {availableTags.length === 0 && selectedTags.length === 0 && (
              <p className="no-tags-hint">Žádné tagy v nastavení.</p>
            )}
            {availableTags.length === 0 && selectedTags.length > 0 && (
              <p className="no-tags-hint">Všechny tagy vybrány.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleOpenAddForm = () => {
    setNewVideo({
      title: "",
      creator: creators[0] || "",
      app: "",
      language: "",
      videoUrl: "",
      tags: "",
      notes: "",
    });
    setShowAddForm(true);
  };

  const addTagConfig = (name: string) => {
    const cleanName = name.toLowerCase().trim();
    if (
      !cleanName ||
      tagConfigs.some((c) => c.name.toLowerCase() === cleanName)
    )
      return;
    setTagConfigs([...tagConfigs, { name: cleanName, color: "color-default" }]);
  };

  const updateTagColor = (name: string, colorClass: string) => {
    setTagConfigs(
      tagConfigs.map((c) =>
        c.name === name ? { ...c, color: colorClass } : c,
      ),
    );
  };

  const updateTagName = (oldName: string, newName: string) => {
    if (!newName || oldName === newName) return;
    const oldKey = oldName.toLowerCase().trim();
    const newKey = newName.toLowerCase().trim();

    if (tagConfigs.some((c) => c.name.toLowerCase() === newKey)) return;

    // 1. Update Configs Array (PRESERVES INDEX/ORDER)
    setTagConfigs(
      tagConfigs.map((c) => (c.name === oldName ? { ...c, name: newName } : c)),
    );

    // 2. Update Videos
    setVideos(
      videos.map((v) => {
        const migrate = (str: string) =>
          (str || "")
            .split(",")
            .map((p) =>
              p.trim().toLowerCase() === oldKey ? newName.trim() : p.trim(),
            )
            .join(", ");
        return {
          ...v,
          tags: migrate(v.tags),
          language: migrate(v.language),
        };
      }),
    );

    if (expandedTag === oldName) setExpandedTag(newName);
  };

  const deleteTagConfig = (name: string) => {
    setTagConfigs(tagConfigs.filter((c) => c.name !== name));
  };

  if (!isConfigured) {
    return (
      <div className="setup-container">
        <h1>UGC Production Tracker</h1>
        <p>Zadejte 3 aplikace, které budete sledovat:</p>
        {tempApps.map((app, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Aplikace ${i + 1}`}
            value={app}
            onChange={(e) => {
              const newTemp = [...tempApps];
              newTemp[i] = e.target.value;
              setTempApps(newTemp);
            }}
          />
        ))}
        <button
          onClick={handleSetup}
          disabled={tempApps.some((a) => !a.trim())}
        >
          Spustit Tracker
        </button>
      </div>
    );
  }

  return (
    <div className="app-container" ref={appRef}>
      <header>
        <div className="header-row top-row">
          <div className="app-title">
            <h1>UGC Tracker</h1>
          </div>
          <div className="header-actions">
            <div className="global-search-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Hledat napříč vším..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="global-search-input"
              />
              {globalSearch && (
                <button
                  className="clear-search"
                  onClick={() => setGlobalSearch("")}
                >
                  ×
                </button>
              )}
            </div>
            <div className="filters">
              <div className="filter-input-wrapper">
                <Globe size={14} className="filter-icon" />
                <input
                  type="text"
                  placeholder="Filtr jazyk..."
                  value={langFilter}
                  onChange={(e) => setLangFilter(e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-input-wrapper">
                <Plus
                  size={14}
                  className="filter-icon"
                  style={{ transform: "rotate(45deg)" }}
                />
                <input
                  type="text"
                  placeholder="Filtr tagy..."
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>
            <div className="data-actions">
              <button
                className="icon-btn"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                title={`Přepnout na ${theme === "dark" ? "světlý" : "tmavý"} režim`}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                className="icon-btn"
                onClick={exportData}
                title="Exportovat data (Záloha)"
              >
                <Download size={18} />
              </button>
              <label className="icon-btn" title="Importovat data">
                <Upload size={18} />
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  style={{ display: "none" }}
                />
              </label>
            </div>
            <div className="manage-buttons">
              <button
                className="add-btn secondary"
                onClick={() => setShowAppManager(true)}
              >
                Aplikace
              </button>
              <button
                className="add-btn secondary"
                onClick={() => setShowCreatorManager(true)}
              >
                Tvůrce
              </button>
              <button
                className="add-btn secondary"
                onClick={() => setShowTagManager(true)}
              >
                Jazyky / Tagy
              </button>
              <button className="add-btn" onClick={handleOpenAddForm}>
                <Plus size={20} /> Nové Video
              </button>
            </div>
          </div>
        </div>
        <div className="header-row tabs-row">
          <div className="app-tabs">
            {apps.map((app) => (
              <button
                key={app}
                className={`tab ${currentApp === app ? "active" : ""}`}
                onClick={() => setCurrentApp(app)}
              >
                {app}
              </button>
            ))}
          </div>
        </div>
      </header>

      {showTagManager && (
        <div className="modal">
          <div className="modal-content tag-manager-modal">
            <h2>Správa barev jazyků a tagů</h2>
            <div className="tag-configs-list">
              {(() => {
                const languages = [
                  "cz",
                  "cs",
                  "en",
                  "sk",
                  "de",
                  "fr",
                  "es",
                  "it",
                  "pl",
                ];
                const langConfigs = tagConfigs.filter((c) =>
                  languages.includes(c.name.toLowerCase().trim()),
                );
                const otherConfigs = tagConfigs.filter(
                  (c) => !languages.includes(c.name.toLowerCase().trim()),
                );

                const renderItem = ({
                  name,
                  color,
                }: {
                  name: string;
                  color: string;
                }) => (
                  <div key={name} className="tag-manage-item-wrapper">
                    <div
                      className={`tag-manage-item ${expandedTag === name ? "expanded" : ""}`}
                      onClick={() =>
                        setExpandedTag(expandedTag === name ? null : name)
                      }
                      title="Klikněte kamkoliv pro výběr barvy"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="tag-preview-toggle">
                        {(() => {
                          const { className, style } = getTagStyle(name);
                          const isEditing = editingTagName === name;

                          return (
                            <span
                              className={`chip ${className}`}
                              style={style}
                              onClick={(e) => {
                                if (!isEditing) {
                                  e.stopPropagation();
                                  setEditingTagName(name);
                                  setEditingTagValue(name);
                                }
                              }}
                              title="Klikněte pro úpravu názvu"
                            >
                              {isEditing ? (
                                <input
                                  autoFocus
                                  className="tag-manage-input-field"
                                  value={editingTagValue}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) =>
                                    setEditingTagValue(e.target.value)
                                  }
                                  onBlur={() => {
                                    updateTagName(name, editingTagValue);
                                    setEditingTagName(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      updateTagName(name, editingTagValue);
                                      setEditingTagName(null);
                                    }
                                    if (e.key === "Escape") {
                                      setEditingTagName(null);
                                    }
                                  }}
                                />
                              ) : (
                                name
                              )}
                            </span>
                          );
                        })()}
                        <ChevronDown
                          size={14}
                          className={`expand-icon ${expandedTag === name ? "rotated" : ""}`}
                        />
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTagConfig(name);
                        }}
                        className="delete-btn"
                        title="Smazat konfiguraci tagu"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {expandedTag === name && (
                      <div className="tag-color-controls-expanded">
                        <div className="color-presets-grid">
                          {TAG_COLOR_PRESETS.map((preset) => (
                            <div
                              key={preset}
                              className={`color-preset ${color === preset ? "active" : ""}`}
                              style={{ backgroundColor: preset }}
                              onClick={() => updateTagColor(name, preset)}
                              title={preset}
                            />
                          ))}
                        </div>
                        <div className="custom-color-picker">
                          <div className="picker-pipette-wrapper">
                            <Pipette size={14} className="pipette-icon" />
                            <input
                              type="color"
                              value={color.startsWith("#") ? color : "#64748b"}
                              onChange={(e) =>
                                updateTagColor(name, e.target.value)
                              }
                              title="Vybrat vlastní barvu"
                            />
                          </div>
                          <div className="hex-input-wrapper">
                            <span className="hex-hash">#</span>
                            <input
                              type="text"
                              className="hex-input"
                              value={color.replace("#", "")}
                              onChange={(e) => {
                                const val = e.target.value.trim();
                                if (val.length <= 6) {
                                  updateTagColor(name, `#${val}`);
                                }
                              }}
                              placeholder="HEX"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );

                return (
                  <>
                    {langConfigs.length > 0 && (
                      <div className="tag-manager-section">
                        <h3 className="tag-manager-section-title">Jazyky</h3>
                        {langConfigs.map(renderItem)}
                      </div>
                    )}
                    {langConfigs.length > 0 && otherConfigs.length > 0 && (
                      <div className="tag-manager-divider"></div>
                    )}
                    {otherConfigs.length > 0 && (
                      <div className="tag-manager-section">
                        <h3 className="tag-manager-section-title">Tagy</h3>
                        {otherConfigs.map(renderItem)}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            <button
              className="add-btn"
              onClick={() => {
                const name = window.prompt("Název nového tagu:");
                if (name) addTagConfig(name);
              }}
            >
              <Plus size={18} /> Přidat jazyk / tag
            </button>
            <div className="modal-actions">
              <button
                className="cancel"
                onClick={() => {
                  setShowTagManager(false);
                  setExpandedTag(null);
                }}
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreatorManager && (
        <div className="modal">
          <div className="modal-content">
            <h2>Správa Tvůrců</h2>
            <div className="creator-list">
              {creators.map((creator, index) => (
                <div key={index} className="creator-manage-item">
                  <input
                    className="creator-manage-input"
                    value={creator}
                    onChange={(e) => updateCreatorName(creator, e.target.value)}
                  />
                  <button
                    onClick={() => deleteCreator(creator)}
                    className="delete-btn"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="add-btn"
              onClick={() => {
                const name = window.prompt("Jméno nového tvůrce:");
                if (name) addCreator(name);
              }}
            >
              <Plus size={18} /> Přidat Tvůrce
            </button>
            <div className="modal-actions">
              <button
                className="cancel"
                onClick={() => setShowCreatorManager(false)}
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}

      {showAppManager && (
        <div className="modal">
          <div className="modal-content">
            <h2>Správa Aplikací</h2>
            <div className="creator-list">
              {apps.map((app, index) => (
                <div key={index} className="creator-manage-item">
                  <input
                    className="creator-manage-input"
                    value={app}
                    onChange={(e) => updateAppName(app, e.target.value)}
                  />
                  <button onClick={() => deleteApp(app)} className="delete-btn">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="add-btn"
              onClick={() => {
                const name = window.prompt("Název nové aplikace:");
                if (name) addApp(name);
              }}
            >
              <Plus size={18} /> Přidat Aplikaci
            </button>
            <div className="modal-actions">
              <button
                className="cancel"
                onClick={() => setShowAppManager(false)}
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Nové Video do: {currentApp}</h2>
            <input
              type="text"
              placeholder="Název videa"
              value={newVideo.title}
              onChange={(e) =>
                setNewVideo({ ...newVideo, title: e.target.value })
              }
            />
            <select
              value={newVideo.creator}
              onChange={(e) =>
                setNewVideo({ ...newVideo, creator: e.target.value })
              }
            >
              {creators.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="odkaz na cestu k videu"
              value={newVideo.videoUrl}
              onChange={(e) =>
                setNewVideo({ ...newVideo, videoUrl: e.target.value })
              }
            />

            <textarea
              placeholder="Poznámky"
              value={newVideo.notes}
              onChange={(e) =>
                setNewVideo({ ...newVideo, notes: e.target.value })
              }
            />
            <div className="modal-actions">
              <button onClick={addVideo}>Přidat</button>
              <button className="cancel" onClick={() => setShowAddForm(false)}>
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}

      <main>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {selectedIds.length > 0 && (
            <div className="bulk-actions-bar">
              <span className="selection-count">
                Vybráno: {selectedIds.length} videí
              </span>
              <div className="bulk-buttons">
                <button
                  className="bulk-btn ready"
                  onClick={() => bulkUpdateStatus("reset")}
                >
                  Reset (Ready)
                </button>
                <button
                  className="bulk-btn dubbing"
                  onClick={() => bulkUpdateStatus("isDubbing")}
                >
                  Dabing
                </button>
                <button
                  className="bulk-btn subtitles"
                  onClick={() => bulkUpdateStatus("isSubtitles")}
                >
                  Titulky
                </button>
                <button
                  className="bulk-btn published"
                  onClick={() => bulkUpdateStatus("isPublished")}
                >
                  Publikovat
                </button>
                <button
                  className="bulk-btn delete-all"
                  onClick={bulkDeleteVideos}
                >
                  Smazat vybrané
                </button>
                <button
                  className="bulk-btn cancel"
                  onClick={() => setSelectedIds([])}
                >
                  Zrušit výběr
                </button>
              </div>
            </div>
          )}
          {creators.map((creator, index) => {
            // All videos for this creator in current app (for correct summary counts)
            const allCreatorVideos = videos.filter(
              (v) => v.creator === creator && v.app === currentApp,
            );

            // Filter videos by tag/lang filters AND global search
            const filteredVideos = allCreatorVideos.filter((v) => {
              const matchesLang = langFilter
                ? (v.language || "")
                    .toLowerCase()
                    .includes(langFilter.toLowerCase())
                : true;
              const matchesTags = tagFilter
                ? (v.tags || "").toLowerCase().includes(tagFilter.toLowerCase())
                : true;

              const matchesGlobal = globalSearch
                ? [v.title, v.videoUrl || "", v.notes]
                    .some(field => field.toLowerCase().includes(globalSearch.toLowerCase()))
                : true;

              return matchesLang && matchesTags && matchesGlobal;
            });

            // If filters are active and no videos match, hide the section
            const isFiltering = langFilter !== "" || tagFilter !== "" || globalSearch !== "";
            if (isFiltering && filteredVideos.length === 0) return null;

            const todoVideos = filteredVideos.filter((v) => !v.isPublished);
            const doneVideos = filteredVideos.filter((v) => v.isPublished);

            const isCollapsed = collapsedCreators.includes(creator);
            const totalPublishedCount = allCreatorVideos.filter(
              (v) => v.isPublished,
            ).length;

            const creatorInvoices = invoices.filter(
              (inv) => inv.creator === creator && inv.app === currentApp,
            );
            const paidInvoicesCount = creatorInvoices.filter(
              (inv) => inv.isPaid,
            ).length;

            const isEditingInSection = allCreatorVideos.some(
              (v) => editingField?.id === v.id,
            );

            return (
              <section
                key={index}
                className={`creator-section ${isCollapsed ? "collapsed" : ""} ${isEditingInSection ? "is-editing-section" : ""}`}
              >
                {" "}
                <div
                  className="creator-header"
                  onClick={() => toggleCollapse(creator)}
                >
                  <div className="creator-title">
                    {isCollapsed ? (
                      <ChevronRight size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                    <input
                      className="creator-name-input"
                      value={creator}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        updateCreatorName(creator, e.target.value)
                      }
                    />
                  </div>
                  {isCollapsed && (
                    <div className="creator-summary">
                      <span className="summary-item">
                        <Circle size={14} fill="currentColor" />{" "}
                        {totalPublishedCount}/{allCreatorVideos.length}{" "}
                        Publikováno
                      </span>
                      <span className="summary-item">
                        <FileText size={14} /> {paidInvoicesCount}/
                        {creatorInvoices.length} Zaplaceno
                      </span>
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <>
                    <div className="section-group">
                      <div
                        className="section-header"
                        onClick={() => toggleVideosCollapse(creator)}
                      >
                        <div className="section-title">
                          <Circle size={14} fill="currentColor" />
                          <span>Nepublikovaná videa</span>
                          {collapsedVideos.includes(creator) ? (
                            <ChevronRight size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </div>
                      </div>

                      {!collapsedVideos.includes(creator) && (
                        <div className="video-table-container">
                          {todoVideos.length === 0 ? (
                            <p className="no-videos">
                              {isFiltering
                                ? "Žádná nepublikovaná videa nevyhovují filtrům."
                                : "Všechna videa jsou publikována! 🎉"}
                            </p>
                          ) : (
                            <table>
                              <thead>
                                <tr>
                                  <th
                                    className="col-drag"
                                    style={{ width: "24px" }}
                                  ></th>
                                  <th className="col-select">
                                    {" "}
                                    <input
                                      type="checkbox"
                                      checked={
                                        todoVideos.length > 0 &&
                                        todoVideos.every((v) =>
                                          selectedIds.includes(v.id),
                                        )
                                      }
                                      onChange={(e) => {
                                        const ids = todoVideos.map((v) => v.id);
                                        if (e.target.checked) {
                                          setSelectedIds((prev) => [
                                            ...new Set([...prev, ...ids]),
                                          ]);
                                        } else {
                                          setSelectedIds((prev) =>
                                            prev.filter(
                                              (id) => !ids.includes(id),
                                            ),
                                          );
                                        }
                                      }}
                                    />
                                  </th>
                                  {columnOrder.map((key) => {
                                    const width = columnWidths[key];
                                    const resizer = (
                                      <div
                                        className={`resizer ${isResizing === key ? "is-resizing" : ""}`}
                                        onMouseDown={(e) =>
                                          startResizing(key, e)
                                        }
                                      />
                                    );

                                    switch (key) {
                                      case "title":
                                        return (
                                          <th
                                            key={key}
                                            className="col-title"
                                            style={{ width }}
                                          >
                                            <span>Název</span>
                                            {resizer}
                                          </th>
                                        );
                                      case "url":
                                        return (
                                          <th
                                            key={key}
                                            className="col-url"
                                            style={{ width }}
                                          >
                                            <span>Odkaz</span>
                                            {resizer}
                                          </th>
                                        );
                                      case "status":
                                        return (
                                          <th
                                            key={key}
                                            className="col-status"
                                            style={{ width }}
                                          >
                                            <div className="header-workflow">
                                              <span className="stage-dubbing">
                                                Dabing
                                              </span>
                                              <ChevronRight
                                                size={14}
                                                className="separator"
                                              />
                                              <span className="stage-subtitles">
                                                Titulky
                                              </span>
                                              <ChevronRight
                                                size={14}
                                                className="separator"
                                              />
                                              <span className="stage-published">
                                                Publikováno
                                              </span>
                                            </div>
                                            {resizer}
                                          </th>
                                        );
                                      case "lang":
                                        return (
                                          <th
                                            key={key}
                                            className="col-lang"
                                            style={{ width }}
                                          >
                                            <span>Jazyk</span>
                                            {resizer}
                                          </th>
                                        );
                                      case "tags":
                                        return (
                                          <th
                                            key={key}
                                            className="col-tags"
                                            style={{ width }}
                                          >
                                            <span>Tagy</span>
                                            {resizer}
                                          </th>
                                        );
                                      case "notes":
                                        return (
                                          <th key={key} className="col-notes">
                                            <span>Poznámky</span>
                                          </th>
                                        );
                                      default:
                                        return null;
                                    }
                                  })}
                                  <th className="col-actions"></th>
                                </tr>
                              </thead>
                              <SortableContext
                                items={todoVideos.map((v) => v.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                <tbody>
                                  {todoVideos.map((video) => (
                                    <SortableRow
                                      key={video.id}
                                      video={video}
                                      selectedIds={selectedIds}
                                      toggleSelection={toggleSelection}
                                      columnOrder={columnOrder}
                                      columnWidths={columnWidths}
                                      updateVideoField={updateVideoField}
                                      editingField={editingField}
                                      setEditingField={setEditingField}
                                      showToast={showToast}
                                      deleteVideo={deleteVideo}
                                      updateNotes={updateNotes}
                                      toggleVideoStep={toggleVideoStep}
                                      renderTagSelector={renderTagSelector}
                                      getTagStyle={getTagStyle}
                                      selectorRef={selectorRef}
                                    />
                                  ))}
                                </tbody>
                              </SortableContext>
                            </table>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Published Videos Section */}
                    {doneVideos.length > 0 && (
                      <div className="section-group published-section">
                        <div
                          className="section-header"
                          onClick={() => togglePublishedCollapse(creator)}
                        >
                          <div className="section-title">
                            <Circle size={14} fill="#10b981" />
                            <span>Publikovaná videa</span>
                            {collapsedPublished.includes(creator) ? (
                              <ChevronRight size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </div>
                        </div>

                        {!collapsedPublished.includes(creator) && (
                          <div className="video-table-container">
                            <table>
                              <thead>
                                <tr>
                                  <th
                                    className="col-drag"
                                    style={{ width: "24px" }}
                                  ></th>
                                  <th className="col-select">
                                    {" "}
                                    <input
                                      type="checkbox"
                                      checked={
                                        doneVideos.length > 0 &&
                                        doneVideos.every((v) =>
                                          selectedIds.includes(v.id),
                                        )
                                      }
                                      onChange={(e) => {
                                        const ids = doneVideos.map((v) => v.id);
                                        if (e.target.checked) {
                                          setSelectedIds((prev) => [
                                            ...new Set([...prev, ...ids]),
                                          ]);
                                        } else {
                                          setSelectedIds((prev) =>
                                            prev.filter(
                                              (id) => !ids.includes(id),
                                            ),
                                          );
                                        }
                                      }}
                                    />
                                  </th>
                                  {columnOrder.map((key) => {
                                    const width = columnWidths[key];
                                    const resizer = (
                                      <div
                                        className={`resizer ${isResizing === key ? "is-resizing" : ""}`}
                                        onMouseDown={(e) =>
                                          startResizing(key, e)
                                        }
                                      />
                                    );

                                    switch (key) {
                                      case "title":
                                        return (
                                          <th
                                            key={key}
                                            className="col-title"
                                            style={{ width }}
                                          >
                                            <span>Název</span>
                                            {resizer}
                                          </th>
                                        );
                                      case "url":
                                        return (
                                          <th
                                            key={key}
                                            className="col-url"
                                            style={{ width }}
                                          >
                                            <span>Odkaz</span>
                                            {resizer}
                                          </th>
                                        );
                                      case "status":
                                        return (
                                          <th
                                            key={key}
                                            className="col-status"
                                            style={{ width }}
                                          >
                                            <span>Stav</span>
                                            {resizer}
                                          </th>
                                        );
                                      case "lang":
                                        return (
                                          <th
                                            key={key}
                                            className="col-lang"
                                            style={{ width }}
                                          >
                                            <span>Jazyk</span>
                                            {resizer}
                                          </th>
                                        );
                                      case "tags":
                                        return (
                                          <th
                                            key={key}
                                            className="col-tags"
                                            style={{ width }}
                                          >
                                            <span>Tagy</span>
                                            {resizer}
                                          </th>
                                        );
                                      case "notes":
                                        return (
                                          <th key={key} className="col-notes">
                                            <span>Poznámky</span>
                                          </th>
                                        );
                                      default:
                                        return null;
                                    }
                                  })}
                                  <th className="col-actions"></th>
                                </tr>
                              </thead>
                              <SortableContext
                                items={doneVideos.map((v) => v.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                <tbody>
                                  {doneVideos.map((video) => (
                                    <SortableRow
                                      key={video.id}
                                      video={video}
                                      selectedIds={selectedIds}
                                      toggleSelection={toggleSelection}
                                      columnOrder={columnOrder}
                                      columnWidths={columnWidths}
                                      updateVideoField={updateVideoField}
                                      editingField={editingField}
                                      setEditingField={setEditingField}
                                      showToast={showToast}
                                      deleteVideo={deleteVideo}
                                      updateNotes={updateNotes}
                                      toggleVideoStep={toggleVideoStep}
                                      renderTagSelector={renderTagSelector}
                                      getTagStyle={getTagStyle}
                                      selectorRef={selectorRef}
                                    />
                                  ))}
                                </tbody>
                              </SortableContext>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Invoices Section */}
                    <div className="invoices-section">
                      <div
                        className="invoices-header"
                        onClick={() => toggleInvoiceCollapse(creator)}
                      >
                        <div className="invoices-title">
                          <FileText size={16} />
                          <span>Faktury</span>
                          {collapsedInvoices.includes(creator) ? (
                            <ChevronRight size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </div>
                      </div>

                      {!collapsedInvoices.includes(creator) && (
                        <div className="invoices-content">
                          <button
                            className="add-invoice-btn"
                            style={{ marginBottom: "1rem" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              addInvoice(creator);
                            }}
                            title="Přidat novou fakturu"
                          >
                            <Plus size={14} /> Přidat fakturu
                          </button>
                          {(() => {
                            const creatorInvoices = invoices
                              .filter(
                                (inv) =>
                                  inv.creator === creator &&
                                  inv.app === currentApp,
                              )
                              .sort(
                                (a, b) =>
                                  new Date(b.date).getTime() -
                                  new Date(a.date).getTime(),
                              );

                            if (creatorInvoices.length === 0) {
                              return (
                                <p className="no-invoices">Žádné faktury.</p>
                              );
                            }

                            const currentLimit = invoiceLimits[creator] || 5;
                            const visibleInvoices = creatorInvoices.slice(
                              0,
                              currentLimit,
                            );

                            return (
                              <>
                                <table className="invoices-table">
                                  <thead>
                                    <tr>
                                      <th>Datum</th>
                                      <th>Stav</th>
                                      <th style={{ width: "50px" }}></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {visibleInvoices.map((inv) => (
                                      <tr key={inv.id}>
                                        <td>
                                          <div className="invoice-date-cell">
                                            <Calendar
                                              size={14}
                                              className="field-icon"
                                            />
                                            <div
                                              className="invoice-date-wrapper"
                                              onClick={(e) => {
                                                const input =
                                                  e.currentTarget.querySelector(
                                                    "input",
                                                  );
                                                if (
                                                  input &&
                                                  "showPicker" in input
                                                ) {
                                                  try {
                                                    (input as any).showPicker();
                                                  } catch (err) {
                                                    input.focus();
                                                  }
                                                }
                                              }}
                                            >
                                              <span className="invoice-date-display">
                                                {formatDate(inv.date)}
                                              </span>
                                              <input
                                                type="date"
                                                className="invoice-date-input"
                                                value={inv.date}
                                                onChange={(e) =>
                                                  updateInvoice(
                                                    inv.id,
                                                    "date",
                                                    e.target.value,
                                                  )
                                                }
                                              />
                                            </div>
                                          </div>
                                        </td>{" "}
                                        <td>
                                          <div
                                            className="invoice-status-cycle"
                                            onClick={() =>
                                              toggleInvoiceStatus(inv.id)
                                            }
                                          >
                                            {!inv.isReceived && !inv.isPaid && (
                                              <span className="status-chip empty">
                                                Žádný stav
                                              </span>
                                            )}
                                            {inv.isReceived && !inv.isPaid && (
                                              <span className="status-chip active received">
                                                <Check size={12} /> Přijato
                                              </span>
                                            )}
                                            {inv.isPaid && (
                                              <span className="status-chip active paid">
                                                <Check size={12} /> Zaplaceno
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="col-actions">
                                          <button
                                            onClick={() =>
                                              deleteInvoice(inv.id)
                                            }
                                            className="delete-btn"
                                            title="Smazat fakturu"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                <div className="invoice-pagination-controls">
                                  {creatorInvoices.length > currentLimit && (
                                    <button
                                      className="show-more-invoices"
                                      onClick={() =>
                                        setInvoiceLimits((prev) => ({
                                          ...prev,
                                          [creator]: currentLimit + 5,
                                        }))
                                      }
                                    >
                                      Zobrazit dalších 5 (zbývá{" "}
                                      {creatorInvoices.length - currentLimit})
                                    </button>
                                  )}
                                  {currentLimit > 5 && (
                                    <button
                                      className="show-more-invoices secondary"
                                      onClick={() =>
                                        setInvoiceLimits((prev) => ({
                                          ...prev,
                                          [creator]: 5,
                                        }))
                                      }
                                    >
                                      Zobrazit méně
                                    </button>
                                  )}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </section>
            );
          })}

          {videos.length === 0 && (
            <div className="empty-state">
              <p>Zatím žádná videa. Klikněte na "Nové Video" pro začátek.</p>
            </div>
          )}
        </DndContext>
      </main>

      {toast && (
        <div className="toast-container">
          <div className="toast">
            <div className="toast-message">{toast.message}</div>
            {toast.submessage && (
              <div className="toast-submessage">{toast.submessage}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
