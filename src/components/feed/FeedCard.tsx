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
  ArrowUpCircle,
  ArrowDownCircle,
  Skull,
  Zap,
  Percent,
  CreditCard,
  Bell,
  Flame,
  Snowflake,
  Activity,
  CalendarRange,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/cn";
import type { FeedAccent, FeedItem } from "../../lib/newsfeed";

type TypeStyle = { icon: LucideIcon; accent: string; stripe: string };

const TYPE_CONFIG: Record<string, TypeStyle> = {
  event_result: { icon: Trophy, accent: "text-emerald-600", stripe: "bg-emerald-500" },
  perfect_pick: { icon: Target, accent: "text-amber-600", stripe: "bg-amber-500" },
  everyone_wrong: { icon: XCircle, accent: "text-red-500", stripe: "bg-red-500" },
  winning_streak: { icon: TrendingUp, accent: "text-emerald-600", stripe: "bg-emerald-500" },
  losing_streak: { icon: TrendingDown, accent: "text-zinc-500", stripe: "bg-zinc-400" },
  outlier_alert: { icon: Eye, accent: "text-violet-600", stripe: "bg-violet-500" },
  close_race: { icon: Swords, accent: "text-amber-600", stripe: "bg-amber-500" },
  hot_take: { icon: Lightbulb, accent: "text-sky-600", stripe: "bg-sky-500" },
  odds_alert: { icon: BarChart3, accent: "text-blue-600", stripe: "bg-blue-500" },
  contrarian_pick: { icon: ArrowRightLeft, accent: "text-fuchsia-600", stripe: "bg-fuchsia-500" },
  underdog_backer: { icon: Ticket, accent: "text-teal-600", stripe: "bg-teal-500" },
  winners_list: { icon: Coins, accent: "text-yellow-600", stripe: "bg-yellow-400" },
  group_consensus: { icon: Users, accent: "text-indigo-600", stripe: "bg-indigo-500" },
  leader_banter: { icon: Crown, accent: "text-yellow-600", stripe: "bg-yellow-500" },
  last_place_banter: { icon: Banknote, accent: "text-red-600", stripe: "bg-red-500" },
  pick_summary: { icon: ClipboardList, accent: "text-sky-600", stripe: "bg-sky-500" },
  result_commentary: { icon: MessageSquare, accent: "text-emerald-600", stripe: "bg-emerald-500" },
  pre_event_odds: { icon: BarChart3, accent: "text-blue-600", stripe: "bg-blue-500" },
  new_leader: { icon: ArrowUpCircle, accent: "text-amber-600", stripe: "bg-amber-500" },
  new_spud: { icon: Skull, accent: "text-red-600", stripe: "bg-red-500" },
  upset_alert: { icon: Zap, accent: "text-orange-600", stripe: "bg-orange-500" },
  accuracy_check: { icon: Percent, accent: "text-cyan-600", stripe: "bg-cyan-500" },
  lunch_liability: { icon: CreditCard, accent: "text-rose-600", stripe: "bg-rose-500" },
  picks_open: { icon: Bell, accent: "text-amber-600", stripe: "bg-amber-500" },
  post_event_rubbing: { icon: Flame, accent: "text-orange-600", stripe: "bg-orange-500" },
  odds_vs_picks: { icon: ArrowRightLeft, accent: "text-fuchsia-600", stripe: "bg-fuchsia-500" },
  outlier_bet: { icon: Eye, accent: "text-violet-600", stripe: "bg-violet-500" },
  streak_spotlight: { icon: Flame, accent: "text-amber-600", stripe: "bg-amber-500" },
  leaderboard_change: { icon: Crown, accent: "text-yellow-600", stripe: "bg-yellow-500" },
  ladder_leader: { icon: Crown, accent: "text-amber-600", stripe: "bg-amber-500" },
  ladder_last: { icon: ArrowDownCircle, accent: "text-red-500", stripe: "bg-red-500" },
  season_milestone: { icon: Trophy, accent: "text-emerald-600", stripe: "bg-emerald-500" },
  lunch_bill_climb: { icon: CreditCard, accent: "text-rose-600", stripe: "bg-rose-500" },
  momentum_index: { icon: Activity, accent: "text-sky-600", stripe: "bg-sky-500" },
  week_ahead: { icon: CalendarRange, accent: "text-emerald-600", stripe: "bg-emerald-500" },
  h2h_rivalry: { icon: Swords, accent: "text-violet-600", stripe: "bg-violet-500" },
  stat_callout: { icon: Percent, accent: "text-blue-600", stripe: "bg-blue-500" },
};

