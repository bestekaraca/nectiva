-- NTT DATA basari hikayelerinden secilen 3 firma - Nectiva'ya aktarim (stage = yeni)
-- Supabase SQL Editor'de calistir.

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'karacabeste@gmail.com';
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Kullanici bulunamadi.';
  END IF;

  INSERT INTO leads (user_id, company, sector, stage, value) VALUES
  (v_user_id, 'BSH Türkiye', 'Dayanıklı Tüketim / Beyaz Eşya', 'yeni', 0),
  (v_user_id, 'Fenerium', 'Perakende / Hediyelik', 'yeni', 0),
  (v_user_id, 'Koçtaş', 'Perakende / Yapı Market', 'yeni', 0);
END $$;
