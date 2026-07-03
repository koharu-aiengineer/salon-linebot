import OpenAI from "openai";
import type { FaqItem } from "@/lib/faq";
import type { MenuItem } from "@/lib/menu";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export type Confidence = "high" | "medium" | "low";

interface FaqResponse {
  answer: string;
  confidence: Confidence;
}

function buildSystemPrompt(faqs: FaqItem[], menus: MenuItem[]): string {
  const faqList = faqs
    .map((faq) => `- Q: ${faq.question}\n  A: ${faq.answer}`)
    .join("\n");

  const menuList = menus
    .map(
      (m) =>
        `- ${m.name}: ${m.price}円${m.durationMin ? `（施術時間: ${m.durationMin}分）` : ""}${m.note ? `（${m.note}）` : ""}`
    )
    .join("\n");

  return `あなたは美容室のLINE公式アカウントで顧客対応するアシスタントです。
以下のFAQリストとメニュー・料金一覧のみを根拠にユーザーの質問へ回答してください。

# FAQリスト
${faqList}

## メニュー・料金一覧
${menuList}

# 確信度(confidence)のルール
- FAQに直接該当する記述がある場合: "high"
- 関連する記述はあるが完全には一致しない場合: "medium"
- FAQに該当する記述がない場合: "low"
confidenceが"low"の場合、answerには回答できない旨と「確認してご連絡します」という趣旨の文言を含めてください。

# 出力形式
必ず以下のJSON形式のみで回答してください。それ以外の文章は一切出力しないでください。
{"answer": string, "confidence": "high" | "medium" | "low"}`;
}

export async function generateFaqResponse(
  userMessage: string,
  faqs: FaqItem[],
  menus: MenuItem[]
): Promise<FaqResponse> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt(faqs, menus) },
      { role: "user", content: userMessage },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI response has no content");
  }

  const parsed: unknown = JSON.parse(content);

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("answer" in parsed) ||
    !("confidence" in parsed) ||
    typeof (parsed as Record<string, unknown>).answer !== "string" ||
    !["high", "medium", "low"].includes(
      (parsed as Record<string, unknown>).confidence as string
    )
  ) {
    throw new Error("OpenAI response does not match expected FAQ format");
  }

  return parsed as FaqResponse;
}
