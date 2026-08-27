import { formatCurrency } from "../data/store";

export default function CompletedFollowUpsModal({ leads, onClose, onOpenLead, onReopen }) {
  return (
    <div className="fixed inset-0 bg-ink/25 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="glass rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-glow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-mist flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-lg text-ink">Tamamlanan Takipler</h2>
            <p className="text-xs text-ink/40 mt-0.5">{leads.length} kayıt · "Arandı" olarak işaretlenmiş</p>
          </div>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-xl leading-none">
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-5 flex flex-col gap-2">
          {leads.length === 0 && (
            <div className="text-sm text-ink/30 text-center py-8">Henüz tamamlanan takip yok.</div>
          )}
          {leads.map((l) => {
            const lastNote = l.notes[0];
            return (
              <div
                key={l.id}
                className="bg-white border border-mist rounded-lg px-3.5 py-3 flex items-center justify-between gap-3"
              >
                <button onClick={() => onOpenLead(l)} className="text-left flex-1 min-w-0 hover:opacity-70">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink truncate">{l.company}</span>
                    <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                      Arandı
                    </span>
                  </div>
                  <div className="text-xs text-ink/45 truncate mt-0.5">
                    {lastNote ? `${lastNote.date} · ${lastNote.text}` : l.nextActionNote || "—"}
                  </div>
                  <div className="text-xs font-mono text-ink/30 mt-0.5">
                    {formatCurrency(l.value)} · {l.stage}
                  </div>
                </button>
                <button
                  onClick={() => onReopen(l.id)}
                  className="text-xs font-medium text-violet-600 hover:text-violet-700 shrink-0"
                >
                  Tekrar takibe al
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
