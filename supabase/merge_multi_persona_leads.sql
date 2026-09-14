-- Ayni firma adiyla birden fazla kayit varsa (farkli kisi/persona icin olusturulmus),
-- hepsini TEK bir kayda birlestirir. En eski kayit "ana" kayit olarak kalir,
-- digerlerinin kisi bilgisi "contacts" alanina eklenir, notlari/satin almalari
-- ana kayda tasinir, fazla kayitlar silinir.
-- Supabase SQL Editor'de calistir.

DO $$
DECLARE
  v_user_id uuid;
  grp RECORD;
  v_canonical_id uuid;
  dup RECORD;
  v_new_contact jsonb;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'karacabeste@gmail.com';
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Kullanici bulunamadi.';
  END IF;

  -- Ayni (kucuk harfe cevrilmis, bosluklari kirpilmis) firma adina sahip 2+ kayit olan gruplari bul
  FOR grp IN
    SELECT lower(trim(company)) AS norm_company
    FROM leads
    WHERE user_id = v_user_id
    GROUP BY lower(trim(company))
    HAVING COUNT(*) > 1
  LOOP
    -- Bu gruptaki en eski kaydi "ana" kayit sec
    SELECT id INTO v_canonical_id
    FROM leads
    WHERE user_id = v_user_id AND lower(trim(company)) = grp.norm_company
    ORDER BY created_at ASC
    LIMIT 1;

    -- Diger (duplicate) kayitlari gez
    FOR dup IN
      SELECT id, contact_name, email, phone, position, contacts
      FROM leads
      WHERE user_id = v_user_id
        AND lower(trim(company)) = grp.norm_company
        AND id <> v_canonical_id
    LOOP
      -- Bu duplicate'in kendi kisi bilgisini JSON nesnesine cevir
      v_new_contact := jsonb_build_object(
        'name', COALESCE(dup.contact_name, ''),
        'email', COALESCE(dup.email, ''),
        'phone', COALESCE(dup.phone, ''),
        'position', COALESCE(dup.position, '')
      );

      -- Ana kaydin contacts dizisine ekle (bos degilse)
      IF COALESCE(dup.contact_name, '') <> '' OR COALESCE(dup.email, '') <> '' THEN
        UPDATE leads
        SET contacts = contacts || jsonb_build_array(v_new_contact)
        WHERE id = v_canonical_id;
      END IF;

      -- Eger duplicate'in kendi ekstra "contacts" listesi varsa onlari da tasi
      UPDATE leads
      SET contacts = contacts || dup.contacts
      WHERE id = v_canonical_id AND jsonb_array_length(dup.contacts) > 0;

      -- Notlari ve satin almalari ana kayda tasi
      UPDATE notes SET lead_id = v_canonical_id WHERE lead_id = dup.id;
      UPDATE purchases SET lead_id = v_canonical_id WHERE lead_id = dup.id;

      -- Duplicate kaydi sil
      DELETE FROM leads WHERE id = dup.id;
    END LOOP;
  END LOOP;
END $$;
