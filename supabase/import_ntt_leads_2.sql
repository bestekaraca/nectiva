-- NTT DATA basari hikayelerinden 20 firma daha - Nectiva'ya aktarim (stage = yeni)
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
  (v_user_id, 'Vergo Enerji', 'Enerji / Yenilenebilir Enerji', 'yeni', 0),
  (v_user_id, 'Kipaş Holding', 'Holding / Tekstil', 'yeni', 0),
  (v_user_id, 'Gökçelik', 'Perakende / Kozmetik', 'yeni', 0),
  (v_user_id, 'Teknosa', 'Perakende / Elektronik', 'yeni', 0),
  (v_user_id, 'Index Grup', 'Teknoloji', 'yeni', 0),
  (v_user_id, 'Zeren Group', 'Enerji', 'yeni', 0),
  (v_user_id, 'Pegasus', 'Havacılık', 'yeni', 0),
  (v_user_id, 'Çak Holding – LTB', 'Tekstil / Perakende', 'yeni', 0),
  (v_user_id, 'Noordzee', 'Su Ürünleri / Denizcilik', 'yeni', 0),
  (v_user_id, 'Limak Çimento', 'Çimento / Sanayi', 'yeni', 0),
  (v_user_id, 'Starwood', 'Ahşap / Mobilya', 'yeni', 0),
  (v_user_id, 'VavaCars', 'Otomotiv / E-ticaret', 'yeni', 0),
  (v_user_id, 'Kordsa', 'Otomotiv / Sanayi', 'yeni', 0),
  (v_user_id, 'Opet Fuchs', 'Enerji / Akaryakıt', 'yeni', 0),
  (v_user_id, 'Martaş Otomotiv', 'Otomotiv', 'yeni', 0),
  (v_user_id, 'Çetaş', 'Otomotiv', 'yeni', 0),
  (v_user_id, 'Sanko', 'Holding / Tekstil / Enerji', 'yeni', 0),
  (v_user_id, 'Kaplanlar', 'Gıda / Perakende', 'yeni', 0),
  (v_user_id, 'Gürsel Turizm', 'Turizm', 'yeni', 0),
  (v_user_id, 'Sun Tekstil', 'Tekstil', 'yeni', 0);
END $$;
