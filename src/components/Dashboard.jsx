import { STAGES, formatCurrency, isOverdue, isToday } from "../data/store";

export default function Dashboard({ leads, onOpen }) {
  const activeLeads = leads.filter((l) => l.stage !== "kazanildi" && l.stage !== "kaybedildi");
  const pipelineValue = activeLeads.reduce((s, l) => s + (l.value || 0), 0);
  const wonValue = leads
    .filter((l) => l.stage === "kazanildi")
    .reduce((s, l) => s + (l.value || 0), 0);
  const overdueLeads = leads.filter((l) => isOverdue(l.nextActionDate));
  const todayLeads = leads.filter((l) => isToday(l.nextActionDate));

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-1">Panel</h1>
      <p className="text-sm text-ink/50 mb-6">Bugün nereye odaklanman gerektiğine bak.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <StatCard label="Açık boru hattı" value={formatCurrency(pipelineValue)} sub={`${activeLeads.length} fırsat`} color="indigo" />
        <StatCard label="Kazanılan (toplam)" value={formatCurrency(wonValue)} sub={`${leads.filter(l=>l.stage==='kazanildi').length} anlaşma`} color="teal" />
        <StatCard label="Geciken eylem" value={overdueLeads.length} sub="takip gerekiyor" color="brick" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FollowUpList
          title="Bugün yapılacaklar"
          leads={todayLeads}
          onOpen={onOpen}
          empty="Bugün için planlanmış bir eylem yok."
        />
        <FollowUpList
          title="Gecikmiş takipler"
          leads={overdueLeads}
          onOpen={onOpen}
          empty="Gecikmiş takip yok, harika gidiyorsun."
          urgent
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  const border = {
    indigo: "border-l-indigo",
    teal: "border-l-teal",
    brick: "border-l-brick",
  }[color];
  return (
    <div className={`bg-card border border-line ${border} border-l-[3px] rounded-card p-4`}>
      <div className="text-xs font-medium text-ink/50 mb-1">{label}</div>
      <div className="font-display text-2xl text-ink">{value}</div>
      <div className="text-xs text-ink/40 mt-0.5 font-mono">{sub}</div>
    </div>
  );
}

function FollowUpList({ title, leads, onOpen, empty, urgent }) {
  return (
    <div className="bg-card border border-line rounded-card p-4">
      <h3 className="font-semibold text-sm text-ink/80 mb-3">{title}</h3>
      {leads.length === 0 ? (
        <div className="text-sm text-ink/35">{empty}</div>
      ) : (
        <div className="flex flex-col gap-2">
          {leads.map((l) => (
            <button
              key={l.id}
              onClick={() => onOpen(l)}
              className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-paper transition-colors"
            >
              <div>
                <div className="text-sm font-medium text-ink">{l.company}</div>
                <div className="text-xs text-ink/45">{l.nextActionNote || "—"}</div>
              </div>
              <span
                className={`text-[11px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                  urgent ? "bg-brick-light text-brick-dark" : "bg-amber-light text-amber-dark"
                }`}
              >
                {l.nextActionDate}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
