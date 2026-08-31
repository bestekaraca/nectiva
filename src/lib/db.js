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
    temperature: row.temperature || "",
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
    temperature: lead.temperature,
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
  return data.map((t) => ({
    id: t.id,
    title: t.title,
    dueDate: t.due_date,
    done: t.done,
    category: t.category || "genel",
  }));
}

export async function insertTask(title, dueDate, userId, category = "genel") {
  const { data, error } = await supabase
    .from("tasks")
    .insert({ title, due_date: dueDate || null, user_id: userId, category })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, title: data.title, dueDate: data.due_date, done: data.done, category: data.category };
}

export async function updateTaskDone(id, done) {
  const { error } = await supabase.from("tasks").update({ done }).eq("id", id);
  if (error) throw error;
}

export async function deleteTask(id) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

// --- Marketing: İçerik üretim takibi ---------------------------------------

export async function fetchMarketingContent() {
  const { data, error } = await supabase
    .from("marketing_content")
    .select("*")
    .order("due_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data.map((c) => ({
    id: c.id,
    title: c.title,
    product: c.product,
    contentType: c.content_type,
    status: c.status,
    dueDate: c.due_date,
    note: c.note,
  }));
}

export async function insertMarketingContent({ title, product, contentType, dueDate, note }, userId) {
  const { data, error } = await supabase
    .from("marketing_content")
    .insert({
      title,
      product,
      content_type: contentType,
      due_date: dueDate || null,
      note,
      user_id: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    title: data.title,
    product: data.product,
    contentType: data.content_type,
    status: data.status,
    dueDate: data.due_date,
    note: data.note,
  };
}

export async function updateMarketingContentStatus(id, status) {
  const { error } = await supabase.from("marketing_content").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteMarketingContent(id) {
  const { error } = await supabase.from("marketing_content").delete().eq("id", id);
  if (error) throw error;
}

// --- Marketing: Kampanyalar --------------------------------------------------

export async function fetchCampaigns() {
  const { data, error } = await supabase
    .from("marketing_campaigns")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data.map((c) => ({
    id: c.id,
    title: c.title,
    channel: c.channel,
    product: c.product,
    date: c.date,
    description: c.description,
    metricLabel: c.metric_label,
    metricValue: c.metric_value,
    goalValue: c.goal_value,
  }));
}

export async function insertCampaign(
  { title, channel, product, date, description, metricLabel, metricValue, goalValue },
  userId
) {
  const { data, error } = await supabase
    .from("marketing_campaigns")
    .insert({
      title,
      channel,
      product,
      date,
      description,
      metric_label: metricLabel,
      metric_value: metricValue || null,
      goal_value: goalValue || null,
      user_id: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    title: data.title,
    channel: data.channel,
    product: data.product,
    date: data.date,
    description: data.description,
    metricLabel: data.metric_label,
    metricValue: data.metric_value,
    goalValue: data.goal_value,
  };
}

export async function deleteCampaign(id) {
  const { error } = await supabase.from("marketing_campaigns").delete().eq("id", id);
  if (error) throw error;
}

// --- Marketing: Mail marketing takibi ---------------------------------------

export async function fetchMarketingEmails() {
  const { data, error } = await supabase
    .from("marketing_emails")
    .select("*, leads(company)")
    .order("date", { ascending: false });
  if (error) throw error;
  return data.map((e) => ({
    id: e.id,
    leadId: e.lead_id,
    company: e.leads?.company || "—",
    campaign: e.campaign,
    date: e.date,
  }));
}

export async function insertMarketingEmail(leadId, campaign, date, userId) {
  const { data, error } = await supabase
    .from("marketing_emails")
    .insert({ lead_id: leadId, campaign, date, user_id: userId })
    .select("*, leads(company)")
    .single();
  if (error) throw error;
  return {
    id: data.id,
    leadId: data.lead_id,
    company: data.leads?.company || "—",
    campaign: data.campaign,
    date: data.date,
  };
}

export async function deleteMarketingEmail(id) {
  const { error } = await supabase.from("marketing_emails").delete().eq("id", id);
  if (error) throw error;
}

// --- Rakip / pazar notları ---------------------------------------------------

export async function fetchMarketNotes() {
  const { data, error } = await supabase
    .from("market_notes")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data.map((n) => ({ id: n.id, text: n.text, date: n.date }));
}

export async function insertMarketNote(text, date, userId) {
  const { data, error } = await supabase
    .from("market_notes")
    .insert({ text, date, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, text: data.text, date: data.date };
}

export async function deleteMarketNote(id) {
  const { error } = await supabase.from("market_notes").delete().eq("id", id);
  if (error) throw error;
}

// --- LinkedIn Marketing Strategy (esnek sekme verisi) -----------------------

export async function fetchStrategyRows() {
  const { data, error } = await supabase
    .from("linkedin_strategy_rows")
    .select("*")
    .order("sheet_key", { ascending: true })
    .order("row_index", { ascending: true });
  if (error) throw error;
  const bySheet = {};
  data.forEach((r) => {
    // Onemli: gercek satir kimligi (r.id) her zaman en sonda kalmali,
    // yoksa Excel'deki "ID" sutunu (orn. "1", "2") onun uzerine yazar.
    (bySheet[r.sheet_key] ||= []).push({ ...r.data, id: r.id });
  });
  return bySheet;
}

export async function insertStrategyRow(sheetKey, rowData, rowIndex, userId) {
  const { data, error } = await supabase
    .from("linkedin_strategy_rows")
    .insert({ sheet_key: sheetKey, row_index: rowIndex, data: rowData, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return { ...data.data, id: data.id };
}

export async function updateStrategyRow(id, rowData) {
  const { error } = await supabase.from("linkedin_strategy_rows").update({ data: rowData }).eq("id", id);
  if (error) throw error;
}

export async function deleteStrategyRow(id) {
  const { error } = await supabase.from("linkedin_strategy_rows").delete().eq("id", id);
  if (error) throw error;
}
