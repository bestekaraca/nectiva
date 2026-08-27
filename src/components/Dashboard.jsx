import { formatCurrency, isOverdue, isToday } from "../data/store";
import GoalCard from "./GoalCard";

export default function Dashboard({
  leads,
  onOpen,
  goal,
  saleEntries,
  onAddSale,
  onDeleteSale,
  tasks,
  onToggleTask,
}) {
  const activeLeads = leads.filter((l) => l.stage !== "kazanildi" && l.stage !== "kaybedildi");
  const pipelineValue = activeLeads.reduce((s, l) => s + (l.value || 0), 0);
  const wonValue = leads
    .filter((l) => l.stage === "kazanildi")
    .reduce((s, l) => s + (l.value || 0), 0);
  const overdueLeads = leads.filter((l) => isOverdue(l.nextActionDate) && l.followupStatus !== "arandi");
  const todayLeads = leads.filter((l) => isToday(l.nextActionDate) && l.followupStatus !== "arandi");
  const todaysTasks = tasks
    .filter((t) => !t.done && t.dueDate && (isToday(t.dueDate) || isOverdue(t.dueDate)))
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-ink mb-1">Panel</h1>
      <p className="text-sm text-ink/45 mb-6">Bugün nereye odaklanman gerektiğine bak.</p>

      <GoalCard goal={goal} saleEntries={saleEntries} onAddSale={onAddSale} onDeleteSale={onDeleteSale} />

      {todaysTasks.length > 0 && (
        <div className="glass rounded-card p-4 mb-6">
          <h3 className="font-semibold text-sm text-ink/80 mb-3">Bugünün Görevleri</h3>
          <div className="flex flex-col gap-2">
            {todaysTasks.map((t) => {
              const overdue = isOverdue(t.dueDate);
              return (
                <label
                  key={t.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-violet-50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      onChange={() => onToggleTask(t.id, true)}
                      className="w-4 h-4 accent-violet-600"
                    />
                    <span className="text-sm text-ink/80">{t.title}</span>
                  </span>
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                      overdue
                        ? "bg-rose-50 text-rose-600 border-rose-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {t.dueDate}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

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
  const dot = {
    violet: "bg-violet-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
  }[tone];
  return (
    <div className="glass rounded-card p-4 transition-shadow hover:shadow-glow-sm">
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <div className="text-xs font-medium text-ink/50">{label}</div>
      </div>
      <div className="font-display font-semibold text-2xl text-ink">{value}</div>
      <div className="text-xs text-ink/35 mt-0.5 font-mono">{sub}</div>
    </div>
  );
}

function FollowUpList({ title, leads, onOpen, empty, urgent }) {
  return (
    <div className="glass rounded-card p-4">
      <h3 className="font-semibold text-sm text-ink/80 mb-3">{title}</h3>
      {leads.length === 0 ? (
        <div className="text-sm text-ink/30">{empty}</div>
      ) : (
        <div className="flex flex-col gap-2">
          {leads.map((l) => (
            <button
              key={l.id}
              onClick={() => onOpen(l)}
              className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-violet-50 transition-colors"
            >
              <div>
                <div className="text-sm font-medium text-ink">{l.company}</div>
                <div className="text-xs text-ink/40">{l.nextActionNote || "—"}</div>
              </div>
              <span
                className={`text-[11px] font-mono px-1.5 py-0.5 rounded shrink-0 border ${
                  urgent
                    ? "bg-rose-50 text-rose-600 border-rose-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
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
