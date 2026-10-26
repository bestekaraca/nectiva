import { useState, useMemo } from "react";

const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

const STATUSES = [
  { id: "acik", label: "Açık", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  { id: "bekliyor", label: "Bekliyor", cls: "bg-sky-50 text-sky-700 border-sky-300" },
  { id: "tamam", label: "Tamamlandı", cls: "bg-emerald-50 text-emerald-700 border-emerald-300" },
  { id: "lost", label: "Lost", cls: "bg-rose-50 text-rose-600 border-rose-300" },
];
const statusOf = (id) => STATUSES.find((s) => s.id === id) || STATUSES[0];

// Tarihleri yerel saatle işle (UTC kayması olmasın)
const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const mondayOf = (d) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};
const addDays = (iso, n) => {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};
function formatRange(startISO) {
  const s = fromISO(startISO);
  const e = fromISO(addDays(startISO, 6));
  if (s.getFullYear() !== e.getFullYear())
    return `${s.getDate()} ${MONTHS[s.getMonth()]} ${s.getFullYear()} – ${e.getDate()} ${MONTHS[e.getMonth()]} ${e.getFullYear()}`;
  if (s.getMonth() === e.getMonth())
    return `${s.getDate()} – ${e.getDate()} ${MONTHS[e.getMonth()]} ${e.getFullYear()}`;
  return `${s.getDate()} ${MONTHS[s.getMonth()]} – ${e.getDate()} ${MONTHS[e.getMonth()]} ${e.getFullYear()}`;
}

// "Tofaş" / "TOFAS" / "tofaş" aynı sayılsın
const norm = (s) =>
  String(s || "")
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .trim();

