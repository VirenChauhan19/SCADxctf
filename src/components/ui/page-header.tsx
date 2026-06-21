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
    <div className="mb-6 border-b border-paper-200 pb-4 sm:flex sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase leading-none tracking-[0.02em] text-ink sm:text-[2rem]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-0">
          {children}
        </div>
      )}
    </div>
  );
}
