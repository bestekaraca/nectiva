import { useState } from "react";
import { CONTENT_TYPES, CAMPAIGN_CHANNELS } from "../data/store";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTH_NAMES = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

// ÖNEMLİ: toISOString() UTC'ye çevirir, bu da Türkiye gibi UTC+ dilimlerinde
// tarihi bir gün geriye kaydırabilir. Yerel yıl/ay/gün'den elle string kuruyoruz.
function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
const STATUS_CYCLE = ["yapilacak", "devam", "tamamlandi"];

export default function ContentCalendar({ content, campaigns, onAddContent, onCycleStatus }) {
  const [cursor, setCursor] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [addingDate, setAddingDate] = useState(null);
  const [quickTitle, setQuickTitle] = useState("");

  const cells = getMonthGrid(cursor.getFullYear(), cursor.getMonth());
  const todayISO = toISO(new Date());

  const contentByDate = {};
  content.forEach((c) => {
    if (!c.dueDate) return;
    (contentByDate[c.dueDate] ||= []).push({ ...c, _kind: "content" });
  });
  const campaignsByDate = {};
  (campaigns || []).forEach((c) => {
    if (!c.date) return;
    (campaignsByDate[c.date] ||= []).push({ ...c, _kind: "campaign" });
  });

  const handleQuickAdd = async (iso) => {
    if (!quickTitle.trim()) {
      setAddingDate(null);
      return;
    }
    await onAddContent({ title: quickTitle.trim(), product: "", contentType: "post", dueDate: iso, note: "" });
    setQuickTitle("");
    setAddingDate(null);
  };

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

      <p className="text-[11px] text-ink/35 mb-2">
        Bir güne tıklayıp hızlıca içerik ekle · bir etikete tıklayınca durumu ilerler (Yapılacak → Devam → Tamamlandı)
      </p>

      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-ink/35 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="min-h-[78px]" />;
          const iso = toISO(date);
          const items = contentByDate[iso] || [];
          const campaignItems = campaignsByDate[iso] || [];
          const isToday = iso === todayISO;
          const isAdding = addingDate === iso;
          return (
            <div
              key={i}
              className={`min-h-[78px] rounded-lg border p-1.5 cursor-pointer transition-colors ${
                isToday ? "bg-violet-50 border-violet-300" : "bg-white border-mist hover:border-violet-200"
              }`}
              onClick={() => !isAdding && setAddingDate(iso)}
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
                      title={`${c.title} — tıkla, durumu değiştir`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(c.status) + 1) % 3];
                        onCycleStatus(c.id, next);
                      }}
                      className="flex items-center gap-1 text-[10px] bg-mist/60 hover:bg-mist rounded px-1 py-0.5 truncate"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[c.status]}`} />
                      <span className="truncate text-ink/70">
                        {typeInfo?.icon} {c.title}
                      </span>
                    </div>
                  );
                })}
                {campaignItems.slice(0, 2).map((c) => {
                  const chInfo = CAMPAIGN_CHANNELS.find((ch) => ch.id === c.channel);
                  return (
                    <div
                      key={c.id}
                      title={`${c.title} (${chInfo?.label || c.channel})`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-[10px] bg-violet-100/70 rounded px-1 py-0.5 truncate"
                    >
                      <span className="shrink-0">{chInfo?.icon}</span>
                      <span className="truncate text-violet-800">{c.title}</span>
                    </div>
                  );
                })}
                {items.length + campaignItems.length > 5 && (
                  <div className="text-[10px] text-ink/30">
                    +{items.length + campaignItems.length - 5} daha
                  </div>
                )}
              </div>

              {isAdding && (
                <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    autoFocus
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleQuickAdd(iso);
                      if (e.key === "Escape") setAddingDate(null);
                    }}
                    onBlur={() => handleQuickAdd(iso)}
                    placeholder="İçerik adı..."
                    className="w-full text-[10px] px-1.5 py-1 border border-violet-300 rounded outline-none"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
