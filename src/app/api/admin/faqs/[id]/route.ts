import { NextRequest, NextResponse } from "next/server";
import {
  FaqValidationError,
  deactivateFaq,
  parseFaqInput,
  updateFaq,
} from "@/lib/faq";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: unknown = await req.json();
    const input = parseFaqInput(body);
    const faq = await updateFaq(id, input);
    return NextResponse.json({ faq });
  } catch (error) {
    if (error instanceof FaqValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to update faq:", error);
    return NextResponse.json(
      { error: "Failed to update faq" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deactivateFaq(id);
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Failed to deactivate faq:", error);
    return NextResponse.json(
      { error: "Failed to deactivate faq" },
      { status: 500 }
    );
  }
}
