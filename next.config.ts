import { supabaseUrl } from "./lib/db/config";
import type { NextConfig } from "next";
const supabaseOrigin = (() => {
  try {
    return new URL(supabaseUrl() || "").origin;
  } catch {
    return "";
  }
})();
const config: NextConfig = {
  poweredByHeader: false,
  // Resolve metadata before streaming so missing listings return HTTP 404.
  htmlLimitedBots: /.*/,
  async headers() {
    const dev = process.env.NODE_ENV !== "production";
    return [
      {
        source: "/(.*)",
        headers: [
          ...(process.env.VERCEL_ENV === "preview"
            ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
            : []),
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' ${dev ? "'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' ${supabaseOrigin} ${dev ? "ws: wss:" : ""}; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`,
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          ...(dev
            ? []
            : [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains",
                },
              ]),
        ],
      },
    ];
  },
};
export default config;
