import type { OrderStatus } from "./types";

/** Statuses an admin may move an order to from its current status. */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["cancelled"],
  paid: ["processing", "cancelled", "refunded"],
  processing: ["packed", "cancelled", "refunded"],
  packed: ["shipped", "cancelled", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: ["refunded"],
  refunded: [],
  failed: [],
};

/** Orders that have been paid for (counted as revenue / spend). */
export const PAID_STATUSES: OrderStatus[] = ["paid", "processing", "packed", "shipped", "delivered"];

/** Paid orders still waiting to leave the studio. */
export const TO_FULFIL_STATUSES: OrderStatus[] = ["paid", "processing", "packed"];

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}
