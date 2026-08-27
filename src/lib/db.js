import { supabase } from "./supabaseClient";

// --- Satır <-> uygulama nesnesi dönüşümleri -------------------------------

function rowToLead(row) {
  return {
    id: row.id,
    company: row.company || "",
    contactName: row.contact_name || "",
    phone: row.phone || "",
    email: row.email || "",
    address: row.address || "",
    sector: row.sector || "",
    source: row.source || "",
    website: row.website || "",
    position: row.position || "",
    products: row.products || [],
    followupStatus: row.followup_status || "takip_edilecek",
    tags: row.tags || [],
    value: row.value || 0,
    stage: row.stage || "yeni",
    nextActionDate: row.next_action_date,
    nextActionNote: row.next_action_note || "",
    createdAt: row.created_at,
    notes: (row.notes || [])
      .map((n) => ({ id: n.id, date: n.date, text: n.text, type: n.type || "note" }))
      .sort((a, b) => (a.date < b.date ? 1 : -1)),
    purchases: (row.purchases || [])
      .map((p) => ({ id: p.id, date: p.date, description: p.description, amount: p.amount }))
      .sort((a, b) => (a.date < b.date ? 1 : -1)),
  };
}

function leadToRow(lead, userId) {
  return {
    company: lead.company,
    contact_name: lead.contactName,
    phone: lead.phone,
    email: lead.email,
    address: lead.address,
    sector: lead.sector,
    source: lead.source,
    website: lead.website,
    position: lead.position,
    products: lead.products,
    followup_status: lead.followupStatus,
    tags: lead.tags,
    value: lead.value,
    stage: lead.stage,
    next_action_date: lead.nextActionDate,
    next_action_note: lead.nextActionNote,
    ...(userId ? { user_id: userId } : {}),
  };
}

// --- Sorgular ---------------------------------------------------------------

export async function fetchLeads() {
  const { data, error } = await supabase
    .from("leads")
    .select("*, notes(*), purchases(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(rowToLead);
}

export async function insertLead(partialLead, userId) {
  const { data, error } = await supabase
    .from("leads")
    .insert(leadToRow({ tags: [], products: [], nextActionDate: null, nextActionNote: "", ...partialLead }, userId))
    .select()
    .single();
  if (error) throw error;
  return rowToLead({ ...data, notes: [], purchases: [] });
}

export async function updateLead(lead) {
  const { error } = await supabase.from("leads").update(leadToRow(lead)).eq("id", lead.id);
  if (error) throw error;
}

export async function updateLeadStage(id, stage) {
  const { error } = await supabase.from("leads").update({ stage }).eq("id", id);
  if (error) throw error;
}

export async function updateLeadFollowUp(id, nextActionDate, nextActionNote) {
  const { error } = await supabase
    .from("leads")
    .update({ next_action_date: nextActionDate, next_action_note: nextActionNote })
    .eq("id", id);
  if (error) throw error;
}

export async function updateFollowUpStatus(id, status) {
  const { error } = await supabase.from("leads").update({ followup_status: status }).eq("id", id);
  if (error) throw error;
}

export async function deleteLead(id) {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
}

export async function insertNote(leadId, text, type = "note") {
  const { data, error } = await supabase
    .from("notes")
    .insert({ lead_id: leadId, text, type })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, date: data.date, text: data.text, type: data.type };
}

export async function insertPurchase(leadId, description, amount) {
  const { data, error } = await supabase
    .from("purchases")
    .insert({ lead_id: leadId, description, amount })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, date: data.date, description: data.description, amount: data.amount };
}

// --- Yıllık satış hedefi ---------------------------------------------------

export async function fetchGoal() {
  const { data, error } = await supabase
    .from("sales_goals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    targetAmount: data.target_amount,
    currency: data.currency,
    startDate: data.start_date,
    endDate: data.end_date,
  };
}

export async function upsertGoal({ id, targetAmount, startDate, endDate }, userId) {
  if (id) {
    const { error } = await supabase
      .from("sales_goals")
      .update({ target_amount: targetAmount, start_date: startDate, end_date: endDate })
      .eq("id", id);
    if (error) throw error;
    return { id, targetAmount, currency: "EUR", startDate, endDate };
  }
  const { data, error } = await supabase
    .from("sales_goals")
    .insert({ target_amount: targetAmount, start_date: startDate, end_date: endDate, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    targetAmount: data.target_amount,
    currency: data.currency,
    startDate: data.start_date,
    endDate: data.end_date,
  };
}

export async function fetchSaleEntries() {
  const { data, error } = await supabase
    .from("sale_entries")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data.map((e) => ({
    id: e.id,
    amount: e.amount,
    note: e.note,
    date: e.date,
  }));
}

export async function insertSaleEntry(amount, note, date, userId) {
  const { data, error } = await supabase
    .from("sale_entries")
    .insert({ amount, note, date, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, amount: data.amount, note: data.note, date: data.date };
}

export async function deleteSaleEntry(id) {
  const { error } = await supabase.from("sale_entries").delete().eq("id", id);
  if (error) throw error;
}

// --- Günlük aktivite kaydı (arama / mail) ----------------------------------

export async function fetchActivityLogs() {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((a) => ({ id: a.id, type: a.type, note: a.note, date: a.date }));
}

export async function insertActivityLog(type, note, date, userId) {
  const { data, error } = await supabase
    .from("activity_logs")
    .insert({ type, note, date, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, type: data.type, note: data.note, date: data.date };
}

export async function deleteActivityLog(id) {
  const { error } = await supabase.from("activity_logs").delete().eq("id", id);
  if (error) throw error;
}

// --- Görev listesi ----------------------------------------------------------

export async function fetchTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("due_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data.map((t) => ({ id: t.id, title: t.title, dueDate: t.due_date, done: t.done }));
}

export async function insertTask(title, dueDate, userId) {
  const { data, error } = await supabase
    .from("tasks")
    .insert({ title, due_date: dueDate || null, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, title: data.title, dueDate: data.due_date, done: data.done };
}

export async function updateTaskDone(id, done) {
  const { error } = await supabase.from("tasks").update({ done }).eq("id", id);
  if (error) throw error;
}

export async function deleteTask(id) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}
