import { STAGES, ACTIVITY_TYPES, formatCurrency } from "../data/store";

function getWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0=Pazar .. 6=Cumartesi
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    startStr: monday.toISOString().slice(0, 10),
    endStr: sunday.toISOString().slice(0, 10),
    label: `${monday.toLocaleDateString("tr-TR")} – ${sunday.toLocaleDateString("tr-TR")}`,
  };
}

const TYPE_STYLE = {
  note: "bg-ink/5 text-ink/60",
  call: "bg-blue-100 text-blue-700",
  email: "bg-violet-100 text-violet-700",
  meeting: "bg-emerald-100 text-emerald-700",
  proposal: "bg-amber-100 text-amber-700",
};

export default function Reports({ leads }) {
  const { startStr, endStr, label } = getWeekRange();
  const isThisWeek = (d) => d && d >= startStr && d <= endStr;

  const allNotes = leads.flatMap((l) => l.notes.map((n) => ({ ...n, company: l.company })));
  const weeklyNotes = allNotes.filter((n) => isThisWeek(n.date));

  const weeklyByType = ACTIVITY_TYPES.map((t) => ({
    ...t,
    count: weeklyNotes.filter((n) => n.type === t.id).length,
  }));

  const newLeadsThisWeek = leads.filter((l) => isThisWeek(l.createdAt?.slice(0, 10))).length;

  const stageStats = STAGES.map((s) => {
    const stageLeads = leads.filter((l) => l.stage === s.id);
    return {
      ...s,
      count: stageLeads.length,
      value: stageLeads.reduce((sum, l) => sum + (l.value || 0), 0),
    };
  });

  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  const totalCount = leads.length;

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-ink mb-1">Rapor</h1>
      <p className="text-sm text-ink/40 mb-6">Haftalık temponu ve genel boru hattı durumunu gör.</p>

      {/* Haftalık aktivite */}
      <div className="mb-8">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-semibold text-sm text-ink/75">Bu Hafta</h2>
          <span className="text-xs font-mono text-ink/35">{label}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <ActivityCard icon="✨" label="Yeni Fırsat" count={newLeadsThisWeek} accent="violet" />
          {weeklyByType
            .filter((t) => t.id !== "note")
            .map((t) => (
              <ActivityCard
                key={t.id}
                icon={t.icon}
                label={t.label}
                count={t.count}
                accent={
                  t.id === "call" ? "blue" : t.id === "email" ? "violet" : t.id === "meeting" ? "emerald" : "amber"
                }
              />
            ))}
        </div>
        {weeklyNotes.filter((n) => n.type === "note").length > 0 && (
          <p className="text-xs text-ink/35 mt-2.5">
            + bu hafta {weeklyNotes.filter((n) => n.type === "note").length} genel not eklendi.
          </p>
        )}
      </div>

      {/* Genel pipeline özeti */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-semibold text-sm text-ink/75">Genel Pipeline</h2>
          <span className="text-xs font-mono text-ink/35">
            {totalCount} fırsat · {formatCurrency(totalValue)}
          </span>
        </div>
        <div className="glass rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mist text-left">
                <th className="px-4 py-2.5 text-xs font-semibold text-ink/50 uppercase tracking-wide">Aşama</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-ink/50 uppercase tracking-wide">Fırsat Sayısı</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-ink/50 uppercase tracking-wide">Toplam Değer</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-ink/50 uppercase tracking-wide">Dağılım</th>
              </tr>
            </thead>
            <tbody>
              {stageStats.map((s) => (
                <tr key={s.id} className="border-b border-mist last:border-0">
                  <td className="px-4 py-2.5 font-medium text-ink/80">{s.label}</td>
                  <td className="px-4 py-2.5 text-ink/60">{s.count}</td>
                  <td className="px-4 py-2.5 font-mono text-ink/60">{formatCurrency(s.value)}</td>
                  <td className="px-4 py-2.5">
                    <div className="w-32 h-2 rounded-full bg-mist overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-blue-500"
                        style={{ width: `${totalCount ? (s.count / totalCount) * 100 : 0}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ActivityCard({ icon, label, count, accent }) {
  const border = {
    violet: "border-l-violet-500",
    blue: "border-l-blue-500",
    emerald: "border-l-emerald-500",
    amber: "border-l-amber-500",
  }[accent];
  return (
    <div className={`glass rounded-card p-3.5 border-l-[3px] ${border}`}>
      <div className="text-lg leading-none mb-1.5">{icon}</div>
      <div className="font-display font-bold text-2xl text-ink">{count}</div>
      <div className="text-xs text-ink/45 mt-0.5">{label}</div>
    </div>
  );
}
