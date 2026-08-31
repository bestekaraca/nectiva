-- E-Irsaliye urunu eklendi. Daha once genel etiket (tag) olarak gelmis
-- "E-irsaliye" degerini, dogru urun alanina (products) tasiyor.
-- Supabase SQL Editor'de calistir.

UPDATE leads SET
  products = array_append(products, 'E-İrsaliye'),
  tags = ARRAY(
    SELECT unnest(tags) EXCEPT SELECT unnest(ARRAY['E-irsaliye','e-irsaliye','E-İrsaliye'])
  )
WHERE tags && ARRAY['E-irsaliye','e-irsaliye','E-İrsaliye']
  AND NOT ('E-İrsaliye' = ANY(products));
