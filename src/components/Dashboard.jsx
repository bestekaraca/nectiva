import { formatCurrency, isOverdue, isToday } from "../data/store";

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
      <h1 className="font-display text-2xl text-ivory mb-1">Panel</h1>
      <p className="text-sm text-white/45 mb-6">Bugün nereye odaklanman gerektiğine bak.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <StatCard label="Açık boru hattı" value={formatCurrency(pipelineValue)} sub={`${activeLeads.length} fırsat`} tone="violet" />
        <StatCard label="Kazanılan (toplam)" value={formatCurrency(wonValue)} sub={`${leads.filter(l=>l.stage==='kazanildi').length} anlaşma`} tone="emerald" />
        <StatCard label="Geciken eylem" value={overdueLeads.length} sub="takip gerekiyor" tone="rose" />
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

function StatCard({ label, value, sub, tone }) {
  const glow = {
    violet: "shadow-[0_0_0_1px_rgba(139,92,246,0.25)] hover:shadow-glow-sm",
    emerald: "shadow-[0_0_0_1px_rgba(16,185,129,0.25)]",
    rose: "shadow-[0_0_0_1px_rgba(244,63,94,0.25)]",
  }[tone];
  const dot = {
    violet: "bg-violet-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
  }[tone];
  return (
    <div className={`glass rounded-card p-4 transition-shadow ${glow}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <div className="text-xs font-medium text-white/50">{label}</div>
      </div>
      <div className="font-display text-2xl text-ivory">{value}</div>
      <div className="text-xs text-white/35 mt-0.5 font-mono">{sub}</div>
    </div>
  );
}

function FollowUpList({ title, leads, onOpen, empty, urgent }) {
  return (
    <div className="glass rounded-card p-4">
      <h3 className="font-semibold text-sm text-white/80 mb-3">{title}</h3>
      {leads.length === 0 ? (
        <div className="text-sm text-white/30">{empty}</div>
      ) : (
        <div className="flex flex-col gap-2">
          {leads.map((l) => (
            <button
              key={l.id}
              onClick={() => onOpen(l)}
              className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div>
                <div className="text-sm font-medium text-ivory">{l.company}</div>
                <div className="text-xs text-white/40">{l.nextActionNote || "—"}</div>
              </div>
              <span
                className={`text-[11px] font-mono px-1.5 py-0.5 rounded shrink-0 border ${
                  urgent
                    ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/20"
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
