import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID manquant" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("transmissions")
      .select("message, photo_url, reponse")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Erreur base de données" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Souvenir introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
