import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import type { ProductRow } from "@/lib/admin/types";
import { formatINR } from "@/lib/catalog/pricing";
import { Card, EmptyState, ErrorNotice, PageHeader, StatusBadge } from "@/components/admin/ui";
import { btnSm, tdCls, thCls } from "@/components/admin/styles";

export const metadata: Metadata = { title: "Products" };

type ListRow = Pick<ProductRow, "id" | "slug" | "name" | "images" | "status" | "stock" | "tiers" | "featured" | "sort_order">;

function priceRange(tiers: ProductRow["tiers"]) {
  if (!tiers?.length) return "—";
  const prices = tiers.map((t) => t.unitPrice);
  const lo = Math.min(...prices);
  const hi = Math.max(...prices);
  return lo === hi ? formatINR(lo) : `${formatINR(lo)} – ${formatINR(hi)}`;
}

export default async function ProductsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, images, status, stock, tiers, featured, sort_order")
    .order("sort_order")
    .order("name");
  const products = (data ?? []) as ListRow[];

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        actions={
          <Link href="/admin/products/new" className={`${btnSm} btn-primary`}>
            <Plus className="size-3.5" aria-hidden /> New product
          </Link>
        }
      />
      {error && <ErrorNotice message={`Could not load products: ${error.message}`} />}
      <Card flush>
        {products.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-[var(--line)]">
                <tr>
                  <th scope="col" className={thCls}><span className="sr-only">Image</span></th>
                  <th scope="col" className={thCls}>Name</th>
                  <th scope="col" className={thCls}>Status</th>
                  <th scope="col" className={`${thCls} text-right`}>Stock</th>
                  <th scope="col" className={`${thCls} text-right`}>Price</th>
                  <th scope="col" className={thCls}>Featured</th>
                  <th scope="col" className={`${thCls} text-right`}>Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-cream/50">
                    <td className={`${tdCls} w-16`}>
                      {p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" className="size-12 rounded-[2px] object-cover" />
                      ) : (
                        <div className="size-12 rounded-[2px] bg-cream" />
                      )}
                    </td>
                    <td className={tdCls}>
                      <Link href={`/admin/products/${p.id}`} className="font-medium text-chocolate hover:underline">
                        {p.name}
                      </Link>
                      <div className="text-xs text-cocoa/55">/{p.slug}</div>
                    </td>
                    <td className={tdCls}><StatusBadge status={p.status} /></td>
                    <td className={`${tdCls} text-right tabular-nums`}>
                      {p.stock === null ? <span className="text-cocoa/55">Made to order</span> : p.stock}
                    </td>
                    <td className={`${tdCls} whitespace-nowrap text-right tabular-nums`}>{priceRange(p.tiers)}</td>
                    <td className={tdCls}>{p.featured ? "Yes" : "—"}</td>
                    <td className={`${tdCls} text-right tabular-nums text-cocoa/60`}>{p.sort_order}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No products yet">Run the seed or create your first product.</EmptyState>
        )}
      </Card>
    </>
  );
}
