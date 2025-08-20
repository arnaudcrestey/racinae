import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import 'dotenv/config';

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // 1. Récupérer toutes les capsules à envoyer aujourd'hui et pas encore envoyées
  const { data: capsules = [], error } = await supabase
    .from('time_capsules')
    .select('*')
    .eq('send_date', today)
    .eq('sent', false);

  if (error) {
    console.error('Erreur lecture BDD', error);
    return;
  }

  if (!capsules.length) {
    console.log("Aucune capsule à envoyer aujourd'hui");
    return;
  }
  console.log('Capsules à envoyer:', capsules);

  for (const c of capsules) {
    // 2. Envoi du mail via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Racinae <no-reply@racinae.org>',
        to: c.recipient_email,
        subject: '💌 Un message précieux t’attend sur Racinae',
        html: `
          <h2 style="color:#A78BFA;">💌 Un souvenir du passé vient de t’être confié…</h2>
          <p>${c.recipient_name} t’a écrit un message à ouvrir aujourd’hui, via Racinae.<br/><br/>
          <b>Message :</b><br/>${c.content || "<i>(Voir contenu photo, audio ou vidéo joint)</i>"}</p>
          ${c.photo_url ? `<img src="${c.photo_url}" alt="Photo capsule" style="max-width:250px;border-radius:12px;margin-top:10px;" />` : ""}
          <br><br>
          <a href="https://www.racinae.com/ouvrir-capsule/${c.id}" style="background:#2563EB;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Découvrir la capsule sur Racinae</a>
          <br><br>
          <span style="font-size:12px;color:#666;">Racinae - la mémoire a une maison<br/>
          “Chaque souvenir est une graine pour l’avenir.”</span>
        `,
      }),
    });

    if (response.ok) {
      await supabase
        .from('time_capsules')
        .update({ sent: true })
        .eq('id', c.id);
      console.log(`Capsule ${c.id} envoyée à ${c.recipient_email}`);
    } else {
      const errorText = await response.text();
      console.error(`Erreur envoi mail pour capsule ${c.id} :`, errorText);
    }
  }
}

main().then(() => process.exit());
