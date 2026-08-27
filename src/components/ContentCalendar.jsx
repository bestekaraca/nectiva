import { useState } from "react";
import { CONTENT_TYPES, CONTENT_STATUSES } from "../data/store";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTH_NAMES = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function toISO(d) {
  return d.toISOString().slice(0, 10);
}

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Pazartesi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1;
    cells.push(dayNum >= 1 && dayNum <= daysInMonth ? new Date(year, month, dayNum) : null);
  }
  return cells;
}

const statusDot = {
  yapilacak: "bg-rose-400",
  devam: "bg-amber-400",
  tamamlandi: "bg-emerald-400",
};

export default function ContentCalendar({ content }) {
  const [cursor, setCursor] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const cells = getMonthGrid(cursor.getFullYear(), cursor.getMonth());
  const todayISO = toISO(new Date());

  const contentByDate = {};
  content.forEach((c) => {
    if (!c.dueDate) return;
    (contentByDate[c.dueDate] ||= []).push(c);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-sm text-ink/75">
          {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="w-7 h-7 rounded-lg border border-mist bg-white text-ink/50 hover:text-ink text-sm"
          >
            ‹
          </button>
          <button
            onClick={() => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
            className="text-xs px-2.5 h-7 rounded-lg border border-mist bg-white text-ink/50 hover:text-ink"
          >
            Bugün
          </button>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="w-7 h-7 rounded-lg border border-mist bg-white text-ink/50 hover:text-ink text-sm"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-ink/35 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="min-h-[70px]" />;
          const iso = toISO(date);
          const items = contentByDate[iso] || [];
          const isToday = iso === todayISO;
          return (
            <div
              key={i}
              className={`min-h-[70px] rounded-lg border p-1.5 ${
                isToday ? "bg-violet-50 border-violet-300" : "bg-white border-mist"
              }`}
            >
              <div className={`text-[11px] font-mono mb-1 ${isToday ? "text-violet-700 font-bold" : "text-ink/35"}`}>
                {date.getDate()}
              </div>
              <div className="flex flex-col gap-0.5">
                {items.slice(0, 3).map((c) => {
                  const typeInfo = CONTENT_TYPES.find((t) => t.id === c.contentType);
                  return (
                    <div
                      key={c.id}
                      title={c.title}
                      className="flex items-center gap-1 text-[10px] bg-mist/60 rounded px-1 py-0.5 truncate"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[c.status]}`} />
                      <span className="truncate text-ink/70">
                        {typeInfo?.icon} {c.title}
                      </span>
                    </div>
                  );
                })}
                {items.length > 3 && (
                  <div className="text-[10px] text-ink/30">+{items.length - 3} daha</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
