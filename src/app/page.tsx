const BOOKING_URL = "https://cal.com/arttep/cluska8-demo";

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="text-lg font-bold tracking-tight">cluska8</span>
        <a
          href={BOOKING_URL}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]"
        >
          Book a demo
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-[var(--accent)]/6 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-3xl px-6 text-center">
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Your AI agent gives up
          <br />
          <span className="text-[var(--accent)]">too easily</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)] sm:text-xl">
          It searches a knowledge base, says &ldquo;I don&rsquo;t know,&rdquo;
          and dumps your customer into a queue where nobody answers.
          <br className="hidden sm:block" />
          Ours pulls up their actual account, figures out the problem, and
          fixes&nbsp;it.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href={BOOKING_URL}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-3.5 text-base font-semibold text-white transition hover:bg-[var(--accent-hover)] hover:shadow-lg hover:shadow-[var(--accent)]/20"
          >
            See it work on your tickets
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

function BeforeAfter() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Same ticket. Different outcome.
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {/* TODAY */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
            <div className="mb-6 inline-block rounded-full bg-[var(--danger)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--danger)]">
              Today
            </div>
            <div className="space-y-4 font-mono text-sm leading-relaxed text-[var(--muted)]">
              <Step
                who="Customer"
                text="Hi, I was charged twice for $49 this month."
              />
              <Step
                who="Bot"
                text={`"Let me connect you to an agent who can help with billing."`}
                dim
              />
              <div className="flex items-center gap-2 py-2 text-xs text-[var(--muted)]/60">
                <span className="inline-block h-px w-8 bg-[var(--border)]" />
                3 hours of silence
                <span className="inline-block h-px w-8 bg-[var(--border)]" />
              </div>
              <Step who="Customer" text="Hello? Anyone there?" />
              <div className="flex items-center gap-2 py-2 text-xs text-[var(--danger)]">
                <span className="inline-block h-px w-8 bg-[var(--danger)]/30" />
                Customer leaves
                <span className="inline-block h-px w-8 bg-[var(--danger)]/30" />
              </div>
            </div>
          </div>

          {/* WITH CLUSKA8 */}
          <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--surface)] p-6 sm:p-8 ring-1 ring-[var(--accent)]/10">
            <div className="mb-6 inline-block rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
              With Cluska8
            </div>
            <div className="space-y-4 font-mono text-sm leading-relaxed text-[var(--muted)]">
              <Step
                who="Customer"
                text="Hi, I was charged twice for $49 this month."
              />
              <Step
                who="AI"
                text="Pulling up your Stripe charges now..."
                accent
              />
              <Step
                who="AI"
                text="Found it — $49 on March 3 (billing cycle) and $49 on March 7 (no billing event). That second charge is a duplicate."
                accent
              />
              <Step
                who="AI"
                text="Refund of $49 submitted. You'll see it in 3-5 business days."
                accent
              />
              <div className="flex items-center gap-2 py-2 text-xs text-[var(--success)]">
                <span className="inline-block h-px w-8 bg-[var(--success)]/30" />
                Resolved in 2 minutes
                <span className="inline-block h-px w-8 bg-[var(--success)]/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({
  who,
  text,
  dim,
  accent,
}: {
  who: string;
  text: string;
  dim?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={
        dim
          ? "opacity-50"
          : accent
            ? "text-[var(--foreground)]"
            : ""
      }
    >
      <span
        className={`mr-2 text-xs font-semibold uppercase tracking-wider ${accent ? "text-[var(--accent)]" : "text-[var(--muted)]/70"}`}
      >
        {who}
      </span>
      <p className="mt-1">{text}</p>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Connect your tools",
      desc: "Stripe, Zendesk, Shopify — plugs in with API keys. Five minutes.",
    },
    {
      num: "02",
      title: "Set your rules",
      desc: "Define what the AI can do alone, what needs one-tap approval, and what's off-limits.",
    },
    {
      num: "03",
      title: "AI handles tickets",
      desc: "Reads real customer data, reasons about what went wrong, and takes action.",
    },
    {
      num: "04",
      title: "You stay in control",
      desc: "Full audit trail, reasoning traces, one-tap approvals, and a kill switch.",
    },
  ];

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          How it works
        </h2>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.num} className="group">
              <div className="mb-4 text-3xl font-bold text-[var(--accent)]/30 transition group-hover:text-[var(--accent)]">
                {s.num}
              </div>
              <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BuiltFor() {
  const tools = [
    "Zendesk",
    "Intercom",
    "Freshdesk",
    "Stripe",
    "Shopify",
    "Salesforce",
    "HubSpot",
    "Any REST API",
  ];

  return (
    <section className="py-20 sm:py-28 border-t border-[var(--border)]">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Built for your stack
        </h2>
        <p className="mt-4 text-[var(--muted)]">
          Works with your helpdesk. Connects to your tools.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {tools.map((t) => (
            <span
              key={t}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium transition hover:border-[var(--accent)]/40 hover:bg-[var(--surface-hover)]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Trust() {
  const items = [
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      title: "Every action logged",
      desc: "Complete audit trail. Know exactly what the AI did and why.",
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      title: "Full reasoning trace",
      desc: "See the AI's thought process step by step. No black boxes.",
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
      ),
      title: "You set the boundaries",
      desc: "Auto-approve, require human approval, or block entirely. Per action.",
    },
  ];

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Trust, not blind faith
        </h2>
        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                {item.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-lg font-semibold sm:text-xl">
          Currently onboarding pilot partners
        </p>
        <p className="mt-3 text-[var(--muted)]">
          We work with you to set up, tune, and ship. No self-serve yet&nbsp;&mdash;
          on purpose.
        </p>
        <a
          href={BOOKING_URL}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-3.5 text-base font-semibold text-white transition hover:bg-[var(--accent-hover)] hover:shadow-lg hover:shadow-[var(--accent)]/20"
        >
          See it work on your tickets
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </a>
        <p className="mt-10 text-sm text-[var(--muted)]/60">
          support@cluska8.com
        </p>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="flex-1">
      <Nav />
      <Hero />
      <BeforeAfter />
      <HowItWorks />
      <BuiltFor />
      <Trust />
      <Footer />
    </main>
  );
}
