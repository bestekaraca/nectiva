import BoltIcon from "./BoltIcon";

export default function Sidebar({ view, setView, onNewLead, todayCount, userEmail, onSignOut }) {
  const items = [
    { id: "dashboard", label: "Panel" },
    { id: "pipeline", label: "Pipeline" },
    { id: "contacts", label: "Kişiler" },
    { id: "daily", label: "Günlük Görevler" },
    { id: "marketing", label: "Marketing" },
    { id: "reports", label: "Rapor" },
  ];

  return (
    <aside className="w-full md:w-60 md:min-h-screen bg-gradient-to-b from-[#140F26] to-night border-r border-white/5 text-ivory flex md:flex-col shrink-0 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-violet-700 blob opacity-30" />

      <div className="relative px-5 pt-6 pb-4 hidden md:flex items-center gap-2.5">
        <BoltIcon size={26} id="sidebar" />
        <div>
          <div
            className="font-display font-bold text-2xl tracking-tight leading-none bg-clip-text text-transparent animate-shimmer drop-shadow-[0_1px_10px_rgba(139,92,246,0.35)]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #C4B5FD 0%, #A78BFA 30%, #ffffff 50%, #93C5FD 70%, #93C5FD 100%)",
              backgroundSize: "250% 100%",
            }}
          >
            Nectiva
          </div>
          <div className="text-[10px] text-violet-300/60 font-mono uppercase tracking-wider mt-0.5">
            Sales & Marketing Assistant
          </div>
        </div>
      </div>

      <nav className="relative flex md:flex-col gap-1 px-3 md:px-3 py-2 md:py-2 flex-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
              view === item.id
                ? "bg-gradient-to-r from-violet-600/25 to-blue-600/15 text-white border border-violet-500/30 shadow-glow-sm"
                : "text-white/55 hover:text-white hover:bg-white/5"
            }`}
          >
            {item.label}
            {item.id === "dashboard" && todayCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-night text-[11px] font-mono font-semibold align-middle shadow-glow-sm">
                {todayCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="relative px-3 pb-5 hidden md:flex flex-col gap-2">
        <button
          onClick={onNewLead}
          className="w-full gradient-anim animate-gradientShift bg-gradient-to-r from-violet-600 via-fuchsia-500 to-blue-500 text-white font-semibold text-sm py-2.5 rounded-lg transition-shadow hover:shadow-glow"
        >
          + Yeni fırsat
        </button>
        <div className="flex items-center justify-between px-1 pt-1">
          <span className="text-xs text-white/35 truncate">{userEmail}</span>
          <button
            onClick={onSignOut}
            className="text-xs text-white/45 hover:text-white shrink-0 ml-2"
          >
            Çıkış yap
          </button>
        </div>
      </div>
    </aside>
  );
}
