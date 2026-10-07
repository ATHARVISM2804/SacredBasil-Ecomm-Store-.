import { site } from "@/data/site";
import { cn } from "@/lib/utils";

type Network = (typeof site.social)[number]["network"];

const paths: Record<Network, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M4.5 19.5l1.1-3.9A8.2 8.2 0 1 1 8.6 18.5z" />
      <path d="M9.2 8.6c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .4-.1.6l-.5.6c.6 1.1 1.4 1.9 2.5 2.5l.6-.5c.2-.1.4-.2.6-.1l1.5.6c.3.1.4.3.4.5v.5c0 .3 0 .6-.5.8-.6.3-1.6.4-3-.3a8.6 8.6 0 0 1-3.5-3.5c-.7-1.4-.6-2.4-.4-3z" />
    </>
  ),
  email: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </>
  ),
  facebook: <path d="M14 8.5h2.5V5H14a3.5 3.5 0 0 0-3.5 3.5V11H8v3.5h2.5V21H14v-6.5h2.5l.5-3.5h-3V9a.5.5 0 0 1 .5-.5z" />,
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7.5 10.5V17M7.5 7.5v.01M11 17v-6.5M11 13.5c0-1.7 1-3 2.6-3s2.4 1.2 2.4 3V17" />
    </>
  ),
};

/** Footer social links, from data/site.ts. */
export function SocialLinks({ className }: { className?: string }) {
  if (!site.social.length) return null;
  return (
    <ul className={cn("flex items-center gap-3", className)}>
      {site.social.map((s) => (
        <li key={s.href}>
          <a
            href={s.href}
            aria-label={s.label}
            {...(s.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="grid size-11 place-items-center rounded-full border border-[var(--line-light)] text-champagne transition-colors duration-500 hover:border-champagne hover:bg-champagne hover:text-chocolate-deep"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-[1.15rem]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {paths[s.network]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
