"use client";

import { useEffect, useState } from "react";
import type { ConversationLog } from "@/lib/conversation";

export default function AdminConversationsPage() {
  const [conversations, setConversations] = useState<ConversationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/conversations")
      .then((res) => {
        if (!res.ok) {
          throw new Error("会話ログの取得に失敗しました");
        }
        return res.json();
      })
      .then((data: { conversations: ConversationLog[] }) => {
        setConversations(data.conversations);
        setError(null);
      })
      .catch((err: unknown) => {
        console.error("Failed to load conversations:", err);
        setError(
          "会話ログの取得に失敗しました。時間をおいて再度お試しください。"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-xl font-bold text-[#111827]">会話ログ</h1>

        {isLoading && <p className="text-[#111827]">読み込み中...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!isLoading && !error && conversations.length === 0 && (
          <p className="text-[#111827]">会話ログがありません。</p>
        )}

        <ul className="space-y-3">
          {conversations.map((c) => (
            <li
              key={c.id}
              className={`rounded-lg bg-white p-4 shadow-sm ${
                c.isResolved ? "" : "border-l-4 border-red-500 bg-red-50"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span
                  className={
                    c.isResolved
                      ? "rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600"
                      : "rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white"
                  }
                >
                  {c.isResolved ? "対応済み" : "未対応"}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(c.createdAt).toLocaleString("ja-JP")}
                </span>
              </div>
              <p className="text-sm text-[#111827]">
                <span className="font-medium">お客様: </span>
                {c.userMessage}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-[#111827]">
                <span className="font-medium">bot: </span>
                {c.botReply ?? "(返答なし)"}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
