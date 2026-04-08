import { getComicById } from "@/lib/notion";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const comic = await getComicById(id);
  if (!comic) return NextResponse.json(null, { status: 404 });

  return NextResponse.json(comic);
}
