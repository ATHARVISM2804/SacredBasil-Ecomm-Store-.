import type { Metadata } from "next";
import { CartView } from "./CartView";

export const metadata: Metadata = {
  title: "Your bag",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <section className="bg-ivory pb-24 pt-12 md:pb-32 md:pt-16">
      <div className="shell">
        <p className="eyebrow mb-6 text-cocoa/65">Your selection</p>
        <h1 className="display-section text-chocolate">Your bag</h1>
        <CartView />
      </div>
    </section>
  );
}
