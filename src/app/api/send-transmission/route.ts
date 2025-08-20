// /app/api/send-transmission/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY); // Mets ta clé dans .env.local

export async function POST(req: NextRequest) {
  const { to, subject, html } = await req.json();

  try {
    const data = await resend.emails.send({
  from: 'Racinae  <memoire@racinae.org>',
  to,
  subject,
  html,
  replyTo: 'memoire@racinae.org', // ou ton adresse de réception
});
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, error: e }, { status: 500 });
  }
}