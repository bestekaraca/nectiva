import { useState } from "react";
import { STAGES, TEMPERATURES, formatCurrency } from "../data/store";
import { exportToExcel } from "../lib/exportExcel";
import LeadCard from "./LeadCard";
import StageFlowBar from "./StageFlowBar";

export default function Pipeline({ leads, onMoveStage, onOpen }) {
  const [dragOverStage, setDragOverStage] = useState(null);
  const [query, setQuery] = useState("");
  const [exporting, setExporting] = useState(false);
  const [tempFilter, setTempFilter] = useState(null);

  const filtered = leads.filter(
    (l) =>
      `${l.company} ${l.contactName}`.toLowerCase().includes(query.toLowerCase()) &&
      (!tempFilter || l.temperature === tempFilter)
  );

  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData("leadId", leadId);
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    onMoveStage(leadId, stageId);
    setDragOverStage(null);
  };

  const stageLabel = (id) => STAGES.find((s) => s.id === id)?.label || id;

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportToExcel({
        filename: `nectiva-pipeline-${new Date().toISOString().slice(0, 10)}.xlsx`,
        reportTitle: "Nectiva — Pipeline Raporu",
        rows: filtered,
        columns: [
          { header: "Firma", value: (r) => r.company, width: 24 },
          { header: "İlgili Kişi", value: (r) => r.contactName, width: 20 },
          { header: "Pozisyon", value: (r) => r.position, width: 20 },
          { header: "Telefon", value: (r) => r.phone, width: 16 },
          { header: "E-posta", value: (r) => r.email, width: 24 },
          { header: "Sektör", value: (r) => r.sector, width: 16 },
          { header: "Kaynak", value: (r) => r.source, width: 16 },
          { header: "Ürünler", value: (r) => r.products.join(", "), width: 22 },
          { header: "Aşama", value: (r) => stageLabel(r.stage), width: 16 },
          { header: "Değer (₺)", value: (r) => r.value, width: 14 },
          { header: "Sonraki Eylem Tarihi", value: (r) => r.nextActionDate || "", width: 18 },
          { header: "Sonraki Eylem Notu", value: (r) => r.nextActionNote, width: 30 },
          { header: "Etiketler", value: (r) => r.tags.join(", "), width: 22 },
          { header: "Oluşturulma Tarihi", value: (r) => r.createdAt?.slice(0, 10) || "", width: 16 },
        ],
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
        <h1 className="font-display font-semibold text-2xl text-ink">Pipeline</h1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Firma veya kişi ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-56 input"
          />
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-mist bg-white text-ink/70 hover:border-violet-300 hover:text-violet-700 transition-colors disabled:opacity-50 shrink-0"
          >
            <DownloadIcon />
            {exporting ? "Hazırlanıyor..." : "Excel'e Aktar"}
          </button>
        </div>
      </div>
      <p className="text-sm text-ink/40 mb-5">Kartları sürükleyerek aşama değiştirebilirsin.</p>

      <StageFlowBar leads={leads} />

      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setTempFilter(null)}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
            tempFilter === null
              ? "bg-ink text-white border-ink"
              : "bg-white text-ink/55 border-mist hover:border-ink/25"
          }`}
        >
          Tümü
        </button>
        {TEMPERATURES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTempFilter(t.id)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              tempFilter === t.id
                ? "bg-ink text-white border-ink"
                : "bg-white text-ink/55 border-mist hover:border-ink/25"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
        {STAGES.map((stage) => {
          const stageLeads = filtered.filter((l) => l.stage === stage.id);
          const stageValue = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);
          return (
            <div
              key={stage.id}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(stage.id);
              }}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`w-64 shrink-0 rounded-xl transition-colors ${
                dragOverStage === stage.id ? "bg-violet-100/60 ring-1 ring-violet-300" : ""
              }`}
            >
              <div className="flex items-baseline justify-between px-1 mb-2.5">
                <h2 className="font-semibold text-sm text-ink/75">{stage.label}</h2>
                <span className="font-mono text-xs text-ink/35">
                  {stageLeads.length} · {formatCurrency(stageValue)}
                </span>
              </div>
              <div className="flex flex-col gap-2.5 min-h-[80px]">
                {stageLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    stageColor={stage.color}
                    onOpen={onOpen}
                    onDragStart={handleDragStart}
                  />
                ))}
                {stageLeads.length === 0 && (
                  <div className="text-xs text-ink/25 border border-dashed border-mist rounded-card py-4 text-center">
                    Boş
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
