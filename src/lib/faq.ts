import { supabase } from "@/lib/supabase";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  priceNote: string | null;
}

export async function fetchFaqs(): Promise<FaqItem[]> {
  const { data, error } = await supabase
    .from("faqs")
    .select("id, question, answer, category, price_note")
    .eq("is_active", true);

  if (error) {
    throw new Error(`Failed to fetch faqs: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    priceNote: row.price_note,
  }));
}
