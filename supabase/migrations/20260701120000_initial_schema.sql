create extension if not exists pgcrypto;

create type public.user_role as enum ('owner', 'doctor', 'staff', 'customer');
create type public.account_status as enum ('active', 'inactive');
create type public.appointment_type as enum ('walk-in', 'scheduled');
create type public.appointment_status as enum ('scheduled', 'confirmed', 'checked-in', 'examined', 'completed');
create type public.invoice_status as enum ('unpaid', 'paid', 'voided');
create type public.payment_method as enum ('cash', 'card', 'transfer');
create type public.purchase_order_status as enum ('draft', 'submitted', 'received', 'cancelled');
create type public.grooming_status as enum ('scheduled', 'in_progress', 'completed', 'cancelled');
create type public.hotel_room_status as enum ('available', 'occupied', 'maintenance');
create type public.inpatient_status as enum ('active', 'discharged', 'cancelled');
create type public.audit_action as enum ('insert', 'update', 'delete', 'void', 'adjustment', 'role_change');

create table public.profiles (
  id uuid primary key,
  username text not null unique,
  pin_hash text not null,
  role public.user_role not null default 'staff',
  status public.account_status not null default 'active',
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  role public.user_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, role)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint customer_contact_check check (phone is not null and length(trim(phone)) > 0)
);

create table public.pets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  name text not null,
  species text not null,
  breed text not null,
  birth_date date,
  weight_kg numeric(8,2) not null check (weight_kg >= 0),
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  pet_id uuid not null references public.pets(id) on delete restrict,
  appointment_type public.appointment_type not null default 'scheduled',
  status public.appointment_status not null default 'scheduled',
  scheduled_at timestamptz not null,
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint appointment_status_transition_check check (status in ('scheduled', 'confirmed', 'checked-in', 'examined', 'completed'))
);

