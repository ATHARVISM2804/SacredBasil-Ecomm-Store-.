export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="bg-ivory pb-[var(--section-y)] pt-44 md:pt-52">
      <div className="shell">
        <h1 className="display-section text-chocolate">{title}</h1>
        {updated && <p className="eyebrow mt-6 text-cocoa/55">Last updated {updated}</p>}
        <div className="mt-14 max-w-2xl space-y-6 border-t border-[var(--line)] pt-12 text-cocoa/80 [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:font-light [&_h2]:text-cocoa">
          {children}
        </div>
      </div>
    </article>
  );
}
