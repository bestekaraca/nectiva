import { useEffect, useState } from "react";
import {
  STAGES,
  SECTORS,
  SOURCES,
  PRODUCTS,
  PRODUCT_BADGE,
  ACTIVITY_TYPES,
  FOLLOWUP_STATUSES,
  TEMPERATURES,
  formatCurrency,
  totalPurchases,
} from "../data/store";

export default function LeadModal({ lead, onClose, onSave, onDelete, onAddNote, onAddPurchase }) {
  const [form, setForm] = useState({ ...lead });
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState("note");
  const [tagText, setTagText] = useState("");
  const [purchaseDesc, setPurchaseDesc] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [busyNote, setBusyNote] = useState(false);
  const [busyPurchase, setBusyPurchase] = useState(false);
  const [tab, setTab] = useState("bilgiler");

  useEffect(() => {
    setForm({ ...lead });
  }, [lead.id]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleAddNote = async () => {
    if (!noteText.trim() || busyNote) return;
    setBusyNote(true);
    try {
      await onAddNote(lead.id, noteText.trim(), noteType);
      setNoteText("");
    } finally {
      setBusyNote(false);
    }
  };

  const handleAddTag = () => {
    const t = tagText.trim();
    if (!t || form.tags.includes(t)) return;
    update("tags", [...form.tags, t]);
    setTagText("");
  };

  const handleRemoveTag = (t) => {
    update("tags", form.tags.filter((tag) => tag !== t));
  };

  const toggleProduct = (p) => {
    update(
      "products",
      form.products.includes(p) ? form.products.filter((x) => x !== p) : [...form.products, p]
    );
  };

  const handleAddPurchase = async () => {
    if (!purchaseDesc.trim() || !purchaseAmount || busyPurchase) return;
    setBusyPurchase(true);
    try {
      await onAddPurchase(lead.id, purchaseDesc.trim(), Number(purchaseAmount));
      setPurchaseDesc("");
      setPurchaseAmount("");
    } finally {
      setBusyPurchase(false);
    }
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-ink/25 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="glass rounded-3xl w-full max-w-xl max-h-[88vh] overflow-y-auto shadow-glow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-mist flex items-center justify-between">
          <input
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            className="font-display font-semibold text-xl bg-transparent outline-none w-full text-ink placeholder-ink/30"
            placeholder="Firma adı"
          />
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-xl leading-none ml-3">
            ×
          </button>
        </div>

        <div className="flex gap-1 px-6 pt-4 border-b border-mist">
          {[
            { id: "bilgiler", label: "Bilgiler" },
            { id: "gecmis", label: `Geçmiş (${lead.purchases.length})` },
            { id: "notlar", label: `Notlar (${lead.notes.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 pb-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.id
                  ? "border-violet-500 text-ink"
                  : "border-transparent text-ink/35 hover:text-ink/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 flex flex-col gap-4">
          {tab === "bilgiler" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="İlgili kişi">
                  <input
                    value={form.contactName}
                    onChange={(e) => update("contactName", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Pozisyon">
                  <input
                    value={form.position}
                    onChange={(e) => update("position", e.target.value)}
                    className="input"
                    placeholder="Örn: Satın Alma Müdürü"
                  />
                </Field>
                <Field label="Değer (₺)">
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => update("value", Number(e.target.value))}
                    className="input font-mono"
                  />
                </Field>
                <Field label="Telefon">
                  <input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="E-posta">
                  <input
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Sektör">
                  <select
                    value={form.sector}
                    onChange={(e) => update("sector", e.target.value)}
                    className="input"
                  >
                    <option value="">Seçilmedi</option>
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Sıcaklık">
                  <select
                    value={form.temperature}
                    onChange={(e) => update("temperature", e.target.value)}
                    className="input"
                  >
                    <option value="">Seçilmedi</option>
                    {TEMPERATURES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Kaynak">
                  <select
                    value={form.source}
                    onChange={(e) => update("source", e.target.value)}
                    className="input"
                  >
                    <option value="">Seçilmedi</option>
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Web sitesi">
                  <input
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                    className="input"
                    placeholder="ornek.com"
                  />
                </Field>
                <Field label="Aşama">
                  <select
                    value={form.stage}
                    onChange={(e) => update("stage", e.target.value)}
                    className="input"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Adres">
                <textarea
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className="input resize-none"
                  rows={2}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Sonraki eylem tarihi">
                  <input
                    type="date"
                    value={form.nextActionDate || ""}
                    onChange={(e) => update("nextActionDate", e.target.value || null)}
                    className="input font-mono"
                  />
                </Field>
                <Field label="Sonraki eylem notu">
                  <input
                    value={form.nextActionNote}
                    onChange={(e) => update("nextActionNote", e.target.value)}
                    className="input"
                    placeholder="Örn: fiyat için geri arayacak"
                  />
                </Field>
              </div>

              <Field label="Takip durumu">
                <select
                  value={form.followupStatus}
                  onChange={(e) => update("followupStatus", e.target.value)}
                  className="input"
                >
                  {FOLLOWUP_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>

              <div>
                <div className="text-xs font-medium text-ink/45 mb-1.5">Ürünler</div>
                <div className="flex flex-wrap gap-1.5">
                  {PRODUCTS.map((p) => {
                    const active = form.products.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => toggleProduct(p)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                          active
                            ? PRODUCT_BADGE[p]
                            : "bg-transparent text-ink/35 border-mist hover:border-ink/20"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-ink/45 mb-1.5">Etiketler</div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1 bg-violet-100 text-violet-700 border border-violet-200 text-xs font-medium px-2 py-1 rounded-full"
                    >
                      {t}
                      <button onClick={() => handleRemoveTag(t)} className="hover:text-rose-500">×</button>
                    </span>
                  ))}
                  {form.tags.length === 0 && (
                    <span className="text-xs text-ink/25">Henüz etiket yok.</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    value={tagText}
                    onChange={(e) => setTagText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                    placeholder="Etiket ekle ve Enter'a bas"
                    className="input flex-1"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-ink/6 text-ink text-sm rounded-lg font-medium hover:bg-ink/10"
                  >
                    Ekle
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === "gecmis" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-ink/55">Toplam geçmiş satış</div>
                <div className="font-mono font-semibold text-emerald-600">
                  {formatCurrency(totalPurchases(lead))}
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <input
                  value={purchaseDesc}
                  onChange={(e) => setPurchaseDesc(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddPurchase()}
                  placeholder="Açıklama (örn: Yıllık lisans yenileme)"
                  className="input flex-1"
                />
                <input
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddPurchase()}
                  placeholder="₺"
                  className="input w-24 font-mono"
                />
                <button
                  onClick={handleAddPurchase}
                  disabled={busyPurchase}
                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm rounded-lg font-medium hover:shadow-glow-sm shrink-0 disabled:opacity-60"
                >
                  Ekle
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                {lead.purchases.length === 0 && (
                  <div className="text-xs text-ink/30">
                    Henüz geçmiş satış kaydı yok. Bu müşteriden önce alınan siparişleri buraya ekleyebilirsin.
                  </div>
                )}
                {lead.purchases.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-mist rounded-lg px-3 py-2 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm text-ink/80">{p.description}</div>
                      <div className="text-xs font-mono text-ink/35">{p.date}</div>
                    </div>
                    <div className="font-mono text-sm font-medium text-ink/65 shrink-0 ml-3">
                      {formatCurrency(p.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "notlar" && (
            <div>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {ACTIVITY_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setNoteType(t.id)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                      noteType === t.id
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-white text-ink/50 border-mist hover:border-violet-300"
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                  placeholder="Not ekle..."
                  className="input flex-1"
                />
                <button
                  onClick={handleAddNote}
                  disabled={busyNote}
                  className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm rounded-lg font-medium hover:shadow-glow-sm disabled:opacity-60"
                >
                  Ekle
                </button>
              </div>
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                {lead.notes.length === 0 && (
                  <div className="text-xs text-ink/30">Henüz not yok.</div>
                )}
                {lead.notes.map((n) => (
                  <div key={n.id} className="bg-white border border-mist rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-ink/35 mb-0.5">
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
        </div>

        <div className="p-6 border-t border-mist flex items-center justify-between">
          <button
            onClick={() => onDelete(form.id)}
            className="text-sm text-rose-500 hover:text-rose-600 font-medium"
          >
            Fırsatı sil
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-ink/50 hover:text-ink"
            >
              Vazgeç
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-glow-sm"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-ink/45">{label}</span>
      {children}
    </label>
  );
}
