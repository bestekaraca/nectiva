# Nexivra Sales — Satış Asistanı

Satış fırsatlarını takip etmek, boru hattını (pipeline) yönetmek, müşteri
bilgilerini ve geçmiş satışları kayıt altına almak için bir web uygulaması.

## Veri nerede saklanıyor?

Veriler artık **Supabase** üzerinde gerçek bir veritabanında (Postgres)
tutuluyor — tarayıcıya bağlı değil, her cihazdan giriş yapıp aynı veriyi
görebilirsin. Sadece senin hesabınla girenler kendi verisini görür (Row
Level Security ile korunuyor).

### Kurulum (bir kere yapılır)

1. `supabase/schema.sql` dosyasının içeriğini kopyala.
2. Supabase panelinde sol menüden **SQL Editor** açık, yapıştır ve **Run**'a bas.
3. Bu, `leads`, `notes`, `purchases` tablolarını ve güvenlik kurallarını oluşturur.
4. `src/lib/supabaseClient.js` içindeki `SUPABASE_URL` ve
   `SUPABASE_PUBLISHABLE_KEY` değerlerinin kendi projene ait olduğundan
   emin ol (Project Settings → API Keys).

### Giriş

Uygulama artık e-posta + şifre ile giriş istiyor. İlk kullanımda "Hesap
oluştur" sekmesinden bir hesap açman gerekiyor.

## Yerelde çalıştırma

```bash
npm install
npm run dev
```

## Canlıya alma (Vercel — ücretsiz)

1. Bu klasördeki dosyaları GitHub reponuza yükleyin.
2. vercel.com'a GitHub hesabınızla giriş yapın.
3. "Add New Project" -> reponuzu seçin, Vite otomatik algılanır, "Deploy".
4. Birkaç saniye içinde "sizin-projeniz.vercel.app" linki hazır olur.
