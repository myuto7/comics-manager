import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;
  const url = new URL(`https://api.mangadex.org/manga/${uuid}`);
  url.searchParams.append("includes[]", "cover_art");

  const res = await fetch(url.toString());
  const data: any = await res.json();
  const attrs = data.data?.attributes;

  const description = attrs?.description?.ja ?? attrs?.description?.en ?? null;

  return NextResponse.json({ description });
}
