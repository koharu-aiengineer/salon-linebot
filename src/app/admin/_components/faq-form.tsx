"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { FaqItem } from "@/lib/faq";

interface FaqFormProps {
  mode: "create" | "edit";
  initialFaq?: FaqItem;
}

export default function FaqForm({ mode, initialFaq }: FaqFormProps) {
  const router = useRouter();
  const [question, setQuestion] = useState(initialFaq?.question ?? "");
  const [answer, setAnswer] = useState(initialFaq?.answer ?? "");
  const [category, setCategory] = useState(initialFaq?.category ?? "");
  const [priceNote, setPriceNote] = useState(initialFaq?.priceNote ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url =
        mode === "create" ? "/api/admin/faqs" : `/api/admin/faqs/${initialFaq?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          answer,
          category: category.trim() === "" ? null : category.trim(),
          priceNote: priceNote.trim() === "" ? null : priceNote.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("保存に失敗しました");
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error("Failed to save faq:", err);
      setError("保存に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-[#111827]">
          質問
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          className="w-full rounded-md border border-gray-300 p-2 text-[#111827] focus:border-[#06C755] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[#111827]">
          回答
        </label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
          rows={5}
          className="w-full rounded-md border border-gray-300 p-2 text-[#111827] focus:border-[#06C755] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[#111827]">
          カテゴリ
        </label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-gray-300 p-2 text-[#111827] focus:border-[#06C755] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[#111827]">
          料金備考
        </label>
        <input
          type="text"
          value={priceNote}
          onChange={(e) => setPriceNote(e.target.value)}
          className="w-full rounded-md border border-gray-300 p-2 text-[#111827] focus:border-[#06C755] focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-[#06C755] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {mode === "create" ? "追加" : "保存"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-[#111827]"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
