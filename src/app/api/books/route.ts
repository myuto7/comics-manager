import { NextResponse } from "next/server";
import { BookSearchResult } from "@/app/type";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const url = new URL("https://www.googleapis.com/books/v1/volumes");
    url.searchParams.set("q", query);
    url.searchParams.set("maxResults", "20");
    if (apiKey) url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString());

    if (!res.ok) {
      console.error(`Google Books API error: ${res.status}`);
      return NextResponse.json([]);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();

    if (!data.items) {
      return NextResponse.json([]);
    }

    const results: BookSearchResult[] = data.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any): BookSearchResult | null => {
        const info = item.volumeInfo;
        const isbn13 = info.industryIdentifiers?.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (id: any) => id.type === "ISBN_13"
        )?.identifier;
        const isbn10 = info.industryIdentifiers?.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (id: any) => id.type === "ISBN_10"
        )?.identifier;
        const isbn = isbn13 || isbn10;

        if (!isbn) return null;

        const rawThumbnail = info.imageLinks?.thumbnail as string | undefined;
        const thumbnail = rawThumbnail
          ? rawThumbnail.replace(/^http:\/\//, "https://")
          : undefined;

        return {
          title: info.title,
          authors: info.authors || [],
          isbn,
          thumbnail,
        };
      })
      .filter(Boolean) as BookSearchResult[];

    // 表紙ありを優先
    results.sort((a, b) => (b.thumbnail ? 1 : 0) - (a.thumbnail ? 1 : 0));

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}
