import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] items-end bg-ivory pb-[var(--section-y)] pt-20">
      <div className="shell">
        <h1 className="display-section max-w-[14ch] text-chocolate">This page could not be found.</h1>
        <p className="lede mt-7 text-cocoa/72">It may have moved. The collections are a good place to begin again.</p>
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
          <ButtonLink href="/collections">Explore Collections</ButtonLink>
          <ButtonLink href="/" variant="text">
            Return home
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
