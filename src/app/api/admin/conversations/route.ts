import { NextResponse } from "next/server";
import { fetchConversations } from "@/lib/conversation";

export async function GET() {
  try {
    const conversations = await fetchConversations();
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
