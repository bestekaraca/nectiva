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
    tags: row.tags || [],
    value: row.value || 0,
    stage: row.stage || "yeni",
    nextActionDate: row.next_action_date,
    nextActionNote: row.next_action_note || "",
    createdAt: row.created_at,
    notes: (row.notes || [])
      .map((n) => ({ id: n.id, date: n.date, text: n.text }))
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

export async function deleteLead(id) {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
}

export async function insertNote(leadId, text) {
  const { data, error } = await supabase
    .from("notes")
    .insert({ lead_id: leadId, text })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, date: data.date, text: data.text };
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
