import { NextRequest, NextResponse } from "next/server";
import {
  MenuValidationError,
  deactivateMenu,
  parseMenuInput,
  updateMenu,
} from "@/lib/menu";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: unknown = await req.json();
    const input = parseMenuInput(body);
    const menu = await updateMenu(id, input);
    return NextResponse.json({ menu });
  } catch (error) {
    if (error instanceof MenuValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to update menu:", error);
    return NextResponse.json(
      { error: "Failed to update menu" },
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
    await deactivateMenu(id);
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Failed to deactivate menu:", error);
    return NextResponse.json(
      { error: "Failed to deactivate menu" },
      { status: 500 }
    );
  }
}
