import { useState, useEffect } from "react";

export function useBookCover(title: string) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!title) return;

    fetch(`/api/books?title=${encodeURIComponent(title)}`)
      .then((res) => res.json())
      .then((data) => {
        setThumbnail(data.thumbnail);
        setLoading(false);
      });
  }, [title]);

  return { thumbnail, loading };
}