create table public.medical_records (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete restrict,
  pet_id uuid not null references public.pets(id) on delete restrict,
  complaint text not null,
  vitals jsonb,
  diagnosis text,
  treatment_plan text,
  status public.appointment_status not null default 'scheduled',
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text not null unique,
  category text not null,
  stock integer not null default 0 check (stock >= 0),
  unit_price numeric(10,2) not null default 0 check (unit_price >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  movement_type text not null,
  quantity integer not null check (quantity != 0),
  balance_after integer not null,
  reference_type text,
  reference_id uuid,
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text,
  phone text,
  email text,
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  status public.purchase_order_status not null default 'draft',
  total_amount numeric(10,2) not null default 0 check (total_amount >= 0),
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.po_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  medical_record_id uuid not null references public.medical_records(id) on delete restrict,
  total_amount numeric(10,2) not null default 0 check (total_amount >= 0),
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.prescription_items (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid not null references public.prescriptions(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  dosage text not null,
  instructions text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid unique references public.appointments(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  status public.invoice_status not null default 'unpaid',
  total_amount numeric(10,2) not null default 0 check (total_amount >= 0),
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  description text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  line_total numeric(10,2) not null check (line_total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  method public.payment_method not null,
  amount numeric(10,2) not null check (amount > 0),
  reference text,
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.grooming_bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  pet_id uuid not null references public.pets(id) on delete restrict,
  status public.grooming_status not null default 'scheduled',
  scheduled_at timestamptz not null,
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.hotel_rooms (
  id uuid primary key default gen_random_uuid(),
  room_number text not null unique,
  room_type text not null,
  daily_rate numeric(10,2) not null check (daily_rate >= 0),
  status public.hotel_room_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.hotel_reservations (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.hotel_rooms(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  pet_id uuid not null references public.pets(id) on delete restrict,
  check_in_date date not null,
  check_out_date date not null,
  total_amount numeric(10,2) not null default 0 check (total_amount >= 0),
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint hotel_date_check check (check_out_date >= check_in_date)
);

create table public.vaccinations (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete restrict,
  vaccine_type text not null,
  administered_at date not null,
  next_due_date date,
  reminder_sent boolean not null default false,
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inpatient_stays (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete restrict,
  admission_date date not null,
  discharge_date date,
  status public.inpatient_status not null default 'active',
  discharge_summary text,
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.inpatient_monitoring (
  id uuid primary key default gen_random_uuid(),
  inpatient_stay_id uuid not null references public.inpatient_stays(id) on delete restrict,
  monitored_on date not null,
  notes text not null,
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete restrict,
  action public.audit_action not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create table public.clinic_settings (
  id uuid primary key default gen_random_uuid(),
  clinic_name text not null,
  address text,
  operating_hours jsonb,
  timezone text not null default 'UTC',
  active_payment_methods text[] not null default array['cash'],
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_profiles_username on public.profiles (username);
create index idx_profiles_role on public.profiles (role);
create index idx_customers_phone on public.customers (phone);
create index idx_pets_customer_id on public.pets (customer_id);
create index idx_appointments_customer_id on public.appointments (customer_id);
create index idx_appointments_pet_id on public.appointments (pet_id);
create index idx_appointments_scheduled_at on public.appointments (scheduled_at);
create index idx_medical_records_pet_id on public.medical_records (pet_id);
create index idx_products_name on public.products (name);
create index idx_stock_movements_product_id on public.stock_movements (product_id);
create index idx_purchase_orders_supplier_id on public.purchase_orders (supplier_id);
create index idx_prescriptions_medical_record_id on public.prescriptions (medical_record_id);
create index idx_invoices_customer_id on public.invoices (customer_id);
create index idx_payments_invoice_id on public.payments (invoice_id);
create index idx_grooming_bookings_scheduled_at on public.grooming_bookings (scheduled_at);
create index idx_hotel_reservations_room_id on public.hotel_reservations (room_id);
create index idx_vaccinations_pet_id on public.vaccinations (pet_id);
create index idx_vaccinations_next_due_date on public.vaccinations (next_due_date);
create index idx_inpatient_stays_pet_id on public.inpatient_stays (pet_id);
create index idx_audit_logs_created_at on public.audit_logs (created_at);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.has_role(target_user_id uuid, required_role public.user_role)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = target_user_id
      and p.status = 'active'
      and (
        p.role = required_role
        or p.role = 'owner'
      )
  );
$$;

create or replace function public.next_vaccination_due_date(vaccine_type text, administered_at date)
returns date
language sql
as $$
  select case
    when lower(vaccine_type) like '%rabies%' then administered_at + interval '1 year'
    when lower(vaccine_type) like '%distemper%' then administered_at + interval '1 year'
    when lower(vaccine_type) like '%parvo%' then administered_at + interval '1 year'
    else administered_at + interval '6 months'
  end::date;
$$;

create or replace function public.calculate_invoice_total(invoice_id uuid)
returns numeric(10,2)
language sql
as $$
  select coalesce(sum(line_total), 0)
  from public.invoice_items
  where invoice_id = calculate_invoice_total.invoice_id;
$$;

create or replace function public.log_audit_event()
returns trigger as $$
begin
  insert into public.audit_logs(user_id, action, entity_type, entity_id, before_data, after_data)
  values (
    coalesce(current_setting('request.jwt.claim.user_id', true)::uuid, null),
    case tg_op
      when 'INSERT' then 'insert'::public.audit_action
      when 'UPDATE' then 'update'::public.audit_action
      when 'DELETE' then 'delete'::public.audit_action
    end,
    tg_table_name,
    coalesce(new.id, old.id),
    to_jsonb(old),
    to_jsonb(new)
  );
  return coalesce(new, old);
end;
$$ language plpgsql;

create or replace function public.create_invoice_from_prescription()
returns trigger as $$
declare
  appointment_uuid uuid;
  customer_uuid uuid;
  invoice_uuid uuid;
  prescription_total numeric(10,2);
begin
  select a.id, a.customer_id
  into appointment_uuid, customer_uuid
  from public.appointments a
  join public.medical_records mr on mr.appointment_id = a.id
  where mr.id = new.medical_record_id;

  if appointment_uuid is null then
    return new;
  end if;

  select coalesce(sum(pi.quantity * p.unit_price), 0)
  into prescription_total
  from public.prescription_items pi
  join public.products p on p.id = pi.product_id
  where pi.prescription_id = new.id;

  insert into public.invoices(appointment_id, customer_id, total_amount, created_by)
  values (appointment_uuid, customer_uuid, prescription_total, coalesce(current_setting('request.jwt.claim.user_id', true)::uuid, null))
  returning id into invoice_uuid;

  insert into public.invoice_items(invoice_id, description, quantity, unit_price, line_total)
  select invoice_uuid, p.name, pi.quantity, p.unit_price, pi.quantity * p.unit_price
  from public.prescription_items pi
  join public.products p on p.id = pi.product_id
  where pi.prescription_id = new.id;

  return new;
end;
$$ language plpgsql;

create or replace function public.decrement_stock_from_prescription()
returns trigger as $$
declare
  product_record record;
begin
  for product_record in
    select pi.product_id, pi.quantity
    from public.prescription_items pi
    where pi.prescription_id = new.prescription_id
  loop
    update public.products
    set stock = stock - product_record.quantity
    where id = product_record.product_id and stock - product_record.quantity >= 0;

    if not found then
      raise exception 'Inventory stock insufficient';
    end if;
  end loop;

  return new;
end;
$$ language plpgsql;

create or replace function public.update_vaccination_reminder()
returns trigger as $$
begin
  if new.next_due_date is null then
    new.next_due_date = public.next_vaccination_due_date(new.vaccine_type, new.administered_at);
  end if;
  return new;
end;
$$ language plpgsql;

create or replace function public.ensure_unique_room_booking()
returns trigger as $$
begin
  if exists (
    select 1
    from public.hotel_reservations hr
    where hr.room_id = new.room_id
      and hr.deleted_at is null
      and new.check_in_date <= hr.check_out_date
      and new.check_out_date >= hr.check_in_date
      and hr.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) then
    raise exception 'Room already reserved for the requested dates';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
drop trigger if exists trg_user_roles_updated_at on public.user_roles;
drop trigger if exists trg_customers_updated_at on public.customers;
drop trigger if exists trg_pets_updated_at on public.pets;
drop trigger if exists trg_appointments_updated_at on public.appointments;
drop trigger if exists trg_medical_records_updated_at on public.medical_records;
drop trigger if exists trg_products_updated_at on public.products;
drop trigger if exists trg_stock_movements_updated_at on public.stock_movements;
drop trigger if exists trg_suppliers_updated_at on public.suppliers;
drop trigger if exists trg_purchase_orders_updated_at on public.purchase_orders;
drop trigger if exists trg_po_items_updated_at on public.po_items;
drop trigger if exists trg_prescriptions_updated_at on public.prescriptions;
drop trigger if exists trg_prescription_items_updated_at on public.prescription_items;
drop trigger if exists trg_invoices_updated_at on public.invoices;
drop trigger if exists trg_invoice_items_updated_at on public.invoice_items;
drop trigger if exists trg_payments_updated_at on public.payments;
drop trigger if exists trg_grooming_bookings_updated_at on public.grooming_bookings;
drop trigger if exists trg_hotel_rooms_updated_at on public.hotel_rooms;
drop trigger if exists trg_hotel_reservations_updated_at on public.hotel_reservations;
drop trigger if exists trg_vaccinations_updated_at on public.vaccinations;
drop trigger if exists trg_inpatient_stays_updated_at on public.inpatient_stays;
drop trigger if exists trg_inpatient_monitoring_updated_at on public.inpatient_monitoring;
drop trigger if exists trg_clinic_settings_updated_at on public.clinic_settings;
drop trigger if exists trg_services_updated_at on public.services;
drop trigger if exists trg_prescription_items_stock on public.prescription_items;
drop trigger if exists trg_prescriptions_invoice on public.prescriptions;
drop trigger if exists trg_vaccinations_reminder on public.vaccinations;
drop trigger if exists trg_hotel_reservations_conflict on public.hotel_reservations;
drop trigger if exists trg_audit_logs on public.customers;
drop trigger if exists trg_audit_logs_medical on public.medical_records;
drop trigger if exists trg_audit_logs_inventory on public.products;
drop trigger if exists trg_audit_logs_invoices on public.invoices;
drop trigger if exists trg_audit_logs_profiles on public.profiles;

create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_user_roles_updated_at before update on public.user_roles for each row execute function public.set_updated_at();
create trigger trg_customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
create trigger trg_pets_updated_at before update on public.pets for each row execute function public.set_updated_at();
create trigger trg_appointments_updated_at before update on public.appointments for each row execute function public.set_updated_at();
create trigger trg_medical_records_updated_at before update on public.medical_records for each row execute function public.set_updated_at();
create trigger trg_products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger trg_stock_movements_updated_at before update on public.stock_movements for each row execute function public.set_updated_at();
create trigger trg_suppliers_updated_at before update on public.suppliers for each row execute function public.set_updated_at();
create trigger trg_purchase_orders_updated_at before update on public.purchase_orders for each row execute function public.set_updated_at();
create trigger trg_po_items_updated_at before update on public.po_items for each row execute function public.set_updated_at();
create trigger trg_prescriptions_updated_at before update on public.prescriptions for each row execute function public.set_updated_at();
create trigger trg_prescription_items_updated_at before update on public.prescription_items for each row execute function public.set_updated_at();
create trigger trg_invoices_updated_at before update on public.invoices for each row execute function public.set_updated_at();
create trigger trg_invoice_items_updated_at before update on public.invoice_items for each row execute function public.set_updated_at();
create trigger trg_payments_updated_at before update on public.payments for each row execute function public.set_updated_at();
create trigger trg_grooming_bookings_updated_at before update on public.grooming_bookings for each row execute function public.set_updated_at();
create trigger trg_hotel_rooms_updated_at before update on public.hotel_rooms for each row execute function public.set_updated_at();
create trigger trg_hotel_reservations_updated_at before update on public.hotel_reservations for each row execute function public.set_updated_at();
create trigger trg_vaccinations_updated_at before update on public.vaccinations for each row execute function public.set_updated_at();
create trigger trg_inpatient_stays_updated_at before update on public.inpatient_stays for each row execute function public.set_updated_at();
create trigger trg_inpatient_monitoring_updated_at before update on public.inpatient_monitoring for each row execute function public.set_updated_at();
create trigger trg_clinic_settings_updated_at before update on public.clinic_settings for each row execute function public.set_updated_at();
create trigger trg_services_updated_at before update on public.services for each row execute function public.set_updated_at();

create trigger trg_prescription_items_stock before insert or update on public.prescription_items for each row execute function public.decrement_stock_from_prescription();
create trigger trg_prescriptions_invoice after insert on public.prescriptions for each row execute function public.create_invoice_from_prescription();
create trigger trg_vaccinations_reminder before insert or update on public.vaccinations for each row execute function public.update_vaccination_reminder();
create trigger trg_hotel_reservations_conflict before insert or update on public.hotel_reservations for each row execute function public.ensure_unique_room_booking();
create trigger trg_audit_logs after insert or update or delete on public.customers for each row execute function public.log_audit_event();
create trigger trg_audit_logs_medical after insert or update or delete on public.medical_records for each row execute function public.log_audit_event();
create trigger trg_audit_logs_inventory after insert or update or delete on public.products for each row execute function public.log_audit_event();
create trigger trg_audit_logs_invoices after insert or update or delete on public.invoices for each row execute function public.log_audit_event();
create trigger trg_audit_logs_profiles after insert or update or delete on public.profiles for each row execute function public.log_audit_event();

create view public.v_daily_revenue as
select date(created_at) as revenue_date, coalesce(sum(total_amount), 0) as total_revenue
from public.invoices
where status = 'paid'
group by date(created_at);

create view public.v_low_stock_products as
select id, name, sku, stock, low_stock_threshold
from public.products
where stock <= low_stock_threshold;

create view public.v_active_inpatients as
select id, pet_id, admission_date, status
from public.inpatient_stays
where status = 'active';

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.customers enable row level security;
alter table public.pets enable row level security;
alter table public.appointments enable row level security;
alter table public.medical_records enable row level security;
alter table public.products enable row level security;
alter table public.stock_movements enable row level security;
alter table public.suppliers enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.po_items enable row level security;
alter table public.prescriptions enable row level security;
alter table public.prescription_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.grooming_bookings enable row level security;
alter table public.hotel_rooms enable row level security;
alter table public.hotel_reservations enable row level security;
alter table public.vaccinations enable row level security;
alter table public.inpatient_stays enable row level security;
alter table public.inpatient_monitoring enable row level security;
alter table public.audit_logs enable row level security;
alter table public.clinic_settings enable row level security;
alter table public.services enable row level security;

drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_update on public.profiles;
drop policy if exists roles_select on public.user_roles;
drop policy if exists customers_all on public.customers;
drop policy if exists pets_all on public.pets;
drop policy if exists appointments_all on public.appointments;
drop policy if exists medical_records_all on public.medical_records;
drop policy if exists products_all on public.products;
drop policy if exists stock_movements_all on public.stock_movements;
drop policy if exists suppliers_all on public.suppliers;
drop policy if exists purchase_orders_all on public.purchase_orders;
drop policy if exists po_items_all on public.po_items;
drop policy if exists prescriptions_all on public.prescriptions;
drop policy if exists prescription_items_all on public.prescription_items;
drop policy if exists invoices_all on public.invoices;
drop policy if exists invoice_items_all on public.invoice_items;
drop policy if exists payments_all on public.payments;
drop policy if exists grooming_all on public.grooming_bookings;
drop policy if exists hotel_rooms_all on public.hotel_rooms;
drop policy if exists hotel_reservations_all on public.hotel_reservations;
drop policy if exists vaccinations_all on public.vaccinations;
drop policy if exists inpatient_stays_all on public.inpatient_stays;
drop policy if exists inpatient_monitoring_all on public.inpatient_monitoring;
drop policy if exists audit_logs_select on public.audit_logs;
drop policy if exists clinic_settings_all on public.clinic_settings;
drop policy if exists services_all on public.services;

create policy profiles_select on public.profiles for select using (auth.uid() = id);
create policy profiles_update on public.profiles for update using (auth.uid() = id);
create policy roles_select on public.user_roles for select using (public.has_role(auth.uid(), 'owner'));
create policy customers_all on public.customers for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff') or public.has_role(auth.uid(), 'doctor')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff'));
create policy pets_all on public.pets for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff') or public.has_role(auth.uid(), 'doctor')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff'));
create policy appointments_all on public.appointments for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff') or public.has_role(auth.uid(), 'doctor')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff') or public.has_role(auth.uid(), 'doctor'));
create policy medical_records_all on public.medical_records for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'doctor')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'doctor'));
create policy products_all on public.products for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff'));
create policy stock_movements_all on public.stock_movements for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff'));
create policy suppliers_all on public.suppliers for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff'));
create policy purchase_orders_all on public.purchase_orders for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff'));
create policy po_items_all on public.po_items for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff'));
create policy prescriptions_all on public.prescriptions for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'doctor')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'doctor'));
create policy prescription_items_all on public.prescription_items for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'doctor')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'doctor'));
create policy invoices_all on public.invoices for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff'));
create policy invoice_items_all on public.invoice_items for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff'));
create policy payments_all on public.payments for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff'));
create policy grooming_all on public.grooming_bookings for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff'));
create policy hotel_rooms_all on public.hotel_rooms for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff') or public.has_role(auth.uid(), 'doctor')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff'));
create policy hotel_reservations_all on public.hotel_reservations for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff'));
create policy vaccinations_all on public.vaccinations for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'doctor')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'doctor'));
create policy inpatient_stays_all on public.inpatient_stays for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'doctor')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'doctor'));
create policy inpatient_monitoring_all on public.inpatient_monitoring for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'doctor')) with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'doctor'));
create policy audit_logs_select on public.audit_logs for select using (public.has_role(auth.uid(), 'owner'));
create policy clinic_settings_all on public.clinic_settings for all using (public.has_role(auth.uid(), 'owner')) with check (public.has_role(auth.uid(), 'owner'));
create policy services_all on public.services for all using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff') or public.has_role(auth.uid(), 'doctor')) with check (public.has_role(auth.uid(), 'owner'));

