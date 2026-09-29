-- 澳門民法研習室 0.3 — run once in your project's SQL Editor.
-- This schema is for Supabase PostgreSQL, NOT Cloudflare D1.
begin;
create table public.civil_members (
 email text primary key check (email = lower(email)),
 created_at timestamptz not null default now()
);
alter table public.civil_members enable row level security;
revoke all on public.civil_members from anon, authenticated;
grant select on public.civil_members to authenticated;
create policy civil_member_self on public.civil_members for select to authenticated
 using (email = lower(auth.jwt()->>'email'));

create table public.civil_learning_state (
 user_id uuid primary key references auth.users(id) on delete cascade,
 revision bigint not null default 1 check(revision>0),
 state jsonb not null check(jsonb_typeof(state)='object' and octet_length(state::text)<2000000),
 updated_at timestamptz not null default now()
);
alter table public.civil_learning_state enable row level security;
revoke all on public.civil_learning_state from anon, authenticated;
grant select, insert, update on public.civil_learning_state to authenticated;
create policy civil_state_read on public.civil_learning_state for select to authenticated
 using (user_id=(select auth.uid()) and exists (select 1 from public.civil_members where email=lower(auth.jwt()->>'email')));
create policy civil_state_insert on public.civil_learning_state for insert to authenticated
 with check (user_id=(select auth.uid()) and exists (select 1 from public.civil_members where email=lower(auth.jwt()->>'email')));
create policy civil_state_update on public.civil_learning_state for update to authenticated
 using (user_id=(select auth.uid()) and exists (select 1 from public.civil_members where email=lower(auth.jwt()->>'email')))
 with check (user_id=(select auth.uid()) and exists (select 1 from public.civil_members where email=lower(auth.jwt()->>'email')));

-- Atomic optimistic concurrency: returns zero rows if another device changed the revision.
create function public.civil_save_state(expected_revision bigint, new_state jsonb)
returns table(revision bigint, updated_at timestamptz)
language plpgsql security invoker set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if expected_revision < 0 or jsonb_typeof(new_state)<>'object'
    or (new_state->>'version') is distinct from '1'
    or octet_length(new_state::text)>=2000000 then
  raise exception 'Invalid state';
 end if;
 if expected_revision=0 then
  return query insert into public.civil_learning_state as s(user_id,revision,state)
   values(auth.uid(),1,new_state) on conflict(user_id) do nothing
   returning s.revision,s.updated_at;
 else
  return query update public.civil_learning_state as s
   set state=new_state,revision=s.revision+1,updated_at=now()
   where s.user_id=auth.uid() and s.revision=expected_revision
   returning s.revision,s.updated_at;
 end if;
end; $$;
revoke all on function public.civil_save_state(bigint,jsonb) from public, anon;
grant execute on function public.civil_save_state(bigint,jsonb) to authenticated;
commit;

-- Add invitees separately using the SQL Editor (not a browser key).
-- insert into public.civil_members(email) values(lower('YOUR_GOOGLE_EMAIL')) on conflict do nothing;
-- Remove access: delete from public.civil_members where email=lower('EMAIL_TO_REMOVE');
