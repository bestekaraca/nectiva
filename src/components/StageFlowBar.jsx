import { STAGES } from "../data/store";

const colorMap = {
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  amber: "bg-amber-400",
  fuchsia: "bg-fuchsia-500",
  teal: "bg-emerald-500",
  brick: "bg-rose-500",
};

const dotMap = {
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  amber: "bg-amber-400",
  fuchsia: "bg-fuchsia-500",
  teal: "bg-emerald-500",
  brick: "bg-rose-500",
};

export default function StageFlowBar({ leads }) {
  const total = leads.length || 1;
  const counts = STAGES.map((s) => ({
    ...s,
    count: leads.filter((l) => l.stage === s.id).length,
  }));

  return (
    <div className="mb-6">
      <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-mist border border-mist">
        {counts.map((s) =>
          s.count > 0 ? (
            <div
              key={s.id}
              className={`${colorMap[s.color]} transition-all`}
              style={{ width: `${(s.count / total) * 100}%` }}
              title={`${s.label}: ${s.count}`}
            />
          ) : null
        )}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2.5">
        {counts.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5 text-xs text-ink/55">
            <span className={`w-2 h-2 rounded-full ${dotMap[s.color]}`} />
            <span className="font-medium">{s.label}</span>
            <span className="font-mono text-ink/30">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
