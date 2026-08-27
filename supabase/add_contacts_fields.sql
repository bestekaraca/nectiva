-- Kisiler (Contacts) ozelligi icin yeni alanlar
-- Supabase SQL Editor'de calistir.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS position text DEFAULT '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS products text[] DEFAULT '{}';

-- Daha once "etiket" olarak eklenmis urun isimlerini (Excel aktariminda
-- oldugu gibi) yeni "products" alanina tasi, tags'ten cikar.
UPDATE leads SET
  products = ARRAY(
    SELECT unnest(tags) INTERSECT
    SELECT unnest(ARRAY['RedFlag','SETS','SOBE','SEBE','SORS','EU SETS','The SOLV.AI','Dexperie'])
  ),
  tags = ARRAY(
    SELECT unnest(tags) EXCEPT
    SELECT unnest(ARRAY['RedFlag','SETS','SOBE','SEBE','SORS','EU SETS','The SOLV.AI','Dexperie'])
  )
WHERE tags && ARRAY['RedFlag','SETS','SOBE','SEBE','SORS','EU SETS','The SOLV.AI','Dexperie'];
