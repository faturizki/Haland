create table if not exists public.user_security (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  failed_login_attempts integer not null default 0 check (failed_login_attempts >= 0),
  lockout_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.ensure_user_security_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_security(profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;
  return new;
end;
$$;

create or replace function public.authenticate_profile(username_input text, pin_input text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_record public.profiles%rowtype;
  security_record public.user_security%rowtype;
begin
  select * into profile_record
  from public.profiles p
  where lower(p.username) = lower(username_input)
    and p.deleted_at is null;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'invalid_credentials');
  end if;

  select * into security_record
  from public.user_security us
  where us.profile_id = profile_record.id;

  if security_record.lockout_until is not null and security_record.lockout_until > now() then
    return jsonb_build_object('ok', false, 'reason', 'account_locked', 'locked_until', security_record.lockout_until);
  end if;

  if profile_record.status <> 'active' then
    return jsonb_build_object('ok', false, 'reason', 'inactive_account');
  end if;

  if profile_record.pin_hash = crypt(pin_input, profile_record.pin_hash) then
    update public.user_security
    set failed_login_attempts = 0,
        lockout_until = null,
        last_login_at = now(),
        updated_at = now()
    where profile_id = profile_record.id;

    return jsonb_build_object('ok', true, 'profile', to_jsonb(profile_record));
  end if;

  update public.user_security
  set failed_login_attempts = coalesce(failed_login_attempts, 0) + 1,
      lockout_until = case
        when coalesce(failed_login_attempts, 0) + 1 >= 5 then now() + interval '15 minutes'
        else null
      end,
      updated_at = now()
  where profile_id = profile_record.id;

  return jsonb_build_object('ok', false, 'reason', 'invalid_credentials');
end;
$$;

create or replace function public.create_profile_account(username_input text, display_name_input text, role_input public.user_role, status_input public.account_status, pin_input text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into public.profiles(username, pin_hash, role, status, display_name)
  values (
    username_input,
    crypt(pin_input, gen_salt('bf')),
    role_input,
    status_input,
    display_name_input
  )
  returning id into new_id;

  return new_id;
end;
$$;

create or replace function public.set_profile_pin(profile_id uuid, new_pin text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
  set pin_hash = crypt(new_pin, gen_salt('bf')),
      updated_at = now()
  where id = profile_id;
$$;

create or replace function public.set_profile_status(profile_id uuid, new_status public.account_status)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
  set status = new_status,
      updated_at = now()
  where id = profile_id;
$$;

create trigger if not exists trg_user_security_on_profile_insert
after insert on public.profiles
for each row
execute function public.ensure_user_security_row();

create trigger if not exists trg_user_security_updated_at
before update on public.user_security
for each row
execute function public.set_updated_at();

alter table public.user_security enable row level security;
create policy if not exists user_security_select on public.user_security
for select using (public.has_role(auth.uid(), 'owner'));
create policy if not exists user_security_update on public.user_security
for update using (public.has_role(auth.uid(), 'owner'));
create policy if not exists audit_logs_insert on public.audit_logs
for insert with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'staff'));