const DEFAULT_CONFIG: TypeStyle = TYPE_CONFIG.event_result;

const ACCENT_OVERRIDES: Record<FeedAccent, { accent: string; stripe: string }> = {
  green: { accent: "text-emerald-600", stripe: "bg-emerald-500" },
  red: { accent: "text-red-500", stripe: "bg-red-500" },
  blue: { accent: "text-blue-600", stripe: "bg-blue-500" },
  amber: { accent: "text-amber-600", stripe: "bg-amber-500" },
  purple: { accent: "text-violet-600", stripe: "bg-violet-500" },
  gold: { accent: "text-amber-600", stripe: "bg-amber-500" },
  zinc: { accent: "text-zinc-500", stripe: "bg-zinc-400" },
};

const ICON_HINT_MAP: Record<string, LucideIcon> = {
  trophy: Trophy,
  flame: Flame,
  crown: Crown,
  zap: Zap,
  snowflake: Snowflake,
  medal: Trophy,
  target: Target,
  lightbulb: Lightbulb,
  skull: Skull,
  ticket: Ticket,
  coins: Coins,
  users: Users,
  percent: Percent,
  activity: Activity,
  calendar: CalendarRange,
  swords: Swords,
  eye: Eye,
};

const TYPE_LABELS: Record<string, string> = {
  event_result: "Event Result",
  perfect_pick: "Perfect Pick",
  everyone_wrong: "Everyone Wrong",
  winning_streak: "Winning Streak",
  losing_streak: "Losing Streak",
  outlier_alert: "Outlier Alert",
  close_race: "Close Race",
  hot_take: "Hot Take",
  odds_alert: "Odds",
  contrarian_pick: "Group vs Bookies",
  underdog_backer: "Underdog Pick",
  winners_list: "Winners & Losers",
  group_consensus: "Group Consensus",
  leader_banter: "Leaderboard",
  last_place_banter: "Last Place",
  pick_summary: "Pick Summary",
  result_commentary: "Commentary",
  pre_event_odds: "Pre-Event Odds",
  new_leader: "New Leader",
  new_spud: "New Spud",
  upset_alert: "Upset Alert",
  accuracy_check: "Accuracy",
  lunch_liability: "Lunch Liability",
  picks_open: "Picks Open",
  post_event_rubbing: "Aftermath",
  odds_vs_picks: "Odds vs Picks",
  outlier_bet: "Outlier Bet",
  streak_spotlight: "Streak Spotlight",
  leaderboard_change: "Ladder Move",
  ladder_leader: "Ladder — Leader",
  ladder_last: "Ladder — Last",
  season_milestone: "Season Milestone",
  lunch_bill_climb: "Lunch Bill",
  momentum_index: "Momentum",
  week_ahead: "Week Ahead",
  h2h_rivalry: "Head to Head",
  stat_callout: "Stat",
};

interface FeedCardProps {
  item: FeedItem;
  index: number;
}

