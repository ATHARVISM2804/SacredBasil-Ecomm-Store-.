export const orderStatusLabel: Record<string, string> = {
  pending: "Awaiting payment",
  paid: "Confirmed",
  processing: "Being handcrafted",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
  failed: "Payment failed",
};

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(
    new Date(iso),
  );
