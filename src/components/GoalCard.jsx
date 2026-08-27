import { useState } from "react";
import { formatEUR } from "../data/store";
import AddSaleModal from "./AddSaleModal";

export default function GoalCard({ goal, saleEntries, onAddSale, onDeleteSale }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (!goal) return null;

  const total = saleEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const pct = Math.min(100, Math.round((total / goal.targetAmount) * 100));

  const today = new Date();
  const end = new Date(goal.endDate);
  const start = new Date(goal.startDate);
  const daysLeft = Math.max(0, Math.ceil((end - today) / (1000 * 60 * 60 * 24)));
  const monthsLeft = Math.max(1, Math.round(daysLeft / 30));
  const remaining = Math.max(0, goal.targetAmount - total);
  const monthlyPaceNeeded = remaining / monthsLeft;

  const elapsedPct = Math.min(
    100,
    Math.max(0, Math.round(((today - start) / (end - start)) * 100))
  );
  const onTrack = pct >= elapsedPct - 5;

  return (
    <div className="glass rounded-card p-5 mb-6 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-16 -right-16 w-52 h-52 rounded-full bg-violet-300 blob opacity-30" />

      <div className="relative flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <div className="text-xs font-medium text-ink/45 uppercase tracking-wide mb-1">
            Yıllık Satış Hedefi
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-3xl text-ink">{formatEUR(total)}</span>
            <span className="text-ink/35 text-sm">/ {formatEUR(goal.targetAmount)}</span>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="gradient-anim animate-gradientShift bg-gradient-to-r from-violet-600 via-fuchsia-500 to-blue-500 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-shadow hover:shadow-glow shrink-0"
        >
          + Satış ekle
        </button>
      </div>

      <div className="relative h-3 w-full rounded-full bg-mist overflow-hidden mb-2">
        <div
          className="h-full bg-gradient-to-r from-violet-600 to-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
        {/* Zaman içindeki beklenen ilerleme işareti */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-ink/25"
          style={{ left: `${elapsedPct}%` }}
          title="Bugüne kadar geçmesi beklenen oran"
        />
      </div>

      <div className="relative flex items-center justify-between flex-wrap gap-2 text-xs text-ink/50 mb-1">
        <span>
          <span className="font-semibold text-ink/70">%{pct}</span> tamamlandı ·{" "}
          {daysLeft > 0 ? `${daysLeft} gün kaldı` : "Süre doldu"}
        </span>
        <span className={onTrack ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
          {onTrack ? "Hedefin gerisinde değilsin" : "Biraz gerideyiz"}
        </span>
      </div>

      {remaining > 0 && daysLeft > 0 && (
        <p className="relative text-xs text-ink/40 mb-3">
          Hedefi tutturmak için ayda ortalama{" "}
          <span className="font-medium text-violet-700">{formatEUR(monthlyPaceNeeded)}</span> satış
          yapman gerekiyor.
        </p>
      )}

      <button
        onClick={() => setShowHistory((s) => !s)}
        className="relative text-xs text-violet-600 hover:text-violet-700 font-medium"
      >
        {showHistory ? "Geçmişi gizle" : `Satış geçmişini göster (${saleEntries.length})`}
      </button>

      {showHistory && (
        <div className="relative flex flex-col gap-1.5 mt-3 max-h-48 overflow-y-auto">
          {saleEntries.length === 0 && (
            <div className="text-xs text-ink/30">Henüz satış girişi yok.</div>
          )}
          {saleEntries.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between bg-white border border-mist rounded-lg px-3 py-2"
            >
              <div>
                <div className="text-sm text-ink/80">{e.note || "—"}</div>
                <div className="text-xs font-mono text-ink/35">{e.date}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="font-mono text-sm font-medium text-emerald-600">
                  {formatEUR(e.amount)}
                </span>
                <button
                  onClick={() => onDeleteSale(e.id)}
                  className="text-ink/25 hover:text-rose-500 text-sm leading-none"
                  title="Sil"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddSaleModal onClose={() => setShowAdd(false)} onCreate={onAddSale} />}
    </div>
  );
}
