import { motion } from "framer-motion";
import { Trophy, Crown, Medal } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import type { LeaderboardEntry } from "../../types";

interface PodiumProps {
  entries: LeaderboardEntry[];
  onSelect: (id: number) => void;
}

export function Podium({ entries, onSelect }: PodiumProps) {
  const first = entries[0];
  const second = entries[1];
  const third = entries[2];

  if (!first) return null;

  return (
    <div className="px-4 pt-6 pb-2">
      {/* Winner callout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/50 px-3 py-1 mb-3">
          <Crown size={12} className="text-amber-600" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Leader</span>
        </div>
      </motion.div>

      {/* Podium blocks */}
      <div className="flex items-end justify-center gap-3 mb-2">
        {/* 2nd place */}
        {second && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            onClick={() => onSelect(second.id)}
            className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
          >
            <Avatar name={second.name} id={second.id} size="lg" ringColor="silver" />
            <p className="font-display font-bold text-xs text-zinc-600 mt-2 truncate max-w-[80px]">
              {second.name}
            </p>
            <p className="text-lg font-display font-extrabold text-zinc-500">{second.total_points}</p>
            <div className="w-20 h-16 rounded-t-xl bg-zinc-100 border border-zinc-200/60 border-b-0 flex items-center justify-center mt-1">
              <Medal size={20} className="text-zinc-400" />
            </div>
          </motion.div>
        )}

        {/* 1st place */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          onClick={() => onSelect(first.id)}
          className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
        >
          <div className="relative">
            <Avatar name={first.name} id={first.id} size="xl" ringColor="gold" />
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center">
              <Crown size={14} className="text-amber-600" />
            </div>
          </div>
          <p className="font-display font-extrabold text-sm text-zinc-900 mt-2 truncate max-w-[90px]">
            {first.name}
          </p>
          <p className="text-2xl font-display font-extrabold text-gradient-gold">{first.total_points}</p>
          <div className="w-24 h-24 rounded-t-xl bg-gradient-to-t from-amber-100/80 to-amber-50/40 border border-amber-200/50 border-b-0 flex items-center justify-center mt-1">
            <Trophy size={28} className="text-amber-500" />
          </div>
        </motion.div>

        {/* 3rd place */}
        {third && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onClick={() => onSelect(third.id)}
            className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
          >
            <Avatar name={third.name} id={third.id} size="lg" ringColor="bronze" />
            <p className="font-display font-bold text-xs text-zinc-600 mt-2 truncate max-w-[80px]">
              {third.name}
            </p>
            <p className="text-lg font-display font-extrabold text-amber-700">{third.total_points}</p>
            <div className="w-20 h-12 rounded-t-xl bg-amber-50 border border-amber-200/40 border-b-0 flex items-center justify-center mt-1">
              <Medal size={18} className="text-amber-600" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Podium base */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-zinc-300 to-transparent" />
    </div>
  );
}
