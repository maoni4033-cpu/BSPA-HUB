create table if not exists org_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table org_store enable row level security;

create policy "Allow public read" on org_store
  for select
  using (true);

create policy "Allow public write" on org_store
  for insert
  with check (true);

create policy "Allow public update" on org_store
  for update
  using (true);
