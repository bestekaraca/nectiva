import { useState } from "react";
import { PRODUCTS, PRODUCT_BADGE, PRODUCT_DOT } from "../data/store";
import { exportToExcel } from "../lib/exportExcel";

export default function Contacts({ leads, onOpen }) {
  const [productFilter, setProductFilter] = useState(null);
  const [query, setQuery] = useState("");
  const [exporting, setExporting] = useState(false);

  const filtered = leads.filter((l) => {
    const matchesProduct = !productFilter || l.products.includes(productFilter);
    const matchesQuery = `${l.contactName} ${l.company} ${l.position}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesProduct && matchesQuery;
  });

  const uniqueCompanies = new Set(leads.map((l) => l.company).filter(Boolean)).size;

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportToExcel({
        filename: `nectiva-kisiler-${new Date().toISOString().slice(0, 10)}.xlsx`,
        reportTitle: "Nectiva — Kişiler Raporu",
        rows: filtered,
        columns: [
          { header: "Ad Soyad", value: (r) => r.contactName, width: 22 },
          { header: "Pozisyon", value: (r) => r.position, width: 20 },
          { header: "Firma", value: (r) => r.company, width: 24 },
          { header: "Telefon", value: (r) => r.phone, width: 16 },
          { header: "E-posta", value: (r) => r.email, width: 24 },
          { header: "Sektör", value: (r) => r.sector, width: 16 },
          { header: "Ürünler", value: (r) => r.products.join(", "), width: 26 },
        ],
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
        <h1 className="font-display font-semibold text-2xl text-ink">Kişiler</h1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="İsim, firma veya pozisyon ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64 input"
          />
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-mist bg-white text-ink/70 hover:border-violet-300 hover:text-violet-700 transition-colors disabled:opacity-50 shrink-0"
          >
            <DownloadIcon />
            {exporting ? "Hazırlanıyor..." : "Excel'e Aktar"}
          </button>
        </div>
      </div>
      <p className="text-sm text-ink/40 mb-1">Tüm müşteri kişilerin, ürüne göre filtrelenebilir.</p>
      <p className="text-sm text-ink/60 font-medium mb-5">
        Toplam <span className="text-violet-600 font-semibold">{leads.length}</span> kişi ·{" "}
        <span className="text-violet-600 font-semibold">{uniqueCompanies}</span> firma
        {(productFilter || query) && (
          <span className="text-ink/40 font-normal"> (filtre sonrası {filtered.length} kayıt)</span>
        )}
      </p>

      {/* Ürün filtre sekmeleri */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        <FilterTab
          label="Tümü"
          active={productFilter === null}
          onClick={() => setProductFilter(null)}
        />
        {PRODUCTS.map((p) => (
          <FilterTab
            key={p}
            label={p}
            dotClass={PRODUCT_DOT[p]}
            active={productFilter === p}
            onClick={() => setProductFilter(p)}
          />
        ))}
      </div>

      <div className="glass rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mist text-left">
                <Th>Ad Soyad</Th>
                <Th>Pozisyon</Th>
                <Th>Firma</Th>
                <Th>Telefon</Th>
                <Th>E-posta</Th>
                <Th>Sektör</Th>
                <Th>Ürün(ler)</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr
                  key={l.id}
                  onClick={() => onOpen(l)}
                  className="border-b border-mist last:border-0 hover:bg-violet-50 cursor-pointer transition-colors"
                >
                  <Td className="font-medium text-ink">{l.contactName || "—"}</Td>
                  <Td>{l.position || "—"}</Td>
                  <Td>{l.company || "—"}</Td>
                  <Td className="font-mono text-xs">{l.phone || "—"}</Td>
                  <Td className="text-xs">{l.email || "—"}</Td>
                  <Td>{l.sector || "—"}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {l.products.length === 0 && <span className="text-ink/25">—</span>}
                      {l.products.map((p) => (
                        <span
                          key={p}
                          className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full border ${PRODUCT_BADGE[p]}`}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </Td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-ink/30 text-sm py-8">
                    Eşleşen kişi bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FilterTab({ label, dotClass, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
        active
          ? "bg-ink text-white border-ink"
          : "bg-white text-ink/55 border-mist hover:border-ink/25"
      }`}
    >
      {dotClass && <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />}
      {label}
    </button>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-2.5 text-xs font-semibold text-ink/50 uppercase tracking-wide whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return <td className={`px-4 py-2.5 text-ink/75 whitespace-nowrap ${className}`}>{children}</td>;
}
