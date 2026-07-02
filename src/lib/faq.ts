import { supabase } from "@/lib/supabase";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  priceNote: string | null;
}

export interface FaqInput {
  question: string;
  answer: string;
  category: string | null;
  priceNote: string | null;
}

export class FaqValidationError extends Error {}

function mapFaqRow(row: {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  price_note: string | null;
}): FaqItem {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    priceNote: row.price_note,
  };
}

export function parseFaqInput(body: unknown): FaqInput {
  if (typeof body !== "object" || body === null) {
    throw new FaqValidationError("Invalid request body");
  }

  const { question, answer, category, priceNote } = body as Record<
    string,
    unknown
  >;

  if (typeof question !== "string" || question.trim() === "") {
    throw new FaqValidationError("question is required");
  }
  if (typeof answer !== "string" || answer.trim() === "") {
    throw new FaqValidationError("answer is required");
  }
  if (
    category !== undefined &&
    category !== null &&
    typeof category !== "string"
  ) {
    throw new FaqValidationError("category must be a string or null");
  }
  if (
    priceNote !== undefined &&
    priceNote !== null &&
    typeof priceNote !== "string"
  ) {
    throw new FaqValidationError("priceNote must be a string or null");
  }

  return {
    question: question.trim(),
    answer: answer.trim(),
    category: typeof category === "string" ? category : null,
    priceNote: typeof priceNote === "string" ? priceNote : null,
  };
}

export async function fetchFaqs(): Promise<FaqItem[]> {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_active", true);

  if (error) {
    console.error("Failed to fetch faqs:", error);
    throw new Error(`Failed to fetch faqs: ${error.message}`);
  }

  return (data ?? []).map(mapFaqRow);
}

export async function fetchFaqById(id: string): Promise<FaqItem | null> {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch faq:", error);
    throw new Error(`Failed to fetch faq: ${error.message}`);
  }

  return data ? mapFaqRow(data) : null;
}

export async function createFaq(input: FaqInput): Promise<FaqItem> {
  const { data, error } = await supabase
    .from("faqs")
    .insert({
      question: input.question,
      answer: input.answer,
      category: input.category,
      price_note: input.priceNote,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Failed to create faq:", error);
    throw new Error(`Failed to create faq: ${error.message}`);
  }

  return mapFaqRow(data);
}

export async function updateFaq(
  id: string,
  input: FaqInput
): Promise<FaqItem> {
  const { data, error } = await supabase
    .from("faqs")
    .update({
      question: input.question,
      answer: input.answer,
      category: input.category,
      price_note: input.priceNote,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Failed to update faq:", error);
    throw new Error(`Failed to update faq: ${error.message}`);
  }

  return mapFaqRow(data);
}

export async function deactivateFaq(id: string): Promise<void> {
  const { error } = await supabase
    .from("faqs")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Failed to deactivate faq:", error);
    throw new Error(`Failed to deactivate faq: ${error.message}`);
  }
}
