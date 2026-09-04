import { useEffect, useState, lazy, Suspense } from "react";
import { supabase } from "./lib/supabaseClient";
import {
  fetchLeads,
  insertLead,
  updateLead,
  updateLeadStage,
  updateLeadFollowUp,
  updateFollowUpStatus,
  deleteLead,
  insertNote,
  insertPurchase,
  fetchGoal,
  fetchSaleEntries,
  insertSaleEntry,
  deleteSaleEntry,
  fetchActivityLogs,
  insertActivityLog,
  deleteActivityLog,
  fetchTasks,
  insertTask,
  updateTaskDone,
  deleteTask,
  fetchMarketingContent,
  insertMarketingContent,
  updateMarketingContentStatus,
  deleteMarketingContent,
  fetchCampaigns,
  insertCampaign,
  deleteCampaign,
  fetchMarketingEmails,
  insertMarketingEmail,
  deleteMarketingEmail,
  fetchMarketNotes,
  insertMarketNote,
  deleteMarketNote,
  fetchStrategyRows,
  insertStrategyRow,
  updateStrategyRow,
  deleteStrategyRow,
} from "./lib/db";
import { isToday } from "./data/store";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Pipeline from "./components/Pipeline";
import Contacts from "./components/Contacts";
import DailyTasks from "./components/DailyTasks";
import Marketing from "./components/Marketing";
const LinkedInStrategy = lazy(() => import("./components/LinkedInStrategy"));
import LeadModal from "./components/LeadModal";
import NewLeadModal from "./components/NewLeadModal";
import Login from "./components/Login";

