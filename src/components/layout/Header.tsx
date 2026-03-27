import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/leaderboard": "Leaderboard",
  "/events": "Events",
  "/members": "Members",
};

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSubPage = /^\/(player|events)\/\d+/.test(location.pathname);
  const pageTitle = PAGE_TITLES[location.pathname];

  function handleBack() {
    if (location.pathname.startsWith("/events/")) {
      navigate("/events");
    } else if (location.pathname.startsWith("/player/")) {
      // Try to go back in history; if we came from somewhere within the app it'll work.
      // If direct navigation, fallback to members page.
      if (window.history.state?.idx > 0) {
        navigate(-1);
      } else {
        navigate("/members");
      }
    } else {
      navigate(-1);
    }
  }

  return (
    <header className="shrink-0 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl pt-safe">
      <div className="flex items-center h-14 px-4 max-w-2xl mx-auto">
        {isSubPage ? (
          <>
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="mr-3 flex items-center justify-center w-11 h-11 rounded-full bg-zinc-100 text-zinc-600 active:scale-95 transition-transform"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="font-display font-bold text-sm text-zinc-900">
              {location.pathname.startsWith("/events/") ? "Event Details" : "Player Profile"}
            </h1>
          </>
        ) : (
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="BOSF"
              className="w-8 h-8 rounded-lg object-contain"
            />
            {pageTitle && (
              <h1 className="font-display font-bold text-sm text-zinc-900">{pageTitle}</h1>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
