import { formatCurrency, isOverdue, isToday } from "../data/store";

const stripeColor = {
  indigo: "before:bg-indigo",
  amber: "before:bg-amber",
  teal: "before:bg-teal",
  brick: "before:bg-brick",
};

export default function LeadCard({ lead, stageColor, onOpen, onDragStart }) {
  const overdue = isOverdue(lead.nextActionDate);
  const today = isToday(lead.nextActionDate);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={() => onOpen(lead)}
      className={`relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-l-card ${stripeColor[stageColor]} bg-card border border-line rounded-card pl-3.5 pr-3 py-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all`}
    >
      <div className="font-semibold text-sm text-ink leading-tight">{lead.company}</div>
      <div className="text-xs text-ink/55 mt-0.5">
        {lead.contactName}
        {lead.sector && <span className="text-ink/35"> · {lead.sector}</span>}
      </div>
      <div className="flex items-center justify-between mt-2.5">
        <span className="font-mono text-sm font-medium text-ink/80">
          {formatCurrency(lead.value)}
        </span>
        {lead.nextActionDate && (
          <span
            className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
              overdue
                ? "bg-brick-light text-brick-dark"
                : today
                ? "bg-amber-light text-amber-dark"
                : "bg-line text-ink/50"
            }`}
          >
            {lead.nextActionDate}
          </span>
        )}
      </div>
    </div>
  );
}
