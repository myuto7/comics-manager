import { NextResponse } from "next/server";
import { BookSearchResult } from "@/app/type";
import { parseMangaItem } from "@/lib/mangadex";

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

    const data: any = await res.json();

    if (data.result !== "ok" || !data.data) {
      return NextResponse.json([]);
    }

    const results: BookSearchResult[] = data.data
      .map((manga: any) => parseMangaItem(manga))
      .filter(Boolean) as BookSearchResult[];

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}
