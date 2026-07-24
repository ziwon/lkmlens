import { Outlet } from "react-router";
import { Nav } from "./Nav.tsx";
import { Footer } from "./Footer.tsx";
import { AiQuotaToast } from "./AiQuotaToast.tsx";

export function Layout() {
  return (
    <div className="flex min-h-full flex-col bg-canvas">
      <a
        href="#main"
        className="focus-ring sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:border focus:border-border-strong focus:bg-surface focus:px-3 focus:py-2 focus:text-small focus:text-ink"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AiQuotaToast />
    </div>
  );
}
