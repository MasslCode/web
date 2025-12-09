import { Routes, Route } from "react-router-dom";
import TierlistPage from "./pages/TierlistPage.tsx";
import Home from "./pages/Home.tsx";
import MenuBar from "./components/MenuBar.tsx";
import ScrollToTop from "./pages/ScrollToTop.tsx";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <MenuBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tierlist" element={<TierlistPage />} />
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </>
  );
}