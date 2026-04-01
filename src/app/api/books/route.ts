import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title");

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${title}&langRestrict=ja&key=${process.env.GOOGLE_BOOKS_API_KEY}`
  );
  const data = await res.json();
  const thumbnail = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail ?? null;

  return NextResponse.json({ thumbnail });
}
