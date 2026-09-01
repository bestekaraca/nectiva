import { useState } from "react";
import { exportToExcel } from "../lib/exportExcel";

const TYPE_ICON = { call: "📞", email: "✉️", meeting: "🤝" };
const TYPE_LABEL = { call: "Arama", email: "Mail", meeting: "Toplantı" };

export default function ActivityHistoryModal({ activityLogs, onClose, onDelete }) {
  const [exporting, setExporting] = useState(false);

  // Tarihe göre grupla, en yeni gün en üstte
  const byDate = {};
  activityLogs.forEach((a) => {
    (byDate[a.date] ||= []).push(a);
  });
  const dates = Object.keys(byDate).sort((a, b) => (a < b ? 1 : -1));

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportToExcel({
        filename: `nectiva-aktivite-gecmisi-${new Date().toISOString().slice(0, 10)}.xlsx`,
        reportTitle: "Nectiva — Aktivite Geçmişi (Arama / Mail / Toplantı)",
        rows: activityLogs,
        columns: [
          { header: "Tarih", value: (r) => r.date, width: 16 },
          { header: "Tür", value: (r) => TYPE_LABEL[r.type] || r.type, width: 14 },
          { header: "Not", value: (r) => r.note, width: 50 },
        ],
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/25 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="glass rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-glow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-mist flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-lg text-ink">Aktivite Geçmişi</h2>
            <p className="text-xs text-ink/40 mt-0.5">Toplam {activityLogs.length} kayıt · {dates.length} gün</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-mist bg-white text-ink/70 hover:border-violet-300 hover:text-violet-700 disabled:opacity-50"
            >
              {exporting ? "Hazırlanıyor..." : "Excel'e Aktar"}
            </button>
            <button onClick={onClose} className="text-ink/40 hover:text-ink text-xl leading-none">
              ×
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-5 flex flex-col gap-5">
          {dates.length === 0 && (
            <div className="text-sm text-ink/30 text-center py-8">Henüz kayıt yok.</div>
          )}
          {dates.map((date) => {
            const entries = byDate[date];
            const counts = { call: 0, email: 0, meeting: 0 };
            entries.forEach((e) => (counts[e.type] = (counts[e.type] || 0) + 1));
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold text-ink/60">{date}</span>
                  <span className="text-[11px] text-ink/35">
                    📞 {counts.call} · ✉️ {counts.email} · 🤝 {counts.meeting}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {entries.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-start justify-between gap-3 bg-white border border-mist rounded-lg px-3 py-2"
                    >
                      <span className="text-sm text-ink/75">
                        {TYPE_ICON[e.type]} {e.note || `${TYPE_LABEL[e.type]} yapıldı`}
                      </span>
                      <button
                        onClick={() => onDelete(e.id)}
                        className="text-ink/25 hover:text-rose-500 text-sm shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
