-- Bills / Reikningar / Skjöl (Option A: one table with `kind`)
-- Stores PDFs in Supabase Storage under bucket `bills`.

-- Table
create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('reikningur', 'skjal')),
  name text not null,
  category text not null default 'annad' check (category in ('vatn', 'hiti', 'rafmagn', 'vidhald', 'annad')),
  amount numeric,
  date date not null,
  due_date date,
  status text not null default 'greitt' check (status in ('vinnsla', 'greitt')),
  file_url text,
  description text,
  uploaded_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists bills_date_idx on public.bills(date);
create index if not exists bills_kind_idx on public.bills(kind);

-- RLS
alter table public.bills enable row level security;

drop policy if exists "bills_select_all" on public.bills;
create policy "bills_select_all"
on public.bills for select
to authenticated
using (auth.uid() is not null);

drop policy if exists "bills_insert_own" on public.bills;
create policy "bills_insert_own"
on public.bills for insert
to authenticated
with check (auth.uid() = uploaded_by);

drop policy if exists "bills_update_own" on public.bills;
create policy "bills_update_own"
on public.bills for update
to authenticated
using (auth.uid() = uploaded_by)
with check (auth.uid() = uploaded_by);

drop policy if exists "bills_delete_own" on public.bills;
create policy "bills_delete_own"
on public.bills for delete
to authenticated
using (auth.uid() = uploaded_by);

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('bills', 'bills', true)
on conflict (id) do nothing;

-- NOTE: We intentionally don't create/modify `storage.objects` policies here.
-- Some Supabase dashboard connections can't run ALTER/CREATE POLICY on storage.objects
-- because they aren't the table owner.
-- If uploads fail later, we'll add a single INSERT policy for bucket_id = 'bills'
-- using an owner/privileged connection.

