import Link from "next/link";
import { formatINR } from "@/lib/catalog/pricing";
import { formatDateTime } from "@/lib/admin/format";
import type { OrderRow } from "@/lib/admin/types";
import { StatusBadge } from "./ui";
import { tdCls, thCls } from "./styles";

export type OrderListRow = Pick<OrderRow, "id" | "order_number" | "customer_name" | "email" | "total" | "status" | "created_at">;

export const ORDER_LIST_COLUMNS = "id, order_number, customer_name, email, total, status, created_at";

export function OrdersTable({ orders }: { orders: OrderListRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-[var(--line)]">
          <tr>
            <th scope="col" className={thCls}>Order</th>
            <th scope="col" className={thCls}>Customer</th>
            <th scope="col" className={thCls}>Placed</th>
            <th scope="col" className={thCls}>Status</th>
            <th scope="col" className={`${thCls} text-right`}>Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-cream/50">
              <td className={tdCls}>
                <Link href={`/admin/orders/${o.id}`} className="font-medium text-chocolate underline-offset-4 hover:underline">
                  {o.order_number}
                </Link>
              </td>
              <td className={tdCls}>
                <div>{o.customer_name}</div>
                <div className="text-xs text-cocoa/55">{o.email}</div>
              </td>
              <td className={`${tdCls} whitespace-nowrap text-cocoa/70`}>{formatDateTime(o.created_at)}</td>
              <td className={tdCls}>
                <StatusBadge status={o.status} />
              </td>
              <td className={`${tdCls} text-right tabular-nums`}>{formatINR(o.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
