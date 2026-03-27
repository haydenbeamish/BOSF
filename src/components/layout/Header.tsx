import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSubPage = /^\/(player|events)\/\d+/.test(location.pathname);

  function handleBack() {
    // Navigate to the logical parent route instead of relying on browser history
    if (location.pathname.startsWith("/events/")) {
      navigate("/events");
    } else if (location.pathname.startsWith("/player/")) {
      // Go back in history if available, otherwise fallback to leaderboard
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/leaderboard");
      }
    } else {
      navigate(-1);
    }
  }

  return (
    <header className="shrink-0 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl">
      <div className="flex items-center h-14 px-4 max-w-2xl mx-auto">
        {isSubPage ? (
          <>
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="mr-3 flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 text-zinc-600 active:scale-95 transition-transform"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="font-display font-bold text-sm text-zinc-900">Back</h1>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="BOSF"
              className="w-8 h-8 rounded-lg object-contain"
            />
          </div>
        )}
      </div>
    </header>
  );
}
