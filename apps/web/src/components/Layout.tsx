import { Outlet } from "react-router";
import { Nav } from "./Nav.tsx";
import { Footer } from "./Footer.tsx";

export function Layout() {
  return (
    <div className="flex min-h-full flex-col">
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
