import { useState } from "react";
import { isOverdue, ACTIVITY_TYPES, FOLLOWUP_STATUSES } from "../data/store";

function daysAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Math.round((new Date() - new Date(dateStr + "T00:00:00")) / 86400000);
  return diff;
}

export default function FollowUpRow({ lead, onOpenLead, onSetFollowUp, onUpdateFollowUpStatus, onAddNote }) {
  const [expanded, setExpanded] = useState(false);
  const [noteType, setNoteType] = useState("call");
  const [noteText, setNoteText] = useState("");
  const [busy, setBusy] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(lead.nextActionDate || "");
  const [rescheduleNote, setRescheduleNote] = useState(lead.nextActionNote || "");
  const [pendingStatus, setPendingStatus] = useState(null);
  const [statusNoteText, setStatusNoteText] = useState("");

  const overdue = isOverdue(lead.nextActionDate);
  const currentBadge =
    FOLLOWUP_STATUSES.find((s) => s.id === (pendingStatus || lead.followupStatus))?.badge ||
    FOLLOWUP_STATUSES[2].badge;
  const lastNote = lead.notes[0];
  const sinceLast = lastNote ? daysAgo(lastNote.date) : null;

  const handleAddNote = async () => {
    if (!noteText.trim() || busy) return;
    setBusy(true);
    try {
      await onAddNote(lead.id, noteText.trim(), noteType);
      setNoteText("");
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setPendingStatus(newStatus);
    setStatusNoteText("");
  };

  const handleConfirmStatus = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const label = FOLLOWUP_STATUSES.find((s) => s.id === pendingStatus)?.label || pendingStatus;
      const noteType = pendingStatus === "arandi" ? "call" : "note";
      await onUpdateFollowUpStatus(lead.id, pendingStatus);
      await onAddNote(lead.id, statusNoteText.trim() || `Durum güncellendi: ${label}`, noteType);
      setPendingStatus(null);
      setStatusNoteText("");
    } finally {
      setBusy(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || busy) return;
    setBusy(true);
    try {
      await onSetFollowUp(lead.id, rescheduleDate, rescheduleNote.trim());
      await onAddNote(
        lead.id,
        `Takip yeniden planlandı → ${rescheduleDate}${rescheduleNote.trim() ? `: ${rescheduleNote.trim()}` : ""}`,
        "note"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-mist bg-white overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 py-2.5">
        <button
          onClick={() => onOpenLead(lead)}
          className="text-left flex-1 min-w-0 hover:opacity-70 transition-opacity"
        >
          <div className="text-sm font-medium text-ink truncate">{lead.company}</div>
          <div className="text-xs text-ink/45 truncate">
            {lead.nextActionNote || "—"}
            {sinceLast !== null && (
              <span className="text-ink/30">
                {" · "}
                {sinceLast === 0 ? "bugün not eklendi" : `son temas ${sinceLast} gün önce`}
              </span>
            )}
          </div>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[11px] font-mono px-1.5 py-0.5 rounded border ${
              overdue
                ? "bg-rose-50 text-rose-600 border-rose-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {lead.nextActionDate}
          </span>
          <select
            value={pendingStatus || lead.followupStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer outline-none appearance-none ${currentBadge}`}
          >
            {FOLLOWUP_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-ink/35 hover:text-ink text-xs px-1"
            title="Detay / not ekle"
          >
            {expanded ? "▴" : "▾"}
          </button>
        </div>
      </div>

      {pendingStatus && (
        <div className="border-t border-violet-200 bg-violet-50/60 px-3 py-2.5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-violet-800 shrink-0">
            {FOLLOWUP_STATUSES.find((s) => s.id === pendingStatus)?.label} — ne oldu?
          </span>
          <input
            autoFocus
            value={statusNoteText}
            onChange={(e) => setStatusNoteText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirmStatus()}
            placeholder="Örn: Aradım ama açmadı"
            className="input flex-1 min-w-[160px] text-xs"
          />
          <button
            onClick={handleConfirmStatus}
            disabled={busy}
            className="px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 shrink-0"
          >
            Kaydet
          </button>
          <button
            onClick={() => setPendingStatus(null)}
            className="text-xs text-ink/40 hover:text-ink shrink-0"
          >
            Vazgeç
          </button>
        </div>
      )}

      {expanded && (
        <div className="border-t border-mist bg-paper/60 px-3 py-3 flex flex-col gap-3">
          {/* Geçmiş notlar (son 3) */}
          {lead.notes.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {lead.notes.slice(0, 3).map((n) => (
                <div key={n.id} className="text-xs bg-white border border-mist rounded-lg px-2.5 py-1.5">
                  <span className="font-mono text-ink/35">{n.date}</span>
                  <span className="text-ink/25"> · </span>
                  <span className="text-ink/55">
                    {ACTIVITY_TYPES.find((t) => t.id === n.type)?.icon}{" "}
                    {ACTIVITY_TYPES.find((t) => t.id === n.type)?.label}
                  </span>
                  <div className="text-ink/75 mt-0.5">{n.text}</div>
                </div>
              ))}
            </div>
          )}

          {/* Ne konuştuk / not ekle */}
          <div>
            <div className="text-[11px] font-medium text-ink/40 uppercase tracking-wide mb-1.5">
              Ne oldu? (görüşme notu ekle)
            </div>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {ACTIVITY_TYPES.filter((t) => t.id !== "proposal").map((t) => (
                <button
                  key={t.id}
                  onClick={() => setNoteType(t.id)}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                    noteType === t.id
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-white text-ink/50 border-mist"
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                placeholder="Örn: Aradım ama kapanmadı, süreci hızlandırdım"
                className="input flex-1 text-xs"
              />
              <button
                onClick={handleAddNote}
                disabled={busy}
                className="px-3 py-1.5 bg-ink text-white text-xs font-medium rounded-lg disabled:opacity-50 shrink-0"
              >
                Kaydet
              </button>
            </div>
          </div>

          {/* Sonraki takibi yeniden planla */}
          <div>
            <div className="text-[11px] font-medium text-ink/40 uppercase tracking-wide mb-1.5">
              Sonraki takip
            </div>
            <div className="flex flex-wrap gap-1.5">
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="input font-mono text-xs !w-auto"
              />
              <input
                value={rescheduleNote}
                onChange={(e) => setRescheduleNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReschedule()}
                placeholder="Sonraki eylem notu"
                className="input flex-1 text-xs"
              />
              <button
                onClick={handleReschedule}
                disabled={busy}
                className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-xs font-medium rounded-lg hover:shadow-glow-sm disabled:opacity-50 shrink-0"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
