import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { STAGES, PRODUCTS, formatCurrency } from "../data/store";

const STAGE_HEX = {
  blue: "#3B82F6",
  violet: "#8B5CF6",
  amber: "#F59E0B",
  fuchsia: "#D946EF",
  teal: "#10B981",
  brick: "#F43F5E",
};

function toISO(d) {
  return d.toISOString().slice(0, 10);
}
function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toISO(d);
}
function mondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return toISO(d);
}

function getRange(mode, customStart, customEnd) {
  const today = new Date();
  if (mode === "thisWeek") {
    const start = mondayOf(today);
    return { start, end: addDays(start, 6), label: "Bu Hafta" };
  }
  if (mode === "lastWeek") {
    const thisMonday = mondayOf(today);
    const start = addDays(thisMonday, -7);
    return { start, end: addDays(start, 6), label: "Geçen Hafta" };
  }
  if (mode === "thisMonth") {
    const start = toISO(new Date(today.getFullYear(), today.getMonth(), 1));
    const end = toISO(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    return { start, end, label: "Bu Ay" };
  }
  return { start: customStart, end: customEnd, label: "Özel Aralık" };
}

function getPreviousPeriod(start, end) {
  const lengthDays = Math.round((new Date(end) - new Date(start)) / 86400000) + 1;
  const prevEnd = addDays(start, -1);
  const prevStart = addDays(prevEnd, -(lengthDays - 1));
  return { start: prevStart, end: prevEnd };
}

function countActivities(leads, activityLogs, start, end) {
  const within = (d) => d && d >= start && d <= end;
  const notes = leads.flatMap((l) => l.notes);
  return {
    newLeads: leads.filter((l) => within(l.createdAt?.slice(0, 10))).length,
    call:
      notes.filter((n) => n.type === "call" && within(n.date)).length +
      activityLogs.filter((a) => a.type === "call" && within(a.date)).length,
    email:
      notes.filter((n) => n.type === "email" && within(n.date)).length +
      activityLogs.filter((a) => a.type === "email" && within(a.date)).length,
    meeting:
      notes.filter((n) => n.type === "meeting" && within(n.date)).length +
      activityLogs.filter((a) => a.type === "meeting" && within(a.date)).length,
    proposal: notes.filter((n) => n.type === "proposal" && within(n.date)).length,
  };
}

export default function Reports({ leads, activityLogs }) {
  const [rangeMode, setRangeMode] = useState("thisWeek");
  const [customStart, setCustomStart] = useState(addDays(toISO(new Date()), -6));
  const [customEnd, setCustomEnd] = useState(toISO(new Date()));

  const range = useMemo(
    () => getRange(rangeMode, customStart, customEnd),
    [rangeMode, customStart, customEnd]
  );
  const prevRange = useMemo(() => getPreviousPeriod(range.start, range.end), [range]);

  const current = useMemo(() => countActivities(leads, activityLogs, range.start, range.end), [leads, activityLogs, range]);
  const previous = useMemo(
    () => countActivities(leads, activityLogs, prevRange.start, prevRange.end),
    [leads, activityLogs, prevRange]
  );

  const comparisonData = [
    { name: "Yeni Fırsat", onceki: previous.newLeads, secili: current.newLeads },
    { name: "Arama", onceki: previous.call, secili: current.call },
    { name: "Mail", onceki: previous.email, secili: current.email },
    { name: "Toplantı", onceki: previous.meeting, secili: current.meeting },
    { name: "Teklif", onceki: previous.proposal, secili: current.proposal },
  ];

  const stageData = STAGES.map((s) => ({
    name: s.label,
    count: leads.filter((l) => l.stage === s.id).length,
    color: STAGE_HEX[s.color],
  }));

  const productData = PRODUCTS.map((p) => {
    const withProduct = leads.filter((l) => l.products.includes(p));
    return {
      name: p,
      teklif: withProduct.filter((l) => l.stage === "teklif").length,
      muzakere: withProduct.filter((l) => l.stage === "muzakere").length,
      sunum: withProduct.reduce(
        (sum, l) => sum + l.notes.filter((n) => n.type === "meeting").length,
        0
      ),
    };
  });

  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-ink mb-1">Rapor</h1>
      <p className="text-sm text-ink/40 mb-6">Yönetici özeti: dönem karşılaştırması, pipeline ve ürün analizi.</p>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {[
          { id: "thisWeek", label: "Bu Hafta" },
          { id: "lastWeek", label: "Geçen Hafta" },
          { id: "thisMonth", label: "Bu Ay" },
          { id: "custom", label: "Özel Aralık" },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setRangeMode(m.id)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              rangeMode === m.id
                ? "bg-ink text-white border-ink"
                : "bg-white text-ink/55 border-mist hover:border-ink/25"
            }`}
          >
            {m.label}
          </button>
        ))}
        {rangeMode === "custom" && (
          <div className="flex items-center gap-1.5 ml-1">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="input font-mono !w-auto text-xs py-1"
            />
            <span className="text-ink/30 text-xs">–</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="input font-mono !w-auto text-xs py-1"
            />
          </div>
        )}
        <span className="text-xs font-mono text-ink/30 ml-1">
          {range.start} → {range.end}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        <ActivityCard icon="✨" label="Yeni Fırsat" count={current.newLeads} prev={previous.newLeads} accent="violet" />
        <ActivityCard icon="📞" label="Arama" count={current.call} prev={previous.call} accent="blue" />
        <ActivityCard icon="✉️" label="Mail" count={current.email} prev={previous.email} accent="violet" />
        <ActivityCard icon="🤝" label="Toplantı" count={current.meeting} prev={previous.meeting} accent="emerald" />
        <ActivityCard icon="📄" label="Teklif" count={current.proposal} prev={previous.proposal} accent="amber" />
      </div>

      <Section title="Dönem Karşılaştırması" subtitle={`Önceki dönem (${prevRange.start} – ${prevRange.end}) ile karşılaştırma`}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={comparisonData}
            layout="vertical"
            margin={{ top: 10, right: 34, left: 10, bottom: 10 }}
            barCategoryGap={18}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E9E5F6" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12, fill: "#6B6478" }} allowDecimals={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: "#3F3A4D", fontWeight: 500 }}
              width={80}
              axisLine={{ stroke: "#E9E5F6" }}
              tickLine={false}
            />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E9E5F6", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="onceki" name="Önceki Dönem" fill="#DDD6FE" radius={[0, 6, 6, 0]} barSize={13}>
              <LabelList dataKey="onceki" position="right" style={{ fontSize: 11, fill: "#8B7FB8", fontWeight: 600 }} />
            </Bar>
            <Bar dataKey="secili" name="Seçili Dönem" fill="#7C3AED" radius={[0, 6, 6, 0]} barSize={13}>
              <LabelList dataKey="secili" position="right" style={{ fontSize: 11, fill: "#5B21B6", fontWeight: 700 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 pt-3 border-t border-mist">
          {comparisonData.map((d) => {
            const diff = d.secili - d.onceki;
            const color = diff > 0 ? "text-emerald-600" : diff < 0 ? "text-rose-500" : "text-ink/35";
            const sign = diff > 0 ? "+" : "";
            return (
              <span key={d.name} className="text-xs text-ink/50">
                {d.name}: <span className={`font-semibold ${color}`}>{sign}{diff}</span>
              </span>
            );
          })}
        </div>
      </Section>

      <Section title="Pipeline Dağılımı" subtitle={`Toplam ${leads.length} fırsat · ${formatCurrency(totalValue)} — sütun grafik`}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stageData} margin={{ top: 28, right: 10, left: -10, bottom: 0 }} barCategoryGap={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E9E5F6" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B6478" }} axisLine={{ stroke: "#E9E5F6" }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#6B6478" }} allowDecimals={false} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: "1px solid #E9E5F6", fontSize: 12 }}
              formatter={(value, name, props) => [`${value} fırsat`, props.payload.name]}
            />
            <Bar dataKey="count" name="Fırsat Sayısı" radius={[8, 8, 0, 0]} maxBarSize={64}>
              {stageData.map((s, i) => (
                <Cell key={i} fill={s.color} />
              ))}
              <LabelList
                dataKey="count"
                position="top"
                style={{ fontSize: 13, fill: "#1E1B2E", fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <Section title="Ürün Bazlı Analiz" subtitle="Her ürün için açık teklif, müzakere ve yapılan sunum (toplantı) sayısı — yatay çubuk grafik">
        <ResponsiveContainer width="100%" height={380}>
          <BarChart
            data={productData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            barCategoryGap={14}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E9E5F6" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12, fill: "#6B6478" }} allowDecimals={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: "#3F3A4D", fontWeight: 500 }}
              width={92}
              axisLine={{ stroke: "#E9E5F6" }}
              tickLine={false}
            />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E9E5F6", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="teklif" name="Teklif" fill="#F59E0B" radius={[0, 6, 6, 0]} barSize={11}>
              <LabelList dataKey="teklif" position="right" style={{ fontSize: 11, fill: "#92400E", fontWeight: 600 }} />
            </Bar>
            <Bar dataKey="muzakere" name="Müzakere" fill="#D946EF" radius={[0, 6, 6, 0]} barSize={11}>
              <LabelList dataKey="muzakere" position="right" style={{ fontSize: 11, fill: "#A21CAF", fontWeight: 600 }} />
            </Bar>
            <Bar dataKey="sunum" name="Sunum" fill="#3B82F6" radius={[0, 6, 6, 0]} barSize={11}>
              <LabelList dataKey="sunum" position="right" style={{ fontSize: 11, fill: "#1D4ED8", fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Section>
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

function ActivityCard({ icon, label, count, prev, accent }) {
  const border = {
    violet: "border-l-violet-500",
    blue: "border-l-blue-500",
    emerald: "border-l-emerald-500",
    amber: "border-l-amber-500",
  }[accent];
  const diff = count - prev;
  const diffLabel =
    diff === 0 ? "değişim yok" : diff > 0 ? `+${diff} önceki döneme göre` : `${diff} önceki döneme göre`;
  const diffColor = diff > 0 ? "text-emerald-600" : diff < 0 ? "text-rose-500" : "text-ink/30";
  return (
    <div className={`glass rounded-card p-3.5 border-l-[3px] ${border}`}>
      <div className="text-lg leading-none mb-1.5">{icon}</div>
      <div className="font-display font-bold text-2xl text-ink">{count}</div>
      <div className="text-xs text-ink/45 mt-0.5">{label}</div>
      <div className={`text-[11px] mt-1 font-medium ${diffColor}`}>{diffLabel}</div>
    </div>
  );
}
