import { useState, useEffect } from "react";
import { searchEventNews } from "../data/ai";

interface NewsItem {
  title: string;
  url: string;
  description: string;
  age?: string;
}

export function useEventNews(eventName: string | undefined, sport: string | undefined) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventName) return;

    let cancelled = false;
    setLoading(true);

    const query = `${eventName}${sport ? ` ${sport}` : ""} results 2026`;
    searchEventNews(query).then((results) => {
      if (cancelled) return;
      setNews(results);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [eventName, sport]);

  return { news, loading };
}
