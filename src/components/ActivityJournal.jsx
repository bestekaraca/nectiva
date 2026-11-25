import { useState, useMemo } from "react";
import { ACTIVITY_TYPES } from "../data/store";

const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const DAYS_SHORT = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

// Gerçek bir aktivite sayılan not türleri. Düz "Genel Not"lar (toplu aktarımlar dahil)
// sadece bu sayfadan girildiyse ya da "Genel notları da göster" açıksa listelenir.
const ACTIVITY_NOTE_TYPES = new Set(["call", "email", "meeting", "meeting_planned", "proposal"]);
const FALLBACK_TEXT = {
  call: "Arama yapıldı",
  email: "Mail gönderildi",
  meeting: "Toplantı yapıldı",
  meeting_planned: "Toplantı planlandı",
  proposal: "Teklif iletildi",
};

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
  if (s.getMonth() === e.getMonth()) return `${s.getDate()} – ${e.getDate()} ${MONTHS[e.getMonth()]} ${e.getFullYear()}`;
  return `${s.getDate()} ${MONTHS[s.getMonth()]} – ${e.getDate()} ${MONTHS[e.getMonth()]} ${e.getFullYear()}`;
}
const dayTitle = (iso) => {
  const d = fromISO(iso);
  return `${DAYS[d.getDay()]} · ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

const norm = (s) =>
  String(s || "")
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .trim();

const typeMeta = (id) => ACTIVITY_TYPES.find((t) => t.id === id) || ACTIVITY_TYPES[0];

export default function ActivityJournal({
  leads,
  activityLogs,
  onAddNote,
  onAddActivity,
  onDeleteNote,
  onDeleteActivity,
  onOpenLead,
}) {
  const todayISO = toISO(new Date());
  const thisWeek = toISO(mondayOf(new Date()));
  const isFriday = new Date().getDay() === 5;

  const [weekStart, setWeekStart] = useState(thisWeek);
  const [date, setDate] = useState(todayISO);
  const [company, setCompany] = useState("");
  const [type, setType] = useState("call");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showPlain, setShowPlain] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filters, setFilters] = useState([]); // boşsa hepsi

  // --- Firma eşleştirme (yazdığın firma pipeline'daki hangi fırsat?) ---
  const normLeads = useMemo(() => leads.map((l) => ({ lead: l, n: norm(l.company) })), [leads]);
  const match = useMemo(() => {
    const c = norm(company);
    if (!c) return { state: "none" };
    const exact = normLeads.filter((x) => x.n === c);
    if (exact.length >= 1) return { state: "ok", lead: exact[0].lead };
    const starts = normLeads.filter((x) => x.n.startsWith(c));
    if (starts.length === 1) return { state: "ok", lead: starts[0].lead };
    if (starts.length > 1) return { state: "ambiguous", options: starts.slice(0, 4).map((x) => x.lead.company) };
    return { state: "missing" };
  }, [company, normLeads]);

  // --- Seçili haftanın kayıtları (fırsat notları + firmasız günlük kayıtlar) ---
  const weekEnd = addDays(weekStart, 7);
  const inWeek = (d) => d && d >= weekStart && d < weekEnd;

  const items = useMemo(() => {
    const out = [];
    for (const l of leads) {
      for (const n of l.notes) {
        if (!inWeek(n.date)) continue;
        if (ACTIVITY_NOTE_TYPES.has(n.type) || n.source === "journal" || showPlain) {
          out.push({
            key: "n" + n.id, kind: "note", id: n.id, leadId: l.id, lead: l,
            company: l.company, date: n.date, type: n.type, text: n.text,
          });
        }
      }
    }
    for (const a of activityLogs) {
      if (!inWeek(a.date)) continue;
      out.push({ key: "a" + a.id, kind: "log", id: a.id, company: "", date: a.date, type: a.type, text: a.note || "" });
    }
    return out;
  }, [leads, activityLogs, weekStart, showPlain]);

  // --- Haftalık özet ---
  const summary = useMemo(() => {
    const by = (t) => items.filter((i) => i.type === t).length;
    const companies = new Set(items.filter((i) => i.company).map((i) => i.company));
    const perCompany = new Map();
    for (const i of items) {
      const k = i.company || "Genel";
      if (!perCompany.has(k)) perCompany.set(k, []);
      perCompany.get(k).push(i);
    }
    for (const arr of perCompany.values()) arr.sort((a, b) => (a.date < b.date ? -1 : 1));
    const groups = [...perCompany.entries()].sort((a, b) => {
      if (a[0] === "Genel") return 1;
      if (b[0] === "Genel") return -1;
      return b[1].length - a[1].length || a[0].localeCompare(b[0], "tr");
    });
    return {
      call: by("call"), email: by("email"), meeting: by("meeting"),
      planned: by("meeting_planned"), proposal: by("proposal"),
      companies: companies.size, total: items.length, groups,
    };
  }, [items]);

  const summaryLine = () => {
    const parts = [];
    if (summary.call) parts.push(`${summary.call} arama`);
    if (summary.email) parts.push(`${summary.email} mail`);
    if (summary.meeting) parts.push(`${summary.meeting} toplantı yapıldı`);
    if (summary.planned) parts.push(`${summary.planned} toplantı alındı`);
    if (summary.proposal) parts.push(`${summary.proposal} teklif`);
    if (summary.companies) parts.push(`${summary.companies} firmaya dokunuldu`);
    return parts.join(" · ");
  };

  const buildText = () => {
    const lines = [`Haftalık Aktivite Özeti — ${formatRange(weekStart)}`, "", summaryLine() || "Bu hafta kayıt yok.", ""];
    for (const [name, arr] of summary.groups) {
      lines.push(`• ${name}`);
      for (const i of arr) {
        const dd = DAYS_SHORT[fromISO(i.date).getDay()];
        const body = i.text || FALLBACK_TEXT[i.type] || typeMeta(i.type).label;
        lines.push(`   - ${dd}: ${typeMeta(i.type).icon} ${body}`);
      }
    }
    return lines.join("\n");
  };

  const handleCopy = async () => {
    const t = buildText();
    try {
      await navigator.clipboard.writeText(t);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Kopyala (Ctrl+C):", t);
    }
  };

  // --- Kaydet ---
  const canSave =
    !busy && match.state !== "ambiguous" && (type !== "note" || text.trim().length > 0);

  const handleSave = async () => {
    if (!canSave) return;
    setBusy(true);
    setError("");
    const t = text.trim();
    try {
      if (match.state === "ok") {
        // Fırsatın not geçmişine düşer: tekrar girmene gerek yok
        await onAddNote(match.lead.id, t || FALLBACK_TEXT[type] || "Not", type, date, "journal");
      } else {
        const c = company.trim();
        const label = FALLBACK_TEXT[type] || typeMeta(type).label;
        const body = c ? (t ? `${c}: ${t}` : `${c} — ${label}`) : t || label;
        await onAddActivity(type, body, date);
      }
      setText("");
      setCompany("");
      // eklediğin günün haftasını göster
      const addedWeek = toISO(mondayOf(fromISO(date)));
      if (addedWeek !== weekStart) setWeekStart(addedWeek);
    } catch (e) {
      setError(e.message || "Kaydedilemedi");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = (item) => {
    if (item.kind === "note") {
      if (!window.confirm("Bu kayıt firmanın not geçmişinden de silinecek. Silinsin mi?")) return;
      onDeleteNote(item.leadId, item.id);
    } else {
      onDeleteActivity(item.id);
    }
  };

  // --- Gün gün liste ---
  const typeCounts = ACTIVITY_TYPES.map((t) => ({ ...t, n: items.filter((i) => i.type === t.id).length }));
  const visible = useMemo(
    () => (filters.length ? items.filter((i) => filters.includes(i.type)) : items),
    [items, filters]
  );
  const toggleFilter = (id) =>
    setFilters((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const days = useMemo(() => {
    const m = new Map();
    for (const i of visible) {
      if (!m.has(i.date)) m.set(i.date, []);
      m.get(i.date).push(i);
    }
    return [...m.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [visible]);

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-ink mb-1">Aktivite Geçmişi</h1>
      <p className="text-sm text-ink/40 mb-5">
        Gün sonunda ne yaptığını gir. Firma yazarsan not otomatik o fırsatın içine de düşer, bir daha girmen gerekmez.
      </p>

      {/* Giriş */}
      <datalist id="journal-companies">
        {leads.map((l) => (
          <option key={l.id} value={l.company} />
        ))}
      </datalist>
      <div className="glass rounded-card p-4 mb-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value || todayISO)}
            className="input !w-auto"
          />
          <input
            list="journal-companies"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Firma (opsiyonel)"
            className="input flex-1 min-w-[200px]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {ACTIVITY_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                type === t.id
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-ink/60 border-mist hover:border-violet-300"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
            }}
            rows={2}
            placeholder={
              type === "note"
                ? "Ne oldu? (örn: Bellona veri güvenliği konusunu netleştirdik)"
                : "Detay (opsiyonel): örn. demo için salı günü ayarlandı"
            }
            className="input flex-1 resize-none"
          />
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm disabled:opacity-50 shrink-0"
          >
            {busy ? "..." : "Kaydet"}
          </button>
        </div>
        <div className="mt-2 text-xs min-h-[16px]">
          {match.state === "ok" && (
            <span className="text-emerald-600">
              ✓ “{match.lead.company}” fırsatının not geçmişine de eklenecek.
            </span>
          )}
          {match.state === "ambiguous" && (
            <span className="text-amber-600">
              ⚠ Birden fazla eşleşme ({match.options.join(", ")}…). Listeden tam firma adını seç.
            </span>
          )}
          {match.state === "missing" && (
            <span className="text-ink/40">Pipeline'da bu isimde firma yok, sadece günlüğe kaydedilecek.</span>
          )}
          {match.state === "none" && (
            <span className="text-ink/30">Firma yazmazsan genel günlük kaydı olur. Ctrl+Enter ile de kaydedebilirsin.</span>
          )}
          {error && <span className="text-rose-500 ml-2">{error}</span>}
        </div>
      </div>

      {/* Hafta seçici */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
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
        <label className="flex items-center gap-1.5 text-xs text-ink/45 cursor-pointer">
          <input type="checkbox" checked={showPlain} onChange={(e) => setShowPlain(e.target.checked)} />
          Diğer yerlerden girilmiş genel notları da göster
        </label>
      </div>

      {/* Haftalık özet */}
      <div
        className={`rounded-card p-4 mb-5 border ${
          isFriday && weekStart === thisWeek
            ? "bg-emerald-50 border-emerald-200"
            : "bg-white border-mist"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="font-display font-semibold text-ink">
            📊 Haftalık Özet
            {isFriday && weekStart === thisWeek && (
              <span className="ml-2 text-xs font-medium text-emerald-700">Bugün Cuma, özetin hazır 🎉</span>
            )}
          </div>
          <button
            onClick={handleCopy}
            disabled={summary.total === 0}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-mist bg-white text-ink/60 hover:border-violet-300 hover:text-violet-700 disabled:opacity-40"
          >
            {copied ? "✓ Kopyalandı" : "📋 Özeti kopyala"}
          </button>
        </div>

        {summary.total === 0 ? (
          <div className="text-sm text-ink/35">Bu hafta için henüz kayıt yok.</div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                ["📞", summary.call, "Arama", "bg-blue-50 text-blue-700 border-blue-200", "call"],
                ["✉️", summary.email, "Mail", "bg-violet-50 text-violet-700 border-violet-200", "email"],
                ["🤝", summary.meeting, "Toplantı", "bg-emerald-50 text-emerald-700 border-emerald-200", "meeting"],
                ["🗓️", summary.planned, "Toplantı alındı", "bg-sky-50 text-sky-700 border-sky-200", "meeting_planned"],
                ["📄", summary.proposal, "Teklif", "bg-amber-50 text-amber-700 border-amber-200", "proposal"],
                ["🏢", summary.companies, "Firma", "bg-slate-50 text-slate-600 border-slate-200", null],
              ]
                .filter((c) => c[1] > 0)
                .map(([icon, n, label, cls, tid]) =>
                  tid ? (
                    <button
                      key={label}
                      onClick={() => toggleFilter(tid)}
                      title="Aşağıdaki listede sadece bunu göster"
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border hover:shadow-sm ${cls} ${
                        filters.includes(tid) ? "ring-2 ring-violet-400" : ""
                      }`}
                    >
                      {icon} {n} {label}
                    </button>
                  ) : (
                    <span key={label} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
                      {icon} {n} {label}
                    </span>
                  )
                )}
            </div>
            <div className="flex flex-col gap-2">
              {summary.groups.map(([name, arr]) => {
                const lead = arr[0].lead;
                return (
                  <div key={name} className="text-sm">
                    {lead ? (
                      <button onClick={() => onOpenLead(lead)} className="font-semibold text-violet-700 hover:underline">
                        {name}
                      </button>
                    ) : (
                      <span className="font-semibold text-ink/70">{name}</span>
                    )}
                    <span className="text-ink/55">
                      {" — "}
                      {arr
                        .map((i) => `${typeMeta(i.type).icon} ${i.text || FALLBACK_TEXT[i.type] || typeMeta(i.type).label}`)
                        .join(" · ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Filtre */}
      {items.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <button
            onClick={() => setFilters([])}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filters.length === 0
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-white text-ink/60 border-mist hover:border-violet-300"
            }`}
          >
            Tümü <span className="opacity-70">{items.length}</span>
          </button>
          {typeCounts
            .filter((t) => t.n > 0)
            .map((t) => (
              <button
                key={t.id}
                onClick={() => toggleFilter(t.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  filters.includes(t.id)
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-white text-ink/60 border-mist hover:border-violet-300"
                }`}
              >
                {t.icon} {t.label} <span className="opacity-70">{t.n}</span>
              </button>
            ))}
          {filters.length > 0 && (
            <span className="text-xs text-ink/35 ml-1">{visible.length} kayıt gösteriliyor</span>
          )}
        </div>
      )}

      {/* Gün gün geçmiş */}
      <div className="flex flex-col gap-4">
        {days.length === 0 && (
          <div className="text-sm text-ink/30 text-center py-8">
            {filters.length ? "Bu filtreyle kayıt yok." : "Bu hafta için kayıt yok."}
          </div>
        )}
        {days.map(([d, arr]) => (
          <div key={d}>
            <div className="text-xs font-semibold text-ink/45 mb-1.5 flex items-center gap-2">
              {dayTitle(d)}
              <span className="font-mono text-ink/25">{arr.length} kayıt</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {arr.map((i) => (
                <div
                  key={i.key}
                  className="flex items-start gap-3 bg-white border border-mist rounded-lg px-3.5 py-2.5"
                >
                  <span className="text-base leading-6 shrink-0" title={typeMeta(i.type).label}>
                    {typeMeta(i.type).icon}
                  </span>
                  <div className="flex-1 min-w-0 text-sm leading-relaxed">
                    {i.company && (
                      <button
                        onClick={() => onOpenLead(i.lead)}
                        className="font-semibold text-violet-700 hover:underline mr-2"
                      >
                        {i.company}
                      </button>
                    )}
                    <span className="text-ink/70">{i.text || FALLBACK_TEXT[i.type] || typeMeta(i.type).label}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(i)}
                    className="text-ink/25 hover:text-rose-500 text-sm shrink-0"
                    title="Sil"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
