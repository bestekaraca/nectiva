import { useState, useMemo } from "react";
import { isOverdue, ACTIVITY_TYPES } from "../data/store";

function daysAgo(dateStr) {
  if (!dateStr) return null;
  return Math.round((new Date() - new Date(dateStr + "T00:00:00")) / 86400000);
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const TYPE_LABEL = { call: "Arama", email: "Mail", meeting: "Toplantı", proposal: "Teklif", note: "Not" };

const STAGE_CONFIG = [
  { id: "iletisimde", label: "İletişimde", base: "Bir sonraki adıma geçir — toplantı planla veya teklif hazırla" },
  { id: "teklif", label: "Teklif", base: "Teklifin durumunu sor, karar sürecini netleştir" },
  { id: "muzakere", label: "Müzakere", base: "Müzakereyi kapanışa yaklaştır, şartları netleştir" },
];

function suggestAction(lead, base) {
  const lastNote = lead.notes[0];
  const overdue = isOverdue(lead.nextActionDate);

  if (!lastNote) {
    return {
      action: "Hiç kayıt yok — ilk temasını kur ve not gir",
      context: lead.nextActionNote ? `Planlanan: "${lead.nextActionNote}"` : "Bu fırsatla hiç ilgilenilmemiş",
      urgent: true,
      sinceLast: 9999,
    };
  }

  const sinceLast = daysAgo(lastNote.date);
  let context = `Son temas: ${lastNote.date} (${TYPE_LABEL[lastNote.type] || "Not"}) — "${lastNote.text}"`;
  if (overdue) context = `Gecikmiş takip var (${lead.nextActionDate}) · ${context}`;

  return { action: base, context, urgent: overdue || sinceLast >= 5, sinceLast };
}

export default function WeeklyActionPlan({ leads, onAddTask, onOpenLead, onAddNote }) {
  const [dismissed, setDismissed] = useState(new Set());
  const [addedFor, setAddedFor] = useState(new Set());
  const [expanded, setExpanded] = useState(new Set());

  const toggleExpand = (stageId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
  };

  const groups = useMemo(() => {
    return STAGE_CONFIG.map((cfg) => {
      const stageLeads = leads
        .filter((l) => l.stage === cfg.id)
        .map((l) => ({ lead: l, ...suggestAction(l, cfg.base) }))
        .sort((a, b) => (b.urgent === a.urgent ? b.sinceLast - a.sinceLast : b.urgent ? 1 : -1));
      return { ...cfg, items: stageLeads };
    });
  }, [leads]);

  const totalCount = groups.reduce((s, g) => s + g.items.length, 0);
  if (totalCount === 0) return null;

  const handleAddTask = async (key, item) => {
    await onAddTask(`${item.lead.company}: ${item.action}`, todayISO());
    setAddedFor((prev) => new Set(prev).add(key));
  };

  return (
    <div className="glass rounded-card p-4 mb-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-sm text-ink/80">🎯 Aksiyon Planı — İletişimde / Teklif / Müzakere</h3>
        <span className="text-xs text-ink/35">{totalCount} fırsat</span>
      </div>
      <p className="text-xs text-ink/40 mb-3">
        Bu üç aşamadaki tüm fırsatların notları tarandı — hepsi için önerilen adım aşağıda.
      </p>

      <div className="flex flex-col gap-5">
        {groups.map((g) => {
          const isOpen = expanded.has(g.id);
          const urgentCount = g.items.filter((i) => i.urgent).length;
          return (
            <div key={g.id}>
              <button
                onClick={() => toggleExpand(g.id)}
                className="w-full flex items-center justify-between gap-2 mb-2 group"
              >
                <span className="text-xs font-semibold text-ink/55 uppercase tracking-wide flex items-center gap-2">
                  <span className={`transition-transform ${isOpen ? "rotate-90" : ""}`}>›</span>
                  {g.label} ({g.items.length})
                  {urgentCount > 0 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300">
                      {urgentCount} öncelikli
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-ink/25 group-hover:text-ink/40">
                  {isOpen ? "gizle" : "göster"}
                </span>
              </button>
              {isOpen &&
                (g.items.length === 0 ? (
                  <div className="text-xs text-ink/25">Bu aşamada fırsat yok.</div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {g.items.map((item) => {
                      const key = `${g.id}-${item.lead.id}`;
                      if (dismissed.has(key)) return null;
                      return (
                        <ActionItemCard
                          key={key}
                          itemKey={key}
                          item={item}
                          onDismiss={() => setDismissed((prev) => new Set(prev).add(key))}
                          onOpenLead={() => onOpenLead(item.lead)}
                          onAddTask={() => handleAddTask(key, item)}
                          taskAdded={addedFor.has(key)}
                          onAddNote={onAddNote}
                        />
                      );
                    })}
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionItemCard({ item, onDismiss, onOpenLead, onAddTask, taskAdded, onAddNote }) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState("note");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveNote = async () => {
    if (!noteText.trim() || saving) return;
    setSaving(true);
    try {
      await onAddNote(item.lead.id, noteText.trim(), noteType);
      setNoteText("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-mist rounded-lg px-3.5 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            {item.urgent && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300 shrink-0">
                Öncelikli
              </span>
            )}
            <span className="text-sm font-medium text-ink/85 truncate">{item.lead.company}</span>
          </div>
          <div className="text-xs text-ink/65 mb-0.5">{item.action}</div>
          <div className="text-[11px] text-ink/35 truncate">{item.context}</div>
        </div>
        <button onClick={onDismiss} className="text-ink/25 hover:text-rose-500 text-sm shrink-0" title="Gizle">
          ×
        </button>
      </div>

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <button
          onClick={onOpenLead}
          className="text-xs font-medium px-2.5 py-1 rounded-lg border border-mist bg-white text-ink/60 hover:border-violet-300 hover:text-violet-700"
        >
          Firmayı Aç
        </button>
        <button
          onClick={onAddTask}
          disabled={taskAdded}
          className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-600 to-blue-500 text-white hover:shadow-glow-sm disabled:opacity-50"
        >
          {taskAdded ? "✓ Görev eklendi" : "Görev Olarak Ekle"}
        </button>
        <button
          onClick={() => setNoteOpen((v) => !v)}
          className="text-xs font-medium text-violet-600 hover:text-violet-700 ml-auto"
        >
          {noteOpen ? "Not alanını kapat" : saved ? "✓ Not kaydedildi" : "+ Ne yaptığımı not et"}
        </button>
      </div>

      {noteOpen && (
        <div className="mt-2.5 pt-2.5 border-t border-mist">
          <div className="flex flex-wrap gap-1 mb-1.5">
            {ACTIVITY_TYPES.filter((t) => t.id !== "proposal").map((t) => (
              <button
                key={t.id}
                onClick={() => setNoteType(t.id)}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  noteType === t.id ? "bg-violet-600 text-white border-violet-600" : "bg-white text-ink/50 border-mist"
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
              onKeyDown={(e) => e.key === "Enter" && handleSaveNote()}
              placeholder="Örn: Önerilen aksiyonu yapamadım ama mail attım, cevap bekliyorum"
              className="input flex-1 text-xs"
            />
            <button
              onClick={handleSaveNote}
              disabled={saving}
              className="px-3 py-1.5 bg-ink text-white text-xs font-medium rounded-lg disabled:opacity-50 shrink-0"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
