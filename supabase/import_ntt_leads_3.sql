-- NTT DATA basari hikayelerinden 11 firma daha - Nectiva'ya aktarim (stage = yeni)
-- Norm Holding, Koctas ve Penti zaten sistemde oldugu icin atlandi.
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
  (v_user_id, 'Bakioğlu Holding', 'Holding / Tekstil', 'yeni', 0),
  (v_user_id, 'Kardemir', 'Demir-Çelik', 'yeni', 0),
  (v_user_id, 'Standard Profil', 'Otomotiv', 'yeni', 0),
  (v_user_id, 'Silverline', 'Beyaz Eşya / Ankastre', 'yeni', 0),
  (v_user_id, 'Koleksiyon', 'Mobilya', 'yeni', 0),
  (v_user_id, 'Savcan Tekstil', 'Tekstil', 'yeni', 0),
  (v_user_id, 'TKG Otomotiv', 'Otomotiv', 'yeni', 0),
  (v_user_id, 'Reis Makina', 'Makine / Dış Ticaret', 'yeni', 0),
  (v_user_id, 'Sarten Ambalaj', 'Metal Ambalaj', 'yeni', 0),
  (v_user_id, 'Kanca', 'Metal / El Aletleri', 'yeni', 0),
  (v_user_id, 'Altınyıldız', 'Tekstil', 'yeni', 0);
END $$;
