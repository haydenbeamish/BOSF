import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-surface-100 border border-surface-200 flex items-center justify-center mb-4 text-surface-400">
        {icon}
      </div>
      <h3 className="font-display font-bold text-base text-zinc-300 mb-1">{title}</h3>
      <p className="text-sm text-surface-500 max-w-xs">{description}</p>
    </motion.div>
  );
}
