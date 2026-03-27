import { motion } from "framer-motion";
import { Badge } from "../ui/Badge";

interface PlayerHeaderProps {
  name: string;
  totalPoints: number;
  predictions: { is_correct: boolean | null }[];
}

export function PlayerHeader({ name, totalPoints, predictions }: PlayerHeaderProps) {
  const wins = predictions.filter((p) => p.is_correct === true).length;
  const losses = predictions.filter((p) => p.is_correct === false).length;
  const pending = predictions.filter((p) => p.is_correct === null).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-6"
    >
      <h2 className="text-2xl font-bold text-slate-100">{name}</h2>
      <p className="text-3xl font-bold text-gold-400 mt-1">
        {totalPoints} <span className="text-sm text-slate-500 font-normal">pts</span>
      </p>
      <div className="flex gap-2 mt-3">
        <Badge variant="correct">{wins} Won</Badge>
        <Badge variant="incorrect">{losses} Lost</Badge>
        <Badge variant="pending">{pending} Pending</Badge>
      </div>
    </motion.div>
  );
}
