import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Target,
  XCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  Swords,
  Lightbulb,
  BarChart3,
  ArrowRightLeft,
  Ticket,
  Coins,
  Users,
  Crown,
  Banknote,
  ClipboardList,
  MessageSquare,
} from "lucide-react";
import { cn } from "../../lib/cn";
import type { FeedItem } from "../../lib/newsfeed";

const TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; accent: string; stripe: string }
> = {
  event_result: {
    icon: Trophy,
    accent: "text-emerald-600",
    stripe: "bg-emerald-500",
  },
  perfect_pick: {
    icon: Target,
    accent: "text-amber-600",
    stripe: "bg-amber-500",
  },
  everyone_wrong: {
    icon: XCircle,
    accent: "text-red-500",
    stripe: "bg-red-500",
  },
  winning_streak: {
    icon: TrendingUp,
    accent: "text-emerald-600",
    stripe: "bg-emerald-500",
  },
  losing_streak: {
    icon: TrendingDown,
    accent: "text-zinc-500",
    stripe: "bg-zinc-400",
  },
  outlier_alert: {
    icon: Eye,
    accent: "text-violet-600",
    stripe: "bg-violet-500",
  },
  close_race: {
    icon: Swords,
    accent: "text-amber-600",
    stripe: "bg-amber-500",
  },
  hot_take: {
    icon: Lightbulb,
    accent: "text-sky-600",
    stripe: "bg-sky-500",
  },
  odds_alert: {
    icon: BarChart3,
    accent: "text-blue-600",
    stripe: "bg-blue-500",
  },
  contrarian_pick: {
    icon: ArrowRightLeft,
    accent: "text-fuchsia-600",
    stripe: "bg-fuchsia-500",
  },
  underdog_backer: {
    icon: Ticket,
    accent: "text-teal-600",
    stripe: "bg-teal-500",
  },
  winners_list: {
    icon: Coins,
    accent: "text-yellow-600",
    stripe: "bg-yellow-400",
  },
  group_consensus: {
    icon: Users,
    accent: "text-indigo-600",
    stripe: "bg-indigo-500",
  },
  leader_banter: {
    icon: Crown,
    accent: "text-yellow-600",
    stripe: "bg-yellow-500",
  },
  last_place_banter: {
    icon: Banknote,
    accent: "text-red-600",
    stripe: "bg-red-500",
  },
  pick_summary: {
    icon: ClipboardList,
    accent: "text-sky-600",
    stripe: "bg-sky-500",
  },
  result_commentary: {
    icon: MessageSquare,
    accent: "text-emerald-600",
    stripe: "bg-emerald-500",
  },
  pre_event_odds: {
    icon: BarChart3,
    accent: "text-blue-600",
    stripe: "bg-blue-500",
  },
};

const DEFAULT_CONFIG = TYPE_CONFIG.event_result;

interface FeedCardProps {
  item: FeedItem;
  index: number;
}

export function FeedCard({ item, index }: FeedCardProps) {
  const navigate = useNavigate();
  const config = TYPE_CONFIG[item.type] ?? DEFAULT_CONFIG;
  const Icon = config.icon;

  const handleClick = () => {
    if (item.eventId) {
      navigate(`/events/${item.eventId}`);
    } else if (item.playerId) {
      navigate(`/player/${item.playerId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={item.headline}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm",
        "cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]",
        "pl-0 pr-4 py-3.5"
      )}
    >
      {/* Left accent stripe */}
      <div
        className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl", config.stripe)}
      />

      <div className="flex items-start gap-3 pl-4">
        <div
          className={cn(
            "mt-0.5 shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-50",
            config.accent
          )}
        >
          <Icon size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-sm leading-snug text-zinc-800">
            {item.headline}
          </p>
          <p className="text-[13px] text-zinc-500 mt-0.5 leading-relaxed">
            {item.subtext}
          </p>
          {item.sport && (
            <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-100 rounded-full px-2 py-0.5">
              {item.sport}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
