export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function houseTypeLabel(type: string) {
  switch (type) {
    case "HOME":
      return "My home";
    case "PROJECT":
      return "Project";
    case "DREAM":
      return "Dream / inspo";
    default:
      return type;
  }
}

export function houseTypeBadgeClass(type: string) {
  switch (type) {
    case "HOME":
      return "bg-emerald-100 text-emerald-800";
    case "PROJECT":
      return "bg-amber-100 text-amber-900";
    case "DREAM":
      return "bg-violet-100 text-violet-800";
    default:
      return "bg-stone-100 text-stone-700";
  }
}

export function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function formatRelativeTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
