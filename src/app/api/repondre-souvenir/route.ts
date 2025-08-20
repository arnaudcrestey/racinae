import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  const { id, reponse } = await req.json();

  const { error } = await supabase
    .from("transmissions")
    .update({ reponse })
    .eq("id", id);

  if (error) return NextResponse.json({ success: false, error }, { status: 500 });
  return NextResponse.json({ success: true });
}
