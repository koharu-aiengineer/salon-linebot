import FaqForm from "@/app/admin/_components/faq-form";

export default function NewFaqPage() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] p-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-xl font-bold text-[#111827]">
          FAQ新規追加
        </h1>
        <FaqForm mode="create" />
      </div>
    </main>
  );
}
