import { useState, useEffect } from "react";

export function useBookCover(title: string, isbn?: string) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!title && !isbn) {
      setLoading(false);
      return;
    }

    const query = isbn ? `isbn:${isbn}` : title;
    fetch(`/api/books?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data: { thumbnail?: string }[]) => {
        const found = data.find((d) => d.thumbnail);
        setThumbnail(found?.thumbnail ?? null);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [title, isbn]);

  return { thumbnail, loading };
}
