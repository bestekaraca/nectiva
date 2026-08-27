import { formatCurrency, isOverdue, isToday } from "../data/store";

const stripeColor = {
  blue: "before:bg-blue-500",
  violet: "before:bg-violet-500",
  amber: "before:bg-amber-400",
  fuchsia: "before:bg-fuchsia-500",
  teal: "before:bg-emerald-500",
  brick: "before:bg-rose-500",
};

export default function LeadCard({ lead, stageColor, onOpen, onDragStart }) {
  const overdue = isOverdue(lead.nextActionDate);
  const today = isToday(lead.nextActionDate);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={() => onOpen(lead)}
      className={`relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-l-card ${stripeColor[stageColor]} glass rounded-card pl-3.5 pr-3 py-3 cursor-pointer hover:shadow-glow-sm hover:-translate-y-0.5 transition-all`}
    >
      <div className="font-semibold text-sm text-ink leading-tight">{lead.company}</div>
      <div className="text-xs text-ink/50 mt-0.5">
        {lead.contactName}
        {lead.sector && <span className="text-ink/30"> · {lead.sector}</span>}
      </div>
      <div className="flex items-center justify-between mt-2.5">
        <span className="font-mono text-sm font-medium text-ink/80">
          {formatCurrency(lead.value)}
        </span>
        {lead.nextActionDate && (
          <span
            className={`text-[11px] font-mono px-1.5 py-0.5 rounded border ${
              overdue
                ? "bg-rose-50 text-rose-600 border-rose-200"
                : today
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-mist/60 text-ink/40 border-mist"
            }`}
          >
            {lead.nextActionDate}
          </span>
        )}
      </div>
    </div>
  );
}
