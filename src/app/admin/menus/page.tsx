"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { MenuItem } from "@/lib/menu";

export default function AdminMenuListPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMenus = async () => {
    try {
      const res = await fetch("/api/admin/menus");
      if (!res.ok) {
        throw new Error("メニューの取得に失敗しました");
      }
      const data: { menus: MenuItem[] } = await res.json();
      setMenus(data.menus);
      setError(null);
    } catch (err) {
      console.error("Failed to load menus:", err);
      setError(
        "メニューの取得に失敗しました。時間をおいて再度お試しください。"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/admin/menus")
      .then((res) => {
        if (!res.ok) {
          throw new Error("メニューの取得に失敗しました");
        }
        return res.json();
      })
      .then((data: { menus: MenuItem[] }) => {
        setMenus(data.menus);
        setError(null);
      })
      .catch((err: unknown) => {
        console.error("Failed to load menus:", err);
        setError(
          "メニューの取得に失敗しました。時間をおいて再度お試しください。"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleDeactivate = async (id: string) => {
    if (!confirm("このメニューを無効化しますか？")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/menus/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("無効化に失敗しました");
      }
      await loadMenus();
    } catch (err) {
      console.error("Failed to deactivate menu:", err);
      alert("無効化に失敗しました。時間をおいて再度お試しください。");
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#111827]">
            メニュー・料金一覧
          </h1>
          <Link
            href="/admin/menus/new"
            className="flex h-11 items-center rounded-md bg-[#06C755] px-4 text-sm font-semibold text-white"
          >
            新規追加
          </Link>
        </div>

        {isLoading && <p className="text-[#111827]">読み込み中...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!isLoading && !error && menus.length === 0 && (
          <p className="text-[#111827]">メニューがありません。</p>
        )}

        <ul className="space-y-3">
          {menus.map((menu) => (
            <li key={menu.id} className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[#111827]">{menu.name}</p>
                <p className="font-semibold text-[#06C755]">
                  ¥{menu.price.toLocaleString()}
                </p>
              </div>
              <p className="mt-1 text-sm text-[#111827]">
                施術時間: {menu.durationMin}分
              </p>
              {menu.note && (
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-500">
                  {menu.note}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/admin/menus/${menu.id}`}
                  className="flex h-11 items-center rounded-md border border-[#06C755] px-3 text-sm text-[#06C755]"
                >
                  編集
                </Link>
                <button
                  type="button"
                  onClick={() => handleDeactivate(menu.id)}
                  className="flex h-11 items-center rounded-md border border-red-500 px-3 text-sm text-red-500"
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
