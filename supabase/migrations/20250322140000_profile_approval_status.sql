-- Stjórnandi samþykkir nýskráningar áður en fullur aðgangur er veittur.

alter table public.profiles
  add column if not exists approval_status text not null default 'approved'
  check (approval_status in ('pending', 'approved', 'rejected'));

comment on column public.profiles.approval_status is 'pending = biður eftir stjórnanda, approved = fullur aðgangur, rejected = hafnað';

-- Eldri raðir fá samþykki strax (eitt skipti við fyrstu keyrslu eftir þessa breytingu)
update public.profiles
set approval_status = 'approved'
where approval_status is distinct from 'approved';

alter table public.profiles alter column approval_status set default 'pending';

create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, approval_status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    'pending'
  );
  return new;
end;
$$;
