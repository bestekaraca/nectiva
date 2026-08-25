import { useState } from "react";
import { STAGES, formatCurrency } from "../data/store";
import LeadCard from "./LeadCard";
import StageFlowBar from "./StageFlowBar";

export default function Pipeline({ leads, onMoveStage, onOpen }) {
  const [dragOverStage, setDragOverStage] = useState(null);
  const [query, setQuery] = useState("");

  const filtered = leads.filter((l) =>
    `${l.company} ${l.contactName}`.toLowerCase().includes(query.toLowerCase())
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

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1">
        <h1 className="font-display text-2xl text-ink">Boru Hattı</h1>
        <input
          type="text"
          placeholder="Firma veya kişi ara..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-56 bg-card border border-line rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo"
        />
      </div>
      <p className="text-sm text-ink/50 mb-5">Kartları sürükleyerek aşama değiştirebilirsin.</p>

      <StageFlowBar leads={leads} />

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
                dragOverStage === stage.id ? "bg-indigo-light/60" : ""
              }`}
            >
              <div className="flex items-baseline justify-between px-1 mb-2.5">
                <h2 className="font-semibold text-sm text-ink/80">{stage.label}</h2>
                <span className="font-mono text-xs text-ink/40">
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
                  <div className="text-xs text-ink/30 border border-dashed border-line rounded-card py-4 text-center">
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
