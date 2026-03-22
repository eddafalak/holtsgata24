-- Holtsgata 24, STF1008784 — HMS: https://hms.is/fasteignaskra/100369/1008784
-- Keyrt eftir supabase db reset (staðbundin þróun).

insert into public.apartments (id, name, property_number, size)
values
  ('a0000000-0000-4000-8000-000000000001', 'Holtsgata 24 — íbúð 0201', 'F2001089', 58.6),
  ('a0000000-0000-4000-8000-000000000002', 'Holtsgata 24 — íbúð 0202', 'F2001090', 101.4),
  ('a0000000-0000-4000-8000-000000000003', 'Holtsgata 24 — íbúð 0301', 'F2001091', 58.6),
  ('a0000000-0000-4000-8000-000000000004', 'Holtsgata 24 — íbúð 0302', 'F2001092', 100.3),
  ('a0000000-0000-4000-8000-000000000005', 'Holtsgata 24 — íbúð 0401', 'F2001093', 76),
  ('a0000000-0000-4000-8000-000000000006', 'Holtsgata 24 — íbúð 0402', 'F2001094', 133.7)
on conflict (id) do nothing;
