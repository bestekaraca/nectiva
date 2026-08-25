-- Nexivra Sales - Veritabani semasi
-- Bu kodu Supabase panelinde "SQL Editor" bolumune yapistirip calistir.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null default '',
  contact_name text default '',
  phone text default '',
  email text default '',
  address text default '',
  sector text default '',
  source text default '',
  website text default '',
  tags text[] default '{}',
  value numeric default 0,
  stage text default 'yeni',
  next_action_date date,
  next_action_note text default '',
  created_at timestamptz default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  date date default current_date,
  text text not null,
  created_at timestamptz default now()
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  date date default current_date,
  description text not null,
  amount numeric default 0,
  created_at timestamptz default now()
);

-- Row Level Security: herkes sadece kendi verisini gorebilir/degistirebilir
alter table leads enable row level security;
alter table notes enable row level security;
alter table purchases enable row level security;

create policy "Users manage own leads" on leads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage notes of own leads" on notes
  for all using (
    exists (select 1 from leads where leads.id = notes.lead_id and leads.user_id = auth.uid())
  )
  with check (
    exists (select 1 from leads where leads.id = notes.lead_id and leads.user_id = auth.uid())
  );

create policy "Users manage purchases of own leads" on purchases
  for all using (
    exists (select 1 from leads where leads.id = purchases.lead_id and leads.user_id = auth.uid())
  )
  with check (
    exists (select 1 from leads where leads.id = purchases.lead_id and leads.user_id = auth.uid())
  );
