import { useState } from "react";

const MONTH_NAMES = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function isSameMonth(dateStr, year, month) {
  if (!dateStr) return false;
  const d = new Date(dateStr + "T00:00:00");
  return d.getFullYear() === year && d.getMonth() === month;
}

export default function MonthlyTaskReport({ tasks, onToggleTask }) {
  const [cursor, setCursor] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const monthTasks = tasks
    .filter((t) => isSameMonth(t.dueDate, year, month))
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));

  const total = monthTasks.length;
  const done = monthTasks.filter((t) => t.done).length;
  const open = total - done;
  const successRate = total ? Math.round((done / total) * 100) : 0;

  const successColor =
    successRate >= 75 ? "text-emerald-600" : successRate >= 40 ? "text-amber-600" : "text-rose-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-sm text-ink/75">
          {MONTH_NAMES[month]} {year} — Görev Raporu
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="w-7 h-7 rounded-lg border border-mist bg-white text-ink/50 hover:text-ink text-sm"
          >
            ‹
          </button>
          <button
            onClick={() => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
            className="text-xs px-2.5 h-7 rounded-lg border border-mist bg-white text-ink/50 hover:text-ink"
          >
            Bu Ay
          </button>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="w-7 h-7 rounded-lg border border-mist bg-white text-ink/50 hover:text-ink text-sm"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="glass rounded-card p-3">
          <div className="font-display font-bold text-xl text-ink">{total}</div>
          <div className="text-xs text-ink/45 mt-0.5">Toplam Görev</div>
        </div>
        <div className="glass rounded-card p-3">
          <div className="font-display font-bold text-xl text-emerald-600">{done}</div>
          <div className="text-xs text-ink/45 mt-0.5">Tamamlanan</div>
        </div>
        <div className="glass rounded-card p-3">
          <div className="font-display font-bold text-xl text-amber-600">{open}</div>
          <div className="text-xs text-ink/45 mt-0.5">Açık</div>
        </div>
        <div className="glass rounded-card p-3">
          <div className={`font-display font-bold text-xl ${successColor}`}>%{successRate}</div>
          <div className="text-xs text-ink/45 mt-0.5">Başarı Oranı</div>
        </div>
      </div>

      {total > 0 && (
        <div className="h-2.5 w-full rounded-full bg-mist overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all"
            style={{ width: `${successRate}%` }}
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {monthTasks.length === 0 && (
          <div className="text-sm text-ink/30 text-center py-6">
            {MONTH_NAMES[month]} {year} için hiç görev yok. Bu ayın görevlerini Günlük Görevler veya Marketing
            sayfasından, bitiş tarihi bu aya denk gelecek şekilde ekleyebilirsin.
          </div>
        )}
        {monthTasks.map((t) => (
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
            <span className="text-[11px] font-mono text-ink/35 shrink-0">{t.dueDate}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
