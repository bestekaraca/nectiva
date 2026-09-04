import { useState } from "react";
import {
  PRODUCTS,
  PRODUCT_DOT,
} from "../data/store";
import ContentCalendar from "./ContentCalendar";
import ProductWorkspaceModal from "./ProductWorkspaceModal";

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
  onUpdateTaskProduct,
}) {
  const [activeProduct, setActiveProduct] = useState(null); // null kapali, "" = Genel, urun adi

  const summary = {
    contentDone: content.filter((c) => c.status === "tamamlandi").length,
    contentOpen: content.filter((c) => c.status !== "tamamlandi").length,
    campaignCount: campaigns.length,
    emailCount: marketingEmails.length,
    openTasks: marketingTasks.filter((t) => !t.done).length,
  };

  const countFor = (product) =>
    content.filter((c) => (c.product || "") === product).length +
    campaigns.filter((c) => (c.product || "") === product).length +
    marketingTasks.filter((t) => (t.product || "") === product).length;

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

      <Section title="Ürünler" subtitle="Her ürünün içeriğini, kampanyalarını ve görevlerini tek yerde gör">
        <div className="flex flex-wrap gap-2">
          {PRODUCTS.map((p) => (
            <button
              key={p}
              onClick={() => setActiveProduct(p)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-mist rounded-xl hover:border-violet-300 hover:shadow-md transition-all"
            >
              <span className={`w-2 h-2 rounded-full ${PRODUCT_DOT[p]}`} />
              <span className="text-sm font-medium text-ink/80">{p}</span>
              {countFor(p) > 0 && (
                <span className="text-xs font-mono font-semibold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">
                  {countFor(p)}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => setActiveProduct("")}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-dashed border-mist rounded-xl hover:border-ink/25 transition-all"
          >
            <span className="text-sm font-medium text-ink/50">Genel (ürünsüz)</span>
            {countFor("") > 0 && (
              <span className="text-xs font-mono font-semibold text-ink/40 bg-mist px-1.5 py-0.5 rounded">
                {countFor("")}
              </span>
            )}
          </button>
        </div>
      </Section>

      <MailMarketingSection
        leads={leads}
        entries={marketingEmails}
        onAdd={onAddMarketingEmail}
        onDelete={onDeleteMarketingEmail}
      />
      <MarketNotesSection notes={marketNotes} onAdd={onAddMarketNote} onDelete={onDeleteMarketNote} />

      {activeProduct !== null && (
        <ProductWorkspaceModal
          product={activeProduct}
          content={content}
          campaigns={campaigns}
          tasks={marketingTasks}
          onAddContent={onAddContent}
          onUpdateContentStatus={onUpdateContentStatus}
          onDeleteContent={onDeleteContent}
          onAddCampaign={onAddCampaign}
          onDeleteCampaign={onDeleteCampaign}
          onAddTask={onAddMarketingTask}
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
          onUpdateTaskProduct={onUpdateTaskProduct}
          onClose={() => setActiveProduct(null)}
        />
      )}
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

function MailMarketingSection({ leads, entries, onAdd, onDelete }) {
  const [companyName, setCompanyName] = useState("");
  const [campaign, setCampaign] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [expanded, setExpanded] = useState(false);

  const handleAdd = async () => {
    if (!companyName.trim()) return;
    await onAdd(companyName.trim(), campaign.trim(), date);
    setCompanyName("");
    setCampaign("");
  };

  const summary = {};
  entries.forEach((e) => {
    summary[e.company] = (summary[e.company] || 0) + 1;
  });
  const summaryList = Object.entries(summary).sort((a, b) => b[1] - a[1]);

  return (
    <Section title="Mail Marketing Takibi" subtitle="Hangi firmaya kaç kere mail marketing yapıldığını kaydet">
      <datalist id="mail-marketing-companies">
        {leads.map((l) => (
          <option key={l.id} value={l.company} />
        ))}
      </datalist>
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          list="mail-marketing-companies"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Firma adı yaz..."
          className="input flex-1 min-w-[180px]"
        />
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
          disabled={!companyName.trim()}
          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm disabled:opacity-50 shrink-0"
        >
          Ekle
        </button>
      </div>
      <p className="text-[11px] text-ink/30 mb-3">
        Pipeline'da kayıtlı bir firma adı yazarsan, o firmanın not geçmişine de otomatik "Mail" olarak işlenir.
      </p>

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

