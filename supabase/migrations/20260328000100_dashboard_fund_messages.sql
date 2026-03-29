-- Sjóður húsfélags + skilaboð fyrir yfirlit (dashboard)

-- Fund balance (mánaðarleg staða)
create table if not exists public.fund_balance (
  id uuid primary key default gen_random_uuid (),
  balance numeric not null,
  month date not null,
  income numeric not null default 0,
  expenses numeric not null default 0,
  notes text,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fund_balance_month_unique unique (month)
);

comment on table public.fund_balance is 'Heildarstaða sjóðs eftir mánuði';

create index if not exists fund_balance_month_idx on public.fund_balance (month desc);

alter table public.fund_balance enable row level security;

drop policy if exists "fund_balance_select_authenticated" on public.fund_balance;
create policy "fund_balance_select_authenticated" on public.fund_balance for select to authenticated using (true);

drop policy if exists "fund_balance_insert_gjaldkeri" on public.fund_balance;
create policy "fund_balance_insert_gjaldkeri" on public.fund_balance for insert to authenticated with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid ()
      and p.role = 'gjaldkeri'
  )
);

drop policy if exists "fund_balance_update_gjaldkeri" on public.fund_balance;
create policy "fund_balance_update_gjaldkeri" on public.fund_balance for update to authenticated using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid ()
      and p.role = 'gjaldkeri'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid ()
      and p.role = 'gjaldkeri'
  )
);

drop policy if exists "fund_balance_delete_gjaldkeri" on public.fund_balance;
create policy "fund_balance_delete_gjaldkeri" on public.fund_balance for delete to authenticated using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid ()
      and p.role = 'gjaldkeri'
  )
);

-- Upphafsstaða (mánuður fyrsta dagsetningar)
insert into public.fund_balance (balance, month, income, expenses, notes)
values (450000, '2026-03-01', 125000, 85000, 'Initial balance entry')
on conflict (month) do nothing;

-- Skilaboð (hópur + einkaspjall)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid (),
  content text not null,
  sender_id uuid not null references auth.users (id) on delete cascade,
  is_private boolean not null default false,
  recipient_id uuid references auth.users (id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now ()
);

comment on table public.messages is 'Hóp- og einkaskilaboð';

create index if not exists messages_created_at_idx on public.messages (created_at desc);

alter table public.messages enable row level security;

drop policy if exists "messages_select_visible" on public.messages;
create policy "messages_select_visible" on public.messages for select to authenticated using (
  not is_private
  or recipient_id = auth.uid ()
  or sender_id = auth.uid ()
);

drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own" on public.messages for insert to authenticated with check (sender_id = auth.uid ());

drop policy if exists "messages_update_visible" on public.messages;
create policy "messages_update_visible" on public.messages for update to authenticated using (
  (is_private and recipient_id = auth.uid ())
  or (not is_private)
  or sender_id = auth.uid ()
)
with check (true);

-- Staðsetning fundar (valfrjálst)
alter table public.meetings add column if not exists location text;
