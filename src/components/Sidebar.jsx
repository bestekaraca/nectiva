export default function Sidebar({ view, setView, onNewLead, todayCount, userEmail, onSignOut }) {
  const items = [
    { id: "dashboard", label: "Panel", hint: null },
    { id: "pipeline", label: "Boru Hattı", hint: null },
  ];

  return (
    <aside className="w-full md:w-60 md:min-h-screen bg-ink text-paper flex md:flex-col shrink-0">
      <div className="px-5 pt-6 pb-4 hidden md:block">
        <div className="font-display text-2xl tracking-tight">Nexivra</div>
        <div className="text-xs text-white/50 font-mono uppercase tracking-wider mt-0.5">
          Satış Asistanı
        </div>
      </div>

      <nav className="flex md:flex-col gap-1 px-3 md:px-3 py-2 md:py-2 flex-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
              view === item.id
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {item.label}
            {item.id === "dashboard" && todayCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber text-ink text-[11px] font-mono font-semibold align-middle">
                {todayCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-5 hidden md:flex flex-col gap-2">
        <button
          onClick={onNewLead}
          className="w-full bg-amber hover:bg-amber-dark text-ink font-semibold text-sm py-2.5 rounded-lg transition-colors"
        >
          + Yeni fırsat
        </button>
        <div className="flex items-center justify-between px-1 pt-1">
          <span className="text-xs text-white/40 truncate">{userEmail}</span>
          <button
            onClick={onSignOut}
            className="text-xs text-white/50 hover:text-white shrink-0 ml-2"
          >
            Çıkış yap
          </button>
        </div>
      </div>
    </aside>
  );
}
