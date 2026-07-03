import MenuForm from "@/app/admin/_components/menu-form";

export default function NewMenuPage() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] p-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-xl font-bold text-[#111827]">
          メニュー新規追加
        </h1>
        <MenuForm mode="create" />
      </div>
    </main>
  );
}
