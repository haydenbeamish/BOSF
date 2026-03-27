import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, ChevronRight, RefreshCw, Trophy } from "lucide-react";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { cn } from "../lib/cn";

export function MembersPage() {
  const navigate = useNavigate();
  const { entries: members, loading, error, retry } = useLeaderboard();

  if (error) {
    return (
      <EmptyState icon={<Users size={28} />} title="Couldn't load members" description={error}>
        <button
          onClick={retry}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold active:scale-95 transition-transform"
        >
          <RefreshCw size={14} /> Try again
        </button>
      </EmptyState>
    );
  }

  if (loading) {
    return (
      <div className="px-4 pt-4 flex flex-col gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-18 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <EmptyState
        icon={<Users size={28} />}
        title="No members yet"
        description="Members will appear here once they join the competition."
      />
    );
  }

  // Group stats
  const avgWinRate = members.filter(m => m.decided_predictions > 0).length > 0
    ? Math.round(members.filter(m => m.decided_predictions > 0).reduce((s, m) => s + m.win_rate, 0) / members.filter(m => m.decided_predictions > 0).length)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-6"
    >
      <div className="px-4 pt-4 pb-3">
        <h2 className="font-display font-extrabold text-base text-zinc-900">Members</h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          {members.length} punter{members.length !== 1 ? "s" : ""} in the syndicate
          {avgWinRate > 0 && <> &middot; Avg {avgWinRate}% win rate</>}
        </p>
      </div>

      <div className="flex flex-col gap-2 px-4">
        {members.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.5), duration: 0.3 }}
            onClick={() => navigate(`/player/${member.id}`)}
            className="flex items-center gap-3 px-4 py-4 rounded-2xl border border-zinc-200/60 bg-white cursor-pointer active:scale-[0.98] hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm"
          >
            <div className="relative">
              <Avatar name={member.name} id={member.id} size="lg" />
              {member.rank <= 3 && (
                <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-white shadow-sm border border-zinc-200/60 flex items-center justify-center">
                  {member.rank === 1 ? (
                    <Trophy size={10} className="text-amber-600" />
                  ) : (
                    <span className={cn(
                      "text-[9px] font-display font-extrabold",
                      member.rank <= 3 ? "text-amber-600" : "text-zinc-400"
                    )}>
                      {member.rank}
                    </span>
                  )}
                </div>
              )}
              {member.rank > 3 && (
                <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-white shadow-sm border border-zinc-200/60 flex items-center justify-center">
                  <span className="text-[9px] font-display font-extrabold text-zinc-400">
                    {member.rank}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-sm text-zinc-900 truncate">{member.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {member.decided_predictions > 0 ? (
                  <Badge variant={member.win_rate >= 50 ? "accent" : "default"} size="sm">
                    {member.win_rate}% win rate
                  </Badge>
                ) : (
                  <Badge variant="default" size="sm">No results yet</Badge>
                )}
                <span className="text-[11px] text-zinc-400">
                  {member.correct_predictions}/{member.decided_predictions} correct
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className={cn(
                "font-display font-extrabold text-base tabular-nums",
                member.rank === 1 ? "text-amber-600" : "text-zinc-800"
              )}>
                {member.total_points}
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">pts</p>
            </div>
            <ChevronRight size={14} className="text-zinc-300 shrink-0" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default MembersPage;
