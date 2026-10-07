-- Sacred Basil: commerce helpers (checkout, payments, accounts).
-- All functions here are for the server (service role) only.

-- ---------------------------------------------------------------------------
-- mark_order_paid: the single, atomic transition pending|failed -> paid.
-- Used by both the checkout verify endpoint and the Razorpay webhook, so it
-- must be idempotent: only the first caller flips the status (newly_paid =
-- true), decrements stock and counts the coupon use.
-- ---------------------------------------------------------------------------
create or replace function public.mark_order_paid(
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_note text default null
)
returns table (order_id uuid, order_number text, newly_paid boolean)
language plpgsql
set search_path = public
as $$
#variable_conflict use_column
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders o
  where o.razorpay_order_id = p_razorpay_order_id
  for update;

  if not found then
    return;
  end if;

  if v_order.status not in ('pending', 'failed') then
    -- Already paid (or moved further along by the studio): nothing to do.
    return query select v_order.id, v_order.order_number, false;
    return;
  end if;

  update public.orders
  set status = 'paid',
      paid_at = now(),
      razorpay_payment_id = p_razorpay_payment_id
  where id = v_order.id;

  insert into public.order_events (order_id, status, note)
  values (v_order.id, 'paid', coalesce(p_note, 'Payment received') || ' (' || p_razorpay_payment_id || ')');

  -- Decrement tracked stock, never below zero. Made-to-order (null) is untouched.
  update public.products p
  set stock = greatest(p.stock - i.qty, 0)
  from (
    select oi.product_id, sum(oi.quantity)::integer as qty
    from public.order_items oi
    where oi.order_id = v_order.id
    group by oi.product_id
  ) i
  where p.id = i.product_id and p.stock is not null;

  if v_order.coupon_code is not null then
    update public.coupons set used_count = used_count + 1 where code = v_order.coupon_code;
  end if;

  return query select v_order.id, v_order.order_number, true;
end;
$$;

-- ---------------------------------------------------------------------------
-- mark_order_failed: a failed payment attempt. Only touches pending orders
-- (a later successful attempt on the same Razorpay order still wins).
-- ---------------------------------------------------------------------------
create or replace function public.mark_order_failed(p_razorpay_order_id text, p_note text default null)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  v_id uuid;
begin
  update public.orders set status = 'failed'
  where razorpay_order_id = p_razorpay_order_id and status = 'pending'
  returning id into v_id;

  if v_id is null then
    return false;
  end if;

  insert into public.order_events (order_id, status, note)
  values (v_id, 'failed', coalesce(p_note, 'Payment failed'));
  return true;
end;
$$;

-- ---------------------------------------------------------------------------
-- link_guest_orders: attach guest orders to an account, only when the
-- account's email is confirmed and matches the order email exactly
-- (case-insensitive). The email is read from auth.users, never from input.
-- ---------------------------------------------------------------------------
create or replace function public.link_guest_orders(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_count integer;
begin
  select u.email into v_email
  from auth.users u
  where u.id = p_user_id and u.email_confirmed_at is not null;

  if v_email is null then
    return 0;
  end if;

  update public.orders set user_id = p_user_id
  where user_id is null and lower(email) = lower(v_email);
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Server only: never callable through the public API by visitors.
revoke all on function public.mark_order_paid(text, text, text) from public, anon, authenticated;
revoke all on function public.mark_order_failed(text, text) from public, anon, authenticated;
revoke all on function public.link_guest_orders(uuid) from public, anon, authenticated;
grant execute on function public.mark_order_paid(text, text, text) to service_role;
grant execute on function public.mark_order_failed(text, text) to service_role;
grant execute on function public.link_guest_orders(uuid) to service_role;
