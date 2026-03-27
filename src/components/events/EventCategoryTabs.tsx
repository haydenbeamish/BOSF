import { useRef, useEffect } from "react";
import { cn } from "../../lib/cn";
import { getCategoryInfo } from "../../lib/categories";

interface EventCategoryTabsProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export function EventCategoryTabs({ categories, selected, onSelect }: EventCategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const button = activeRef.current;
      const scrollLeft = button.offsetLeft - container.offsetWidth / 2 + button.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [selected]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none sticky top-14 z-30 bg-slate-950/90 backdrop-blur-xl"
    >
      {categories.map((cat) => {
        const isActive = cat === selected;
        const info = cat === "All" ? null : getCategoryInfo(cat);
        return (
          <button
            key={cat}
            ref={isActive ? activeRef : null}
            onClick={() => onSelect(cat)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all shrink-0 active:scale-95",
              isActive
                ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                : "bg-slate-800/50 text-slate-400 border border-slate-700/30"
            )}
          >
            {info && <span>{info.emoji}</span>}
            {cat}
          </button>
        );
      })}
    </div>
  );
}
