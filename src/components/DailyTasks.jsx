import { useState } from "react";
import { isOverdue, isToday, ACTIVITY_TYPES } from "../data/store";
import FollowUpRow from "./FollowUpRow";
import CompletedFollowUpsModal from "./CompletedFollowUpsModal";
import ActivityDetailModal from "./ActivityDetailModal";
import ActivityHistoryModal from "./ActivityHistoryModal";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function DailyTasks({
  leads,
  onOpenLead,
  onSetFollowUp,
  onUpdateFollowUpStatus,
  onAddNote,
  activityLogs,
  onAddActivity,
  onDeleteActivity,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) {
  const [activityNote, setActivityNote] = useState("");
  const [activityType, setActivityType] = useState("call");
  const [activityLeadId, setActivityLeadId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState(todayStr());
  const [showDone, setShowDone] = useState(false);
  const [showCompletedFollowUps, setShowCompletedFollowUps] = useState(false);
  const [activityPopup, setActivityPopup] = useState(null); // null | 'call' | 'email' | 'meeting'
  const [showActivityHistory, setShowActivityHistory] = useState(false);

  const [followUpLeadId, setFollowUpLeadId] = useState("");
  const [followUpDate, setFollowUpDate] = useState(todayStr());
  const [followUpNote, setFollowUpNote] = useState("");

  const handleAddFollowUp = async () => {
    if (!followUpLeadId) return;
    await onSetFollowUp(followUpLeadId, followUpDate, followUpNote.trim());
    setFollowUpLeadId("");
    setFollowUpNote("");
  };

  const allNotesToday = leads.flatMap((l) => l.notes.map((n) => ({ ...n, company: l.company })))
    .filter((n) => n.date === todayStr());

  const todaysCalls =
    activityLogs.filter((a) => a.type === "call" && a.date === todayStr()).length +
    allNotesToday.filter((n) => n.type === "call").length;
  const todaysEmails =
    activityLogs.filter((a) => a.type === "email" && a.date === todayStr()).length +
    allNotesToday.filter((n) => n.type === "email").length;
  const todaysMeetings =
    activityLogs.filter((a) => a.type === "meeting" && a.date === todayStr()).length +
    allNotesToday.filter((n) => n.type === "meeting").length;
  const todaysLogs = activityLogs.filter((a) => a.date === todayStr());

  const selectedLead = leads.find((l) => l.id === activityLeadId);

  const handleLogActivity = async () => {
    if (activityLeadId) {
      const fallback =
        activityType === "call" ? "Arama yapıldı" : activityType === "email" ? "Mail gönderildi" : "Toplantı yapıldı";
      await onAddNote(activityLeadId, activityNote.trim() || fallback, activityType);
    } else {
      await onAddActivity(activityType, activityNote.trim(), todayStr());
    }
    setActivityNote("");
  };

  const followUps = leads
    .filter(
      (l) =>
        l.nextActionDate &&
        (isToday(l.nextActionDate) || isOverdue(l.nextActionDate)) &&
        l.followupStatus !== "arandi"
    )
    .sort((a, b) => (a.nextActionDate < b.nextActionDate ? -1 : 1));

  const completedFollowUps = leads
    .filter((l) => l.followupStatus === "arandi")
    .sort((a, b) => (a.nextActionDate < b.nextActionDate ? 1 : -1));

  const handleReopenFollowUp = (leadId) => {
    onUpdateFollowUpStatus(leadId, "takip_edilecek");
  };

  const openTasks = tasks
    .filter((t) => !t.done)
    .sort((a, b) => (a.dueDate || "9999") < (b.dueDate || "9999") ? -1 : 1);
  const doneTasks = tasks.filter((t) => t.done);

  const handleAddTask = async () => {
    if (!taskTitle.trim()) return;
    await onAddTask(taskTitle.trim(), taskDue || null);
    setTaskTitle("");
  };

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-ink mb-1">Günlük Görevler</h1>
      <p className="text-sm text-ink/40 mb-6">Bugünün aramaları, mailleri, takipleri ve görevleri tek yerde.</p>

      {/* Hızlı aktivite girişi */}
      <Section title="Hızlı Aktivite Girişi" subtitle="Bugün yaptığın aramaları ve mailleri buradan kaydet">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatBox icon="📞" label="Bugünkü Aramalar" count={todaysCalls} accent="blue" onClick={() => setActivityPopup("call")} />
          <StatBox icon="✉️" label="Bugünkü Mailler" count={todaysEmails} accent="violet" onClick={() => setActivityPopup("email")} />
          <StatBox icon="🤝" label="Alınan Toplantılar" count={todaysMeetings} accent="emerald" onClick={() => setActivityPopup("meeting")} />
        </div>
        <p className="text-[11px] text-ink/30 mb-3">
          Detayları görmek için kutulardan birine tıkla ·{" "}
          <button onClick={() => setShowActivityHistory(true)} className="text-violet-600 hover:text-violet-700 font-medium">
            📋 tüm geçmişi gör ({activityLogs.length} kayıt)
          </button>
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activityLeadId}
            onChange={(e) => setActivityLeadId(e.target.value)}
            className="input !w-56"
          >
            <option value="">Firma seç (opsiyonel)</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.company}
              </option>
            ))}
          </select>
          <div className="flex gap-1 bg-ink/5 rounded-lg p-1">
            <button
              onClick={() => setActivityType("call")}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
                activityType === "call" ? "bg-white shadow-sm text-ink" : "text-ink/45"
              }`}
            >
              📞 Arama
            </button>
            <button
              onClick={() => setActivityType("email")}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
                activityType === "email" ? "bg-white shadow-sm text-ink" : "text-ink/45"
              }`}
            >
              ✉️ Mail
            </button>
            <button
              onClick={() => setActivityType("meeting")}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
                activityType === "meeting" ? "bg-white shadow-sm text-ink" : "text-ink/45"
              }`}
            >
              🤝 Toplantı
            </button>
          </div>
          <input
            value={activityNote}
            onChange={(e) => setActivityNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogActivity()}
            placeholder="Not (opsiyonel, örn: Firma X ile görüştüm)"
            className="input flex-1 min-w-[200px]"
          />
          <button
            onClick={handleLogActivity}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm shrink-0"
          >
            Ekle
          </button>
        </div>

        {selectedLead && (
          <div className="mt-4 bg-violet-50/60 border border-violet-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-violet-800 mb-2">
              {selectedLead.company} — Geçmiş Aktiviteler ({selectedLead.notes.length})
            </div>
            <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
              {selectedLead.notes.length === 0 && (
                <div className="text-xs text-ink/30">Bu firma için henüz kayıt yok.</div>
              )}
              {selectedLead.notes.map((n) => (
                <div key={n.id} className="bg-white border border-mist rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-ink/35 mb-0.5">
                    <span>{n.date}</span>
                    <span className="text-ink/20">·</span>
                    <span>
                      {ACTIVITY_TYPES.find((t) => t.id === n.type)?.icon}{" "}
                      {ACTIVITY_TYPES.find((t) => t.id === n.type)?.label || "Not"}
                    </span>
                  </div>
                  <div className="text-sm text-ink/80">{n.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Takip listesi */}
      <Section title="Takip Listesi" subtitle="Bugün ve gecikmiş takipler — tıklayınca fırsat detayı açılır">
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-mist">
          <select
            value={followUpLeadId}
            onChange={(e) => setFollowUpLeadId(e.target.value)}
            className="input flex-1 min-w-[180px]"
          >
            <option value="">Firma seç...</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.company} {l.contactName ? `— ${l.contactName}` : ""}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="input font-mono !w-auto"
          />
          <input
            value={followUpNote}
            onChange={(e) => setFollowUpNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddFollowUp()}
            placeholder="Not (örn: fiyat için geri arayacak)"
            className="input flex-1 min-w-[180px]"
          />
          <button
            onClick={handleAddFollowUp}
            disabled={!followUpLeadId}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm disabled:opacity-50 shrink-0"
          >
            Ekle
          </button>
        </div>

        {followUps.length === 0 ? (
          <div className="text-sm text-ink/30">Bugün için bekleyen takip yok.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {followUps.map((l) => (
              <FollowUpRow
                key={l.id}
                lead={l}
                onOpenLead={onOpenLead}
                onSetFollowUp={onSetFollowUp}
                onUpdateFollowUpStatus={onUpdateFollowUpStatus}
                onAddNote={onAddNote}
              />
            ))}
          </div>
        )}

        {completedFollowUps.length > 0 && (
          <button
            onClick={() => setShowCompletedFollowUps(true)}
            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700"
          >
            ✅ Tamamlanan Follow-up'lar ({completedFollowUps.length})
          </button>
        )}
      </Section>

      {/* Görev listesi */}
      <Section
        title="Görev Listesi"
        subtitle="Fırsata bağlı olmayan genel görevler, bitiş tarihiyle"
      >
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatBox icon="📋" label="Toplam Görev" count={tasks.length} accent="violet" />
          <StatBox icon="✅" label="Tamamlanan" count={doneTasks.length} accent="blue" />
          <StatBox icon="🕓" label="Açık" count={openTasks.length} accent="amber" />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            placeholder="Görev başlığı (örn: Haftalık rapor hazırla)"
            className="input flex-1 min-w-[200px]"
          />
          <input
            type="date"
            value={taskDue}
            onChange={(e) => setTaskDue(e.target.value)}
            className="input font-mono !w-auto"
          />
          <button
            onClick={handleAddTask}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm shrink-0"
          >
            Ekle
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {openTasks.length === 0 && (
            <div className="text-sm text-ink/30">Açık görev yok.</div>
          )}
          {openTasks.map((t) => {
            const overdue = t.dueDate && isOverdue(t.dueDate);
            const dueToday = t.dueDate && isToday(t.dueDate);
            return (
              <div
                key={t.id}
                className="flex items-center justify-between bg-white border border-mist rounded-lg px-3 py-2.5"
              >
                <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => onToggleTask(t.id, true)}
                    className="w-4 h-4 accent-violet-600"
                  />
                  <span className="text-sm text-ink/80">{t.title}</span>
                </label>
                <div className="flex items-center gap-2 shrink-0">
                  {t.dueDate && (
                    <span
                      className={`text-[11px] font-mono px-1.5 py-0.5 rounded border ${
                        overdue
                          ? "bg-rose-50 text-rose-600 border-rose-200"
                          : dueToday
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-mist/60 text-ink/40 border-mist"
                      }`}
                    >
                      {t.dueDate}
                    </span>
                  )}
                  <button
                    onClick={() => onDeleteTask(t.id)}
                    className="text-ink/25 hover:text-rose-500 text-sm leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {doneTasks.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setShowDone((s) => !s)}
              className="text-xs text-violet-600 hover:text-violet-700 font-medium"
            >
              {showDone ? "Tamamlananları gizle" : `Tamamlananları göster (${doneTasks.length})`}
            </button>
            {showDone && (
              <div className="flex flex-col gap-1.5 mt-2">
                {doneTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between bg-mist/40 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-ink/40 line-through">{t.title}</span>
                    <button
                      onClick={() => onDeleteTask(t.id)}
                      className="text-ink/25 hover:text-rose-500 text-sm leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Section>

      {showCompletedFollowUps && (
        <CompletedFollowUpsModal
          leads={completedFollowUps}
          onClose={() => setShowCompletedFollowUps(false)}
          onOpenLead={onOpenLead}
          onReopen={handleReopenFollowUp}
        />
      )}

      {activityPopup && (
        <ActivityDetailModal
          title={
            activityPopup === "call" ? "Bugünkü Aramalar" : activityPopup === "email" ? "Bugünkü Mailler" : "Alınan Toplantılar"
          }
          icon={activityPopup === "call" ? "📞" : activityPopup === "email" ? "✉️" : "🤝"}
          entries={[
            ...activityLogs.filter((a) => a.type === activityPopup && a.date === todayStr()),
            ...allNotesToday
              .filter((n) => n.type === activityPopup)
              .map((n) => ({ id: n.id, note: `${n.company}: ${n.text}` })),
          ]}
          onClose={() => setActivityPopup(null)}
          onDelete={onDeleteActivity}
        />
      )}

      {showActivityHistory && (
        <ActivityHistoryModal
          activityLogs={activityLogs}
          onClose={() => setShowActivityHistory(false)}
          onDelete={onDeleteActivity}
        />
      )}
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="mb-8">
      <div className="mb-3">
        <h2 className="font-semibold text-sm text-ink/75">{title}</h2>
        <p className="text-xs text-ink/35">{subtitle}</p>
      </div>
      <div className="glass rounded-card p-4">{children}</div>
    </div>
  );
}

function StatBox({ icon, label, count, accent, onClick }) {
  const border = {
    blue: "border-l-blue-500",
    violet: "border-l-violet-500",
    amber: "border-l-amber-500",
    emerald: "border-l-emerald-500",
  }[accent];
  return (
    <button
      onClick={onClick}
      className={`text-left bg-white border border-mist ${border} border-l-[3px] rounded-lg p-3 hover:shadow-md transition-shadow`}
    >
      <div className="text-base leading-none mb-1">{icon}</div>
      <div className="font-display font-bold text-xl text-ink">{count}</div>
      <div className="text-xs text-ink/45 mt-0.5">{label}</div>
    </button>
  );
}
