-- Global page-view counter for oculink.github.io
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).

-- 1. Single-row counter table.
create table if not exists public.page_views (
  id     int primary key default 1,
  count  bigint not null default 0,
  constraint page_views_single_row check (id = 1)
);

insert into public.page_views (id, count)
values (1, 0)
on conflict (id) do nothing;

-- Lock the table down: anonymous visitors must not read/write rows directly.
alter table public.page_views enable row level security;

-- 2. Atomic increment-and-return. SECURITY DEFINER runs as the table owner, so it
--    can update the row even with RLS enabled and no policies. The anon key is only
--    granted EXECUTE on this function, never table access.
create or replace function public.record_page_view()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count bigint;
begin
  update public.page_views
     set count = count + 1
   where id = 1
  returning count into new_count;
  return new_count;
end;
$$;

-- Callers with the anon / logged-in keys may run the function, nothing else.
revoke all on function public.record_page_view() from public;
grant execute on function public.record_page_view() to anon, authenticated;
