import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const page = (await notion.pages.retrieve({ page_id: id })) as any;
  const comic = {
    id: page.id,
    title: page.properties["タイトル"].title[0].text.content ?? "",
    creator: page.properties["入力者"].rich_text[0]?.text.content ?? "",
    isPurchased: page.properties["購入済み"].checkbox ?? false,
    thumbnail: page.properties["表紙URL"]?.url || null,
    mangadexUuid:
      page.properties["MangaDexUUID"].rich_text[0]?.text.content ?? "",
  };

  return NextResponse.json(comic);
}
