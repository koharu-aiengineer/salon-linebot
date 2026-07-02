import { NextRequest, NextResponse } from "next/server";
import {
  FaqValidationError,
  createFaq,
  fetchFaqs,
  parseFaqInput,
} from "@/lib/faq";

export async function GET() {
  try {
    const faqs = await fetchFaqs();
    return NextResponse.json({ faqs });
  } catch (error) {
    console.error("Failed to fetch faqs:", error);
    return NextResponse.json(
      { error: "Failed to fetch faqs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const input = parseFaqInput(body);
    const faq = await createFaq(input);
    return NextResponse.json({ faq }, { status: 201 });
  } catch (error) {
    if (error instanceof FaqValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to create faq:", error);
    return NextResponse.json(
      { error: "Failed to create faq" },
      { status: 500 }
    );
  }
}
