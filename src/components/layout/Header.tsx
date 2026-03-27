import { useLocation, useNavigate } from "react-router-dom";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSubPage = location.pathname.includes("/player/") || location.pathname.includes("/events/");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex items-center h-14 px-4">
        {isSubPage && (
          <button
            onClick={() => navigate(-1)}
            className="mr-3 flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/50 text-slate-400 active:scale-95 transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-bold tracking-tight">
          <span className="text-gold-400">BOSF</span>
          {!isSubPage && <span className="text-slate-500 font-normal ml-2 text-sm">Punting Leaderboard</span>}
        </h1>
      </div>
    </header>
  );
}
