// Secrets are intentionally absent from wrangler.jsonc. This declaration only
// augments the generated Env with the secret installed by `wrangler secret put`.
interface Env {
  GEMINI_API_KEY: string;
}
