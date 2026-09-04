import { useState } from "react";
import { CONTENT_TYPES, CONTENT_STATUSES, CAMPAIGN_CHANNELS, PRODUCTS } from "../data/store";

export default function ProductWorkspaceModal({
  product,
  content,
  campaigns,
  tasks,
  onAddContent,
  onUpdateContentStatus,
  onDeleteContent,
  onAddCampaign,
  onDeleteCampaign,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTaskProduct,
  onClose,
}) {
  const label = product || "Genel (ürünsüz)";
  const productContent = content.filter((c) => (c.product || "") === product);
  const productCampaigns = campaigns.filter((c) => (c.product || "") === product);
  const productTasks = tasks.filter((t) => (t.product || "") === product);

  const contentDone = productContent.filter((c) => c.status === "tamamlandi").length;
  const contentOpen = productContent.length - contentDone;
  const tasksOpen = productTasks.filter((t) => !t.done).length;
  const tasksDone = productTasks.filter((t) => t.done).length;

  return (
    <div className="fixed inset-0 bg-ink/25 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="glass rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-glow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-mist flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-xl text-ink">{label}</h2>
            <p className="text-xs text-ink/40 mt-0.5">
              {productContent.length} içerik ({contentDone} tamamlandı) · {productCampaigns.length} kampanya ·{" "}
              {productTasks.length} görev ({tasksOpen} açık)
            </p>
          </div>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-xl leading-none">
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-5 flex flex-col gap-6">
          <ProductContentBlock
            items={productContent}
            onAdd={(payload) => onAddContent({ ...payload, product })}
            onUpdateStatus={onUpdateContentStatus}
            onDelete={onDeleteContent}
          />
          <ProductCampaignBlock
            items={productCampaigns}
            onAdd={(payload) => onAddCampaign({ ...payload, product })}
            onDelete={onDeleteCampaign}
          />
          <ProductTaskBlock
            items={productTasks}
            onAdd={(title, dueDate) => onAddTask(title, dueDate, "", product)}
            onToggle={onToggleTask}
            onDelete={onDeleteTask}
            onMove={onUpdateTaskProduct}
            currentProduct={product}
          />
        </div>
      </div>
    </div>
  );
}

function BlockTitle({ children, count }) {
  return (
    <h3 className="text-sm font-semibold text-ink/75 mb-2.5">
      {children} {count > 0 && <span className="text-ink/35 font-normal">({count})</span>}
    </h3>
  );
}

