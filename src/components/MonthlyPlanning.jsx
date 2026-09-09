import { useState, useEffect } from "react";
import { formatEUR, isOverdue } from "../data/store";
import MonthlyTargetsPanel from "./MonthlyTargetsPanel";
import ContentCalendar from "./ContentCalendar";

const MONTH_NAMES = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function toISO(d) {
  return d.toISOString().slice(0, 10);
}
function monthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
}
function monthsBetween(startISO, endISO) {
  const s = new Date(startISO);
  const e = new Date(endISO);
  return Math.max(1, (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1);
}

export default function MonthlyPlanning({
  leads,
  activityLogs,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  goal,
  saleEntries,
  content,
  campaigns,
  onAddContent,
  onUpdateContentStatus,
  monthlyTargets,
  onSaveMonthlyTarget,
  monthlyPlanNotes,
  onSavePlanNote,
  scorecardItems,
  onAddScorecardItem,
  onUpdateScorecardActual,
  onDeleteScorecardItem,
  onDeleteNote,
  onDeleteActivity,
}) {
  const [cursor, setCursor] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const key = monthKey(year, month);
  const monthStart = key;
  const monthEnd = monthKey(year, month + 1);

  // --- Satış hedefi ilerlemesi (bu ay) ---
  let goalSection = null;
  if (goal) {
    const totalMonths = monthsBetween(goal.startDate, goal.endDate);
    const monthlyTarget = goal.targetAmount / totalMonths;
    const monthActual = saleEntries
      .filter((e) => e.date >= monthStart && e.date < monthEnd)
      .reduce((s, e) => s + (e.amount || 0), 0);
    const pct = monthlyTarget > 0 ? Math.min(100, Math.round((monthActual / monthlyTarget) * 100)) : 0;
    goalSection = { monthlyTarget, monthActual, pct };
  }

  // --- Bu ayın görevleri ---
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const monthTasks = tasks
    .filter((t) => t.dueDate && t.dueDate >= monthStart && t.dueDate < monthEnd)
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
  const handleAddTask = async () => {
    if (!taskTitle.trim()) return;
    const due = taskDue || toISO(new Date(year, month, Math.min(new Date().getDate(), 28)));
    await onAddTask(taskTitle.trim(), due);
    setTaskTitle("");
    setTaskDue("");
  };

  // --- Strateji notu ---
  const existingNote = monthlyPlanNotes.find((n) => n.month === key);
  const [noteText, setNoteText] = useState(existingNote?.note || "");
  const [noteSaving, setNoteSaving] = useState(false);
  useEffect(() => {
    setNoteText(existingNote?.note || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const handleSaveNote = async () => {
    setNoteSaving(true);
    try {
      await onSavePlanNote(key, noteText);
    } finally {
      setNoteSaving(false);
    }
  };

  // --- Kampanya hedef tablosu ---
  const [scLabel, setScLabel] = useState("");
  const [scTarget, setScTarget] = useState("");
  const monthScorecard = scorecardItems
    .filter((s) => s.month === key)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const handleAddScorecard = async () => {
    if (!scLabel.trim()) return;
    await onAddScorecardItem({
      month: key,
      label: scLabel.trim(),
      targetText: scTarget.trim(),
      sortOrder: monthScorecard.length + 1,
    });
    setScLabel("");
    setScTarget("");
  };

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-ink mb-1">Aylık Planlama</h1>
      <p className="text-sm text-ink/40 mb-5">Bir ayı seç, o ayın hedeflerini, görevlerini ve stratejisini planla.</p>

      <div className="flex items-center gap-1 mb-6">
        <button
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="w-8 h-8 rounded-lg border border-mist bg-white text-ink/50 hover:text-ink"
        >
          ‹
        </button>
        <span className="text-base font-display font-semibold text-ink px-2 min-w-[140px] text-center">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="w-8 h-8 rounded-lg border border-mist bg-white text-ink/50 hover:text-ink"
        >
          ›
        </button>
        <button
          onClick={() => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
          className="text-xs px-3 h-8 rounded-lg border border-mist bg-white text-ink/50 hover:text-ink ml-1"
        >
          Bu Ay
        </button>
      </div>

      {/* Satış Hedefi İlerlemesi */}
      <Section title="Satış Hedefi İlerlemesi" subtitle="Yıllık hedefinin bu aya düşen payı">
        {!goal ? (
          <div className="text-sm text-ink/30">Panel'de bir yıllık satış hedefi tanımlamadın.</div>
        ) : (
          <>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-display font-bold text-2xl text-ink">{formatEUR(goalSection.monthActual)}</span>
              <span className="text-ink/35 text-sm">/ {formatEUR(goalSection.monthlyTarget)} (bu ayın payı)</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-mist overflow-hidden">
              <div
                className={`h-full transition-all ${
                  goalSection.pct >= 100 ? "bg-emerald-500" : goalSection.pct >= 50 ? "bg-amber-500" : "bg-rose-500"
                }`}
                style={{ width: `${goalSection.pct}%` }}
              />
            </div>
            <div className="text-xs text-ink/40 mt-1.5">%{goalSection.pct} tamamlandı</div>
          </>
        )}
      </Section>

      {/* Bu Ayın Görevleri */}
      <Section title="Bu Ayın Görevleri" subtitle="Bu aya ait yapılacaklar, işaretlenebilir">
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            placeholder="Görev başlığı"
            className="input flex-1 min-w-[200px]"
          />
          <input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} className="input font-mono !w-auto" />
          <button
            onClick={handleAddTask}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm shrink-0"
          >
            Ekle
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          {monthTasks.length === 0 && (
            <div className="text-sm text-ink/30">Bu ay için görev yok.</div>
          )}
          {monthTasks.map((t) => {
            const overdue = !t.done && isOverdue(t.dueDate);
            return (
              <label
                key={t.id}
                className="flex items-center justify-between gap-3 bg-white border border-mist rounded-lg px-3 py-2 cursor-pointer"
              >
                <span className="flex items-center gap-2.5 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => onToggleTask(t.id, !t.done)}
                    className="w-4 h-4 accent-emerald-600 shrink-0"
                  />
                  <span className={`text-sm truncate ${t.done ? "text-ink/35 line-through" : "text-ink/80"}`}>
                    {t.title}
                  </span>
                  {t.product && (
                    <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200 shrink-0">
                      {t.product}
                    </span>
                  )}
                </span>
                <span className={`text-[11px] font-mono shrink-0 ${overdue ? "text-rose-500" : "text-ink/35"}`}>
                  {t.dueDate}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onDeleteTask(t.id);
                  }}
                  className="text-ink/25 hover:text-rose-500 text-sm shrink-0"
                >
                  ×
                </button>
              </label>
            );
          })}
        </div>
      </Section>

      {/* Strateji notu */}
      <Section title="Bu Ayın Stratejisi" subtitle="Serbest not — hedeflerin, önceliklerin, planların">
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={5}
          placeholder="Örn: Bu ay RedFlag için 3 yeni referans müşteri hedefliyorum, ağırlığı finans sektörüne veriyorum..."
          className="input resize-none mb-2"
        />
        <button
          onClick={handleSaveNote}
          disabled={noteSaving}
          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm disabled:opacity-50"
        >
          {noteSaving ? "Kaydediliyor..." : "Notu Kaydet"}
        </button>
      </Section>

      {/* Kampanya Hedef Tablosu */}
      <Section
        title="Kampanya Hedef Tablosu"
        subtitle="Serbest metrikler — hedefi sen belirle, gerçekleşeni sen gir (örn. arama, mail, nitelikli fırsat, teklif)"
      >
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            value={scLabel}
            onChange={(e) => setScLabel(e.target.value)}
            placeholder="Metrik adı (örn: Nitelikli RedFlag Fırsatı)"
            className="input flex-1 min-w-[200px]"
          />
          <input
            value={scTarget}
            onChange={(e) => setScTarget(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddScorecard()}
            placeholder="Hedef (örn: 4-5, En az 2, 120)"
            className="input !w-40"
          />
          <button
            onClick={handleAddScorecard}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm shrink-0"
          >
            Ekle
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          {monthScorecard.length === 0 && (
            <div className="text-sm text-ink/30">Bu ay için hedef metriği yok.</div>
          )}
          {monthScorecard.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 bg-white border border-mist rounded-lg px-3 py-2">
              <span className="text-sm text-ink/80 flex-1 min-w-0 truncate">{s.label}</span>
              <span className="text-xs font-mono text-ink/40 shrink-0">Hedef: {s.targetText}</span>
              <input
                type="number"
                defaultValue={s.actualValue}
                onBlur={(e) => onUpdateScorecardActual(s.id, Number(e.target.value) || 0)}
                className="input font-mono !w-20 text-center shrink-0"
                title="Gerçekleşen"
              />
              <button
                onClick={() => onDeleteScorecardItem(s.id)}
                className="text-ink/25 hover:text-rose-500 text-sm shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Aylık Hedefler (arama/mail/toplantı) */}
      <Section title="Aylık Hedefler" subtitle="Ay + ürün bazlı arama/mail/toplantı hedefi (kendi ay/ürün seçimiyle)">
        <MonthlyTargetsPanel
          leads={leads}
          activityLogs={activityLogs}
          targets={monthlyTargets}
          onSaveTarget={onSaveMonthlyTarget}
          onDeleteNote={onDeleteNote}
          onDeleteActivity={onDeleteActivity}
        />
      </Section>

      {/* İçerik & Kampanya Takvimi */}
      <Section title="İçerik & Kampanya Takvimi" subtitle="Marketing modülündeki takvimin aynısı, kendi ay seçimiyle">
        <ContentCalendar
          content={content}
          campaigns={campaigns}
          onAddContent={onAddContent}
          onCycleStatus={onUpdateContentStatus}
        />
      </Section>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="mb-8">
      <div className="mb-3">
        <h2 className="font-semibold text-sm text-ink/75">{title}</h2>
        <p className="text-xs text-ink/35">{subtitle}</p>
      </div>
      <div className="glass rounded-card p-4">{children}</div>
    </div>
  );
}
