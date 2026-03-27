import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, ChevronRight } from "lucide-react";
import { getLeaderboard } from "../data/api";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { cn } from "../lib/cn";
import type { LeaderboardEntry } from "../types";

export function MembersPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLeaderboard()
      .then((data) => {
        if (!cancelled) { setMembers(data); setLoading(false); }
      })
      .catch((err) => {
        if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return <EmptyState icon={<Users size={28} />} title="Couldn't load members" description={error} />;
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-24"
    >
      <div className="px-4 pt-4 pb-3">
        <h2 className="font-display font-extrabold text-base text-zinc-100">Members</h2>
        <p className="text-xs text-surface-500 mt-0.5">{members.length} punters in the syndicate</p>
      </div>

      <div className="flex flex-col gap-2 px-4">
        {members.map((member, i) => {
          const winRate = member.total_predictions > 0
            ? Math.round((member.correct_predictions / member.total_predictions) * 100)
            : 0;

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              onClick={() => navigate(`/player/${member.id}`)}
              className="flex items-center gap-3 px-4 py-4 rounded-2xl border border-surface-200/30 bg-surface-50/40 cursor-pointer active:scale-[0.98] hover:bg-surface-100/50 transition-all"
            >
              <div className="relative">
                <Avatar name={member.name} id={member.id} size="lg" />
                <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-surface-0 flex items-center justify-center">
                  <span className={cn(
                    "text-[9px] font-display font-extrabold",
                    member.rank <= 3 ? "text-amber-400" : "text-surface-500"
                  )}>
                    {member.rank}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-sm text-zinc-100 truncate">{member.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={winRate >= 50 ? "accent" : "default"} size="sm">
                    {winRate}% win rate
                  </Badge>
                  <span className="text-[11px] text-surface-500">
                    {member.correct_predictions} correct
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className={cn(
                  "font-display font-extrabold text-base tabular-nums",
                  member.rank === 1 ? "text-amber-400" : "text-zinc-200"
                )}>
                  {member.total_points}
                </p>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-surface-500">pts</p>
              </div>
              <ChevronRight size={14} className="text-surface-400 shrink-0" />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
