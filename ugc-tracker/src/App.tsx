import { useState, useEffect } from "react";
import type { Video, ProductionStatus, Invoice } from "./types";
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
} from "lucide-react";
const STORAGE_KEY = "ugc_tracker_data";

const INITIAL_CREATORS = ["krystof"];

function App() {
  const [apps, setApps] = useState<string[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [creators, setCreators] = useState<string[]>(INITIAL_CREATORS);
  const [currentApp, setCurrentApp] = useState<string>("");
  const [collapsedCreators, setCollapsedCreators] = useState<string[]>([]);
  const [collapsedVideos, setCollapsedVideos] = useState<string[]>([]);
  const [collapsedInvoices, setCollapsedInvoices] = useState<string[]>([]);
  const [collapsedPublished, setCollapsedPublished] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);

  // Filter State
  const [tagFilter, setTagFilter] = useState("");
  const [langFilter, setLangFilter] = useState("");

  // App Setup State
  const [tempApps, setTempApps] = useState(["", "", ""]);

  // Add Video Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCreatorManager, setShowCreatorManager] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: "",
    creator: INITIAL_CREATORS[0],
    app: "",
    language: "",
    videoUrl: "",
    tags: "",
    notes: "",
  });

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const {
        apps,
        videos,
        invoices: savedInvoices,
        creators,
        currentApp,
        collapsedCreators,
        collapsedVideos: savedCollapsedVideos,
        collapsedInvoices: savedCollapsedInvoices,
        collapsedPublished: savedCollapsedPublished,
      } = JSON.parse(saved);

      // Migrate back to single status if needed, remove invoice data
      const migratedVideos = (videos || []).map((v: any) => {
        let finalStatus = v.status;
        if (!v.status) {
          finalStatus = "dubbing";
          if (v.published) finalStatus = "published";
          else if (v.subtitlesDone) finalStatus = "subtitles";
        }

        const {
          dubbingDone,
          subtitlesDone,
          published,
          invoiceStatus,
          invoiceReceived,
          invoicePaid,
          ...rest
        } = v;

        // Ensure tags is a string
        let finalTags = v.tags;
        if (Array.isArray(v.tags)) {
          finalTags = v.tags.join(", ");
        } else if (v.tags === undefined || v.tags === null) {
          finalTags = "";
        }

        return { ...rest, status: finalStatus, tags: finalTags };
      });

      setApps(apps || []);
      setVideos(migratedVideos);
      setInvoices(savedInvoices || []);
      setCreators(creators || INITIAL_CREATORS);
      setCurrentApp(currentApp || (apps && apps[0]) || "");
      setCollapsedCreators(collapsedCreators || []);
      setCollapsedVideos(savedCollapsedVideos || []);
      setCollapsedInvoices(savedCollapsedInvoices || []);
      setCollapsedPublished(savedCollapsedPublished || []);
      if (apps && apps.length === 3) setIsConfigured(true);
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
          currentApp,
          collapsedCreators,
          collapsedVideos,
          collapsedInvoices,
          collapsedPublished,
        }),
      );
    }
  }, [
    apps,
    videos,
    invoices,
    creators,
    currentApp,
    collapsedCreators,
    collapsedVideos,
    collapsedInvoices,
    collapsedPublished,
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
    if (tempApps.every((a) => a.trim() !== "")) {
      setApps(tempApps);
      setCurrentApp(tempApps[0]);
      setIsConfigured(true);
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
      status: "ready",
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

  const toggleStatus = (id: string, currentStatus: ProductionStatus) => {
    const statuses: ProductionStatus[] = [
      "ready",
      "dubbing",
      "subtitles",
      "published",
    ];
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];

    setVideos(
      videos.map((v) => (v.id === id ? { ...v, status: nextStatus } : v)),
    );
  };

  const bulkUpdateStatus = (targetStatus: ProductionStatus) => {
    if (selectedIds.length === 0) return;
    setVideos(
      videos.map((v) =>
        selectedIds.includes(v.id) ? { ...v, status: targetStatus } : v,
      ),
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
      { apps, videos, creators, currentApp, collapsedCreators },
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
          setApps(imported.apps || []);
          setVideos(imported.videos || []);
          setCreators(imported.creators || INITIAL_CREATORS);
          setCurrentApp(
            imported.currentApp || (imported.apps && imported.apps[0]) || "",
          );
          setCollapsedCreators(imported.collapsedCreators || []);
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
    <div className="app-container">
      <header>
        <div className="app-title">
          <h1>UGC Tracker</h1>
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
        <div className="header-actions">
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
          <button
            className="add-btn secondary"
            onClick={() => setShowCreatorManager(true)}
          >
            Spravovat Tvůrce
          </button>
          <button className="add-btn" onClick={handleOpenAddForm}>
            <Plus size={20} /> Nové Video
          </button>
        </div>
      </header>

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
            <input
              type="text"
              placeholder="Jazyk (např. CZ -> EN)"
              value={newVideo.language}
              onChange={(e) =>
                setNewVideo({ ...newVideo, language: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Tagy (oddělené čárkou)"
              value={newVideo.tags}
              onChange={(e) =>
                setNewVideo({ ...newVideo, tags: e.target.value })
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
        {selectedIds.length > 0 && (
          <div className="bulk-actions-bar">
            <span className="selection-count">
              Vybráno: {selectedIds.length} videí
            </span>
            <div className="bulk-buttons">
              <button
                className="bulk-btn ready"
                onClick={() => bulkUpdateStatus("ready")}
              >
                Reset (Ready)
              </button>
              <button
                className="bulk-btn dubbing"
                onClick={() => bulkUpdateStatus("dubbing")}
              >
                Dabing
              </button>
              <button
                className="bulk-btn subtitles"
                onClick={() => bulkUpdateStatus("subtitles")}
              >
                Titulky
              </button>
              <button
                className="bulk-btn published"
                onClick={() => bulkUpdateStatus("published")}
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

          if (allCreatorVideos.length === 0) return null;

          // Filter videos by tag/lang filters for display
          const filteredVideos = allCreatorVideos.filter((v) => {
            const matchesLang = langFilter
              ? (v.language || "")
                  .toLowerCase()
                  .includes(langFilter.toLowerCase())
              : true;
            const matchesTags = tagFilter
              ? (v.tags || "").toLowerCase().includes(tagFilter.toLowerCase())
              : true;
            return matchesLang && matchesTags;
          });

          // If filters are active and no videos match, hide the section
          const isFiltering = langFilter !== "" || tagFilter !== "";
          if (isFiltering && filteredVideos.length === 0) return null;

          const todoVideos = filteredVideos.filter(
            (v) => v.status !== "published",
          );
          const doneVideos = filteredVideos.filter(
            (v) => v.status === "published",
          );

          const isCollapsed = collapsedCreators.includes(creator);
          const totalPublishedCount = allCreatorVideos.filter(
            (v) => v.status === "published",
          ).length;

          const creatorInvoices = invoices.filter(
            (inv) => inv.creator === creator && inv.app === currentApp,
          );
          const paidInvoicesCount = creatorInvoices.filter(
            (inv) => inv.isPaid,
          ).length;

          return (
            <section
              key={index}
              className={`creator-section ${isCollapsed ? "collapsed" : ""}`}
            >
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
                    onChange={(e) => updateCreatorName(creator, e.target.value)}
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
                                <th className="col-select">
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
                                <th className="col-title">Název</th>{" "}
                                <th className="col-status">
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
                                      Publiko
                                    </span>
                                  </div>
                                </th>
                                <th className="col-lang">Jazyk</th>
                                <th className="col-tags">Tagy</th>
                                <th className="col-notes">Poznámky</th>
                                <th className="col-actions"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {todoVideos.map((video) => (
                                <tr key={video.id}>
                                  <td className="col-select">
                                    <input
                                      type="checkbox"
                                      checked={selectedIds.includes(video.id)}
                                      onChange={() => toggleSelection(video.id)}
                                    />
                                  </td>
                                  <td className="col-title">
                                    <div className="title-edit-group">
                                      <input
                                        className="table-editable-field title-field"
                                        value={video.title}
                                        onChange={(e) =>
                                          updateVideoField(
                                            video.id,
                                            "title",
                                            e.target.value,
                                          )
                                        }
                                      />
                                      <div className="url-edit-wrapper">
                                        <input
                                          className="table-editable-field url-field"
                                          placeholder="Vložte odkaz nebo cestu..."
                                          value={video.videoUrl || ""}
                                          onChange={(e) =>
                                            updateVideoField(
                                              video.id,
                                              "videoUrl",
                                              e.target.value,
                                            )
                                          }
                                        />
                                        {video.videoUrl && (
                                          <button
                                            className="copy-link-btn"
                                            title="Kopírovat cestu/odkaz"
                                            onClick={() => {
                                              if (video.videoUrl) {
                                                navigator.clipboard.writeText(
                                                  video.videoUrl,
                                                );
                                              }
                                            }}
                                          >
                                            <Copy size={14} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </td>{" "}
                                  <td className="col-status">
                                    <div className="table-checklist">
                                      {[
                                        { key: "dubbing", label: "Dabing" },
                                        { key: "subtitles", label: "Titulky" },
                                        { key: "published", label: "Pub" },
                                      ].map((step) => {
                                        const statuses = [
                                          "ready",
                                          "dubbing",
                                          "subtitles",
                                          "published",
                                        ];
                                        const isDone = statuses
                                          .slice(
                                            0,
                                            statuses.indexOf(video.status) + 1,
                                          )
                                          .includes(step.key);

                                        return (
                                          <div
                                            key={step.key}
                                            className={`table-check-item ${isDone ? "done" : ""} status-${step.key}`}
                                            onClick={() =>
                                              toggleStatus(
                                                video.id,
                                                video.status,
                                              )
                                            }
                                            title={step.label}
                                          >
                                            <Circle
                                              size={16}
                                              fill={
                                                isDone ? "currentColor" : "none"
                                              }
                                            />
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </td>
                                  <td className="col-lang">
                                    <div className="field-with-icon">
                                      <Globe size={12} className="field-icon" />
                                      <input
                                        className="table-editable-field"
                                        value={video.language}
                                        onChange={(e) =>
                                          updateVideoField(
                                            video.id,
                                            "language",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                  </td>
                                  <td className="col-tags">
                                    <input
                                      className="table-editable-field"
                                      placeholder="Tagy..."
                                      value={video.tags}
                                      onChange={(e) =>
                                        updateVideoField(
                                          video.id,
                                          "tags",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="col-notes">
                                    <div className="table-notes-container">
                                      <textarea
                                        className="table-editable-notes"
                                        placeholder="..."
                                        value={video.notes}
                                        onChange={(e) =>
                                          updateNotes(video.id, e.target.value)
                                        }
                                      />
                                    </div>
                                  </td>
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
                              ))}
                            </tbody>
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
                                <th className="col-select">
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
                                <th className="col-title">Název</th>
                                <th className="col-status">Stav</th>
                                <th className="col-lang">Jazyk</th>
                                <th className="col-tags">Tagy</th>
                                <th className="col-notes">Poznámky</th>
                                <th className="col-actions"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {doneVideos.map((video) => (
                                <tr key={video.id}>
                                  <td className="col-select">
                                    <input
                                      type="checkbox"
                                      checked={selectedIds.includes(video.id)}
                                      onChange={() => toggleSelection(video.id)}
                                    />
                                  </td>
                                  <td className="col-title">
                                    <div className="title-edit-group">
                                      <input
                                        className="table-editable-field title-field"
                                        value={video.title}
                                        onChange={(e) =>
                                          updateVideoField(
                                            video.id,
                                            "title",
                                            e.target.value,
                                          )
                                        }
                                      />
                                      <div className="url-edit-wrapper">
                                        <input
                                          className="table-editable-field url-field"
                                          placeholder="Vložte odkaz nebo cestu..."
                                          value={video.videoUrl || ""}
                                          onChange={(e) =>
                                            updateVideoField(
                                              video.id,
                                              "videoUrl",
                                              e.target.value,
                                            )
                                          }
                                        />
                                        {video.videoUrl && (
                                          <button
                                            className="copy-link-btn"
                                            title="Kopírovat cestu/odkaz"
                                            onClick={() => {
                                              if (video.videoUrl) {
                                                navigator.clipboard.writeText(
                                                  video.videoUrl,
                                                );
                                              }
                                            }}
                                          >
                                            <Copy size={14} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="col-status">
                                    <div className="table-checklist">
                                      <div
                                        className="table-check-item done status-published"
                                        onClick={() =>
                                          toggleStatus(video.id, video.status)
                                        }
                                      >
                                        <Circle size={16} fill="currentColor" />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="col-lang">
                                    <div className="field-with-icon">
                                      <Globe size={12} className="field-icon" />
                                      <input
                                        className="table-editable-field"
                                        value={video.language}
                                        onChange={(e) =>
                                          updateVideoField(
                                            video.id,
                                            "language",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                  </td>
                                  <td className="col-tags">
                                    <input
                                      className="table-editable-field"
                                      placeholder="Tagy..."
                                      value={video.tags}
                                      onChange={(e) =>
                                        updateVideoField(
                                          video.id,
                                          "tags",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="col-notes">
                                    <div className="table-notes-container">
                                      <textarea
                                        className="table-editable-notes"
                                        placeholder="..."
                                        value={video.notes}
                                        onChange={(e) =>
                                          updateNotes(video.id, e.target.value)
                                        }
                                      />
                                    </div>
                                  </td>
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
                              ))}
                            </tbody>
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
                      <button
                        className="add-invoice-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addInvoice(creator);
                        }}
                      >
                        <Plus size={14} /> Přidat Fakturu
                      </button>
                    </div>

                    {!collapsedInvoices.includes(creator) && (
                      <div className="invoices-content">
                        {invoices.filter(
                          (inv) =>
                            inv.creator === creator && inv.app === currentApp,
                        ).length === 0 ? (
                          <p className="no-invoices">Žádné faktury.</p>
                        ) : (
                          <table className="invoices-table">
                            <thead>
                              <tr>
                                <th>Datum</th>
                                <th>Stav</th>
                                <th style={{ width: "50px" }}></th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoices
                                .filter(
                                  (inv) =>
                                    inv.creator === creator &&
                                    inv.app === currentApp,
                                )
                                .map((inv) => (
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
                                        onClick={() => deleteInvoice(inv.id)}
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
                        )}
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
      </main>
    </div>
  );
}

export default App;
