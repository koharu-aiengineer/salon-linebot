import { NextRequest, NextResponse } from "next/server";
import { LineBotClient, validateSignature, webhook, messagingApi } from "@line/bot-sdk";

const channelSecret = process.env.LINE_CHANNEL_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-line-signature") ?? "";

    if (!validateSignature(body, channelSecret, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { events }: { events: webhook.Event[] } = JSON.parse(body);

    const client = LineBotClient.fromChannelAccessToken({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
    });

    await Promise.all(
      events.map(async (event) => {
        console.log('userId:', event.source?.userId);

        if (
          event.type !== "message" ||
          event.message.type !== "text" ||
          !event.replyToken
        ) {
          return;
        }

        const replyMessage: messagingApi.TextMessage = {
          type: "text",
          text: event.message.text,
        };

        await client.replyMessage({
          replyToken: event.replyToken,
          messages: [replyMessage],
        });
      })
    );

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    // LINEの仕様上、エラーでも200を返してリトライを防ぐ
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}
