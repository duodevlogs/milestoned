/** Approximate — computed from the server's clock, not the visitor's local time. */
export function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0]?.split("+")[0] ?? email;
  const words = local
    .replace(/[._-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return email;
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
