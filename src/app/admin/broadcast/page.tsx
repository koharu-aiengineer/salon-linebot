"use client";

import { useState, type FormEvent } from "react";

const MAX_LENGTH = 500;

export default function BroadcastPage() {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (message.trim() === "") {
      setError("お知らせ内容を入力してください。");
      return;
    }

    if (!confirm("友だち全員にお知らせを送信します。よろしいですか？")) {
      return;
    }

    setIsSending(true);

    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error("送信に失敗しました");
      }

      setSuccessMessage("送信しました");
      setMessage("");
    } catch (err) {
      console.error("Failed to send broadcast:", err);
      setError("送信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-xl font-bold text-[#111827]">
          お知らせを送る
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#111827]">
              お知らせ内容
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              maxLength={MAX_LENGTH}
              placeholder="友だち全員に届くお知らせを入力してください"
              className="w-full rounded-md border border-gray-300 p-2 text-[#111827] focus:border-[#06C755] focus:outline-none"
            />
            <p className="mt-1 text-right text-sm text-gray-500">
              {message.length} / {MAX_LENGTH}文字
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {successMessage && (
            <p className="text-sm font-medium text-[#06C755]">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSending}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#06C755] px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isSending ? (
              <>
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                />
                送信中...
              </>
            ) : (
              "送信する"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
