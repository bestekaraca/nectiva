-- RedFlag agresif satis kampanyasi hedef tablosunu ekliyor
-- Eylul 2026 icin ana metrikler, Kasim 2026 icin ilk satis hedefi
-- Supabase SQL Editor'de calistir.

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'karacabeste@gmail.com';
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Kullanici bulunamadi.';
  END IF;

  INSERT INTO monthly_scorecard_items (user_id, month, label, target_text, sort_order) VALUES
  (v_user_id, '2026-09-01', 'Öncelikli hedef şirket', '40', 1),
  (v_user_id, '2026-09-01', 'Ulaşılacak kişi', '100–120', 2),
  (v_user_id, '2026-09-01', 'Telefon araması', '150–160', 3),
  (v_user_id, '2026-09-01', 'Yeni kişiselleştirilmiş mail', '120', 4),
  (v_user_id, '2026-09-01', 'Follow-up maili', '120', 5),
  (v_user_id, '2026-09-01', 'LinkedIn teması', '60–80', 6),
  (v_user_id, '2026-09-01', 'Gerçekleşen toplantı', '8–10', 7),
  (v_user_id, '2026-09-01', 'Nitelikli RedFlag fırsatı', '4–5', 8),
  (v_user_id, '2026-09-01', 'İkinci toplantı/demo', '4', 9),
  (v_user_id, '2026-09-01', 'Teklif', '2–3', 10),
  (v_user_id, '2026-09-01', 'Karar vericinin katıldığı görüşme', 'En az 2', 11),
  (v_user_id, '2026-11-01', 'Hedef kapanış (ilk satış)', 'En az 1', 1);
END $$;
