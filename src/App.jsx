import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import {
  fetchLeads,
  insertLead,
  updateLead,
  updateLeadStage,
  deleteLead,
  insertNote,
  insertPurchase,
} from "./lib/db";
import { isToday } from "./data/store";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Pipeline from "./components/Pipeline";
import LeadModal from "./components/LeadModal";
import NewLeadModal from "./components/NewLeadModal";
import Login from "./components/Login";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = yükleniyor
  const [leads, setLeads] = useState([]);
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

  const handleAddNote = async (leadId, text) => {
    const note = await insertNote(leadId, text);
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

  const todayCount = leads.filter((l) => isToday(l.nextActionDate)).length;

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
              <Dashboard leads={leads} onOpen={(l) => setActiveLeadId(l.id)} />
            )}
            {view === "pipeline" && (
              <Pipeline
                leads={leads}
                onMoveStage={handleMoveStage}
                onOpen={(l) => setActiveLeadId(l.id)}
              />
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
