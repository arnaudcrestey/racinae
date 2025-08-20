import { NextRequest, NextResponse } from "next/server";

const ASSISTANT_ID = "asst_pYRQnqo5B6XvpC9cyYHzuHt9";

const openaiHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  "OpenAI-Beta": "assistants=v2",
};

export async function POST(req: NextRequest) {
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { question, threadId: incomingThreadId } = body;
  if (!question) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  try {
    let threadId = incomingThreadId;
    // 1. Crée un thread si besoin
    if (!threadId) {
      const threadRes = await fetch("https://api.openai.com/v1/threads", {
        method: "POST",
        headers: openaiHeaders,
      });
      const threadData = await threadRes.json();
      console.log("THREAD DATA", threadData);
      if (threadData.error) {
        return NextResponse.json({ error: "Erreur création thread", detail: threadData }, { status: 500 });
      }
      threadId = threadData.id;
    }

    // 2. Ajoute le message utilisateur
    const msgRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers: openaiHeaders,
      body: JSON.stringify({
        role: "user",
        content: question,
      }),
    });
    const msgData = await msgRes.json();
    console.log("MESSAGE DATA", msgData);
    if (msgData.error) {
      return NextResponse.json({ error: "Erreur ajout message", detail: msgData }, { status: 500 });
    }

    // 3. Lance un run
    const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: openaiHeaders,
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
      }),
    });
    const runData = await runRes.json();
    console.log("RUN DATA", runData);
    if (runData.error) {
      return NextResponse.json({ error: "Erreur run", detail: runData }, { status: 500 });
    }
    const runId = runData.id;

    // 4. Polling jusqu'à réponse dispo
    let answer = "";
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const statusRes = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
        {
          headers: openaiHeaders,
        }
      );
      const statusData = await statusRes.json();
      console.log("STATUS DATA", statusData);
      if (statusData.error) {
        return NextResponse.json({ error: "Erreur status run", detail: statusData }, { status: 500 });
      }
      if (statusData.status === "completed") {
        const msgRes = await fetch(
          `https://api.openai.com/v1/threads/${threadId}/messages?order=desc&limit=5`,
          {
            headers: openaiHeaders,
          }
        );
        const msgData = await msgRes.json();
        console.log("MESSAGES DATA", msgData);
        if (msgData.error) {
          return NextResponse.json({ error: "Erreur récupération messages", detail: msgData }, { status: 500 });
        }
        const last = msgData.data.find(
          (m: any) => m.role === "assistant" && m.run_id === runId
        );
        answer =
          last?.content?.[0]?.text?.value ||
          "Désolé, je n'ai pas compris. Reformule ou précise ta question.";
        break;
      } else if (statusData.status === "failed" || statusData.status === "expired") {
        answer = "Désolé, une erreur technique est survenue. Réessaie plus tard.";
        break;
      }
    }

    if (!answer)
      answer = "Désolé, je n'ai pas pu obtenir de réponse pour l’instant.";

    return NextResponse.json({ answer, threadId });
  } catch (error) {
    console.error("Erreur assistant API:", error);
    return NextResponse.json({ error: "Erreur côté serveur.", detail: String(error) }, { status: 500 });
  }
}
