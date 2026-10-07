"use client";

import { useState } from "react";
import type { SavedAddress } from "@/app/checkout/CheckoutForm";
import { deleteAddress, makeDefaultAddress } from "../actions";
import { AddressForm } from "./AddressForm";

export function AddressBook({ addresses }: { addresses: SavedAddress[] }) {
  const [editing, setEditing] = useState<string | null>(addresses.length ? null : "new");
  const [round, setRound] = useState(0);
  const done = () => {
    setEditing(null);
    setRound((r) => r + 1);
  };

  return (
    <div className="space-y-12">
      {addresses.length > 0 && (
        <ul className="grid gap-6 md:grid-cols-2">
          {addresses.map((a) =>
            editing === a.id ? (
              <li key={a.id} className="border border-[var(--line)] p-6 md:col-span-2">
                <AddressForm key={`${a.id}-${round}`} address={a} onDone={done} />
              </li>
            ) : (
              <li key={a.id} className="flex flex-col border border-[var(--line)] p-6">
                <p className="eyebrow text-cocoa/65">
                  {a.label || "Address"}
                  {a.is_default && <span className="ml-2 text-gold">· Default</span>}
                </p>
                <p className="mt-3 text-cocoa/85">
                  {a.full_name}
                  <br />
                  {a.line1}
                  {a.line2 && (
                    <>
                      <br />
                      {a.line2}
                    </>
                  )}
                  <br />
                  {a.city}, {a.state} {a.pincode}
                  <br />
                  {a.phone}
                </p>
                <div className="mt-auto flex flex-wrap gap-5 pt-5">
                  <button type="button" onClick={() => setEditing(a.id)} className="eyebrow text-chocolate hover:underline">
                    Edit
                  </button>
                  {!a.is_default && (
                    <form action={makeDefaultAddress}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="eyebrow text-cocoa/65 hover:text-chocolate">
                        Make default
                      </button>
                    </form>
                  )}
                  <form
                    action={deleteAddress}
                    onSubmit={(e) => {
                      if (!window.confirm("Remove this address?")) e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" className="eyebrow text-cocoa/65 hover:text-terracotta">
                      Remove
                    </button>
                  </form>
                </div>
              </li>
            ),
          )}
        </ul>
      )}

      {editing === "new" ? (
        <div className="max-w-2xl border border-[var(--line)] p-6 md:p-8">
          <h2 className="display-sub mb-8 text-chocolate">New address</h2>
          <AddressForm key={`new-${round}`} onDone={done} />
        </div>
      ) : (
        <button type="button" onClick={() => setEditing("new")} className="btn btn-primary">
          Add an address
        </button>
      )}
    </div>
  );
}
