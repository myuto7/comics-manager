import { Comic } from "@/app/type";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.DB_ID!;

// SQS クライアントの初期化
const sqsClient = new SQSClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    const data = response.results.map(
      (page: any): Comic => ({
        id: page.id,
        title: page.properties["タイトル"].title[0].text.content ?? "",
        creator: page.properties["入力者"].rich_text[0].text.content ?? "",
        isPurchased: page.properties["購入済み"].checkbox ?? false,
        mangadexUuid:
          page.properties["MangaDexUUID"]?.rich_text[0]?.text?.content ||
          undefined,
        thumbnail: page.properties["表紙URL"]?.url || undefined,
      })
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}

export async function POST(req: Request) {
  const { title, creator, mangadexUuid, thumbnail } = await req.json();

  try {
    // Notionに登録
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
        MangaDexUUID: {
          rich_text: [
            {
              text: {
                content: mangadexUuid ?? "",
              },
            },
          ],
        },
        表紙URL: {
          url: thumbnail || null,
        },
      },
    });

    // SQSにメッセージを送信（LINE通知用）
    if (process.env.NOTIFICATIONS_ENABLED === "true") {
      const command = new SendMessageCommand({
        QueueUrl: process.env.AWS_SQS_QUEUE_URL!,
        MessageBody: JSON.stringify({
          type: "register",
          title,
          creator,
          mangadexUuid,
          thumbnail,
        }),
      });

      await sqsClient.send(command);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { id, title, isPurchased } = await req.json();

  await notion.pages.update({
    page_id: id,
    properties: {
      購入済み: {
        checkbox: isPurchased,
      },
    },
  });

  if (process.env.NOTIFICATIONS_ENABLED === "true") {
    const command = new SendMessageCommand({
      QueueUrl: process.env.AWS_SQS_QUEUE_URL!,
      MessageBody: JSON.stringify({
        type: "purchase",
        title,
      }),
    });

    await sqsClient.send(command);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  await notion.pages.update({
    page_id: id,
    archived: true,
  });

  return NextResponse.json({ success: true });
}
