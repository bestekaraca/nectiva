import { useState } from "react";
import { createLead, SECTORS, SOURCES } from "../data/store";

export default function NewLeadModal({ onClose, onCreate }) {
  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [value, setValue] = useState("");
  const [sector, setSector] = useState("");
  const [source, setSource] = useState("");

  const handleCreate = () => {
    if (!company.trim()) return;
    onCreate(
      createLead({
        company: company.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        value: Number(value) || 0,
        sector,
        source,
      })
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-paper rounded-2xl w-full max-w-sm shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl mb-4">Yeni fırsat</h2>
        <div className="flex flex-col gap-3">
          <input
            autoFocus
            placeholder="Firma adı"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="input"
          />
          <input
            placeholder="İlgili kişi"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="input"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Telefon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
            />
            <input
              type="number"
              placeholder="Tahmini değer (₺)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="input font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select value={sector} onChange={(e) => setSector(e.target.value)} className="input">
              <option value="">Sektör</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select value={source} onChange={(e) => setSource(e.target.value)} className="input">
              <option value="">Kaynak</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-ink/60 hover:text-ink">
            Vazgeç
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-amber text-ink text-sm font-semibold rounded-lg hover:bg-amber-dark"
          >
            Oluştur
          </button>
        </div>
      </div>
    </div>
  );
}
