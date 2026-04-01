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
    const isIsbnSearch = query.startsWith("isbn:");
    const apiQuery = isIsbnSearch ? query : `${query}+subject:comics`;

    const url = new URL("https://www.googleapis.com/books/v1/volumes");
    url.searchParams.set("q", apiQuery);
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

        const categories: string[] = info.categories || [];
        const isComic = categories.some((c) =>
          /comic|manga|graphic novel|漫画/i.test(c)
        );

        return {
          title: info.title,
          authors: info.authors || [],
          isbn,
          thumbnail,
          isComic,
        };
      })
      .filter(Boolean) as (BookSearchResult & { isComic: boolean })[];

    // コミック判定あり → 表紙あり の順で優先
    results.sort((a, b) => {
      const aScore =
        ((a as BookSearchResult & { isComic: boolean }).isComic ? 2 : 0) +
        (a.thumbnail ? 1 : 0);
      const bScore =
        ((b as BookSearchResult & { isComic: boolean }).isComic ? 2 : 0) +
        (b.thumbnail ? 1 : 0);
      return bScore - aScore;
    });

    // isComic は内部ソート用なので除いて返す
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return NextResponse.json(results.map(({ isComic: _, ...r }) => r));
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}
