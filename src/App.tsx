import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { BottomNav } from "./components/layout/BottomNav";
import { DashboardPage } from "./pages/DashboardPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { EventDetailPage } from "./pages/EventDetailPage";
import { PlayerPage } from "./pages/PlayerPage";
import { MembersPage } from "./pages/MembersPage";

function ScrollToTop({ scrollRef }: { scrollRef: React.RefObject<HTMLElement | null> }) {
  const { pathname } = useLocation();
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [pathname, scrollRef]);
  return null;
}

export default function App() {
  const mainRef = useRef<HTMLElement>(null);

  return (
    <BrowserRouter>
      <div className="flex flex-col h-dvh bg-surface-50 text-zinc-800 max-w-2xl mx-auto app-shell">
        <ScrollToTop scrollRef={mainRef} />
        <Header />
        <main ref={mainRef} className="flex-1 overflow-y-auto overscroll-contain scroll-smooth-ios">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/player/:id" element={<PlayerPage />} />
            <Route path="/members" element={<MembersPage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
