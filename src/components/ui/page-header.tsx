export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 border-b border-ink/10 pb-5 sm:flex sm:items-end sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="h-4 w-1 rounded-full bg-brand-400" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
            Team hub
          </p>
        </div>
        <h1 className="mt-2.5 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-0 sm:shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
