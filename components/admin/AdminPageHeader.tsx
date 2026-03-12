type AdminPageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function AdminPageHeader({ title, subtitle }: AdminPageHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>
      )}
    </div>
  );
}
