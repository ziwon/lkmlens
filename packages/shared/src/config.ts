export const SITE_NAME = "Kernel Lens";
export const SITE_TAGLINE = "A clearer view into Linux kernel development.";
export const DEFAULT_SITE_URL = "https://kernel-lens.pages.dev";
export const LEGACY_SITE_URL = "https://lkmlens.pages.dev";

export function getSiteUrl(env?: { PUBLIC_SITE_URL?: string }): string {
  return env?.PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
}
