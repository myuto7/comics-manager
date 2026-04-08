import { BookSearchResult } from "@/app/type";

export function parseMangaItem(manga: any): BookSearchResult | null {
  const attrs = manga.attributes;

  // altTitlesから日本語タイトルを検索
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
    .filter((r: any) => r.type === "author")
    .map((r: any) => r.attributes?.name as string | undefined)
    .filter(Boolean);

  const coverRel = manga.relationships.find((r: any) => r.type === "cover_art");
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
}

export async function getMangaDescription(
  uuid: string
): Promise<string | null> {
  const url = new URL(`https://api.mangadex.org/manga/${uuid}`);
  url.searchParams.append("includes[]", "cover_art");
  const res = await fetch(url.toString());
  const data: any = await res.json();
  const attrs = data.data?.attributes;
  return attrs?.description?.ja ?? attrs?.description?.en ?? null;
}
