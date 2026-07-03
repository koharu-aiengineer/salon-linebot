"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { MenuItem } from "@/lib/menu";

interface MenuFormProps {
  mode: "create" | "edit";
  initialMenu?: MenuItem;
}

export default function MenuForm({ mode, initialMenu }: MenuFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialMenu?.name ?? "");
  const [price, setPrice] = useState(
    initialMenu ? String(initialMenu.price) : ""
  );
  const [durationMin, setDurationMin] = useState(
    initialMenu ? String(initialMenu.durationMin) : ""
  );
  const [note, setNote] = useState(initialMenu?.note ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url =
        mode === "create"
          ? "/api/admin/menus"
          : `/api/admin/menus/${initialMenu?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          durationMin: Number(durationMin),
          note: note.trim() === "" ? null : note.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("保存に失敗しました");
      }

      router.push("/admin/menus");
      router.refresh();
    } catch (err) {
      console.error("Failed to save menu:", err);
      setError("保存に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-[#111827]">
          メニュー名
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-md border border-gray-300 p-2 text-[#111827] focus:border-[#06C755] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[#111827]">
          料金(円)
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min={0}
          className="w-full rounded-md border border-gray-300 p-2 text-[#111827] focus:border-[#06C755] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[#111827]">
          施術時間(分)
        </label>
        <input
          type="number"
          value={durationMin}
          onChange={(e) => setDurationMin(e.target.value)}
          required
          min={1}
          className="w-full rounded-md border border-gray-300 p-2 text-[#111827] focus:border-[#06C755] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[#111827]">
          備考
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-md border border-gray-300 p-2 text-[#111827] focus:border-[#06C755] focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-11 items-center rounded-md bg-[#06C755] px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          {mode === "create" ? "追加" : "保存"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/menus")}
          className="flex h-11 items-center rounded-md border border-gray-300 px-4 text-sm text-[#111827]"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