export function FeedCard({ item, index }: FeedCardProps) {
  const navigate = useNavigate();
  const baseConfig = TYPE_CONFIG[item.type] ?? DEFAULT_CONFIG;
  const accentOverride = item.accent ? ACCENT_OVERRIDES[item.accent] : null;
  const iconFromHint =
    item.icon && ICON_HINT_MAP[item.icon.toLowerCase()];
  const Icon: LucideIcon = iconFromHint || baseConfig.icon;
  const accent = accentOverride?.accent ?? baseConfig.accent;
  const stripe = accentOverride?.stripe ?? baseConfig.stripe;

  const hasEventId = !!item.eventId;
  const hasPlayerId = !!item.playerId;
  const clickable = hasEventId || hasPlayerId;

  const handleClick = () => {
    if (item.eventId) navigate(`/events/${item.eventId}`);
    else if (item.playerId) navigate(`/player/${item.playerId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.3 }}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? handleClick : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      aria-label={clickable ? item.headline : undefined}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm",
        "transition-all duration-200",
        "pl-0 pr-4 py-3.5",
        clickable &&
          "cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
      )}
    >
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl", stripe)} />

      <div className="flex items-start gap-3 pl-4">
        <div
          className={cn(
            "mt-0.5 shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-50",
            accent
          )}
        >
          <Icon size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-0.5">
            {TYPE_LABELS[item.type] ?? item.type.replace(/_/g, " ")}
          </p>
          <p className="font-display font-bold text-sm leading-snug text-zinc-800">
            {item.headline}
          </p>
          {item.subtext && (
            <p className="text-[13px] text-zinc-500 mt-0.5 leading-relaxed">
              {item.subtext}
            </p>
          )}

          {/* Rich backend card shapes — render conditionally */}
          {item.detail?.market && <MarketBlock market={item.detail.market} />}
          {item.odds && !item.detail?.market && <OddsDisplay odds={item.odds} />}
          {item.picks && item.picks.total > 0 && <PicksDisplay picks={item.picks} />}
          {item.detail?.timeline && <TimelineBlock timeline={item.detail.timeline} />}
          {item.detail?.ladder && <LadderBlock ladder={item.detail.ladder} />}
          {item.detail?.momentum && <MomentumBlock momentum={item.detail.momentum} />}
          {item.detail?.week_ahead && <WeekAheadBlock week={item.detail.week_ahead} />}
          {item.detail?.h2h && <H2HBlock h2h={item.detail.h2h} />}
          {item.detail?.stat && <StatBlock stat={item.detail.stat} />}

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

// --- Sub-blocks -----------------------------------------------------------

function PicksDisplay({ picks }: { picks: NonNullable<FeedItem["picks"]> }) {
  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        Picks ({picks.total})
      </p>
      {picks.options.map((opt) => {
        const pct = picks.total > 0 ? Math.round((opt.count / picks.total) * 100) : 0;
        const isFav = opt.isFavourite ?? opt.market_role === "favourite";
        const isUnd = opt.market_role === "underdog";
        const labelColor = opt.isCorrect
          ? "text-emerald-700"
          : isFav
          ? "text-emerald-700"
          : isUnd
          ? "text-blue-600"
          : "text-zinc-700";
        const barColor = opt.isCorrect
          ? "bg-emerald-500"
          : isFav
          ? "bg-emerald-500"
          : isUnd
          ? "bg-blue-500"
          : "bg-zinc-400";
        return (
          <div key={opt.label}>
            <div className="flex items-center justify-between mb-0.5 gap-2">
              <span
                className={cn("text-[12px] font-semibold truncate flex items-center gap-1", labelColor)}
              >
                {opt.label}
                {isFav && (
                  <span className="text-[10px] opacity-70 font-normal">(fav)</span>
                )}
                {opt.isCorrect && <span className="text-emerald-500">✓</span>}
              </span>
              <span className="text-[11px] font-bold tabular-nums text-zinc-500 shrink-0">
                {pct}%
              </span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden bg-zinc-100 mb-0.5">
              <div
                className={cn("rounded-full transition-all", barColor)}
                style={{ width: `${pct}%` }}
              />
            </div>
            {opt.names.length > 0 && (
              <p className="text-[11px] text-zinc-400 leading-tight truncate">
                {opt.names.join(", ")}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function OddsDisplay({ odds }: { odds: NonNullable<FeedItem["odds"]> }) {
  const favImplied = odds.favouriteOdds > 0 ? 1 / odds.favouriteOdds : 0;
  const undImplied = odds.underdogOdds && odds.underdogOdds > 0 ? 1 / odds.underdogOdds : 0;
  const total = favImplied + undImplied;
  const favPct = total > 0 ? Math.round((favImplied / total) * 100) : 100;
  const undPct = 100 - favPct;

  return (
    <div className="mt-1.5 space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5 gap-2">
            <span className="text-[12px] font-semibold text-emerald-700 truncate">
              {odds.favourite}
            </span>
            <span className="text-[12px] font-bold tabular-nums text-emerald-700 shrink-0">
              ${odds.favouriteOdds.toFixed(2)}
            </span>
          </div>
          {odds.underdog && odds.underdogOdds != null && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-semibold text-blue-600 truncate">
                {odds.underdog}
              </span>
              <span className="text-[12px] font-bold tabular-nums text-blue-600 shrink-0">
                ${odds.underdogOdds.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
      {odds.underdog && odds.underdogOdds != null && (
        <div className="flex h-1.5 rounded-full overflow-hidden bg-zinc-100">
          <div className="bg-emerald-500 rounded-l-full" style={{ width: `${favPct}%` }} />
          <div className="bg-blue-500 rounded-r-full" style={{ width: `${undPct}%` }} />
        </div>
      )}
    </div>
  );
}

function MarketBlock({ market }: { market: NonNullable<FeedItem["detail"]>["market"] }) {
  if (!market) return null;
  const favImplied = market.favouriteOdds > 0 ? 1 / market.favouriteOdds : 0;
  const undImplied = market.underdogOdds && market.underdogOdds > 0 ? 1 / market.underdogOdds : 0;
  const total = favImplied + undImplied;
  const favPct = total > 0 ? Math.round((favImplied / total) * 100) : 100;
  const undPct = 100 - favPct;
  return (
    <div className="mt-2 rounded-lg bg-zinc-50 border border-zinc-200/50 p-2">
      {market.variant && (
        <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full mb-1.5">
          {market.variant} pre-kick
        </span>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-semibold text-emerald-700 truncate">
          {market.favourite}
        </span>
        <span className="text-[12px] font-bold tabular-nums text-emerald-700 shrink-0">
          ${market.favouriteOdds.toFixed(2)}
          {market.implied_pct != null && (
            <span className="opacity-60 font-normal"> · {market.implied_pct}%</span>
          )}
        </span>
      </div>
      {market.underdog && market.underdogOdds != null && (
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-[12px] font-semibold text-blue-600 truncate">
            {market.underdog}
          </span>
          <span className="text-[12px] font-bold tabular-nums text-blue-600 shrink-0">
            ${market.underdogOdds.toFixed(2)}
          </span>
        </div>
      )}
      {market.underdog && market.underdogOdds != null && (
        <div className="flex h-1.5 rounded-full overflow-hidden bg-white mt-1.5">
          <div className="bg-emerald-500" style={{ width: `${favPct}%` }} />
          <div className="bg-blue-500" style={{ width: `${undPct}%` }} />
        </div>
      )}
      {market.gap_multiplier != null && (
        <p className="text-[11px] text-zinc-500 mt-1">
          Gap: <strong>{market.gap_multiplier.toFixed(1)}x</strong>
        </p>
      )}
    </div>
  );
}

function TimelineBlock({
  timeline,
}: {
  timeline: NonNullable<FeedItem["detail"]>["timeline"];
}) {
  if (!timeline) return null;
  const hot = timeline.hotness === "hot";
  const cold = timeline.hotness === "cold";
  return (
    <div className="mt-2">
      <div className="flex items-center gap-1 mb-1">
        {timeline.results.map((r, i) => (
          <span
            key={i}
            aria-label={r.is_correct ? "win" : "loss"}
            className={cn(
              "w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold",
              r.is_correct ? "bg-emerald-500 text-white" : "bg-red-400 text-white"
            )}
            title={r.event_name ?? (r.is_correct ? "Win" : "Loss")}
          >
            {r.is_correct ? "✓" : "✗"}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap text-[11px] text-zinc-500">
        {hot && (
          <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
            <Flame size={11} /> Hot
          </span>
        )}
        {cold && (
          <span className="inline-flex items-center gap-1 text-sky-600 font-semibold">
            <Snowflake size={11} /> Cold
          </span>
        )}
        {timeline.rank != null && <span>Rank {timeline.rank}</span>}
        {timeline.points != null && <span>{timeline.points} pts</span>}
        {timeline.lunch_bill != null && <span>${timeline.lunch_bill} lunch</span>}
      </div>
    </div>
  );
}

function LadderBlock({
  ladder,
}: {
  ladder: NonNullable<FeedItem["detail"]>["ladder"];
}) {
  if (!ladder) return null;
  return (
    <div className="mt-2 rounded-lg bg-zinc-50 border border-zinc-200/50 p-2">
      <div className="flex flex-col gap-0.5">
        {ladder.rows.slice(0, 13).map((row) => (
          <div
            key={`${row.rank}-${row.name}`}
            className={cn(
              "flex items-center gap-2 text-[12px] px-1.5 py-0.5 rounded",
              row.is_focus && "bg-emerald-100/70"
            )}
          >
            <span className="tabular-nums text-zinc-400 font-semibold w-5 text-right">
              {row.rank}
            </span>
            <span
              className={cn(
                "flex-1 truncate",
                row.is_focus ? "font-bold text-emerald-800" : "text-zinc-700"
              )}
            >
              {row.name}
            </span>
            <span className="tabular-nums font-bold text-zinc-700">
              {row.points.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
      {ladder.progress_pct != null && (
        <div className="mt-2">
          <div className="h-1.5 rounded-full bg-white overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400"
              style={{ width: `${Math.min(100, Math.max(0, ladder.progress_pct))}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">
            Season {ladder.progress_pct}% complete
          </p>
        </div>
      )}
      {(ladder.rank_move != null || ladder.bill_move != null) && (
        <div className="flex gap-3 mt-1.5 text-[11px]">
          {ladder.rank_move != null && (
            <span
              className={cn(
                "font-semibold",
                ladder.rank_move > 0 ? "text-red-500" : "text-emerald-600"
              )}
            >
              {ladder.rank_move > 0 ? "↓" : "↑"} {Math.abs(ladder.rank_move)} rank
            </span>
          )}
          {ladder.bill_move != null && (
            <span
              className={cn(
                "font-semibold",
                ladder.bill_move > 0 ? "text-red-500" : "text-emerald-600"
              )}
            >
              {ladder.bill_move > 0 ? "+" : "-"}${Math.abs(ladder.bill_move)} bill
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function MomentumBlock({
  momentum,
}: {
  momentum: NonNullable<FeedItem["detail"]>["momentum"];
}) {
  if (!momentum) return null;
  return (
    <div className="mt-2 space-y-1">
      {momentum.bars.slice(0, 8).map((b) => (
        <div key={b.label} className="flex items-center gap-2">
          <span className="w-16 text-[11px] text-zinc-500 truncate">{b.label}</span>
          <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-400"
              style={{ width: `${Math.min(100, Math.max(0, b.value))}%` }}
            />
          </div>
          <span className="text-[11px] tabular-nums text-zinc-600 w-8 text-right">
            {b.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function WeekAheadBlock({
  week,
}: {
  week: NonNullable<FeedItem["detail"]>["week_ahead"];
}) {
  if (!week) return null;
  return (
    <div className="mt-2 space-y-1.5">
      {week.sport_chips.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {week.sport_chips.slice(0, 6).map((c) => (
            <span
              key={c.sport}
              className="text-[10px] font-semibold rounded-full bg-zinc-100 text-zinc-600 px-1.5 py-0.5"
            >
              {c.sport} × {c.count}
            </span>
          ))}
        </div>
      )}
      {week.by_day.slice(0, 5).map((d) => (
        <div key={d.day}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">
            {d.day}
          </p>
          <ul className="flex flex-col gap-0.5">
            {d.events.slice(0, 4).map((ev, i) => (
              <li key={`${d.day}-${i}`} className="text-[12px] text-zinc-700 truncate">
                • {ev.event_name}
                {ev.sport && (
                  <span className="text-[10px] text-zinc-400 ml-1">{ev.sport}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function H2HBlock({ h2h }: { h2h: NonNullable<FeedItem["detail"]>["h2h"] }) {
  if (!h2h || h2h.pair.length < 2) return null;
  const [a, b] = h2h.pair;
  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      {[a, b].map((p, idx) => (
        <div
          key={`${p.name}-${idx}`}
          className="rounded-lg bg-zinc-50 border border-zinc-200/50 p-2"
        >
          <p className="font-display font-bold text-sm text-zinc-800 truncate">{p.name}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {p.wins}W · {p.losses}L
          </p>
          <div className="flex gap-0.5 mt-1">
            {p.recent_form.slice(0, 5).map((r, i) => (
              <span
                key={i}
                className={cn(
                  "w-3 h-3 rounded-sm flex items-center justify-center text-[8px] font-bold",
                  r === "W" ? "bg-emerald-500 text-white" : "bg-red-400 text-white"
                )}
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatBlock({ stat }: { stat: NonNullable<FeedItem["detail"]>["stat"] }) {
  if (!stat) return null;
  return (
    <div className="mt-2 rounded-lg bg-zinc-50 border border-zinc-200/50 p-2">
      <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
        {stat.label}
      </p>
      <p className="font-display font-extrabold text-xl text-zinc-900 mt-0.5">
        {stat.value}
        {stat.unit && <span className="text-sm text-zinc-400 ml-1">{stat.unit}</span>}
      </p>
      {stat.context && (
        <p className="text-[11px] text-zinc-500 mt-0.5">{stat.context}</p>
      )}
    </div>
  );
}
