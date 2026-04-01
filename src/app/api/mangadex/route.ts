import { NextResponse } from "next/server";
import { BookSearchResult } from "@/app/type";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const url = new URL("https://api.mangadex.org/manga");
    url.searchParams.set("title", query);
    url.searchParams.set("limit", "10");
    url.searchParams.append("includes[]", "cover_art");
    url.searchParams.append("includes[]", "author");
    url.searchParams.append("contentRating[]", "safe");
    url.searchParams.append("contentRating[]", "suggestive");
    url.searchParams.append("originalLanguage[]", "ja");

    const res = await fetch(url.toString());

    if (!res.ok) {
      console.error(`MangaDex API error: ${res.status}`);
      return NextResponse.json([]);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();

    if (data.result !== "ok" || !data.data) {
      return NextResponse.json([]);
    }

    const results: BookSearchResult[] = data.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((manga: any): BookSearchResult | null => {
        const attrs = manga.attributes;

        // altTitlesから日本語タイトルを検索
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const altTitles: Record<string, string>[] = attrs.altTitles ?? [];
        const jaAltTitle =
          altTitles.find((t) => t.ja)?.ja ??
          altTitles.find((t) => t["ja-ro"])?.["ja-ro"];

        // 日本語タイトルを優先、なければ英語、なければ最初のもの
        const title =
          attrs.title?.ja ??
          attrs.title?.["ja-ro"] ??
          jaAltTitle ??
          attrs.title?.en ??
          (Object.values(attrs.title ?? {}) as string[])[0];

        if (!title) return null;

        const authors: string[] = manga.relationships
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((r: any) => r.type === "author")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((r: any) => r.attributes?.name as string | undefined)
          .filter(Boolean);

        const coverRel = manga.relationships.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (r: any) => r.type === "cover_art"
        );
        const fileName: string | undefined = coverRel?.attributes?.fileName;
        const thumbnail = fileName
          ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg`
          : undefined;

        return {
          title,
          authors,
          mangadexUuid: manga.id,
          thumbnail,
        };
      })
      .filter(Boolean) as BookSearchResult[];

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}
