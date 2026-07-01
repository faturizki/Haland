insert into public.products (name, sku, category, stock, unit_price, low_stock_threshold, created_by)
values
  ('Amoxicillin 250mg', 'AMX-250', 'Medication', 20, 35000, 5, '00000000-0000-0000-0000-000000000001'::uuid),
  ('Vitamin Supplement', 'VIT-001', 'Supplement', 15, 12000, 5, '00000000-0000-0000-0000-000000000001'::uuid),
  ('Shampoo', 'SHM-001', 'Grooming', 12, 8000, 5, '00000000-0000-0000-0000-000000000001'::uuid);
