import { NextResponse } from "next/server";
import { BookSearchResult } from "@/app/type";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=10`
    );
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

        return {
          title: info.title,
          authors: info.authors || [],
          isbn,
          thumbnail: info.imageLinks?.thumbnail,
        };
      })
      .filter(Boolean) as BookSearchResult[];

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}
