import type { Metadata } from "next";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader back={{ href: "/admin/products", label: "Products" }} eyebrow="Catalogue" title="New product" />
      <ProductForm mode="create" productId={randomUUID()} />
    </>
  );
}
