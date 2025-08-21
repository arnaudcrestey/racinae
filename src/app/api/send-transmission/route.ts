// /app/api/send-transmission/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!); // Clé API Resend

export async function POST(req: NextRequest) {
  try {
    const { to, subject, message, imageUrl } = await req.json();

    // Vérifications
    if (!to || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Champs requis manquants (to, subject, message)" },
        { status: 400 }
      );
    }

    // Contenu HTML de l’email avec tes phrases inspirantes incluses
    const html = `
      <div style="font-family: Arial, sans-serif; text-align:center; color:#333;">
        <h2 style="color:#1E2749;">Vous avez reçu un souvenir précieux 💌 </h2>
        <p style="font-size:16px; color:#444; margin-top:12px;">${message}</p>

        ${
          imageUrl
            ? `<img src="${imageUrl}" alt="souvenir" width="420" style="border-radius:12px; margin-top:16px; box-shadow:0 4px 12px rgba(0,0,0,0.15);" />`
            : ""
        }

        <p style="margin-top:32px;font-size:1em;color:#1E2749;font-style:italic;">
          Ce souvenir vous est offert avec tout le cœur de la personne qui pense à vous.<br>
          Il n’attend rien en retour, si ce n’est un sourire ou une pensée douce🌷.
        </p>

        <p style="color:#A78BFA;margin-top:24px;font-size:0.97em;">
          Racinae, là où chaque souvenir a une maison.<br>
          <a href="https://racinae.org" style="color:#2563eb;text-decoration:underline;font-weight:bold;">
            Découvrez notre univers
          </a> et commencez à écrire votre propre histoire.
        </p>
      </div>
    `;

    // Envoi via ton domaine officiel validé
    const data = await resend.emails.send({
      from: "Racinae <memoire@racinae.org>", // ✅ domaine validé
      to,
      subject,
      html,
      replyTo: "memoire@racinae.org",
    });

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    console.error("Erreur Resend:", e);
    return NextResponse.json(
      { success: false, error: e.message || JSON.stringify(e) },
      { status: 500 }
    );
  }
}