insert into public.profiles (id, username, pin_hash, role, status, display_name)
values ('00000000-0000-0000-0000-000000000001'::uuid, 'owner', crypt('123456', gen_salt('bf')), 'owner', 'active', 'Owner Admin');

insert into public.user_roles (profile_id, role)
values ('00000000-0000-0000-0000-000000000001'::uuid, 'owner');

insert into public.clinic_settings (clinic_name, address, operating_hours, timezone, active_payment_methods, created_by)
values ('Haland Petcare', 'Jakarta, Indonesia', '{"monday": ["08:00", "20:00"], "tuesday": ["08:00", "20:00"], "wednesday": ["08:00", "20:00"], "thursday": ["08:00", "20:00"], "friday": ["08:00", "20:00"], "saturday": ["09:00", "17:00"], "sunday": ["closed"]}'::jsonb, 'Asia/Jakarta', array['cash', 'card'], '00000000-0000-0000-0000-000000000001'::uuid);

insert into public.services (name, description, price, created_by)
values
  ('General Examination', 'Routine veterinary consultation', 150000, '00000000-0000-0000-0000-000000000001'::uuid),
  ('Vaccination', 'Core vaccination procedure', 250000, '00000000-0000-0000-0000-000000000001'::uuid),
  ('Grooming', 'Standard grooming service', 180000, '00000000-0000-0000-0000-000000000001'::uuid);
