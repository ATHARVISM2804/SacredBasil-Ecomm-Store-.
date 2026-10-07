import Link from "next/link";
import { site } from "@/data/site";

export function AccountUnavailable() {
  return (
    <div className="max-w-xl">
      <p className="lede text-cocoa/72">
        Customer accounts are being set up. You can still order as a guest, and for anything about an existing order write
        to{" "}
        <a href={`mailto:${site.contact.email}`} className="underline underline-offset-4">
          {site.contact.email}
        </a>
        .
      </p>
      <Link href="/collections" className="btn btn-primary mt-10">
        Explore the collections
      </Link>
    </div>
  );
}
