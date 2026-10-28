const blocked = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "shorturl.at",
  "is.gd",
  "cutt.ly",
  "rebrand.ly",
  "rb.gy",
  "ow.ly",
  "buff.ly",
  "goo.gl",
]);
export function isSafeExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (!url.port || url.port === "443") &&
      host.includes(".") &&
      /^[a-z0-9.-]+$/.test(host) &&
      !/^[\d.]+$/.test(host) &&
      ![
        "localhost",
        "local",
        "internal",
        "test",
        "invalid",
        "example",
        "lan",
        "home",
        "onion",
      ].some((x) => host === x || host.endsWith("." + x)) &&
      ![...blocked].some((x) => host === x || host.endsWith("." + x))
    );
  } catch {
    return false;
  }
}
export function canonicalUrl(value: string) {
  const url = new URL(value);
  url.hash = "";
  for (const key of [...url.searchParams.keys()])
    if (key.startsWith("utm_")) url.searchParams.delete(key);
  url.searchParams.sort();
  return url.toString();
}
