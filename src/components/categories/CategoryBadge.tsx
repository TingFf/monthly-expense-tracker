export default function CategoryBadge({
  name,
  color,
  icon,
}: {
  name: string;
  color: string;
  icon: string | null;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {icon && <span>{icon}</span>}
      {name}
    </span>
  );
}
