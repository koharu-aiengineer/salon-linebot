import { notFound } from "next/navigation";
import FaqForm from "@/app/admin/_components/faq-form";
import { fetchFaqById, type FaqItem } from "@/lib/faq";

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let faq: FaqItem | null;

  try {
    faq = await fetchFaqById(id);
  } catch (error) {
    console.error("Failed to load faq:", error);
    return (
      <main className="min-h-screen bg-[#F9FAFB] p-4">
        <p className="text-sm text-red-600">
          FAQの読み込みに失敗しました。時間をおいて再度お試しください。
        </p>
      </main>
    );
  }

  if (!faq) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-xl font-bold text-[#111827]">FAQ編集</h1>
        <FaqForm mode="edit" initialFaq={faq} />
      </div>
    </main>
  );
}
