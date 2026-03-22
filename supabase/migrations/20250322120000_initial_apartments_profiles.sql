-- Húsfélag: íbúðir og notendaprófíl (samræmt src/types og useResidents / useAuth)

-- Íbúðir
create table public.apartments (
  id uuid primary key default gen_random_uuid (),
  name text not null,
  property_number text not null,
  size numeric not null,
  created_at timestamptz not null default now()
);

comment on table public.apartments is 'Íbúðareignir í húsfélagi';

-- Prófíll tengdur auth.users
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role text check (
    role in (
      'formadur',
      'gjaldkeri',
      'ritari',
      'eigandi'
    )
  ),
  apartment_id uuid references public.apartments (id) on delete set null,
  avatar_url text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Notendaprófíl (eitt lína á notanda)';

-- Nýskráning: búa til tómt prófíl
create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users for each row
execute function public.handle_new_user ();

-- RLS
alter table public.apartments enable row level security;

alter table public.profiles enable row level security;

-- Lesa: opið fyrir þróun (stramta með innskráningu síðar)
create policy "apartments_select_all"
on public.apartments for select
using (true);

create policy "profiles_select_all"
on public.profiles for select
using (true);

-- Uppfæra: aðeins eigin lína
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid () = id)
with check (auth.uid () = id);
