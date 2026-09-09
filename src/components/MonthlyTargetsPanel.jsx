import { useState, useEffect } from "react";
import { PRODUCTS } from "../data/store";

const MONTH_NAMES = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

const TYPE_ICON = { call: "📞", email: "✉️", meeting: "🤝" };
const TYPE_LABEL = { call: "Arama", email: "Mail", meeting: "Toplantı" };

function monthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
}

export default function MonthlyTargetsPanel({
  leads,
  activityLogs,
  targets,
  onSaveTarget,
  onDeleteNote,
  onDeleteActivity,
}) {
  const [cursor, setCursor] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [product, setProduct] = useState(""); // "" = Genel
  const [calls, setCalls] = useState("");
  const [emails, setEmails] = useState("");
  const [meetings, setMeetings] = useState("");
  const [saving, setSaving] = useState(false);
  const [drillType, setDrillType] = useState(null); // null | 'call' | 'email' | 'meeting'

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const key = monthKey(year, month);
  const monthStart = key;
  const monthEnd = monthKey(year, month + 1);

  const existing = targets.find((t) => t.month === key && t.product === product);

  useEffect(() => {
    setCalls(existing ? String(existing.targetCalls) : "");
    setEmails(existing ? String(existing.targetEmails) : "");
    setMeetings(existing ? String(existing.targetMeetings) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, product]);

  const inMonth = (d) => d && d >= monthStart && d < monthEnd;

  // Her tür icin katkida bulunan tum kayitlari (not/log) topluyoruz,
  // hem sayim hem de detay popup'i icin ayni veri kullaniliyor.
  let callEntries = [], emailEntries = [], meetingEntries = [];

  if (product === "") {
    const notesWithCompany = leads.flatMap((l) =>
      l.notes.map((n) => ({ ...n, company: l.company, leadId: l.id, source: "note" }))
    );
    const logs = activityLogs.map((a) => ({ ...a, company: null, source: "log" }));
    const all = [...notesWithCompany, ...logs].filter((e) => inMonth(e.date));
    callEntries = all.filter((e) => e.type === "call");
    emailEntries = all.filter((e) => e.type === "email");
    meetingEntries = all.filter((e) => e.type === "meeting");
  } else {
    const productNotes = leads
      .filter((l) => l.products.includes(product))
      .flatMap((l) => l.notes.map((n) => ({ ...n, company: l.company, leadId: l.id, source: "note" })))
      .filter((e) => inMonth(e.date));
    callEntries = productNotes.filter((e) => e.type === "call");
    emailEntries = productNotes.filter((e) => e.type === "email");
    meetingEntries = productNotes.filter((e) => e.type === "meeting");
  }

  const entriesByType = { call: callEntries, email: emailEntries, meeting: meetingEntries };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveTarget({
        id: existing?.id,
        month: key,
        product,
        targetCalls: Number(calls) || 0,
        targetEmails: Number(emails) || 0,
        targetMeetings: Number(meetings) || 0,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = (entry) => {
    if (entry.source === "note") {
      onDeleteNote(entry.leadId, entry.id);
    } else {
      onDeleteActivity(entry.id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="w-7 h-7 rounded-lg border border-mist bg-white text-ink/50 hover:text-ink text-sm"
          >
            ‹
          </button>
          <span className="text-sm font-semibold text-ink/75 px-1 min-w-[110px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="w-7 h-7 rounded-lg border border-mist bg-white text-ink/50 hover:text-ink text-sm"
          >
            ›
          </button>
        </div>
        <select value={product} onChange={(e) => setProduct(e.target.value)} className="input !w-auto">
          <option value="">Genel (tüm ürünler)</option>
          {PRODUCTS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-end gap-2 mb-5 p-3 bg-white border border-mist rounded-lg">
        <Field label="Hedef Arama">
          <input type="number" value={calls} onChange={(e) => setCalls(e.target.value)} className="input font-mono" />
        </Field>
        <Field label="Hedef Mail">
          <input type="number" value={emails} onChange={(e) => setEmails(e.target.value)} className="input font-mono" />
        </Field>
        <Field label="Hedef Toplantı">
          <input type="number" value={meetings} onChange={(e) => setMeetings(e.target.value)} className="input font-mono" />
        </Field>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm disabled:opacity-50"
        >
          {saving ? "Kaydediliyor..." : "Hedefi Kaydet"}
        </button>
      </div>

      <p className="text-[11px] text-ink/30 mb-2">Detayları görmek ve düzeltmek için bir karta tıkla.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <TargetCard icon="📞" label="Arama" actual={callEntries.length} target={existing?.targetCalls || 0} onClick={() => setDrillType("call")} />
        <TargetCard icon="✉️" label="Mail" actual={emailEntries.length} target={existing?.targetEmails || 0} onClick={() => setDrillType("email")} />
        <TargetCard icon="🤝" label="Toplantı" actual={meetingEntries.length} target={existing?.targetMeetings || 0} onClick={() => setDrillType("meeting")} />
      </div>

      {drillType && (
        <div
          className="fixed inset-0 bg-ink/25 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setDrillType(null)}
        >
          <div
            className="glass rounded-3xl w-full max-w-md max-h-[75vh] overflow-hidden shadow-glow-lg flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-mist flex items-center justify-between">
              <div>
                <h2 className="font-display font-semibold text-lg text-ink">
                  {TYPE_ICON[drillType]} {TYPE_LABEL[drillType]}
                </h2>
                <p className="text-xs text-ink/40 mt-0.5">
                  {MONTH_NAMES[month]} {year} · {entriesByType[drillType].length} kayıt
                </p>
              </div>
              <button onClick={() => setDrillType(null)} className="text-ink/40 hover:text-ink text-xl leading-none">
                ×
              </button>
            </div>
            <div className="overflow-y-auto p-5 flex flex-col gap-2">
              {entriesByType[drillType].length === 0 && (
                <div className="text-sm text-ink/30 text-center py-8">Bu ay için kayıt yok.</div>
              )}
              {entriesByType[drillType].map((e) => (
                <div key={e.id} className="flex items-start justify-between gap-3 bg-white border border-mist rounded-lg px-3.5 py-2.5">
                  <div className="min-w-0">
                    {e.company && (
                      <div className="text-xs font-semibold text-violet-700 truncate">{e.company}</div>
                    )}
                    <div className="text-sm text-ink/75">{e.note || e.text || "—"}</div>
                    <div className="text-[11px] font-mono text-ink/35 mt-0.5">{e.date}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(e)}
                    className="text-ink/25 hover:text-rose-500 text-sm shrink-0"
                    title="Sil (iptal/yanlış girdiyse)"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-ink/45">{label}</span>
      {children}
    </label>
  );
}

function TargetCard({ icon, label, actual, target, onClick }) {
  const pct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : null;
  const color = pct === null ? "text-ink/60" : pct >= 100 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-rose-500";
  return (
    <button onClick={onClick} className="glass rounded-card p-4 text-left hover:shadow-md transition-shadow">
      <div className="text-lg leading-none mb-1.5">{icon}</div>
      <div className="flex items-baseline gap-1.5">
        <span className={`font-display font-bold text-2xl ${color}`}>{actual}</span>
        {target > 0 && <span className="text-ink/35 text-sm">/ {target}</span>}
      </div>
      <div className="text-xs text-ink/45 mt-0.5">{label}</div>
      {pct !== null && (
        <div className="h-1.5 w-full rounded-full bg-mist overflow-hidden mt-2">
          <div
            className={`h-full transition-all ${pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </button>
  );
}
