import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { id, reponse } = await req.json();

    if (!id || !reponse) {
      return NextResponse.json(
        { success: false, error: "Champs manquants" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("transmissions")
      .update({ reponse })
      .eq("id", id);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { success: false, error: "Erreur base de données" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

