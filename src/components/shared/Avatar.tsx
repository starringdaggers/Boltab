const AVATAR_COLORS = ["#2C5364", "#4C7A5E", "#B08B3A", "#7C97A0", "#1D3A46"];

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initialsForName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
  name,
  size = 32,
}: {
  name: string;
  size?: number;
}) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-antique font-medium shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: colorForName(name),
        fontSize: size * 0.38,
      }}
      aria-hidden="true"
    >
      {initialsForName(name)}
    </div>
  );
}
