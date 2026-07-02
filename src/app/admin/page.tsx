"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FaqItem } from "@/lib/faq";

export default function AdminFaqListPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFaqs = async () => {
    try {
      const res = await fetch("/api/admin/faqs");
      if (!res.ok) {
        throw new Error("FAQの取得に失敗しました");
      }
      const data: { faqs: FaqItem[] } = await res.json();
      setFaqs(data.faqs);
      setError(null);
    } catch (err) {
      console.error("Failed to load faqs:", err);
      setError("FAQの取得に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/admin/faqs")
      .then((res) => {
        if (!res.ok) {
          throw new Error("FAQの取得に失敗しました");
        }
        return res.json();
      })
      .then((data: { faqs: FaqItem[] }) => {
        setFaqs(data.faqs);
        setError(null);
      })
      .catch((err: unknown) => {
        console.error("Failed to load faqs:", err);
        setError("FAQの取得に失敗しました。時間をおいて再度お試しください。");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleDeactivate = async (id: string) => {
    if (!confirm("このFAQを無効化しますか？")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("無効化に失敗しました");
      }
      await loadFaqs();
    } catch (err) {
      console.error("Failed to deactivate faq:", err);
      alert("無効化に失敗しました。時間をおいて再度お試しください。");
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#111827]">FAQ一覧</h1>
          <Link
            href="/admin/faq/new"
            className="rounded-md bg-[#06C755] px-4 py-2 text-sm font-semibold text-white"
          >
            新規追加
          </Link>
        </div>

        {isLoading && <p className="text-[#111827]">読み込み中...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!isLoading && !error && faqs.length === 0 && (
          <p className="text-[#111827]">FAQがありません。</p>
        )}

        <ul className="space-y-3">
          {faqs.map((faq) => (
            <li key={faq.id} className="rounded-lg bg-white p-4 shadow-sm">
              <p className="font-semibold text-[#111827]">{faq.question}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-[#111827]">
                {faq.answer}
              </p>
              {faq.category && (
                <span className="mt-2 inline-block rounded-full bg-[#06C755]/10 px-2 py-1 text-xs text-[#06C755]">
                  {faq.category}
                </span>
              )}
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/admin/faq/${faq.id}`}
                  className="rounded-md border border-[#06C755] px-3 py-1.5 text-sm text-[#06C755]"
                >
                  編集
                </Link>
                <button
                  type="button"
                  onClick={() => handleDeactivate(faq.id)}
                  className="rounded-md border border-red-500 px-3 py-1.5 text-sm text-red-500"
                >
                  無効化
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
