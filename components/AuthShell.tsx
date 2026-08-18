export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Brand panel — dark navy */}
      <div className="relative hidden overflow-hidden bg-navy-950 md:flex md:flex-col md:justify-between md:p-10 lg:p-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(var(--navy-ink) 1px, transparent 1px), linear-gradient(90deg, var(--navy-ink) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }}
        />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
            D
          </div>
          <span className="text-sm font-semibold tracking-wide text-white">DCworker CRM</span>
        </div>

        <div className="relative max-w-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-navy-ink-dim">
            {eyebrow}
          </p>
          <h1 className="font-[family-name:var(--font-head)] text-3xl font-semibold leading-tight text-white lg:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-navy-ink-dim">{subtitle}</p>
        </div>

        <p className="relative text-xs text-navy-ink-dim">
          Contacts and pipeline, in one place.
        </p>
      </div>

      {/* Form panel — white */}
      <div className="flex items-center justify-center bg-surface p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
              D
            </div>
            <span className="text-sm font-semibold tracking-wide text-ink-900">DCworker CRM</span>
          </div>
          {children}
          <div className="mt-6 text-center text-sm text-ink-500">{footer}</div>
        </div>
      </div>
    </div>
  );
}
