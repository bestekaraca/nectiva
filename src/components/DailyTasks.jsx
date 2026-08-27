import { useState } from "react";
import { isOverdue, isToday } from "../data/store";
import FollowUpRow from "./FollowUpRow";
import CompletedFollowUpsModal from "./CompletedFollowUpsModal";

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
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState(todayStr());
  const [showDone, setShowDone] = useState(false);
  const [showCompletedFollowUps, setShowCompletedFollowUps] = useState(false);

  const [followUpLeadId, setFollowUpLeadId] = useState("");
  const [followUpDate, setFollowUpDate] = useState(todayStr());
  const [followUpNote, setFollowUpNote] = useState("");

  const handleAddFollowUp = async () => {
    if (!followUpLeadId) return;
    await onSetFollowUp(followUpLeadId, followUpDate, followUpNote.trim());
    setFollowUpLeadId("");
    setFollowUpNote("");
  };

  const todaysCalls = activityLogs.filter((a) => a.type === "call" && a.date === todayStr()).length;
  const todaysEmails = activityLogs.filter((a) => a.type === "email" && a.date === todayStr()).length;
  const todaysLogs = activityLogs.filter((a) => a.date === todayStr());

  const handleLogActivity = async () => {
    await onAddActivity(activityType, activityNote.trim(), todayStr());
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
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatBox icon="📞" label="Bugünkü Aramalar" count={todaysCalls} accent="blue" />
          <StatBox icon="✉️" label="Bugünkü Mailler" count={todaysEmails} accent="violet" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

        {todaysLogs.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-4">
            {todaysLogs.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between bg-white border border-mist rounded-lg px-3 py-2"
              >
                <span className="text-sm text-ink/75">
                  {a.type === "call" ? "📞" : "✉️"} {a.note || (a.type === "call" ? "Arama yapıldı" : "Mail gönderildi")}
                </span>
                <button
                  onClick={() => onDeleteActivity(a.id)}
                  className="text-ink/25 hover:text-rose-500 text-sm leading-none"
                >
                  ×
                </button>
              </div>
            ))}
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

function StatBox({ icon, label, count, accent }) {
  const border = {
    blue: "border-l-blue-500",
    violet: "border-l-violet-500",
    amber: "border-l-amber-500",
  }[accent];
  return (
    <div className={`bg-white border border-mist ${border} border-l-[3px] rounded-lg p-3`}>
      <div className="text-base leading-none mb-1">{icon}</div>
      <div className="font-display font-bold text-xl text-ink">{count}</div>
      <div className="text-xs text-ink/45 mt-0.5">{label}</div>
    </div>
  );
}
