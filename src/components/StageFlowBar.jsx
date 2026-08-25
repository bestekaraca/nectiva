import { STAGES } from "../data/store";

const colorMap = {
  indigo: "bg-indigo",
  amber: "bg-amber",
  teal: "bg-teal",
  brick: "bg-brick",
};

export default function StageFlowBar({ leads }) {
  const total = leads.length || 1;
  const counts = STAGES.map((s) => ({
    ...s,
    count: leads.filter((l) => l.stage === s.id).length,
  }));

  return (
    <div className="mb-6">
      <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-line">
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
          <div key={s.id} className="flex items-center gap-1.5 text-xs text-ink/60">
            <span className={`w-2 h-2 rounded-full ${colorMap[s.color]}`} />
            <span className="font-medium">{s.label}</span>
            <span className="font-mono text-ink/40">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
