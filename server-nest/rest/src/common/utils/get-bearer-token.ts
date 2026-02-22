export function getBearerToken(header?: string): string | null {
  if (!header) return null;

  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  return match[1].trim();
}
