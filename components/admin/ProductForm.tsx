"use client";

import { useId, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash, Upload } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { saveProduct } from "@/lib/admin/actions/products";
import { slugify, validateTiers, type TierDraft } from "@/lib/admin/product-form";
import { objectNameFor, PRODUCT_BUCKET } from "@/lib/admin/storage";
import { idleState, type ProductRow } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { CheckboxField, FormMessage, SelectField, SubmitButton, TextAreaField, TextField, useFormSubmit } from "./form";
import { btnGhost, cardCls, inputCls, labelCls } from "./styles";

type ContentRow = { key: string; name: string; quantity: string; size: string; note: string };
type VariantRow = { key: string; id: string; name: string };
type TierRow = TierDraft & { key: string };

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
let keySeq = 0;
const newKey = () => `r${++keySeq}`;

export function ProductForm({
  mode,
  productId,
  product,
}: {
  mode: "create" | "edit";
  productId: string;
  product?: ProductRow;
}) {
  const [state, onSubmit, pending] = useFormSubmit(saveProduct.bind(null, mode), idleState);
  const err = state.errors ?? {};

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const [contents, setContents] = useState<ContentRow[]>(() =>
    (product?.contents ?? []).map((c) => ({
      key: newKey(),
      name: c.name,
      quantity: String(c.quantity),
      size: c.size ?? "",
      note: c.note ?? "",
    })),
  );
  const [variants, setVariants] = useState<VariantRow[]>(() =>
    (product?.variants ?? []).map((v) => ({ key: newKey(), id: v.id, name: v.name })),
  );
  const [tiers, setTiers] = useState<TierRow[]>(() =>
    (product?.tiers?.length ? [...product.tiers].sort((a, b) => a.min - b.min) : [{ min: 1, max: null, unitPrice: 0 }]).map(
      (t) => ({ key: newKey(), min: String(t.min), max: t.max === null ? "" : String(t.max), unitPrice: t.unitPrice ? String(t.unitPrice) : "" }),
    ),
  );
  const [images, setImages] = useState<string[]>(product?.images ?? []);

  const tierCheck = validateTiers(tiers);
  const tierError = "error" in tierCheck ? tierCheck.error : null;

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-24" noValidate>
      <input type="hidden" name="id" value={productId} />
      <input type="hidden" name="contents" value={JSON.stringify(contents)} />
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />
      <input type="hidden" name="tiers" value={JSON.stringify(tiers.map(({ min, max, unitPrice }) => ({ min, max, unitPrice })))} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <Section title="Basics">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Name"
            name="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            error={err.name}
          />
          <TextField
            label="Slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            error={err.slug}
            hint={`Store URL: /collections/${slug || "…"}${mode === "edit" ? " · changing it breaks existing links" : ""}`}
          />
          <TextField label="Tagline" name="tagline" defaultValue={product?.tagline ?? ""} className="sm:col-span-2" />
          <TextAreaField
            label="Short description"
            name="short_description"
            rows={2}
            defaultValue={product?.short_description ?? ""}
            className="sm:col-span-2"
            hint="One line, shown on product cards."
          />
          <TextAreaField
            label="Description"
            name="description"
            rows={5}
            defaultValue={product?.description ?? ""}
            className="sm:col-span-2"
          />
        </div>
      </Section>

      <Section title="Images" error={err.images}>
        <ImageManager productId={productId} images={images} onChange={setImages} />
      </Section>

      <Section title="Pricing" error={err.tiers ?? (tiers.some((t) => t.unitPrice) ? tierError : null)}>
        <p className="mb-4 text-sm text-cocoa/65">
          Price per kit by quantity, in whole rupees. Tiers run in order without gaps; leave the last maximum blank for
          “and above”.
        </p>
        <RowsTable
          headers={["Min qty", "Max qty", "Unit price (₹)"]}
          rows={tiers}
          onChange={setTiers}
          addLabel="Add tier"
          makeRow={() => {
            const last = tiers[tiers.length - 1];
            const nextMin = last?.max ? String(Number(last.max) + 1) : "";
            return { key: newKey(), min: nextMin, max: "", unitPrice: "" };
          }}
          render={(row, update) => (
            <>
              <CellInput label="Minimum quantity" inputMode="numeric" value={row.min} onChange={(v) => update({ min: v })} />
              <CellInput
                label="Maximum quantity"
                inputMode="numeric"
                value={row.max}
                placeholder="and above"
                onChange={(v) => update({ max: v })}
              />
              <CellInput label="Unit price in rupees" inputMode="numeric" value={row.unitPrice} onChange={(v) => update({ unitPrice: v })} />
            </>
          )}
        />
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField
            label="Bespoke from (qty)"
            name="bespoke_from"
            inputMode="numeric"
            defaultValue={product?.bespoke_from ?? ""}
            error={err.bespoke_from}
            hint="Orders of this many or more are quoted directly. Blank for none."
          />
        </div>
      </Section>

      <Section title="Contents" error={err.contents}>
        <RowsTable
          headers={["Item", "Qty", "Size", "Note"]}
          rows={contents}
          onChange={setContents}
          addLabel="Add item"
          makeRow={() => ({ key: newKey(), name: "", quantity: "1", size: "", note: "" })}
          render={(row, update) => (
            <>
              <CellInput label="Item name" value={row.name} onChange={(v) => update({ name: v })} />
              <CellInput label="Quantity" inputMode="numeric" value={row.quantity} onChange={(v) => update({ quantity: v })} className="sm:w-20" />
              <CellInput label="Size" value={row.size} placeholder="e.g. 75 g approx" onChange={(v) => update({ size: v })} />
              <CellInput label="Note" value={row.note} onChange={(v) => update({ note: v })} />
            </>
          )}
        />
      </Section>

      <Section title="Variants" error={err.variants}>
        <p className="mb-4 text-sm text-cocoa/65">Optional choices such as box or pouch. Leave empty if there are none.</p>
        <RowsTable
          headers={["Name", "ID"]}
          rows={variants}
          onChange={setVariants}
          addLabel="Add variant"
          makeRow={() => ({ key: newKey(), id: "", name: "" })}
          render={(row, update) => (
            <>
              <CellInput label="Variant name" value={row.name} onChange={(v) => update({ name: v })} />
              <CellInput
                label="Variant id"
                value={row.id}
                placeholder={slugify(row.name) || "auto"}
                onChange={(v) => update({ id: v })}
              />
            </>
          )}
        />
      </Section>

      <Section title="Details">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextAreaField label="Packaging" name="packaging" rows={2} defaultValue={product?.packaging ?? ""} />
          <TextAreaField label="Customisation" name="customisation" rows={2} defaultValue={product?.customisation ?? ""} />
          <TextField label="Dimensions" name="dimensions" defaultValue={product?.dimensions ?? ""} placeholder="e.g. 6 × 4 × 2 inch" />
        </div>
      </Section>

      <Section title="Availability">
        <div className="grid gap-5 sm:grid-cols-3">
          <SelectField
            label="Status"
            name="status"
            defaultValue={product?.status ?? "draft"}
            error={err.status}
            options={[
              { value: "draft", label: "Draft (hidden)" },
              { value: "active", label: "Active (on the store)" },
            ]}
          />
          <TextField
            label="Stock"
            name="stock"
            inputMode="numeric"
            defaultValue={product?.stock ?? ""}
            error={err.stock}
            hint="Blank = made to order."
          />
          <TextField
            label="Sort order"
            name="sort_order"
            inputMode="numeric"
            defaultValue={product?.sort_order ?? 0}
            error={err.sort_order}
            hint="Lower numbers show first."
          />
          <CheckboxField label="Featured" name="featured" defaultChecked={product?.featured ?? false} hint="Shown in featured spots on the home page." />
        </div>
      </Section>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-4 border-t border-[var(--line)] bg-ivory/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
        <SubmitButton pending={pending}>{mode === "create" ? "Create product" : "Save changes"}</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

function Section({ title, error, children }: { title: string; error?: string | null; children: React.ReactNode }) {
  return (
    <fieldset className={cn(cardCls, "p-5 sm:p-6")}>
      <legend className="sr-only">{title}</legend>
      <h2 aria-hidden className="mb-4 font-display text-2xl text-chocolate">
        {title}
      </h2>
      {children}
      {error && (
        <p role="alert" className="mt-3 text-sm text-terracotta">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function CellInput({
  label,
  value,
  onChange,
  className,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <input
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputCls, "py-1.5", className)}
      {...rest}
    />
  );
}

/** Editable list of rows with add, remove and reorder. */
function RowsTable<T extends { key: string }>({
  headers,
  rows,
  onChange,
  makeRow,
  render,
  addLabel,
}: {
  headers: string[];
  rows: T[];
  onChange: (rows: T[]) => void;
  makeRow: () => T;
  render: (row: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  addLabel: string;
}) {
  const move = (i: number, d: -1 | 1) => {
    const next = [...rows];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const cols = `repeat(${headers.length}, minmax(0, 1fr)) auto`;
  return (
    <div>
      {rows.length > 0 && (
        <div className="hidden gap-2 pb-1 sm:grid" style={{ gridTemplateColumns: cols }} aria-hidden>
          {headers.map((h) => (
            <span key={h} className={labelCls}>
              {h}
            </span>
          ))}
          <span />
        </div>
      )}
      <ul className="space-y-2">
        {rows.map((row, i) => (
          <li
            key={row.key}
            className="grid grid-cols-1 gap-2 rounded-[2px] border border-[var(--line)] p-2 sm:border-0 sm:p-0 sm:[grid-template-columns:var(--cols)]"
            style={{ "--cols": cols } as React.CSSProperties}
          >
            {render(row, (patch) => onChange(rows.map((r) => (r.key === row.key ? { ...r, ...patch } : r))))}
            <div className="flex items-center gap-1">
              <IconButton label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp className="size-3.5" />
              </IconButton>
              <IconButton label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown className="size-3.5" />
              </IconButton>
              <IconButton label="Remove row" onClick={() => onChange(rows.filter((r) => r.key !== row.key))}>
                <Trash className="size-3.5" />
              </IconButton>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => onChange([...rows, makeRow()])} className={cn(btnGhost, "mt-3")}>
        <Plus className="size-3.5" aria-hidden /> {addLabel}
      </button>
    </div>
  );
}

function IconButton({
  label,
  children,
  ...rest
}: { label: string; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="inline-flex size-8 items-center justify-center rounded-[2px] text-cocoa/70 hover:bg-cream hover:text-cocoa disabled:opacity-30 disabled:hover:bg-transparent"
      {...rest}
    >
      <span aria-hidden>{children}</span>
    </button>
  );
}

function ImageManager({
  productId,
  images,
  onChange,
}: {
  productId: string;
  images: string[];
  onChange: (next: string[] | ((prev: string[]) => string[])) => void;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const fileRef = useRef<HTMLInputElement>(null);
  const pathId = useId();
  const [uploading, setUploading] = useState(0);
  const [message, setMessage] = useState("");
  const [path, setPath] = useState("");

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setMessage("");
    const list = Array.from(files);
    setUploading(list.length);
    const problems: string[] = [];
    for (const file of list) {
      if (!file.type.startsWith("image/")) {
        problems.push(`${file.name}: not an image`);
      } else if (file.size > MAX_IMAGE_BYTES) {
        problems.push(`${file.name}: larger than 5 MB`);
      } else {
        const objectPath = `products/${productId}/${objectNameFor(file)}`;
        const { error } = await supabase.storage
          .from(PRODUCT_BUCKET)
          .upload(objectPath, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
        if (error) problems.push(`${file.name}: ${error.message}`);
        else onChange((prev) => [...prev, supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(objectPath).data.publicUrl]);
      }
      setUploading((n) => n - 1);
    }
    if (fileRef.current) fileRef.current.value = "";
    setMessage(problems.length ? `Some files were not uploaded — ${problems.join("; ")}` : "Uploaded. Save to publish the change.");
  }

  const move = (i: number, d: -1 | 1) => {
    const next = [...images];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <div>
      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((src, i) => (
            <li key={src} className="overflow-hidden rounded-[2px] border border-[var(--line)] bg-white">
              <div className="relative aspect-square bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Product image ${i + 1}`} className="size-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded-[2px] bg-chocolate px-1.5 py-0.5 text-[0.6rem] uppercase tracking-[0.14em] text-ivory">
                    Primary
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 px-1.5 py-1">
                <IconButton label={`Move image ${i + 1} earlier`} disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp className="size-3.5 -rotate-90" />
                </IconButton>
                <IconButton label={`Move image ${i + 1} later`} disabled={i === images.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDown className="size-3.5 -rotate-90" />
                </IconButton>
                <IconButton label={`Remove image ${i + 1}`} onClick={() => onChange(images.filter((x) => x !== src))}>
                  <Trash className="size-3.5" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-cocoa/60">No images yet. The first image is the primary one.</p>
      )}

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="sr-only"
            id={`${pathId}-file`}
            onChange={(e) => upload(e.target.files)}
          />
          <label htmlFor={`${pathId}-file`} className={cn(btnGhost, "cursor-pointer", uploading > 0 && "pointer-events-none opacity-60")}>
            <Upload className="size-3.5" aria-hidden /> {uploading > 0 ? `Uploading ${uploading}…` : "Upload images"}
          </label>
        </div>
        <div className="flex flex-1 items-end gap-2">
          <div className="flex-1">
            <label htmlFor={`${pathId}-path`} className={labelCls}>
              Or add an existing site image
            </label>
            <input
              id={`${pathId}-path`}
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/images/products/tranquil-box-open-4-products.webp"
              className={inputCls}
            />
          </div>
          <button
            type="button"
            className={btnGhost}
            onClick={() => {
              const p = path.trim();
              if (!p.startsWith("/") && !p.startsWith("https://")) {
                setMessage("Paths must start with / or https://");
                return;
              }
              if (!images.includes(p)) onChange([...images, p]);
              setPath("");
              setMessage("");
            }}
          >
            Add
          </button>
        </div>
      </div>
      <p aria-live="polite" className="mt-3 text-sm text-cocoa/70">
        {message}
      </p>
    </div>
  );
}
