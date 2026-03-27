import { lazy, Suspense, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { BottomNav } from "./components/layout/BottomNav";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Skeleton } from "./components/ui/Skeleton";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));
const PlayerPage = lazy(() => import("./pages/PlayerPage"));
const MembersPage = lazy(() => import("./pages/MembersPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function PageSkeleton() {
  return (
    <div className="px-4 pt-6 flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}

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
          <ErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/player/:id" element={<PlayerPage />} />
                <Route path="/members" element={<MembersPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
