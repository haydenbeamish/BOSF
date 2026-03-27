import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/": "",
  "/leaderboard": "Leaderboard",
  "/bets": "Bet Log",
  "/members": "Members",
};

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSubPage = /^\/(player|events|members)\/\d+/.test(location.pathname);
  const title = pageTitles[location.pathname] || "";

  return (
    <header className="sticky top-0 z-40 border-b border-surface-200/50 bg-surface-0/80 backdrop-blur-xl">
      <div className="flex items-center h-14 px-4 max-w-2xl mx-auto">
        {isSubPage ? (
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="mr-3 flex items-center justify-center w-10 h-10 rounded-full bg-surface-100 text-surface-600 active:scale-95 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
              <span className="text-accent font-display font-extrabold text-xs">B</span>
            </div>
            <span className="font-display font-extrabold text-sm tracking-tight text-zinc-100">
              BOSF
            </span>
          </div>
        )}
        {title && !isSubPage && (
          <h1 className="ml-4 font-display font-bold text-sm text-zinc-400">{title}</h1>
        )}
        {isSubPage && (
          <h1 className="font-display font-bold text-sm text-zinc-100">Back</h1>
        )}
      </div>
    </header>
  );
}
