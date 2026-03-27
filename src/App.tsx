import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { BottomNav } from "./components/layout/BottomNav";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { PlayerPage } from "./pages/PlayerPage";
import { EventsPage } from "./pages/EventsPage";
import { EventDetailPage } from "./pages/EventDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-dvh bg-slate-950 text-slate-100 max-w-lg mx-auto relative">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<LeaderboardPage />} />
            <Route path="/player/:id" element={<PlayerPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
