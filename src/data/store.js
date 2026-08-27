const STORAGE_KEY = "nexivra_sales_leads_v1";

export const STAGES = [
  { id: "yeni", label: "Yeni", color: "blue" },
  { id: "iletisimde", label: "İletişimde", color: "violet" },
  { id: "teklif", label: "Teklif", color: "amber" },
  { id: "muzakere", label: "Müzakere", color: "fuchsia" },
  { id: "kazanildi", label: "Kazanıldı", color: "teal" },
  { id: "kaybedildi", label: "Kaybedildi", color: "brick" },
];

export const SECTORS = [
  "Perakende",
  "Üretim",
  "İnşaat",
  "Lojistik",
  "Teknoloji",
  "Tekstil",
  "Gıda",
  "Sağlık",
  "Eğitim",
  "Diğer",
];

export const SOURCES = [
  "Referans",
  "Web sitesi",
  "Sosyal medya",
  "Soğuk arama",
  "Fuar / Etkinlik",
  "Diğer",
];

export const PRODUCTS = [
  "RedFlag",
  "SETS",
  "SOBE",
  "SEBE",
  "SORS",
  "EU SETS",
  "The SOLV.AI",
  "Dexperie",
];

// Her ürün için sabit renk sınıfları (Tailwind'in derleme zamanında
// tanıyabilmesi için tam class isimleri burada literal olarak yazılıyor).
export const PRODUCT_BADGE = {
  RedFlag: "bg-rose-100 text-rose-700 border-rose-200",
  SETS: "bg-blue-100 text-blue-700 border-blue-200",
  SOBE: "bg-violet-100 text-violet-700 border-violet-200",
  SEBE: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  SORS: "bg-amber-100 text-amber-700 border-amber-200",
  "EU SETS": "bg-teal-100 text-teal-700 border-teal-200",
  "The SOLV.AI": "bg-cyan-100 text-cyan-700 border-cyan-200",
  Dexperie: "bg-orange-100 text-orange-700 border-orange-200",
};

