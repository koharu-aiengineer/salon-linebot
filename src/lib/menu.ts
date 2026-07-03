import { supabase } from "@/lib/supabase";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  durationMin: number;
  note: string | null;
}

export interface MenuInput {
  name: string;
  price: number;
  durationMin: number;
  note: string | null;
}

export class MenuValidationError extends Error {}

function mapMenuRow(row: {
  id: string;
  name: string;
  price: number;
  duration_min: number;
  note: string | null;
}): MenuItem {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    durationMin: row.duration_min,
    note: row.note,
  };
}

export function parseMenuInput(body: unknown): MenuInput {
  if (typeof body !== "object" || body === null) {
    throw new MenuValidationError("Invalid request body");
  }

  const { name, price, durationMin, note } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim() === "") {
    throw new MenuValidationError("name is required");
  }
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    throw new MenuValidationError("price must be a non-negative number");
  }
  if (
    typeof durationMin !== "number" ||
    !Number.isFinite(durationMin) ||
    durationMin <= 0
  ) {
    throw new MenuValidationError("durationMin must be a positive number");
  }
  if (note !== undefined && note !== null && typeof note !== "string") {
    throw new MenuValidationError("note must be a string or null");
  }

  return {
    name: name.trim(),
    price,
    durationMin,
    note: typeof note === "string" ? note : null,
  };
}

export async function fetchMenus(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .eq("is_active", true);

  if (error) {
    console.error("Failed to fetch menus:", error);
    throw new Error(`Failed to fetch menus: ${error.message}`);
  }

  return (data ?? []).map(mapMenuRow);
}

export async function fetchMenuById(id: string): Promise<MenuItem | null> {
  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch menu:", error);
    throw new Error(`Failed to fetch menu: ${error.message}`);
  }

  return data ? mapMenuRow(data) : null;
}

export async function createMenu(input: MenuInput): Promise<MenuItem> {
  const { data, error } = await supabase
    .from("menus")
    .insert({
      name: input.name,
      price: input.price,
      duration_min: input.durationMin,
      note: input.note,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Failed to create menu:", error);
    throw new Error(`Failed to create menu: ${error.message}`);
  }

  return mapMenuRow(data);
}

export async function updateMenu(
  id: string,
  input: MenuInput
): Promise<MenuItem> {
  const { data, error } = await supabase
    .from("menus")
    .update({
      name: input.name,
      price: input.price,
      duration_min: input.durationMin,
      note: input.note,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Failed to update menu:", error);
    throw new Error(`Failed to update menu: ${error.message}`);
  }

  return mapMenuRow(data);
}

export async function deactivateMenu(id: string): Promise<void> {
  const { error } = await supabase
    .from("menus")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Failed to deactivate menu:", error);
    throw new Error(`Failed to deactivate menu: ${error.message}`);
  }
}
