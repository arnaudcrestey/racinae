import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient"; // <-- bon import

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json(null);

  const { data } = await supabase
    .from("transmissions")
    .select("message, photo_url, reponse")
    .eq("id", id)
    .single();

  return NextResponse.json(data);
}
