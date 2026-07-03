import { notFound } from "next/navigation";
import MenuForm from "@/app/admin/_components/menu-form";
import { fetchMenuById, type MenuItem } from "@/lib/menu";

export default async function EditMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let menu: MenuItem | null;

  try {
    menu = await fetchMenuById(id);
  } catch (error) {
    console.error("Failed to load menu:", error);
    return (
      <main className="min-h-screen bg-[#F9FAFB] p-4">
        <p className="text-sm text-red-600">
          メニューの読み込みに失敗しました。時間をおいて再度お試しください。
        </p>
      </main>
    );
  }

  if (!menu) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-xl font-bold text-[#111827]">
          メニュー編集
        </h1>
        <MenuForm mode="edit" initialMenu={menu} />
      </div>
    </main>
  );
}
