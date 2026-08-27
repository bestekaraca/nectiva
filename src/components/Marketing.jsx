import { useState } from "react";
import {
  PRODUCTS,
  CONTENT_TYPES,
  CONTENT_STATUSES,
  CAMPAIGN_CHANNELS,
} from "../data/store";
import ContentCalendar from "./ContentCalendar";

export default function Marketing({
  leads,
  content,
  onAddContent,
  onUpdateContentStatus,
  onDeleteContent,
  campaigns,
  onAddCampaign,
  onDeleteCampaign,
  marketingEmails,
  onAddMarketingEmail,
  onDeleteMarketingEmail,
  marketingTasks,
  onAddMarketingTask,
  onToggleTask,
  onDeleteTask,
  marketNotes,
  onAddMarketNote,
  onDeleteMarketNote,
  onOpenLinkedInStrategy,
}) {
  const summary = {
    contentDone: content.filter((c) => c.status === "tamamlandi").length,
    contentOpen: content.filter((c) => c.status !== "tamamlandi").length,
    campaignCount: campaigns.length,
    emailCount: marketingEmails.length,
    openTasks: marketingTasks.filter((t) => !t.done).length,
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
        <h1 className="font-display font-semibold text-2xl text-ink">Marketing</h1>
        <button
          onClick={onOpenLinkedInStrategy}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#0A66C2] to-violet-600 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm"
        >
          💼 LinkedIn Marketing Strategy
        </button>
      </div>
      <p className="text-sm text-ink/40 mb-6">
        İçerik üretimi, kampanya sonuçları ve mail marketing takibi tek yerde.
      </p>

      {/* Özet paneli */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        <SummaryCard icon="✅" label="Tamamlanan İçerik" count={summary.contentDone} accent="emerald" />
        <SummaryCard icon="🕓" label="Açık İçerik" count={summary.contentOpen} accent="amber" />
        <SummaryCard icon="📣" label="Kampanya Sayısı" count={summary.campaignCount} accent="violet" />
        <SummaryCard icon="✉️" label="Mail Gönderimi" count={summary.emailCount} accent="blue" />
        <SummaryCard icon="📋" label="Açık Görev" count={summary.openTasks} accent="rose" />
      </div>

      <Section title="İçerik Takvimi" subtitle="Bitiş tarihi girilen içerikler ve kampanyalar ay görünümünde">
        <ContentCalendar
          content={content}
          campaigns={campaigns}
          onAddContent={onAddContent}
          onCycleStatus={onUpdateContentStatus}
        />
      </Section>

      <ContentSection content={content} onAdd={onAddContent} onUpdateStatus={onUpdateContentStatus} onDelete={onDeleteContent} />
      <CampaignSection campaigns={campaigns} onAdd={onAddCampaign} onDelete={onDeleteCampaign} />
      <MailMarketingSection
        leads={leads}
        entries={marketingEmails}
        onAdd={onAddMarketingEmail}
        onDelete={onDeleteMarketingEmail}
      />
      <MarketNotesSection notes={marketNotes} onAdd={onAddMarketNote} onDelete={onDeleteMarketNote} />
      <MarketingTasksSection
        tasks={marketingTasks}
        onAdd={onAddMarketingTask}
        onToggle={onToggleTask}
        onDelete={onDeleteTask}
      />
    </div>
  );
}

function SummaryCard({ icon, label, count, accent }) {
  const border = {
    emerald: "border-l-emerald-500",
    amber: "border-l-amber-500",
    violet: "border-l-violet-500",
    blue: "border-l-blue-500",
    rose: "border-l-rose-500",
  }[accent];
  return (
    <div className={`glass rounded-card p-3.5 border-l-[3px] ${border}`}>
      <div className="text-lg leading-none mb-1.5">{icon}</div>
      <div className="font-display font-bold text-2xl text-ink">{count}</div>
      <div className="text-xs text-ink/45 mt-0.5">{label}</div>
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

function ContentSection({ content, onAdd, onUpdateStatus, onDelete }) {
  const [title, setTitle] = useState("");
  const [product, setProduct] = useState("");
  const [contentType, setContentType] = useState("sunum");
  const [dueDate, setDueDate] = useState("");

  const handleAdd = async () => {
    if (!title.trim()) return;
    await onAdd({ title: title.trim(), product, contentType, dueDate: dueDate || null, note: "" });
    setTitle("");
    setDueDate("");
  };

  const counts = CONTENT_STATUSES.map((s) => ({
    ...s,
    count: content.filter((c) => c.status === s.id).length,
  }));

  return (
    <Section title="İçerik Üretim Takibi" subtitle="Sunum, one-pager, post, broşür, kartvizit — ürüne göre">
      <div className="grid grid-cols-3 gap-3 mb-4">
        {counts.map((s) => (
          <div key={s.id} className={`rounded-lg border px-3 py-2.5 ${s.badge}`}>
            <div className="text-lg font-bold leading-none">{s.count}</div>
            <div className="text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="İçerik adı (örn: RedFlag Presales Sunumu)"
          className="input flex-1 min-w-[200px]"
        />
        <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="input !w-auto">
          {CONTENT_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.icon} {t.label}
            </option>
          ))}
        </select>
        <select value={product} onChange={(e) => setProduct(e.target.value)} className="input !w-auto">
          <option value="">Ürün seç</option>
          {PRODUCTS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="input font-mono !w-auto"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm shrink-0"
        >
          Ekle
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {content.length === 0 && <div className="text-sm text-ink/30">Henüz içerik eklenmedi.</div>}
        {content.map((c) => {
          const typeInfo = CONTENT_TYPES.find((t) => t.id === c.contentType);
          const statusInfo = CONTENT_STATUSES.find((s) => s.id === c.status);
          return (
            <div key={c.id} className="flex items-center justify-between gap-3 bg-white border border-mist rounded-lg px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ink truncate">
                  {typeInfo?.icon} {c.title}
                </div>
                <div className="text-xs text-ink/40 mt-0.5">
                  {c.product && <span className="mr-2">{c.product}</span>}
                  {c.dueDate && <span className="font-mono">{c.dueDate}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={c.status}
                  onChange={(e) => onUpdateStatus(c.id, e.target.value)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer outline-none appearance-none ${statusInfo?.badge}`}
                >
                  {CONTENT_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <button onClick={() => onDelete(c.id)} className="text-ink/25 hover:text-rose-500 text-sm">
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function CampaignSection({ campaigns, onAdd, onDelete }) {
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState("linkedin");
  const [product, setProduct] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [metricLabel, setMetricLabel] = useState("");
  const [metricValue, setMetricValue] = useState("");
  const [goalValue, setGoalValue] = useState("");

  const handleAdd = async () => {
    if (!title.trim()) return;
    await onAdd({
      title: title.trim(),
      channel,
      product,
      date,
      description: description.trim(),
      metricLabel: metricLabel.trim(),
      metricValue: metricValue ? Number(metricValue) : null,
      goalValue: goalValue ? Number(goalValue) : null,
    });
    setTitle("");
    setDescription("");
    setMetricLabel("");
    setMetricValue("");
    setGoalValue("");
  };

  return (
    <Section title="Kampanyalar" subtitle="LinkedIn, Mailing, Google Analytics, etkinlikler — sonuç ve hedeflerle">
      <div className="flex flex-col gap-2 mb-4 p-3 bg-white border border-mist rounded-lg">
        <div className="flex flex-wrap gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Kampanya adı (örn: RedFlag LinkedIn İlk Post)"
            className="input flex-1 min-w-[200px]"
          />
          <select value={channel} onChange={(e) => setChannel(e.target.value)} className="input !w-auto">
            {CAMPAIGN_CHANNELS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
          <select value={product} onChange={(e) => setProduct(e.target.value)} className="input !w-auto">
            <option value="">Ürün seç</option>
            {PRODUCTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input font-mono !w-auto" />
        </div>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Açıklama (opsiyonel)"
          className="input"
        />
        <div className="flex flex-wrap gap-2">
          <input
            value={metricLabel}
            onChange={(e) => setMetricLabel(e.target.value)}
            placeholder="Metrik adı (örn: Yeni takipçi, Oturum)"
            className="input flex-1 min-w-[160px]"
          />
          <input
            type="number"
            value={metricValue}
            onChange={(e) => setMetricValue(e.target.value)}
            placeholder="Sonuç"
            className="input font-mono !w-28"
          />
          <input
            type="number"
            value={goalValue}
            onChange={(e) => setGoalValue(e.target.value)}
            placeholder="Hedef (opsiyonel)"
            className="input font-mono !w-28"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm shrink-0"
          >
            Ekle
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {campaigns.length === 0 && <div className="text-sm text-ink/30">Henüz kampanya eklenmedi.</div>}
        {campaigns.map((c) => {
          const channelInfo = CAMPAIGN_CHANNELS.find((ch) => ch.id === c.channel);
          const pct =
            c.goalValue && c.goalValue > 0 ? Math.min(100, Math.round((c.metricValue / c.goalValue) * 100)) : null;
          return (
            <div key={c.id} className="bg-white border border-mist rounded-lg px-3.5 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink truncate">
                      {channelInfo?.icon} {c.title}
                    </span>
                    {c.product && (
                      <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200 shrink-0">
                        {c.product}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink/40 mt-0.5">
                    {c.date} {c.description && `· ${c.description}`}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {c.metricLabel && (
                    <div className="text-sm font-mono font-semibold text-violet-700">
                      {c.metricValue ?? "—"} {c.metricLabel}
                    </div>
                  )}
                  {c.goalValue && <div className="text-[11px] text-ink/35">hedef: {c.goalValue}</div>}
                </div>
                <button onClick={() => onDelete(c.id)} className="text-ink/25 hover:text-rose-500 text-sm shrink-0">
                  ×
                </button>
              </div>
              {pct !== null && (
                <div className="h-1.5 w-full rounded-full bg-mist overflow-hidden mt-2">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500" style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function MailMarketingSection({ leads, entries, onAdd, onDelete }) {
  const [leadId, setLeadId] = useState("");
  const [campaign, setCampaign] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [expanded, setExpanded] = useState(false);

  const handleAdd = async () => {
    if (!leadId) return;
    await onAdd(leadId, campaign.trim(), date);
    setCampaign("");
  };

  const summary = {};
  entries.forEach((e) => {
    summary[e.company] = (summary[e.company] || 0) + 1;
  });
  const summaryList = Object.entries(summary).sort((a, b) => b[1] - a[1]);

  return (
    <Section title="Mail Marketing Takibi" subtitle="Hangi firmaya kaç kere mail marketing yapıldığını kaydet">
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={leadId} onChange={(e) => setLeadId(e.target.value)} className="input flex-1 min-w-[180px]">
          <option value="">Firma seç...</option>
          {leads.map((l) => (
            <option key={l.id} value={l.id}>
              {l.company}
            </option>
          ))}
        </select>
        <input
          value={campaign}
          onChange={(e) => setCampaign(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Kampanya adı (örn: Ağustos Bülteni)"
          className="input flex-1 min-w-[160px]"
        />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input font-mono !w-auto" />
        <button
          onClick={handleAdd}
          disabled={!leadId}
          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm disabled:opacity-50 shrink-0"
        >
          Ekle
        </button>
      </div>

      {summaryList.length === 0 ? (
        <div className="text-sm text-ink/30">Henüz mail marketing kaydı yok.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          {summaryList.map(([company, count]) => (
            <div key={company} className="flex items-center justify-between bg-white border border-mist rounded-lg px-3 py-2">
              <span className="text-sm text-ink/75 truncate">{company}</span>
              <span className="text-xs font-mono font-semibold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded shrink-0 ml-2">
                {count}×
              </span>
            </div>
          ))}
        </div>
      )}

      {entries.length > 0 && (
        <>
          <button onClick={() => setExpanded((e) => !e)} className="text-xs text-violet-600 hover:text-violet-700 font-medium">
            {expanded ? "Detay kayıtları gizle" : `Detay kayıtları göster (${entries.length})`}
          </button>
          {expanded && (
            <div className="flex flex-col gap-1.5 mt-2 max-h-56 overflow-y-auto">
              {entries.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-xs bg-white border border-mist rounded-lg px-2.5 py-1.5">
                  <span className="text-ink/70">
                    <span className="font-medium">{e.company}</span> · {e.campaign || "—"}
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-ink/35">{e.date}</span>
                    <button onClick={() => onDelete(e.id)} className="text-ink/25 hover:text-rose-500">
                      ×
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Section>
  );
}

function MarketNotesSection({ notes, onAdd, onDelete }) {
  const [text, setText] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleAdd = async () => {
    if (!text.trim()) return;
    await onAdd(text.trim(), date);
    setText("");
  };

  return (
    <Section title="Rakip / Pazar Notları" subtitle="Rakiplerin hareketleri, pazar gözlemleri — serbest not">
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Örn: Rakip X, RedFlag'e benzer bir özellik duyurdu"
          className="input flex-1 min-w-[220px]"
        />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input font-mono !w-auto" />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm shrink-0"
        >
          Ekle
        </button>
      </div>

      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
        {notes.length === 0 && <div className="text-sm text-ink/30">Henüz not eklenmedi.</div>}
        {notes.map((n) => (
          <div key={n.id} className="flex items-start justify-between gap-3 bg-white border border-mist rounded-lg px-3 py-2.5">
            <div>
              <div className="text-xs font-mono text-ink/35">{n.date}</div>
              <div className="text-sm text-ink/75 mt-0.5">{n.text}</div>
            </div>
            <button onClick={() => onDelete(n.id)} className="text-ink/25 hover:text-rose-500 text-sm shrink-0">
              ×
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function MarketingTasksSection({ tasks, onAdd, onToggle, onDelete }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleAdd = async () => {
    if (!title.trim()) return;
    await onAdd(title.trim(), dueDate || null);
    setTitle("");
    setDueDate("");
  };

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <Section title="Marketing Görevleri" subtitle="Stant hazırlığı, broşür, kartvizit gibi görevlerini bitiş tarihiyle takip et">
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Görev (örn: TIDE konferansı stant tasarımı)"
          className="input flex-1 min-w-[200px]"
        />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input font-mono !w-auto" />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm shrink-0"
        >
          Ekle
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {open.length === 0 && <div className="text-sm text-ink/30">Açık marketing görevi yok.</div>}
        {open.map((t) => (
          <div key={t.id} className="flex items-center justify-between bg-white border border-mist rounded-lg px-3 py-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer flex-1">
              <input type="checkbox" onChange={() => onToggle(t.id, true)} className="w-4 h-4 accent-violet-600" />
              <span className="text-sm text-ink/80">{t.title}</span>
            </label>
            <div className="flex items-center gap-2 shrink-0">
              {t.dueDate && (
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded border bg-mist/60 text-ink/40 border-mist">
                  {t.dueDate}
                </span>
              )}
              <button onClick={() => onDelete(t.id)} className="text-ink/25 hover:text-rose-500 text-sm">
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {done.length > 0 && <p className="text-xs text-ink/30 mt-3">{done.length} marketing görevi tamamlandı.</p>}
    </Section>
  );
}