// Recharts büyük bir kütüphane olduğu için Rapor sayfası sadece
// ziyaret edildiğinde yüklenir, uygulamanın açılış hızını etkilemez.
const Reports = lazy(() => import("./components/Reports"));

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = yükleniyor
  const [leads, setLeads] = useState([]);
  const [goal, setGoal] = useState(null);
  const [saleEntries, setSaleEntries] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [marketingContent, setMarketingContent] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [marketingEmails, setMarketingEmails] = useState([]);
  const [marketNotes, setMarketNotes] = useState([]);
  const [strategyData, setStrategyData] = useState({});
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [view, setView] = useState("dashboard");
  const [activeLeadId, setActiveLeadId] = useState(null);
  const [showNewLead, setShowNewLead] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    setLoadingLeads(true);
    fetchLeads()
      .then(setLeads)
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoadingLeads(false));
    fetchGoal().then(setGoal).catch((e) => setLoadError(e.message));
    fetchSaleEntries().then(setSaleEntries).catch((e) => setLoadError(e.message));
    fetchActivityLogs().then(setActivityLogs).catch((e) => setLoadError(e.message));
    fetchTasks().then(setTasks).catch((e) => setLoadError(e.message));
    fetchMarketingContent().then(setMarketingContent).catch((e) => setLoadError(e.message));
    fetchCampaigns().then(setCampaigns).catch((e) => setLoadError(e.message));
    fetchMarketingEmails().then(setMarketingEmails).catch((e) => setLoadError(e.message));
    fetchMarketNotes().then(setMarketNotes).catch((e) => setLoadError(e.message));
    fetchStrategyRows().then(setStrategyData).catch((e) => setLoadError(e.message));
  }, [session]);

  if (session === undefined) {
    return <div className="min-h-screen bg-paper" />;
  }

  if (!session) {
    return <Login />;
  }

  const activeLead = leads.find((l) => l.id === activeLeadId) || null;

  const handleMoveStage = async (leadId, stage) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage } : l)));
    try {
      await updateLeadStage(leadId, stage);
    } catch (e) {
      setLoadError(e.message);
    }
  };

  const handleSetFollowUp = async (leadId, date, note) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, nextActionDate: date, nextActionNote: note } : l))
    );
    try {
      await updateLeadFollowUp(leadId, date, note);
    } catch (e) {
      setLoadError(e.message);
    }
  };

  const handleUpdateFollowUpStatus = async (leadId, status) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, followupStatus: status } : l)));
    try {
      await updateFollowUpStatus(leadId, status);
    } catch (e) {
      setLoadError(e.message);
    }
  };

  const handleSaveLead = async (updated) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
    try {
      await updateLead(updated);
    } catch (e) {
      setLoadError(e.message);
    }
  };

  const handleDeleteLead = async (id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setActiveLeadId(null);
    try {
      await deleteLead(id);
    } catch (e) {
      setLoadError(e.message);
    }
  };

  const handleCreateLead = async (partialLead) => {
    try {
      const created = await insertLead(partialLead, session.user.id);
      setLeads((prev) => [created, ...prev]);
    } catch (e) {
      setLoadError(e.message);
    }
  };

  const handleAddNote = async (leadId, text, type = "note") => {
    const note = await insertNote(leadId, text, type);
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, notes: [note, ...l.notes] } : l))
    );
  };

  const handleAddPurchase = async (leadId, description, amount) => {
    const purchase = await insertPurchase(leadId, description, amount);
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, purchases: [purchase, ...l.purchases] } : l))
    );
  };

  const handleAddSale = async (amount, note, date) => {
    const entry = await insertSaleEntry(amount, note, date, session.user.id);
    setSaleEntries((prev) => [entry, ...prev]);
  };

  const handleDeleteSale = async (id) => {
    setSaleEntries((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteSaleEntry(id);
    } catch (e) {
      setLoadError(e.message);
    }
  };

  const handleAddActivity = async (type, note, date) => {
    const entry = await insertActivityLog(type, note, date, session.user.id);
    setActivityLogs((prev) => [entry, ...prev]);
  };

  const handleDeleteActivity = async (id) => {
    setActivityLogs((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteActivityLog(id);
    } catch (e) {
      setLoadError(e.message);
    }
  };

  const handleAddTask = async (title, dueDate, description = "") => {
    const task = await insertTask(title, dueDate, session.user.id, "genel", description);
    setTasks((prev) => [...prev, task].sort((a, b) => (a.dueDate || "9999") < (b.dueDate || "9999") ? -1 : 1));
  };

  const handleToggleTask = async (id, done) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));
    try {
      await updateTaskDone(id, done);
    } catch (e) {
      setLoadError(e.message);
    }
  };

  const handleDeleteTask = async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTask(id);
    } catch (e) {
      setLoadError(e.message);
    }
  };

  // --- Marketing ---
  const handleAddContent = async (payload) => {
    const item = await insertMarketingContent(payload, session.user.id);
    setMarketingContent((prev) => [...prev, item]);
  };
  const handleUpdateContentStatus = async (id, status) => {
    setMarketingContent((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    try {
      await updateMarketingContentStatus(id, status);
    } catch (e) {
      setLoadError(e.message);
    }
  };
  const handleDeleteContent = async (id) => {
    setMarketingContent((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteMarketingContent(id);
    } catch (e) {
      setLoadError(e.message);
    }
  };

  const handleAddCampaign = async (payload) => {
    const item = await insertCampaign(payload, session.user.id);
    setCampaigns((prev) => [item, ...prev]);
  };
  const handleDeleteCampaign = async (id) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteCampaign(id);
    } catch (e) {
      setLoadError(e.message);
    }
  };

  const handleAddMarketingEmail = async (leadId, campaign, date) => {
    const item = await insertMarketingEmail(leadId, campaign, date, session.user.id);
    setMarketingEmails((prev) => [item, ...prev]);
  };
  const handleDeleteMarketingEmail = async (id) => {
    setMarketingEmails((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteMarketingEmail(id);
    } catch (e) {
      setLoadError(e.message);
    }
  };

  const handleAddMarketingTask = async (title, dueDate, description = "") => {
    const task = await insertTask(title, dueDate, session.user.id, "marketing", description);
    setTasks((prev) => [...prev, task]);
  };

  const handleAddMarketNote = async (text, date) => {
    const note = await insertMarketNote(text, date, session.user.id);
    setMarketNotes((prev) => [note, ...prev]);
  };
  const handleDeleteMarketNote = async (id) => {
    setMarketNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteMarketNote(id);
    } catch (e) {
      setLoadError(e.message);
    }
  };

  // --- LinkedIn Strategy ---
  const handleAddStrategyRow = async (sheetKey, rowData) => {
    const currentCount = (strategyData[sheetKey] || []).length;
    const row = await insertStrategyRow(sheetKey, rowData, currentCount, session.user.id);
    setStrategyData((prev) => ({ ...prev, [sheetKey]: [...(prev[sheetKey] || []), row] }));
  };

  const handleUpdateStrategyCell = async (sheetKey, rowId, key, value) => {
    setStrategyData((prev) => ({
      ...prev,
      [sheetKey]: (prev[sheetKey] || []).map((r) => (r.id === rowId ? { ...r, [key]: value } : r)),
    }));
    const row = (strategyData[sheetKey] || []).find((r) => r.id === rowId);
    if (!row) return;
    const { id, ...rest } = row;
    try {
      await updateStrategyRow(rowId, { ...rest, [key]: value });
    } catch (e) {
      setLoadError(e.message);
    }
  };

  const handleDeleteStrategyRow = async (rowId) => {
    setStrategyData((prev) => {
      const next = {};
      for (const k in prev) next[k] = prev[k].filter((r) => r.id !== rowId);
      return next;
    });
    try {
      await deleteStrategyRow(rowId);
    } catch (e) {
      setLoadError(e.message);
    }
  };

  const todayCount = leads.filter(
    (l) => isToday(l.nextActionDate) && l.followupStatus !== "arandi"
  ).length;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper">
      <Sidebar
        view={view}
        setView={setView}
        onNewLead={() => setShowNewLead(true)}
        todayCount={todayCount}
        userEmail={session.user.email}
        onSignOut={() => supabase.auth.signOut()}
      />

      <main className="flex-1 p-5 md:p-8 max-w-6xl">
        {loadError && (
          <div className="bg-rose-50 text-rose-600 border border-rose-200 text-sm rounded-lg px-3 py-2 mb-4">
            Bir hata oluştu: {loadError}
          </div>
        )}
        {loadingLeads ? (
          <div className="text-sm text-ink/40">Yükleniyor...</div>
        ) : (
          <>
            {view === "dashboard" && (
              <Dashboard
                leads={leads}
                onOpen={(l) => setActiveLeadId(l.id)}
                goal={goal}
                saleEntries={saleEntries}
                onAddSale={handleAddSale}
                onDeleteSale={handleDeleteSale}
                tasks={tasks}
                onToggleTask={handleToggleTask}
              />
            )}
            {view === "pipeline" && (
              <Pipeline
                leads={leads}
                onMoveStage={handleMoveStage}
                onOpen={(l) => setActiveLeadId(l.id)}
              />
            )}
            {view === "contacts" && (
              <Contacts leads={leads} onOpen={(l) => setActiveLeadId(l.id)} />
            )}
            {view === "daily" && (
              <DailyTasks
                leads={leads}
                onOpenLead={(l) => setActiveLeadId(l.id)}
                onSetFollowUp={handleSetFollowUp}
                onUpdateFollowUpStatus={handleUpdateFollowUpStatus}
                onAddNote={handleAddNote}
                activityLogs={activityLogs}
                onAddActivity={handleAddActivity}
                onDeleteActivity={handleDeleteActivity}
                tasks={tasks}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
              />
            )}
            {view === "marketing" && (
              <Marketing
                leads={leads}
                content={marketingContent}
                onAddContent={handleAddContent}
                onUpdateContentStatus={handleUpdateContentStatus}
                onDeleteContent={handleDeleteContent}
                campaigns={campaigns}
                onAddCampaign={handleAddCampaign}
                onDeleteCampaign={handleDeleteCampaign}
                marketingEmails={marketingEmails}
                onAddMarketingEmail={handleAddMarketingEmail}
                onDeleteMarketingEmail={handleDeleteMarketingEmail}
                marketingTasks={tasks.filter((t) => t.category === "marketing")}
                onAddMarketingTask={handleAddMarketingTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                marketNotes={marketNotes}
                onAddMarketNote={handleAddMarketNote}
                onDeleteMarketNote={handleDeleteMarketNote}
                onOpenLinkedInStrategy={() => setView("linkedin_strategy")}
              />
            )}
            {view === "linkedin_strategy" && (
              <Suspense fallback={<div className="text-sm text-ink/40">Yükleniyor...</div>}>
                <LinkedInStrategy
                  strategyData={strategyData}
                  onAddRow={handleAddStrategyRow}
                  onUpdateCell={handleUpdateStrategyCell}
                  onDeleteRow={handleDeleteStrategyRow}
                  onBack={() => setView("marketing")}
                />
              </Suspense>
            )}
            {view === "reports" && (
              <Suspense fallback={<div className="text-sm text-ink/40">Yükleniyor...</div>}>
                <Reports leads={leads} activityLogs={activityLogs} />
              </Suspense>
            )}
          </>
        )}
      </main>

      <button
        onClick={() => setShowNewLead(true)}
        className="md:hidden fixed bottom-5 right-5 bg-gradient-to-br from-violet-600 to-blue-500 text-white font-semibold w-14 h-14 rounded-full shadow-glow text-2xl leading-none"
        aria-label="Yeni fırsat ekle"
      >
        +
      </button>

      {activeLead && (
        <LeadModal
          lead={activeLead}
          onClose={() => setActiveLeadId(null)}
          onSave={handleSaveLead}
          onDelete={handleDeleteLead}
          onAddNote={handleAddNote}
          onAddPurchase={handleAddPurchase}
        />
      )}

      {showNewLead && (
        <NewLeadModal onClose={() => setShowNewLead(false)} onCreate={handleCreateLead} />
      )}
    </div>
  );
}
