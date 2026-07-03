import { NextRequest, NextResponse } from "next/server";
import { lineClient } from "@/lib/line";

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    const { message } = body as Record<string, unknown>;

    if (typeof message !== "string" || message.trim() === "") {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    await lineClient.broadcast({
      messages: [{ type: "text", text: message }],
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Failed to broadcast message:", error);
    return NextResponse.json(
      { error: "Failed to broadcast message" },
      { status: 500 }
    );
  }
}
