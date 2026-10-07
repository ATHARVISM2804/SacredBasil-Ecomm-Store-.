-- Sacred Basil: admin panel support
-- Internal order notes. order_events is readable by the order's customer, so
-- notes written by staff are flagged internal and hidden from customers.

alter table public.order_events
  add column if not exists internal boolean not null default false;

drop policy if exists "order_events: read via order" on public.order_events;
create policy "order_events: read via order" on public.order_events
  for select using (
    public.is_admin()
    or (
      not internal
      and exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
    )
  );

create index if not exists order_events_order_idx on public.order_events (order_id, created_at);
