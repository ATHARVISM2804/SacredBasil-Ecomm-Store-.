import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { firstParam } from "@/lib/admin/format";
import type { ProductRow } from "@/lib/admin/types";
import { Notice, PageHeader, StatusBadge } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { btnGhost } from "@/components/admin/styles";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("products").select("*").eq("id", decodeURIComponent(id)).maybeSingle();
  if (!data) notFound();
  const product = data as ProductRow;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/products", label: "Products" }}
        eyebrow="Catalogue"
        title={product.name}
        actions={
          <>
            <StatusBadge status={product.status} />
            {product.status === "active" && (
              <Link href={`/collections/${product.slug}`} target="_blank" className={btnGhost}>
                View on store <ExternalLink className="size-3.5" aria-hidden />
              </Link>
            )}
          </>
        }
      />
      {firstParam(sp.created) && <Notice>Product created.</Notice>}
      <ProductForm mode="edit" productId={product.id} product={product} />
    </>
  );
}
