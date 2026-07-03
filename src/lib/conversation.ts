import { supabase } from "@/lib/supabase";

export interface ConversationLog {
  id: string;
  lineUserId: string;
  userMessage: string;
  botReply: string | null;
  isResolved: boolean;
  createdAt: string;
}

export async function fetchConversations(): Promise<ConversationLog[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Failed to fetch conversations:", error);
    throw new Error(`Failed to fetch conversations: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    lineUserId: row.line_user_id,
    userMessage: row.user_message,
    botReply: row.bot_reply,
    isResolved: row.is_resolved,
    createdAt: row.created_at,
  }));
}
