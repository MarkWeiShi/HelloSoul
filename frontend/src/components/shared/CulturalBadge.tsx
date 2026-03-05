interface CulturalBadgeProps {
  flag: string;
  location: string;
  color: string;
}

export function CulturalBadge({ flag, location, color }: CulturalBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {flag} {location}
    </span>
  );
}
