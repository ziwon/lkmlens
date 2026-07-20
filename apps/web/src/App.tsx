import { Route, Routes } from "react-router";
import { Layout } from "./components/Layout.tsx";
import Home from "./pages/Home.tsx";
import Search from "./pages/Search.tsx";
import Thread from "./pages/Thread.tsx";
import About from "./pages/About.tsx";
import Methodology from "./pages/Methodology.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";
import Support from "./pages/Support.tsx";
import NotFound from "./pages/NotFound.tsx";
import Digests from "./pages/Digests.tsx";
import Digest from "./pages/Digest.tsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="threads/:id" element={<Thread />} />
        <Route path="digests" element={<Digests />} />
        <Route path="digests/:period/:key" element={<Digest />} />
        <Route path="about" element={<About />} />
        <Route path="about/methodology" element={<Methodology />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="support" element={<Support />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
