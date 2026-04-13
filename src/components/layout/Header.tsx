import { useLocation, useNavigate } from "react-router-dom";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, RefreshCw, Trophy } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "../../lib/cn";

const PAGE_TITLES: Record<string, string> = {
  "/": "BOSF Punting",
  "/news": "News Feed",
  "/events": "Events",
  "/leaderboard": "Leaderboard",
  "/members": "Members",
};

function formatAgo(ms: number): string {
  if (ms < 5_000) return "just now";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function Header({ hidden = false }: { hidden?: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isFetching = useIsFetching() > 0;
  const [logoOk, setLogoOk] = useState(true);
  const prevFetchingRef = useRef(isFetching);
  const [lastRefreshed, setLastRefreshed] = useState<number | null>(null);
  const [tickNow, setTickNow] = useState(() => Date.now());
  const isSubPage = /^\/(player|events)\/\d+/.test(location.pathname);
  const pageTitle = PAGE_TITLES[location.pathname];

  // Record the last time fetching went idle. Deriving state from a transition
  // in `isFetching` genuinely requires an effect — the alternative would be
  // tracking it externally from the query cache.
  useEffect(() => {
    const wasFetching = prevFetchingRef.current;
    prevFetchingRef.current = isFetching;
    const shouldUpdate =
      (wasFetching && !isFetching) ||
      (!isFetching && lastRefreshed === null);
    if (shouldUpdate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLastRefreshed(Date.now());
    }
  }, [isFetching, lastRefreshed]);

  // Tick every 30s so "updated Xm ago" stays fresh
  useEffect(() => {
    const id = setInterval(() => setTickNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = useCallback(async () => {
    // Only refetch queries that are actually rendered — cuts wasted network.
    await queryClient.refetchQueries({ type: "active" });
  }, [queryClient]);

  function handleBack() {
    const hasPreviousPage = window.history.length > 1;
    if (location.pathname.startsWith("/events/")) {
      if (hasPreviousPage) navigate(-1);
      else navigate("/events");
    } else if (location.pathname.startsWith("/player/")) {
      if (hasPreviousPage) navigate(-1);
      else navigate("/leaderboard");
    } else {
      navigate(-1);
    }
  }

  const agoLabel =
    !isSubPage && lastRefreshed ? formatAgo(tickNow - lastRefreshed) : null;

  return (
    <header
      className={cn(
        "shrink-0 border-b bg-white/80 backdrop-blur-xl pt-safe will-change-transform",
        hidden && !isSubPage
          ? "header-hidden border-transparent"
          : "header-visible border-zinc-200/60"
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-3xl mx-auto">
        {isSubPage ? (
          <div className="flex items-center">
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="mr-3 flex items-center justify-center w-11 h-11 rounded-full bg-zinc-100 text-zinc-600 active:scale-95 transition-transform"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="font-display font-bold text-sm text-zinc-900">
              {location.pathname.startsWith("/events/")
                ? "Event Details"
                : "Player Profile"}
            </h1>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            {logoOk ? (
              <img
                src="/logo.png"
                alt=""
                aria-hidden="true"
                className="w-8 h-8 rounded-lg object-contain"
                onError={() => setLogoOk(false)}
              />
            ) : (
              <div
                aria-hidden="true"
                className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/50 flex items-center justify-center text-emerald-600"
              >
                <Trophy size={16} />
              </div>
            )}
            <div className="flex flex-col">
              {pageTitle && (
                <h1 className="font-display font-bold text-sm text-zinc-900 leading-none">
                  {pageTitle}
                </h1>
              )}
              {agoLabel && (
                <span className="text-[10px] text-zinc-400 mt-0.5 leading-none">
                  Updated {agoLabel}
                </span>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleRefresh}
          aria-label={isFetching ? "Refreshing" : "Refresh data"}
          disabled={isFetching}
          className="flex items-center justify-center w-11 h-11 rounded-full text-zinc-400 hover:bg-zinc-100 active:scale-95 transition-all disabled:opacity-60"
        >
          <RefreshCw size={16} className={cn(isFetching && "animate-spin")} />
        </button>
      </div>
    </header>
  );
}
