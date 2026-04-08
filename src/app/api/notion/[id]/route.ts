import { NextResponse } from "next/server";
import { getComicById } from "@/lib/notion";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const comic = await getComicById(id);
  if (!comic) return NextResponse.json(null, { status: 404 });

  return NextResponse.json(comic);
}
