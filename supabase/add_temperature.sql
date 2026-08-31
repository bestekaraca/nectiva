-- Musteri sicakligi (Sicak/Ilik/Soguk) icin ayri bir alan ekleniyor
-- Supabase SQL Editor'de calistir.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS temperature text DEFAULT '';

-- Daha once genel etiket (tag) olarak eklenmis sicaklik degerlerini
-- yeni "temperature" alanina tasi, tags'ten cikar.
UPDATE leads SET
  temperature = (
    SELECT t FROM unnest(tags) AS t WHERE t IN ('Sıcak','Soğuk','Ilık') LIMIT 1
  ),
  tags = ARRAY(
    SELECT unnest(tags) EXCEPT SELECT unnest(ARRAY['Sıcak','Soğuk','Ilık'])
  )
WHERE tags && ARRAY['Sıcak','Soğuk','Ilık'];