export default function WeeklyDigest({ items, leads, loadError, onAdd, onUpdate, onDelete, onOpenLead }) {
  const thisWeek = toISO(mondayOf(new Date()));
  const [weekStart, setWeekStart] = useState(thisWeek);
  const [newCompany, setNewCompany] = useState("");
  const [newText, setNewText] = useState("");
  const [newStatus, setNewStatus] = useState("acik");
  const [editingId, setEditingId] = useState(null);
  const [editCompany, setEditCompany] = useState("");
  const [editText, setEditText] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const normLeads = useMemo(() => leads.map((l) => ({ lead: l, n: norm(l.company) })), [leads]);
  const findLead = (company) => {
    const c = norm(company);
    if (!c) return null;
    return (
      normLeads.find((x) => x.n === c)?.lead ||
      normLeads.find((x) => x.n.startsWith(c))?.lead ||
      null
    );
  };

  const weekItems = items.filter((i) => i.weekStart === weekStart).sort((a, b) => a.sortOrder - b.sortOrder);
  const nextOrder = weekItems.reduce((m, i) => Math.max(m, i.sortOrder), 0) + 1;

  const prevStart = addDays(weekStart, -7);
  const carryCandidates = items.filter(
    (i) =>
      i.weekStart === prevStart &&
      (i.status === "acik" || i.status === "bekliyor") &&
      !weekItems.some((w) => w.text === i.text)
  );

  const counts = STATUSES.map((s) => ({ ...s, n: weekItems.filter((i) => i.status === s.id).length }));

  const handleAdd = async () => {
    if (!newText.trim() || busy) return;
    setBusy(true);
    try {
      await onAdd({
        weekStart,
        company: newCompany.trim(),
        text: newText.trim(),
        status: newStatus,
        sortOrder: nextOrder,
      });
      setNewCompany("");
      setNewText("");
      setNewStatus("acik");
    } finally {
      setBusy(false);
    }
  };

  const handleCarry = async () => {
    if (busy) return;
    setBusy(true);
    try {
      let order = nextOrder;
      for (const i of carryCandidates) {
        await onAdd({ weekStart, company: i.company, text: i.text, status: i.status, sortOrder: order++ });
      }
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditCompany(item.company);
    setEditText(item.text);
  };
  const saveEdit = async () => {
    if (!editText.trim()) return;
    await onUpdate(editingId, { company: editCompany.trim(), text: editText.trim() });
    setEditingId(null);
  };

  const handleCopy = async () => {
    const lines = weekItems.map(
      (i, idx) => `${idx + 1}. ${i.company ? i.company + ": " : ""}${i.text} [${statusOf(i.status).label}]`
    );
    const text = `Weekly Özet — ${formatRange(weekStart)}\n\n${lines.join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Kopyala (Ctrl+C):", text);
    }
  };

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-ink mb-1">Weekly Özet</h1>
      <p className="text-sm text-ink/40 mb-5">Haftalık toplantıda konuşacağın konular — firma bazlı, durumlarıyla.</p>

      {loadError && (
        <div className="mb-4 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">
          Weekly Özet tablosu bulunamadı. Supabase SQL Editor'de <code className="font-mono">add_weekly_items.sql</code>{" "}
          dosyasını çalıştır, sonra sayfayı yenile.
        </div>
      )}

      {/* Hafta seçici + kopyala */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="w-8 h-8 rounded-lg border border-mist bg-white text-ink/50 hover:text-ink"
          >
            ‹
          </button>
          <span className="text-sm font-display font-semibold text-ink px-2 min-w-[190px] text-center">
            {formatRange(weekStart)}
          </span>
          <button
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="w-8 h-8 rounded-lg border border-mist bg-white text-ink/50 hover:text-ink"
          >
            ›
          </button>
          {weekStart !== thisWeek && (
            <button
              onClick={() => setWeekStart(thisWeek)}
              className="text-xs px-3 h-8 rounded-lg border border-mist bg-white text-ink/50 hover:text-ink ml-1"
            >
              Bu Hafta
            </button>
          )}
        </div>
        <button
          onClick={handleCopy}
          disabled={weekItems.length === 0}
          className="text-xs font-medium px-3 py-2 rounded-lg border border-mist bg-white text-ink/60 hover:border-violet-300 hover:text-violet-700 disabled:opacity-40"
        >
          {copied ? "✓ Kopyalandı" : "📋 Özeti kopyala"}
        </button>
      </div>

      {/* Sayaçlar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs text-ink/50 py-1">{weekItems.length} madde</span>
        {counts
          .filter((c) => c.n > 0)
          .map((c) => (
            <span key={c.id} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${c.cls}`}>
              {c.label}: {c.n}
            </span>
          ))}
      </div>

      {/* Madde ekle */}
      <datalist id="weekly-companies">
        {leads.map((l) => (
          <option key={l.id} value={l.company} />
        ))}
      </datalist>
      <div className="glass rounded-card p-3 mb-4 flex flex-wrap gap-2">
        <input
          list="weekly-companies"
          value={newCompany}
          onChange={(e) => setNewCompany(e.target.value)}
          placeholder="Firma (opsiyonel)"
          className="input !w-48"
        />
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Bu hafta ne var? (örn: Demo organize edilecek)"
          className="input flex-1 min-w-[220px]"
        />
        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input !w-auto">
          {STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={busy || !newText.trim()}
          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm disabled:opacity-50 shrink-0"
        >
          Ekle
        </button>
      </div>

      {/* Liste */}
      <div className="flex flex-col gap-2">
        {weekItems.length === 0 && (
          <div className="text-sm text-ink/30 text-center py-10">Bu hafta için madde yok.</div>
        )}
        {weekItems.map((item, idx) => {
          const st = statusOf(item.status);
          const lead = findLead(item.company);
          const editing = editingId === item.id;
          return (
            <div key={item.id} className="flex items-start gap-3 bg-white border border-mist rounded-lg px-3.5 py-3">
              <span className="font-mono text-xs text-ink/30 pt-1 w-5 shrink-0">{idx + 1}.</span>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="flex flex-col gap-1.5">
                    <input
                      list="weekly-companies"
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      placeholder="Firma"
                      className="input text-sm"
                    />
                    <textarea
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      className="input text-sm resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700"
                      >
                        Kaydet
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-ink/40 hover:text-ink">
                        Vazgeç
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed">
                    {item.company &&
                      (lead ? (
                        <button
                          onClick={() => onOpenLead(lead)}
                          className="font-semibold text-violet-700 hover:underline mr-2"
                          title="Firmayı aç"
                        >
                          {item.company}
                        </button>
                      ) : (
                        <span className="font-semibold text-ink/80 mr-2">{item.company}</span>
                      ))}
                    <span
                      onClick={() => startEdit(item)}
                      className={`cursor-text ${
                        item.status === "tamam" ? "text-ink/40 line-through" : item.status === "lost" ? "text-ink/55" : "text-ink/75"
                      }`}
                      title="Düzenlemek için tıkla"
                    >
                      {item.text}
                    </span>
                  </div>
                )}
              </div>
              <select
                value={item.status}
                onChange={(e) => onUpdate(item.id, { status: e.target.value })}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer outline-none appearance-none shrink-0 ${st.cls}`}
              >
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id} className="bg-white text-ink font-normal">
                    {s.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => onDelete(item.id)}
                className="text-ink/25 hover:text-rose-500 text-sm shrink-0 pt-0.5"
                title="Sil"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {carryCandidates.length > 0 && (
        <button
          onClick={handleCarry}
          disabled={busy}
          className="mt-4 text-xs font-medium text-violet-600 hover:text-violet-700 disabled:opacity-50"
        >
          ↳ Geçen haftadan açık/bekleyen {carryCandidates.length} maddeyi bu haftaya getir
        </button>
      )}
    </div>
  );
}
