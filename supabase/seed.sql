-- Seed data for Haland Petcare
-- This file is intended for Supabase SQL execution via CLI or Dashboard.

insert into public.profiles (id, username, pin_hash, role, status, display_name)
values (
  '00000000-0000-0000-0000-000000000001',
  'owner',
  crypt('123456', gen_salt('bf')),
  'owner',
  'active',
  'Owner Admin'
)
on conflict (id) do nothing;

insert into public.user_roles (profile_id, role)
values (
  '00000000-0000-0000-0000-000000000001',
  'owner'
)
on conflict do nothing;

insert into public.clinic_settings (
  clinic_name,
  address,
  operating_hours,
  timezone,
  active_payment_methods,
  created_by
)
values (
  'Haland Petcare',
  'Jakarta, Indonesia',
  '{"monday": ["08:00", "20:00"], "tuesday": ["08:00", "20:00"], "wednesday": ["08:00", "20:00"], "thursday": ["08:00", "20:00"], "friday": ["08:00", "20:00"], "saturday": ["09:00", "17:00"], "sunday": ["closed"]}'::jsonb,
  'Asia/Jakarta',
  array['cash', 'card'],
  '00000000-0000-0000-0000-000000000001'
)
on conflict do nothing;

insert into public.services (name, description, price, created_by)
values
  ('General Examination', 'Routine veterinary consultation', 150000, '00000000-0000-0000-0000-000000000001'),
  ('Vaccination', 'Core vaccination procedure', 250000, '00000000-0000-0000-0000-000000000001'),
  ('Grooming', 'Standard grooming service', 180000, '00000000-0000-0000-0000-000000000001')
on conflict do nothing;

insert into public.products (name, sku, category, stock, unit_price, low_stock_threshold, created_by)
values
  ('Amoxicillin 250mg', 'AMX-250', 'Medication', 20, 35000, 5, '00000000-0000-0000-0000-000000000001'),
  ('Vitamin Supplement', 'VIT-001', 'Supplement', 15, 12000, 5, '00000000-0000-0000-0000-000000000001'),
  ('Shampoo', 'SHM-001', 'Grooming', 12, 8000, 5, '00000000-0000-0000-0000-000000000001')
on conflict (sku) do nothing;