function ProductContentBlock({ items, onAdd, onUpdateStatus, onDelete }) {
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("sunum");
  const [dueDate, setDueDate] = useState("");

  const handleAdd = async () => {
    if (!title.trim()) return;
    await onAdd({ title: title.trim(), contentType, dueDate: dueDate || null, note: "" });
    setTitle("");
    setDueDate("");
  };

  return (
    <div>
      <BlockTitle count={items.length}>📄 İçerik</BlockTitle>
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="İçerik adı"
          className="input flex-1 min-w-[160px]"
        />
        <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="input !w-auto">
          {CONTENT_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.icon} {t.label}
            </option>
          ))}
        </select>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input font-mono !w-auto" />
        <button
          onClick={handleAdd}
          className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm shrink-0"
        >
          Ekle
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {items.length === 0 && <div className="text-xs text-ink/30">Bu ürün için içerik yok.</div>}
        {items.map((c) => {
          const typeInfo = CONTENT_TYPES.find((t) => t.id === c.contentType);
          const statusInfo = CONTENT_STATUSES.find((s) => s.id === c.status);
          return (
            <div key={c.id} className="flex items-center justify-between gap-3 bg-white border border-mist rounded-lg px-3 py-2">
              <span className="text-sm text-ink/75 flex-1 min-w-0 truncate">
                {typeInfo?.icon} {c.title}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={c.status}
                  onChange={(e) => onUpdateStatus(c.id, e.target.value)}
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border cursor-pointer outline-none appearance-none ${statusInfo?.badge}`}
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
    </div>
  );
}

function ProductCampaignBlock({ items, onAdd, onDelete }) {
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState("linkedin");
  const [metricLabel, setMetricLabel] = useState("");
  const [metricValue, setMetricValue] = useState("");
  const [goalValue, setGoalValue] = useState("");

  const handleAdd = async () => {
    if (!title.trim()) return;
    await onAdd({
      title: title.trim(),
      channel,
      date: new Date().toISOString().slice(0, 10),
      description: "",
      metricLabel: metricLabel.trim(),
      metricValue: metricValue ? Number(metricValue) : null,
      goalValue: goalValue ? Number(goalValue) : null,
    });
    setTitle("");
    setMetricLabel("");
    setMetricValue("");
    setGoalValue("");
  };

  return (
    <div>
      <BlockTitle count={items.length}>📣 Kampanyalar</BlockTitle>
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Kampanya adı"
          className="input flex-1 min-w-[160px]"
        />
        <select value={channel} onChange={(e) => setChannel(e.target.value)} className="input !w-auto">
          {CAMPAIGN_CHANNELS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
        <input
          value={metricLabel}
          onChange={(e) => setMetricLabel(e.target.value)}
          placeholder="Metrik adı"
          className="input !w-32"
        />
        <input
          type="number"
          value={metricValue}
          onChange={(e) => setMetricValue(e.target.value)}
          placeholder="Sonuç"
          className="input font-mono !w-20"
        />
        <input
          type="number"
          value={goalValue}
          onChange={(e) => setGoalValue(e.target.value)}
          placeholder="Hedef"
          className="input font-mono !w-20"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm shrink-0"
        >
          Ekle
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {items.length === 0 && <div className="text-xs text-ink/30">Bu ürün için kampanya yok.</div>}
        {items.map((c) => {
          const chInfo = CAMPAIGN_CHANNELS.find((ch) => ch.id === c.channel);
          return (
            <div key={c.id} className="flex items-center justify-between gap-3 bg-white border border-mist rounded-lg px-3 py-2">
              <span className="text-sm text-ink/75 flex-1 min-w-0 truncate">
                {chInfo?.icon} {c.title} <span className="text-ink/35 font-mono text-xs">· {c.date}</span>
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {c.metricLabel && (
                  <span className="text-xs font-mono font-semibold text-violet-700">
                    {c.metricValue ?? "—"} {c.metricLabel}
                  </span>
                )}
                <button onClick={() => onDelete(c.id)} className="text-ink/25 hover:text-rose-500 text-sm">
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductTaskBlock({ items, onAdd, onToggle, onDelete, onMove, currentProduct }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showDone, setShowDone] = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) return;
    await onAdd(title.trim(), dueDate || null);
    setTitle("");
    setDueDate("");
  };

  const open = items.filter((t) => !t.done);
  const done = items.filter((t) => t.done);

  return (
    <div>
      <BlockTitle count={items.length}>✅ Görevler</BlockTitle>
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Görev başlığı"
          className="input flex-1 min-w-[160px]"
        />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input font-mono !w-auto" />
        <button
          onClick={handleAdd}
          className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm shrink-0"
        >
          Ekle
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {open.length === 0 && <div className="text-xs text-ink/30">Bu ürün için açık görev yok.</div>}
        {open.map((t) => (
          <div key={t.id} className="flex items-center justify-between bg-white border border-mist rounded-lg px-3 py-2">
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
              {onMove && (
                <select
                  value={currentProduct}
                  onChange={(e) => onMove(t.id, e.target.value)}
                  className="text-[11px] border border-mist rounded px-1 py-0.5 text-ink/50 outline-none cursor-pointer"
                  title="Başka bir ürüne taşı"
                >
                  <option value="">Genel</option>
                  {PRODUCTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              )}
              <button onClick={() => onDelete(t.id)} className="text-ink/25 hover:text-rose-500 text-sm">
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      {done.length > 0 && (
        <div className="mt-2">
          <button onClick={() => setShowDone((s) => !s)} className="text-xs text-violet-600 hover:text-violet-700 font-medium">
            {showDone ? "Tamamlananları gizle" : `Tamamlananları göster (${done.length})`}
          </button>
          {showDone && (
            <div className="flex flex-col gap-1.5 mt-2">
              {done.map((t) => (
                <div key={t.id} className="flex items-center justify-between bg-mist/40 rounded-lg px-3 py-2">
                  <span className="text-sm text-ink/40 line-through">{t.title}</span>
                  <button onClick={() => onDelete(t.id)} className="text-ink/25 hover:text-rose-500 text-sm">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
