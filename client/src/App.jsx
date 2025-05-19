import { Routes, Route } from "react-router-dom";
import TierlistPage from "./pages/TierlistPage";
import Home from "./pages/Home";
import MenuBar from "./components/MenuBar";
import ScrollToTop from "./pages/ScrollToTop";

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