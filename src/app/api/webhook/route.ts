import { NextRequest, NextResponse } from "next/server";
import { LineBotClient, validateSignature, webhook, messagingApi } from "@line/bot-sdk";
import { fetchFaqs } from "@/lib/faq";
import { generateFaqResponse } from "@/lib/openai";
import { supabase } from "@/lib/supabase";

const channelSecret = process.env.LINE_CHANNEL_SECRET!;
const ownerLineUserId = process.env.OWNER_LINE_USER_ID!;

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

    const faqs = await fetchFaqs();

    await Promise.all(
      events.map(async (event) => {
        if (
          event.type !== "message" ||
          event.message.type !== "text" ||
          !event.replyToken
        ) {
          return;
        }

        const userId = event.source?.userId ?? "unknown";
        const userMessage = event.message.text;

        try {
          const { answer, confidence } = await generateFaqResponse(
            userMessage,
            faqs
          );

          const replyMessage: messagingApi.TextMessage = {
            type: "text",
            text: answer,
          };

          await client.replyMessage({
            replyToken: event.replyToken!,
            messages: [replyMessage],
          });

          const isResolved = confidence !== "low";

          const { error: insertError } = await supabase
            .from("conversations")
            .insert({
              line_user_id: userId,
              user_message: userMessage,
              bot_reply: answer,
              is_resolved: isResolved,
            });

          if (insertError) {
            console.error("Failed to record conversation:", insertError);
          }

          if (confidence === "low") {
            await client.pushMessage({
              to: ownerLineUserId,
              messages: [
                {
                  type: "text",
                  text: `【未回答の質問があります】\n質問内容: ${userMessage}\n\n詳細はSupabase管理画面でご確認ください。`,
                },
              ],
            });
          }
        } catch (eventError) {
          console.error("Failed to handle event:", eventError);
        }
      })
    );

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    // LINEの仕様上、エラーでも200を返してリトライを防ぐ
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}
