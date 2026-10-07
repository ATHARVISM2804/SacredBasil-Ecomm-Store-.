import { Logo } from "@/components/ui/Logo";

const firstAdminSql = `update public.profiles
set role = 'admin'
where email = 'you@example.com';`;

/** Shown on /admin until the Supabase environment variables are present. */
export function SetupScreen() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
      <Logo variant="monogram" className="h-12 w-auto text-chocolate" />
      <p className="eyebrow mt-8 text-gold">Admin setup</p>
      <h1 className="mt-2 font-display text-5xl font-light leading-tight text-chocolate">Connect Supabase</h1>
      <p className="mt-4 max-w-xl text-cocoa/75">
        The admin panel manages orders, products, enquiries and settings stored in Supabase. Until the project keys are
        set, the storefront runs from the built-in catalogue and this panel stays locked.
      </p>

      <ol className="mt-10 space-y-8">
        <Step n={1} title="Add the environment variables">
          <p>
            Copy <Code>.env.example</Code> to <Code>.env.local</Code> and fill in the values from Supabase{" "}
            <em>Project Settings → API</em>:
          </p>
          <Pre>{`NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon / publishable key>
SUPABASE_SERVICE_ROLE_KEY=<service role key, server only>`}</Pre>
          <p>Restart the dev server (or redeploy) after saving.</p>
        </Step>
        <Step n={2} title="Create the database">
          <p>
            Run the migrations in <Code>supabase/migrations/</Code> in order, then <Code>supabase/seed.sql</Code> — either with
            the Supabase CLI (<Code>supabase db push</Code>, then run the seed) or by pasting each file into the SQL editor.
          </p>
        </Step>
        <Step n={3} title="Create your user">
          <p>
            In Supabase <em>Authentication → Users</em>, choose <em>Add user</em> and create an account with your email and a
            password (tick <em>Auto confirm</em>). A profile row is created automatically.
          </p>
        </Step>
        <Step n={4} title="Make it an admin">
          <p>In the SQL editor, run (with your email):</p>
          <Pre>{firstAdminSql}</Pre>
        </Step>
        <Step n={5} title="Allow the sign-in link redirect">
          <p>
            For magic-link sign in, add <Code>{"<your site URL>/admin/auth/callback"}</Code> under{" "}
            <em>Authentication → URL Configuration → Redirect URLs</em>.
          </p>
        </Step>
      </ol>
      <p className="mt-12 text-sm text-cocoa/60">Then reload this page and sign in.</p>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[2.5rem_1fr] gap-4">
      <span className="flex size-9 items-center justify-center rounded-full border border-gold/60 font-display text-lg text-gold">
        {n}
      </span>
      <div className="space-y-3 text-sm leading-relaxed text-cocoa/80">
        <h2 className="font-display text-2xl text-chocolate">{title}</h2>
        {children}
      </div>
    </li>
  );
}

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded-[2px] bg-cream px-1.5 py-0.5 font-mono text-[0.8rem] text-chocolate">{children}</code>
);

const Pre = ({ children }: { children: React.ReactNode }) => (
  <pre className="overflow-x-auto rounded-[2px] bg-chocolate-deep p-4 font-mono text-[0.8rem] leading-relaxed text-champagne">
    {children}
  </pre>
);
