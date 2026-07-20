import { Outlet } from "react-router";
import { Nav } from "./Nav.tsx";
import { Footer } from "./Footer.tsx";
import { AiQuotaToast } from "./AiQuotaToast.tsx";

export function Layout() {
  return (
    <div className="flex min-h-full flex-col">
      <Nav />
      <main className="flex-1 bg-white dark:bg-slate-950">
        <Outlet />
      </main>
      <Footer />
      <AiQuotaToast />
    </div>
  );
}
