import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { Comic } from "@/app/type";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.DB_ID!;

export async function GET() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    const data = response.results.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (page: any): Comic => ({
        id: page.id,
        title: page.properties["タイトル"].title[0].text.content ?? "",
        creator: page.properties["入力者"].rich_text[0].text.content ?? "",
        isPurchased: page.properties["購入済み"].checkbox ?? false,
      })
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}

export async function POST(req: Request) {
  const { title, creator } = await req.json();

  try {
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        タイトル: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        入力者: {
          rich_text: [
            {
              text: {
                content: creator,
              },
            },
          ],
        },
        購入済み: {
          checkbox: false,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
