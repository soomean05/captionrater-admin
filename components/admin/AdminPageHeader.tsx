type AdminPageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function AdminPageHeader({ title, subtitle }: AdminPageHeaderProps) {
  return (
    <div className="admin-card p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
        Admin Panel
      </div>
      <h1 className="mt-1 text-2xl font-semibold text-zinc-900">{title}</h1>
      {subtitle && (
        <p className="mt-1 max-w-3xl text-sm text-zinc-600">{subtitle}</p>
      )}
    </div>
  );
}
