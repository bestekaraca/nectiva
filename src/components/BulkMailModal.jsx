import { useState, useMemo } from "react";

function personalize(text, lead) {
  return text
    .replaceAll("{{isim}}", lead.contactName || "")
    .replaceAll("{{firma}}", lead.company || "")
    .replaceAll("{{pozisyon}}", lead.position || "");
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function BulkMailModal({ leads, marketingEmails, onAddMarketingEmail, onClose }) {
  const [step, setStep] = useState("setup"); // 'setup' | 'sending' | 'done'
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [opened, setOpened] = useState(false);
  const [logging, setLogging] = useState(false);

  const emailable = leads.filter((l) => l.email && l.email.includes("@"));
  const filtered = emailable.filter((l) =>
    `${l.company} ${l.contactName}`.toLowerCase().includes(search.toLowerCase())
  );

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAllFiltered = () => {
    setSelected((prev) => {
      const allSelected = filtered.every((l) => prev.has(l.id));
      const next = new Set(prev);
      filtered.forEach((l) => (allSelected ? next.delete(l.id) : next.add(l.id)));
      return next;
    });
  };

  // Bugun bu kampanya icin zaten gonderilmis olanlari otomatik atla (yeniden acinca kaldigi yerden devam)
  const alreadySentToday = useMemo(() => {
    const set = new Set();
    marketingEmails.forEach((e) => {
      if (e.date === todayISO() && e.campaign === campaignName) set.add(e.company);
    });
    return set;
  }, [marketingEmails, campaignName]);

  const handleStart = () => {
    const chosen = emailable.filter((l) => selected.has(l.id) && !alreadySentToday.has(l.company));
    if (chosen.length === 0 || !subject.trim() || !body.trim()) return;
    setQueue(chosen);
    setIndex(0);
    setOpened(false);
    setStep("sending");
  };

  const current = queue[index];

  const handleOpenOutlook = () => {
    if (!current) return;
    const params = new URLSearchParams({
      to: current.email,
      subject: personalize(subject, current),
      body: personalize(body, current),
    });
    window.open(`https://outlook.office.com/mail/deeplink/compose?${params.toString()}`, "_blank");
    setOpened(true);
  };

  const handleMarkAndNext = async () => {
    setLogging(true);
    try {
      await onAddMarketingEmail(current.company, campaignName.trim(), todayISO());
    } finally {
      setLogging(false);
      goNext();
    }
  };

  const goNext = () => {
    setOpened(false);
    if (index + 1 >= queue.length) {
      setStep("done");
    } else {
      setIndex((i) => i + 1);
    }
  };

  const selectedCount = [...selected].filter((id) => {
    const l = emailable.find((x) => x.id === id);
    return l && !alreadySentToday.has(l.company);
  }).length;

  return (
    <div className="fixed inset-0 bg-ink/25 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="glass rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-glow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-mist flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg text-ink">📤 Toplu Mail Gönderimi</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-xl leading-none">
            ×
          </button>
        </div>

        {step === "setup" && (
          <div className="overflow-y-auto p-5 flex flex-col gap-4">
            <Field label="Kampanya adı">
              <input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Örn: Eylül RedFlag Bülteni"
                className="input"
              />
            </Field>
            <Field label="Konu">
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input" />
            </Field>
            <Field label="Mesaj">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="input resize-none"
                placeholder={"Merhaba {{isim}},\n\n..."}
              />
            </Field>
            <p className="text-[11px] text-ink/35 -mt-2">
              Kullanılabilir alanlar: <code className="bg-mist px-1 rounded">{"{{isim}}"}</code>{" "}
              <code className="bg-mist px-1 rounded">{"{{firma}}"}</code>{" "}
              <code className="bg-mist px-1 rounded">{"{{pozisyon}}"}</code>
            </p>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-ink/45">
                  Alıcılar ({selectedCount} seçili / {emailable.length} e-postalı kayıt)
                </span>
                <button onClick={toggleAllFiltered} className="text-xs text-violet-600 hover:text-violet-700 font-medium">
                  Görünenleri seç/kaldır
                </button>
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Firma veya kişi ara..."
                className="input mb-2 text-sm"
              />
              <div className="border border-mist rounded-lg max-h-56 overflow-y-auto">
                {filtered.length === 0 && <div className="text-xs text-ink/30 p-3">Eşleşen kayıt yok.</div>}
                {filtered.map((l) => {
                  const already = alreadySentToday.has(l.company);
                  return (
                    <label
                      key={l.id}
                      className={`flex items-center gap-2.5 px-3 py-2 border-b border-mist last:border-0 ${
                        already ? "opacity-40" : "cursor-pointer hover:bg-violet-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(l.id)}
                        onChange={() => toggleOne(l.id)}
                        disabled={already}
                        className="w-4 h-4 accent-violet-600"
                      />
                      <span className="text-sm text-ink/75 flex-1 min-w-0 truncate">
                        {l.company} — {l.contactName || "İsimsiz"}
                      </span>
                      <span className="text-[11px] font-mono text-ink/35 shrink-0">
                        {already ? "bugün gönderildi" : l.email}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={selectedCount === 0 || !subject.trim() || !body.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-semibold rounded-lg hover:shadow-glow-sm disabled:opacity-50"
            >
              Gönderimi Başlat ({selectedCount} kişi)
            </button>
          </div>
        )}

        {step === "sending" && current && (
          <div className="overflow-y-auto p-5 flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-ink/50">
                  {index + 1} / {queue.length}
                </span>
                <span className="text-xs text-ink/35">{campaignName}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-mist overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all"
                  style={{ width: `${(index / queue.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white border border-mist rounded-lg p-4">
              <div className="text-sm font-semibold text-ink/85 mb-0.5">{current.company}</div>
              <div className="text-xs text-ink/45 mb-3">{current.contactName} · {current.email}</div>
              <div className="text-xs font-medium text-ink/50 mb-1">Konu</div>
              <div className="text-sm text-ink/75 mb-3">{personalize(subject, current)}</div>
              <div className="text-xs font-medium text-ink/50 mb-1">Mesaj</div>
              <div className="text-sm text-ink/75 whitespace-pre-wrap">{personalize(body, current)}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenOutlook}
                className="px-4 py-2.5 bg-gradient-to-r from-[#0078D4] to-blue-500 text-white text-sm font-semibold rounded-lg hover:shadow-glow-sm"
              >
                {opened ? "Tekrar Aç" : "Outlook'ta Aç"}
              </button>
              {opened && (
                <button
                  onClick={handleMarkAndNext}
                  disabled={logging}
                  className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  ✓ Gönderdim → Sıradaki
                </button>
              )}
              <button onClick={goNext} className="text-xs text-ink/40 hover:text-ink ml-auto">
                Bu kişiyi atla →
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <div className="font-display font-semibold text-lg text-ink mb-1">Tamamlandı</div>
            <p className="text-sm text-ink/50 mb-5">{queue.length} kişilik gönderim listesi bitti.</p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-semibold rounded-lg hover:shadow-glow-sm"
            >
              Kapat
            </button>
          </div>
        )}
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
