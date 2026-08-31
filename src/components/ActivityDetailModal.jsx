export default function ActivityDetailModal({ title, icon, entries, onClose, onDelete }) {
  return (
    <div className="fixed inset-0 bg-ink/25 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="glass rounded-3xl w-full max-w-md max-h-[75vh] overflow-hidden shadow-glow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-mist flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-lg text-ink">
              {icon} {title}
            </h2>
            <p className="text-xs text-ink/40 mt-0.5">Bugün · {entries.length} kayıt</p>
          </div>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-xl leading-none">
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-5 flex flex-col gap-2">
          {entries.length === 0 && (
            <div className="text-sm text-ink/30 text-center py-8">Bugün için henüz kayıt yok.</div>
          )}
          {entries.map((e) => (
            <div key={e.id} className="flex items-start justify-between gap-3 bg-white border border-mist rounded-lg px-3.5 py-2.5">
              <span className="text-sm text-ink/75">{e.note || "—"}</span>
              <button onClick={() => onDelete(e.id)} className="text-ink/25 hover:text-rose-500 text-sm shrink-0">
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
