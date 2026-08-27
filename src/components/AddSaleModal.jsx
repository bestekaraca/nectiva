import { useState } from "react";

export default function AddSaleModal({ onClose, onCreate }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);

  const handleCreate = async () => {
    if (!amount || busy) return;
    setBusy(true);
    try {
      await onCreate(Number(amount), note.trim(), date);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/25 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="glass rounded-3xl w-full max-w-sm shadow-glow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display font-semibold text-xl mb-1 text-ink">Satış ekle</h2>
        <p className="text-xs text-ink/40 mb-4">Yıllık hedefine sayılacak.</p>
        <div className="flex flex-col gap-3">
          <input
            autoFocus
            type="number"
            placeholder="Tutar (€)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="input font-mono text-lg"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input font-mono"
          />
          <input
            placeholder="Not (örn: hangi firma)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="input"
          />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-ink/50 hover:text-ink">
            Vazgeç
          </button>
          <button
            onClick={handleCreate}
            disabled={busy}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-semibold rounded-lg hover:shadow-glow-sm disabled:opacity-60"
          >
            {busy ? "Ekleniyor..." : "Ekle"}
          </button>
        </div>
      </div>
    </div>
  );
}
