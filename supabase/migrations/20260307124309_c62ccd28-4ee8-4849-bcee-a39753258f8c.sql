
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  unique(profile_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

create policy "Users can manage own push subscriptions"
  on public.push_subscriptions for all
  to authenticated
  using (profile_id in (select id from profiles where user_id = auth.uid()))
  with check (profile_id in (select id from profiles where user_id = auth.uid()));
