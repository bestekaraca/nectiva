import { useState } from "react";

export default function ComposeMailModal({ lead, onClose, onAddNote }) {
  const [to, setTo] = useState(lead.email || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [opened, setOpened] = useState(false);
  const [marking, setMarking] = useState(false);

  const handleOpenOutlook = () => {
    if (!to.trim()) return;
    const params = new URLSearchParams({
      to: to.trim(),
      subject: subject.trim(),
      body: body.trim(),
    });
    window.open(`https://outlook.office.com/mail/deeplink/compose?${params.toString()}`, "_blank");
    setOpened(true);
  };

  const handleMarkSent = async () => {
    setMarking(true);
    try {
      await onAddNote(lead.id, `Mail gönderildi${subject.trim() ? `: ${subject.trim()}` : ""}`, "email");
      onClose();
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/25 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="glass rounded-3xl w-full max-w-lg shadow-glow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display font-semibold text-xl mb-1 text-ink">✉️ Mail Yaz</h2>
        <p className="text-xs text-ink/40 mb-4">
          Taslağı hazırla, Outlook'ta açılsın, oradan Gönder'e bas — gerçekten senin hesabından gider.
        </p>

        <div className="flex flex-col gap-3">
          <Field label="Kime">
            <input value={to} onChange={(e) => setTo(e.target.value)} className="input" placeholder="ornek@firma.com" />
          </Field>
          <Field label="Konu">
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input" />
          </Field>
          <Field label="Mesaj">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={7}
              className="input resize-none"
              placeholder={`Merhaba ${lead.contactName || ""},\n\n`}
            />
          </Field>
        </div>

        <div className="flex items-center justify-between mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-ink/50 hover:text-ink">
            Vazgeç
          </button>
          <div className="flex items-center gap-2">
            {opened && (
              <button
                onClick={handleMarkSent}
                disabled={marking}
                className="px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
              >
                {marking ? "Kaydediliyor..." : "✓ Gönderdim, not olarak kaydet"}
              </button>
            )}
            <button
              onClick={handleOpenOutlook}
              disabled={!to.trim()}
              className="px-4 py-2 bg-gradient-to-r from-[#0078D4] to-blue-500 text-white text-sm font-semibold rounded-lg hover:shadow-glow-sm disabled:opacity-50"
            >
              {opened ? "Tekrar Aç" : "Outlook'ta Aç"}
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
