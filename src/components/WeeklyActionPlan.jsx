import { useState, useMemo } from "react";
import { isOverdue, isToday } from "../data/store";

function daysAgo(dateStr) {
  if (!dateStr) return 9999;
  return Math.round((new Date() - new Date(dateStr + "T00:00:00")) / 86400000);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const PRIORITY_STYLE = {
  Yüksek: "bg-rose-100 text-rose-700 border-rose-300",
  Orta: "bg-amber-100 text-amber-700 border-amber-300",
};

function buildActionPlan(leads) {
  const active = leads.filter((l) => l.stage !== "kazanildi" && l.stage !== "kaybedildi");
  if (active.length === 0) return [];

  const values = active.map((l) => l.value || 0).sort((a, b) => a - b);
  const highValueThreshold = values[Math.floor(values.length * 0.7)] || 0;

  const items = [];

  active.forEach((lead) => {
    const lastNote = lead.notes[0];
    const sinceLast = lastNote ? daysAgo(lastNote.date) : daysAgo(lead.createdAt?.slice(0, 10));
    const overdue = isOverdue(lead.nextActionDate);
    const hasMeeting = lead.notes.some((n) => n.type === "meeting");
    const hasProposalNote = lead.notes.some((n) => n.type === "proposal");
    const isHighValue = (lead.value || 0) >= highValueThreshold && highValueThreshold > 0;

    // 1. Gecikmiş takip — en yüksek öncelik
    if (overdue) {
      items.push({
        lead,
        priority: "Yüksek",
        score: 100 + (lead.value || 0) / 1000,
        action: `${lead.company} için gecikmiş takibi bugün tamamla`,
        reason: `Planlanan takip tarihi geçti (${lead.nextActionDate})${
          lead.nextActionNote ? " — " + lead.nextActionNote : ""
        }`,
      });
      return;
    }

    // 2. Teklif/müzakerede sessizliğe düşmüş — soğuyan sıcak fırsat
    if ((lead.stage === "teklif" || lead.stage === "muzakere") && sinceLast >= 5) {
      items.push({
        lead,
        priority: "Yüksek",
        score: 90 + (lead.value || 0) / 1000,
        action: `${lead.company} ile ${sinceLast} gündür temas yok — hemen ara`,
        reason: `${lead.stage === "teklif" ? "Teklif" : "Müzakere"} aşamasında bekliyor, soğumadan müdahale et`,
      });
      return;
    }

    // 3. Toplantı yapılmış ama hâlâ erken aşamada, teklif çıkmamış
    if (hasMeeting && !hasProposalNote && (lead.stage === "yeni" || lead.stage === "iletisimde")) {
      items.push({
        lead,
        priority: "Orta",
        score: 60 + (lead.value || 0) / 1000,
        action: `${lead.company} için teklif hazırlayıp gönder`,
        reason: "Toplantı yapıldı ama henüz teklif aşamasına geçilmedi",
      });
      return;
    }

    // 4. Çok uzun süredir hiç temas yok — sessizliğe düşmüş
    if (sinceLast >= 14) {
      items.push({
        lead,
        priority: isHighValue ? "Yüksek" : "Orta",
        score: (isHighValue ? 70 : 40) + (lead.value || 0) / 1000,
        action: `${lead.company} ile yeniden temas kur (mail veya arama)`,
        reason: `${sinceLast} gündür hiçbir aktivite yok, ilişki soğumuş olabilir`,
      });
      return;
    }

    // 5. Yüksek değerli ama erken aşamada, hâlâ öncelik verilmemiş olabilir
    if (isHighValue && (lead.stage === "yeni" || lead.stage === "iletisimde") && sinceLast >= 3) {
      items.push({
        lead,
        priority: "Orta",
        score: 50 + (lead.value || 0) / 1000,
        action: `${lead.company} yüksek değerli bir fırsat — bu hafta öncelik ver`,
        reason: `Değeri yüksek (${(lead.value || 0).toLocaleString("tr-TR")} €) ama hâlâ erken aşamada`,
      });
    }
  });

  return items.sort((a, b) => b.score - a.score).slice(0, 8);
}

export default function WeeklyActionPlan({ leads, onAddTask, onOpenLead }) {
  const [dismissed, setDismissed] = useState(new Set());
  const [addedFor, setAddedFor] = useState(new Set());

  const plan = useMemo(() => buildActionPlan(leads), [leads]);
  const visible = plan.filter((_, i) => !dismissed.has(i));

  const handleAddTask = async (item, idx) => {
    await onAddTask(item.action, todayISO());
    setAddedFor((prev) => new Set(prev).add(idx));
  };

  if (plan.length === 0) return null;

  return (
    <div className="glass rounded-card p-4 mb-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-sm text-ink/80">🎯 Bu Haftanın Aksiyon Planı</h3>
        <span className="text-xs text-ink/35">{visible.length} öneri</span>
      </div>
      <p className="text-xs text-ink/40 mb-3">
        Notların, aşamaların ve son temas tarihlerin taranarak otomatik oluşturuldu — satışı ileri taşıyacak en kritik adımlar.
      </p>

      <div className="flex flex-col gap-2">
        {plan.map((item, idx) => {
          if (dismissed.has(idx)) return null;
          return (
            <div key={idx} className="bg-white border border-mist rounded-lg px-3.5 py-3">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${PRIORITY_STYLE[item.priority]}`}
                  >
                    {item.priority}
                  </span>
                  <span className="text-sm font-medium text-ink/85 truncate">{item.action}</span>
                </div>
                <button
                  onClick={() => setDismissed((prev) => new Set(prev).add(idx))}
                  className="text-ink/25 hover:text-rose-500 text-sm shrink-0"
                  title="Bu öneriyi gizle"
                >
                  ×
                </button>
              </div>
              <p className="text-xs text-ink/40 mb-2">{item.reason}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenLead(item.lead)}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg border border-mist bg-white text-ink/60 hover:border-violet-300 hover:text-violet-700"
                >
                  Firmayı Aç
                </button>
                <button
                  onClick={() => handleAddTask(item, idx)}
                  disabled={addedFor.has(idx)}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-600 to-blue-500 text-white hover:shadow-glow-sm disabled:opacity-50"
                >
                  {addedFor.has(idx) ? "✓ Görev eklendi" : "Görev Olarak Ekle"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
