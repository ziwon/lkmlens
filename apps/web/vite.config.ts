import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
  },
  server: {
    // Pages Functions (apps/web/functions) are served by `wrangler pages dev`,
    // not by the Vite dev server. Run `pnpm build && wrangler pages dev dist`
    // to exercise the /api/* routes locally.
    port: 5173,
  },
});
