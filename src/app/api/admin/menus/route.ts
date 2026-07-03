import { NextRequest, NextResponse } from "next/server";
import {
  MenuValidationError,
  createMenu,
  fetchMenus,
  parseMenuInput,
} from "@/lib/menu";

export async function GET() {
  try {
    const menus = await fetchMenus();
    return NextResponse.json({ menus });
  } catch (error) {
    console.error("Failed to fetch menus:", error);
    return NextResponse.json(
      { error: "Failed to fetch menus" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const input = parseMenuInput(body);
    const menu = await createMenu(input);
    return NextResponse.json({ menu }, { status: 201 });
  } catch (error) {
    if (error instanceof MenuValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to create menu:", error);
    return NextResponse.json(
      { error: "Failed to create menu" },
      { status: 500 }
    );
  }
}
