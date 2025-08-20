"use client";

import { useState, useRef } from "react";

export default function ChatbotFloatingButton() {
  const [open, setOpen] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "👋 Bonjour ! Je suis Le Gardien du Coffre. Pose-moi toutes tes questions pour t’aider à transmettre, écrire ou structurer tes souvenirs.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function resetChat() {
    setThreadId(null);
    setMessages([
      {
        role: "bot",
        content:
          "👋 Bonjour ! Je suis Le Gardien du Coffre. Pose-moi toutes tes questions pour t’aider à transmettre, écrire ou structurer tes souvenirs.",
      },
    ]);
    setInput("");
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }

  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    const question = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, threadId }),
      });
      const data = await res.json();

      if (data.answer) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: data.answer },
        ]);
        setThreadId(data.threadId || threadId);
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: "Erreur : " + (data.error || "impossible d'obtenir une réponse pour l’instant.") },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "Erreur : impossible d'obtenir une réponse pour l’instant. Réessaie dans quelques instants.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }

  function handleInputResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "44px";
      ta.style.height = ta.scrollHeight + "px";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSend();
    }
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(true)}
        className="fixed z-50 bottom-6 right-5 sm:bottom-8 sm:right-8 bg-gradient-to-r from-[#3969F2] via-[#A78BFA] to-[#F2994A]
          rounded-full shadow-xl p-3 flex items-center justify-center animate-bounce-slow
          hover:scale-105 focus:ring-2 focus:ring-[#A78BFA] transition-all"
        aria-label="Ouvrir Le Gardien du Coffre"
        title="Besoin d’aide ? Le Gardien du Coffre répond à vos questions !"
        style={{ boxShadow: "0 8px 32px 0 #A78BFA44" }}
      >
        <span className="w-8 h-8 block">
          {/* SVG chatbot Racinae */}
          <svg viewBox="0 0 110 120" width="32" height="34" fill="none">
            <ellipse cx="55" cy="44" rx="32" ry="30" fill="#FEF7ED" stroke="#A78BFA" strokeWidth="2"/>
            <ellipse cx="43" cy="43" rx="3" ry="3" fill="#1E2749"/>
            <ellipse cx="67" cy="43" rx="3" ry="3" fill="#1E2749"/>
            <path d="M48 53 Q55 59 62 53" stroke="#F2994A" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
            <ellipse cx="32" cy="22" rx="7" ry="13" fill="#10B981" transform="rotate(-18 32 22)"/>
            <ellipse cx="78" cy="20" rx="7" ry="13" fill="#A78BFA" transform="rotate(16 78 20)"/>
            <ellipse cx="55" cy="80" rx="16" ry="5" fill="#A78BFA33"/>
            <ellipse cx="55" cy="100" rx="22" ry="14" fill="#FEF7ED" stroke="#F2994A" strokeWidth="2"/>
            <path d="M55 114 Q50 120 45 112" stroke="#10B981" strokeWidth="2" fill="none"/>
            <path d="M55 114 Q60 120 65 112" stroke="#F2994A" strokeWidth="2" fill="none"/>
            <path d="M55 62 Q54 60 52 62 Q53 65 55 65 Q57 65 58 62 Q56 60 55 62" fill="#F2994A"/>
          </svg>
        </span>
      </button>

      {/* Fenêtre du chatbot */}
      {open && (
        <div
          className="
            fixed z-50 left-0 right-0
            mx-auto
            w-[96vw] max-w-xs
            min-h-[340px] max-h-[82vh]
            bg-white shadow-2xl border border-[#A78BFA]
            flex flex-col
            rounded-t-2xl
            animate-fade-in
            sm:left-auto sm:right-8 sm:mx-0 sm:w-[380px] sm:max-w-sm sm:rounded-2xl
          "
          style={{
            bottom: '24px',      // décalage du bas sur mobile
            // Sur desktop, Tailwind sm:right-8 + bottom-8 = 32px
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#3969F2] via-[#A78BFA] to-[#F2994A] p-3 flex justify-between items-center rounded-t-2xl">
            <span className="text-white font-bold">Le Gardien du Coffre</span>
            <div className="flex items-center gap-2">
              <button
                onClick={resetChat}
                className="text-white opacity-80 hover:opacity-100 px-2 py-1 text-xs border border-white rounded transition"
                aria-label="Réinitialiser le chat"
                title="Remettre à zéro la conversation"
              >
                🔄
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-white opacity-80 hover:opacity-100 px-2 py-1"
                aria-label="Fermer Le Gardien du Coffre"
              >
                ✕
              </button>
            </div>
          </div>
          {/* Chat historique */}
          <div className="flex-1 bg-white overflow-y-auto px-3 py-2 text-sm flex flex-col gap-3 scrollbar-thin scrollbar-thumb-[#A78BFA33]">
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
                <span
                  className={
                    msg.role === "user"
                      ? "inline-block bg-[#A78BFA22] rounded-xl px-3 py-2 max-w-[90vw] sm:max-w-[320px] break-words"
                      : "inline-block bg-[#F2994A11] rounded-xl px-3 py-2 max-w-[90vw] sm:max-w-[320px] break-words"
                  }
                >
                  {msg.content}
                </span>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-[#A78BFA]">
                Le Gardien du Coffre rédige une réponse…
              </div>
            )}
          </div>
          {/* Zone d'input */}
          <form onSubmit={handleSend} className="p-2 border-t bg-[#F8F3EE] flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              className="flex-1 min-h-[40px] max-h-[100px] rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A78BFA]
                resize-none overflow-auto scrollbar-thin scrollbar-thumb-[#A78BFA33] bg-white"
              placeholder="Écris ici ta requête…"
              value={input}
              onChange={handleInputResize}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
              autoFocus
              style={{ fontSize: "13px" }}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-[#3969F2] via-[#A78BFA] to-[#F2994A] text-white px-4 py-2 rounded-lg font-bold shadow hover:scale-105 transition text-sm"
              disabled={loading || !input.trim()}
            >
              Envoyer
            </button>
          </form>
        </div>
      )}
    </>
  );
}
