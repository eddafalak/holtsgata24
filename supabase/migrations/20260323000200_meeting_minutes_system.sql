-- Meetings + meeting minutes system

-- Ensure a meetings table exists for FK support.
create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Fundur',
  description text,
  meeting_date timestamptz not null default now(),
  meeting_type text,
  pdf_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.meetings enable row level security;

drop policy if exists "meetings_select_all" on public.meetings;
create policy "meetings_select_all"
on public.meetings for select
to authenticated
using (auth.uid() is not null);

drop policy if exists "meetings_insert_admin" on public.meetings;
create policy "meetings_insert_admin"
on public.meetings for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('formadur', 'ritari', 'gjaldkeri')
  )
);

drop policy if exists "meetings_update_admin" on public.meetings;
create policy "meetings_update_admin"
on public.meetings for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('formadur', 'ritari', 'gjaldkeri')
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('formadur', 'ritari', 'gjaldkeri')
  )
);

create table if not exists public.meeting_minutes (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,

  attendees jsonb not null default '[]'::jsonb,
  agenda_items jsonb not null default '[]'::jsonb,

  other_notes text,
  next_meeting_date timestamptz,

  secretary_id uuid references public.profiles(id) on delete set null,
  chair_id uuid references public.profiles(id) on delete set null,

  is_finalized boolean not null default false,
  is_draft boolean not null default true,

  pdf_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finalized_at timestamptz,

  created_by uuid references public.profiles(id) on delete set null
);

create unique index if not exists meeting_minutes_meeting_id_uq
on public.meeting_minutes(meeting_id);

alter table public.meeting_minutes enable row level security;

drop policy if exists "meeting_minutes_select_finalized_members" on public.meeting_minutes;
create policy "meeting_minutes_select_finalized_members"
on public.meeting_minutes for select
to authenticated
using (is_finalized = true or created_by = auth.uid());

drop policy if exists "meeting_minutes_manage_admins" on public.meeting_minutes;
create policy "meeting_minutes_manage_admins"
on public.meeting_minutes for all
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('formadur', 'ritari', 'gjaldkeri')
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('formadur', 'ritari', 'gjaldkeri')
  )
);

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_meeting_minutes_updated_at on public.meeting_minutes;
create trigger update_meeting_minutes_updated_at
before update on public.meeting_minutes
for each row execute function public.update_updated_at_column();

-- Storage bucket for generated minutes PDFs
insert into storage.buckets (id, name, public)
values ('meeting-minutes', 'meeting-minutes', true)
on conflict (id) do nothing;

-- NOTE: As with other buckets, storage.objects policies may need to be created
-- from an owner/privileged SQL connection in Supabase dashboard.
