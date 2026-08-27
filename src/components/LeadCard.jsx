import { formatCurrency, isOverdue, isToday } from "../data/store";

const stripeColor = {
  indigo: "before:bg-gradient-to-b before:from-violet-500 before:to-blue-500",
  amber: "before:bg-amber-400",
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
      <div className="font-semibold text-sm text-ivory leading-tight">{lead.company}</div>
      <div className="text-xs text-white/45 mt-0.5">
        {lead.contactName}
        {lead.sector && <span className="text-white/25"> · {lead.sector}</span>}
      </div>
      <div className="flex items-center justify-between mt-2.5">
        <span className="font-mono text-sm font-medium text-white/75">
          {formatCurrency(lead.value)}
        </span>
        {lead.nextActionDate && (
          <span
            className={`text-[11px] font-mono px-1.5 py-0.5 rounded border ${
              overdue
                ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                : today
                ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                : "bg-white/5 text-white/40 border-white/10"
            }`}
          >
            {lead.nextActionDate}
          </span>
        )}
      </div>
    </div>
  );
}
