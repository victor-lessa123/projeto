import { afterEach, describe, expect, it, vi } from "vitest";
import { supabaseConfig, supabaseUrl } from "@/lib/db/config";
const url = "https://configuration-test.supabase.co";
afterEach(() => vi.unstubAllEnvs());
describe("Supabase integration configuration", () => {
  it("connects with the publishable configuration used by the original app", () => {
    expect(
      supabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: url,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-test-key",
      }),
    ).toEqual({ url, key: "public-test-key" });
  });
  it("recognizes the legacy public anon key supplied by integrations", () => {
    expect(
      supabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: url,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-test-key",
      }),
    ).toEqual({ url, key: "anon-test-key" });
  });
  it("supports the non-public aliases for server-side integrations and CSP", () => {
    const env = { SUPABASE_URL: url, SUPABASE_ANON_KEY: "anon-test-key" };
    expect(supabaseConfig(env)).toEqual({ url, key: "anon-test-key" });
    expect(supabaseUrl(env)).toBe(url);
    expect(
      supabaseConfig({
        SUPABASE_URL: url,
        SUPABASE_PUBLISHABLE_KEY: "publishable-test-key",
      }),
    ).toEqual({ url, key: "publishable-test-key" });
  });
  it("prefers explicitly configured public values when aliases differ", () => {
    expect(
      supabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: url,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "preferred-key",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "old-key",
        SUPABASE_URL: "https://unused.supabase.co",
        SUPABASE_ANON_KEY: "other-key",
      }),
    ).toEqual({ url, key: "preferred-key" });
  });
  it("ignores blank aliases and trims accidental surrounding spaces", () => {
    expect(
      supabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: ` ${url} `,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "  ",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: " anon-test-key ",
      }),
    ).toEqual({ url, key: "anon-test-key" });
  });
  it("remains unconfigured when either API URL or public key is missing", () => {
    expect(supabaseConfig({ NEXT_PUBLIC_SUPABASE_URL: url })).toBeNull();
    expect(supabaseConfig({ SUPABASE_ANON_KEY: "anon-test-key" })).toBeNull();
    expect(supabaseConfig({})).toBeNull();
  });
  it("never substitutes a service-role key or SQL connection string", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
    for (const name of [
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_PUBLISHABLE_KEY",
      "SUPABASE_ANON_KEY",
      "SUPABASE_URL",
    ])
      vi.stubEnv(name, "");
    vi.stubEnv(
      "SUPABASE_SERVICE_ROLE_KEY",
      "private-test-key-not-a-real-credential",
    );
    vi.stubEnv("POSTGRES_URL", "postgresql://test.invalid/example");
    expect(supabaseConfig()).toBeNull();
  });
});
