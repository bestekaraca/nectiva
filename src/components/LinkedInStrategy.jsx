import { useState } from "react";
import { LINKEDIN_SHEETS, LINKEDIN_SCHEMAS, emptyRowFor } from "../data/linkedinStrategySchema";
import { GUIDE_STEPS, GLOSSARY, ICP_STRATEGY } from "../data/linkedinReferenceContent";
import EditableSheetTable from "./EditableSheetTable";

export default function LinkedInStrategy({ strategyData, onAddRow, onUpdateCell, onDeleteRow, onBack }) {
  const [activeSheet, setActiveSheet] = useState("master_roadmap");
  const [showGuide, setShowGuide] = useState(false);

  const roadmap = strategyData.master_roadmap || [];
  const weeklyKpi = strategyData.weekly_kpi || [];
  const targetAccounts = strategyData.target_accounts || [];

  const totalTask = roadmap.length;
  const completed = roadmap.filter((r) => r.status === "Completed").length;
  const inProgress = roadmap.filter((r) => r.status === "In Progress").length;
  const notStarted = roadmap.filter((r) => !r.status || r.status === "Not Started").length;
  const completionPct = totalTask ? Math.round((completed / totalTask) * 100) : 0;

  const totalSpend = weeklyKpi.reduce((s, r) => s + (Number(r.spend) || 0), 0);
  const totalLeads = weeklyKpi.reduce((s, r) => s + (Number(r.leads) || 0), 0);
  const totalQualified = weeklyKpi.reduce((s, r) => s + (Number(r.qualifiedLeads) || 0), 0);
  const totalDemos = weeklyKpi.reduce((s, r) => s + (Number(r.demos) || 0), 0);
  const cpl = totalLeads ? (totalSpend / totalLeads).toFixed(1) : "0";

  const tierCounts = ["Tier 1", "Tier 2", "Tier 3", "Do Not Target"].map((t) => ({
    label: t,
    count: targetAccounts.filter((a) => a.tier === t).length,
  }));

  const currentSchema = LINKEDIN_SCHEMAS[activeSheet];
  const currentRows = strategyData[activeSheet] || [];
  const searchKeyMap = { target_accounts: "company", master_roadmap: "task", lead_tracker: "sirket" };

  return (
    <div>
      <button onClick={onBack} className="text-xs text-violet-600 hover:text-violet-700 font-medium mb-3">
        ← Marketing'e dön
      </button>
      <h1 className="font-display font-semibold text-2xl text-ink mb-1">
        LinkedIn Marketing Strategy <span className="text-ink/30 text-lg font-normal">— RedFlag</span>
      </h1>
      <p className="text-sm text-ink/40 mb-6">Control Tower — ABM kampanya planlama, kurulum ve takip.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mb-6">
        <MiniStat label="Toplam Task" value={totalTask} />
        <MiniStat label="Tamamlanan" value={completed} accent="emerald" />
        <MiniStat label="Devam Eden" value={inProgress} accent="amber" />
        <MiniStat label="Bekleyen" value={notStarted} accent="rose" />
        <MiniStat label="Tamamlanma %" value={`%${completionPct}`} accent="violet" />
        <MiniStat label="Toplam Spend" value={`€${totalSpend.toFixed(0)}`} />
        <MiniStat label="Toplam Lead" value={totalLeads} />
        <MiniStat label="CPL (€)" value={cpl} />
      </div>

      <div className="glass rounded-card p-3.5 mb-6">
        <div className="text-xs font-medium text-ink/50 mb-2">Target Accounts — Tier Dağılımı</div>
        <div className="flex flex-wrap gap-4">
          {tierCounts.map((t) => (
            <span key={t.label} className="text-sm text-ink/70">
              {t.label}: <span className="font-semibold text-violet-700">{t.count}</span>
            </span>
          ))}
          <span className="text-sm text-ink/40">Toplam: {targetAccounts.length}</span>
        </div>
      </div>

      <button
        onClick={() => setShowGuide((s) => !s)}
        className="text-xs font-medium text-violet-600 hover:text-violet-700 mb-4"
      >
        {showGuide ? "▴ Rehber / Sözlük / ICP Stratejisini gizle" : "▾ Rehber / Sözlük / ICP Stratejisini göster"}
      </button>

      {showGuide && <ReferencePanel />}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {LINKEDIN_SHEETS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSheet(s.key)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              activeSheet === s.key
                ? "bg-ink text-white border-ink"
                : "bg-white text-ink/55 border-mist hover:border-ink/25"
            }`}
          >
            {s.label} {strategyData[s.key]?.length ? `(${strategyData[s.key].length})` : ""}
          </button>
        ))}
      </div>

      <div className="glass rounded-card p-4">
        <EditableSheetTable
          schema={currentSchema}
          rows={currentRows}
          searchKey={searchKeyMap[activeSheet]}
          onUpdateCell={(rowId, key, value) => onUpdateCell(activeSheet, rowId, key, value)}
          onAddRow={() => onAddRow(activeSheet, emptyRowFor(activeSheet))}
          onDeleteRow={(rowId) => onDeleteRow(rowId)}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent }) {
  const color = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-500",
    violet: "text-violet-600",
  }[accent];
  return (
    <div className="glass rounded-card p-2.5">
      <div className={`font-display font-bold text-lg leading-none ${color || "text-ink"}`}>{value}</div>
      <div className="text-[10px] text-ink/40 mt-1">{label}</div>
    </div>
  );
}

function ReferencePanel() {
  return (
    <div className="glass rounded-card p-4 mb-6 max-h-[500px] overflow-y-auto">
      <h3 className="font-display font-semibold text-base text-ink mb-3">ICP & ABM Stratejisi</h3>
      <p className="text-sm text-ink/70 mb-3">{ICP_STRATEGY.objective}</p>
      <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2 mb-4">
        <strong>Zorunlu kriter:</strong> {ICP_STRATEGY.nonNegotiable}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs font-semibold text-ink/60 mb-1.5">ICP Puanlama</div>
          {ICP_STRATEGY.scoring.map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs text-ink/60 py-0.5 border-b border-mist">
              <span>{k}</span>
              <span className="font-mono">{v}</span>
            </div>
          ))}
        </div>
        <div>
          <div className="text-xs font-semibold text-ink/60 mb-1.5">Tiering</div>
          {ICP_STRATEGY.tiering.map(([tier, range, desc]) => (
            <div key={tier} className="flex justify-between text-xs text-ink/60 py-0.5 border-b border-mist">
              <span>{tier} <span className="font-mono text-ink/35">({range})</span></span>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs font-semibold text-ink/60 mb-1.5">Persona Önceliği</div>
        {ICP_STRATEGY.personas.map(([p, desc]) => (
          <div key={p} className="text-xs text-ink/60 mb-1">
            <span className="font-medium text-ink/75">{p}:</span> {desc}
          </div>
        ))}
      </div>

      <h3 className="font-display font-semibold text-base text-ink mb-3 mt-6">Başlangıç Rehberi</h3>
      <div className="flex flex-col gap-2 mb-6">
        {GUIDE_STEPS.map((s, i) => (
          <div key={i} className="text-xs bg-white border border-mist rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-ink/35">#{s.id}</span>
              <span className="font-medium text-ink/80">{s.what}</span>
            </div>
            <div className="text-ink/55">{s.how}</div>
            <div className="text-ink/35 italic mt-0.5">💡 {s.tip}</div>
          </div>
        ))}
      </div>

      <h3 className="font-display font-semibold text-base text-ink mb-3">Sözlük</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {GLOSSARY.map(([term, def]) => (
          <div key={term} className="text-xs">
            <span className="font-medium text-ink/80">{term}:</span>{" "}
            <span className="text-ink/55">{def}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
