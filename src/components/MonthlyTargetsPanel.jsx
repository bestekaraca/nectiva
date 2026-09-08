import { useState, useEffect } from "react";
import { PRODUCTS } from "../data/store";

const MONTH_NAMES = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function monthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
}

export default function MonthlyTargetsPanel({ leads, activityLogs, targets, onSaveTarget }) {
  const [cursor, setCursor] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [product, setProduct] = useState(""); // "" = Genel
  const [calls, setCalls] = useState("");
  const [emails, setEmails] = useState("");
  const [meetings, setMeetings] = useState("");
  const [saving, setSaving] = useState(false);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const key = monthKey(year, month);
  const monthStart = key;
  const monthEnd = monthKey(year, month + 1); // bir sonraki ayin 1'i, ust sinir icin

  const existing = targets.find((t) => t.month === key && t.product === product);

  useEffect(() => {
    setCalls(existing ? String(existing.targetCalls) : "");
    setEmails(existing ? String(existing.targetEmails) : "");
    setMeetings(existing ? String(existing.targetMeetings) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, product]);

  const inMonth = (d) => d && d >= monthStart && d < monthEnd;

  // Gerceklesen sayilari hesapla
  let actualCalls = 0;
  let actualEmails = 0;
  let actualMeetings = 0;

  if (product === "") {
    // Genel: hem firma notlari hem firmasiz hizli girisler
    const allNotes = leads.flatMap((l) => l.notes);
    actualCalls =
      allNotes.filter((n) => n.type === "call" && inMonth(n.date)).length +
      activityLogs.filter((a) => a.type === "call" && inMonth(a.date)).length;
    actualEmails =
      allNotes.filter((n) => n.type === "email" && inMonth(n.date)).length +
      activityLogs.filter((a) => a.type === "email" && inMonth(a.date)).length;
    actualMeetings =
      allNotes.filter((n) => n.type === "meeting" && inMonth(n.date)).length +
      activityLogs.filter((a) => a.type === "meeting" && inMonth(a.date)).length;
  } else {
    // Urune ozel: sadece bu urunu iceren firmalarin notlari
    const productNotes = leads
      .filter((l) => l.products.includes(product))
      .flatMap((l) => l.notes);
    actualCalls = productNotes.filter((n) => n.type === "call" && inMonth(n.date)).length;
    actualEmails = productNotes.filter((n) => n.type === "email" && inMonth(n.date)).length;
    actualMeetings = productNotes.filter((n) => n.type === "meeting" && inMonth(n.date)).length;
  }

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

      {/* Hedef girişi */}
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

      {/* Gerceklesen vs hedef */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <TargetCard icon="📞" label="Arama" actual={actualCalls} target={existing?.targetCalls || 0} />
        <TargetCard icon="✉️" label="Mail" actual={actualEmails} target={existing?.targetEmails || 0} />
        <TargetCard icon="🤝" label="Toplantı" actual={actualMeetings} target={existing?.targetMeetings || 0} />
      </div>
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

function TargetCard({ icon, label, actual, target }) {
  const pct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : null;
  const color = pct === null ? "text-ink/60" : pct >= 100 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-rose-500";
  return (
    <div className="glass rounded-card p-4">
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
    </div>
  );
}