export const PRODUCT_DOT = {
  RedFlag: "bg-rose-500",
  SETS: "bg-blue-500",
  SOBE: "bg-violet-500",
  SEBE: "bg-fuchsia-500",
  SORS: "bg-amber-500",
  "EU SETS": "bg-teal-500",
  "The SOLV.AI": "bg-cyan-500",
  Dexperie: "bg-orange-500",
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Eski kayıtlarda bulunmayan alanları güvenli varsayılanlarla tamamlar.
// Böylece önceden kaydedilmiş veriler bozulmadan yeni alanlara sahip olur.
function normalizeLead(lead) {
  return {
    address: "",
    sector: "",
    source: "",
    website: "",
    position: "",
    products: [],
    tags: [],
    purchases: [],
    ...lead,
  };
}

function seedData() {
  const today = new Date();
  const inDays = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };
  return [
    {
      id: uid(),
      company: "Delta Yapı Malzemeleri",
      contactName: "Emre Sancak",
      phone: "0532 000 00 01",
      email: "emre@deltayapi.com",
      address: "Organize Sanayi Bölgesi, 5. Cadde No:12, Gebze/Kocaeli",
      sector: "İnşaat",
      source: "Referans",
      website: "deltayapi.com",
      tags: ["büyük hacim", "yıllık anlaşma adayı"],
      value: 84000,
      stage: "teklif",
      nextActionDate: inDays(1),
      nextActionNote: "Teklifi tekrar ara, fiyat sorusu vardı",
      createdAt: inDays(-6),
      notes: [
        { id: uid(), date: inDays(-6), text: "İlk görüşme yapıldı, ihtiyaç netleşti." },
        { id: uid(), date: inDays(-2), text: "Teklif e-posta ile gönderildi." },
      ],
      purchases: [
        { id: uid(), date: inDays(-190), description: "Deneme siparişi - 2 palet", amount: 18500 },
      ],
    },
    {
      id: uid(),
      company: "Orkun Elektronik",
      contactName: "Sibel Aydın",
      phone: "0533 000 00 02",
      email: "sibel@orkunelektronik.com",
      address: "Perpa Ticaret Merkezi, B Blok Kat 4, İstanbul",
      sector: "Teknoloji",
      source: "Web sitesi",
      website: "orkunelektronik.com",
      tags: [],
      value: 32000,
      stage: "iletisimde",
      nextActionDate: inDays(0),
      nextActionNote: "Bugün geri dönecekti, kontrol et",
      createdAt: inDays(-3),
      notes: [{ id: uid(), date: inDays(-3), text: "Ürün kataloğu paylaşıldı." }],
      purchases: [],
    },
    {
      id: uid(),
      company: "Vantaş Lojistik",
      contactName: "Kaan Türe",
      phone: "0534 000 00 03",
      email: "kaan@vantaslojistik.com",
      address: "Hadımköy Yolu Üzeri No:8, İstanbul",
      sector: "Lojistik",
      source: "Fuar / Etkinlik",
      website: "vantaslojistik.com",
      tags: ["stratejik müşteri"],
      value: 156000,
      stage: "muzakere",
      nextActionDate: inDays(2),
      nextActionNote: "İndirim talebine yanıt ver",
      createdAt: inDays(-14),
      notes: [
        { id: uid(), date: inDays(-14), text: "Yıllık anlaşma görüşülüyor." },
        { id: uid(), date: inDays(-5), text: "%10 indirim talep edildi." },
      ],
      purchases: [
        { id: uid(), date: inDays(-400), description: "Pilot proje - 3 aylık", amount: 42000 },
        { id: uid(), date: inDays(-90), description: "Yenileme siparişi", amount: 51000 },
      ],
    },
    {
      id: uid(),
      company: "Mira Tekstil",
      contactName: "Elif Onat",
      phone: "0535 000 00 04",
      email: "elif@miratekstil.com",
      address: "Laleli, Fatih/İstanbul",
      sector: "Tekstil",
      source: "Referans",
      website: "",
      tags: ["kazanıldı"],
      value: 47500,
      stage: "kazanildi",
      nextActionDate: null,
      nextActionNote: "",
      createdAt: inDays(-20),
      notes: [{ id: uid(), date: inDays(-1), text: "Sözleşme imzalandı. 🎉" }],
      purchases: [{ id: uid(), date: inDays(-1), description: "İlk anlaşma", amount: 47500 }],
    },
    {
      id: uid(),
      company: "Pergel Mobilya",
      contactName: "Tolga Kurt",
      phone: "0536 000 00 05",
      email: "tolga@pergelmobilya.com",
      address: "",
      sector: "Perakende",
      source: "Soğuk arama",
      website: "",
      tags: [],
      value: 21000,
      stage: "yeni",
      nextActionDate: inDays(1),
      nextActionNote: "İlk arama yapılacak",
      createdAt: inDays(-1),
      notes: [],
      purchases: [],
    },
  ];
}

export function loadLeads() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw).map(normalizeLead);
  } catch (e) {
    console.error("Veri okunamadı:", e);
    return [];
  }
}

export function saveLeads(leads) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch (e) {
    console.error("Veri kaydedilemedi:", e);
  }
}

export function createLead(partial) {
  return normalizeLead({
    id: uid(),
    company: "",
    contactName: "",
    phone: "",
    email: "",
    value: 0,
    stage: "yeni",
    nextActionDate: null,
    nextActionNote: "",
    createdAt: new Date().toISOString().slice(0, 10),
    notes: [],
    ...partial,
  });
}

export function newNote(text) {
  return { id: uid(), date: new Date().toISOString().slice(0, 10), text };
}

export function newPurchase(description, amount) {
  return {
    id: uid(),
    date: new Date().toISOString().slice(0, 10),
    description,
    amount: Number(amount) || 0,
  };
}

export function totalPurchases(lead) {
  return (lead.purchases || []).reduce((sum, p) => sum + (p.amount || 0), 0);
}

export function formatCurrency(n) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dateStr < today;
}

export function isToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dateStr === today;
}
