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
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!eventName) return;

    let cancelled = false;
    setLoading(true);
    setError(false);

    const year = new Date().getFullYear();
    const query = `${eventName}${sport ? ` ${sport}` : ""} results ${year}`;
    searchEventNews(query)
      .then((results) => {
        if (cancelled) return;
        setNews(results);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [eventName, sport]);

  return { news, loading, error };
}
