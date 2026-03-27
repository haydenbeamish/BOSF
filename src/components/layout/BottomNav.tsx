import { NavLink } from "react-router-dom";
import { LayoutDashboard, Trophy, ScrollText, Users } from "lucide-react";
import { cn } from "../../lib/cn";

const tabs = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/leaderboard", label: "Board", icon: Trophy },
  { to: "/bets", label: "Bets", icon: ScrollText },
  { to: "/members", label: "Members", icon: Users },
];

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-surface-200 bg-surface-0/90 backdrop-blur-xl pb-safe"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px]",
                isActive
                  ? "text-accent"
                  : "text-surface-500 active:text-surface-700"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <tab.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
                </div>
                <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
