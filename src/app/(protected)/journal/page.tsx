"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const citations = [
  "“La mémoire est un jardin que l’on cultive.”",
  "“Rien n’est petit si c’est vrai.”",
  "“Le plus beau voyage est celui qu’on fait en soi.”",
  "“Ce que tu écris aujourd’hui sera précieux demain.”",
];

const humeurOptions = [
  { label: "Heureux(se)", emoji: "😊" },
  { label: "Triste", emoji: "😢" },
  { label: "Reconnaissant(e)", emoji: "🙏" },
  { label: "Fatigué(e)", emoji: "😴" },
  { label: "Inspiré(e)", emoji: "✨" },
];

export default function JournalPage() {
  const [citation, setCitation] = useState("");
  const [note, setNote] = useState("");
  const [humeur, setHumeur] = useState("");

  useEffect(() => {
    const random = Math.floor(Math.random() * citations.length);
    setCitation(citations[random]);
  }, []);

  // Exemple d’entrées fictives
  const entries = [
    {
      date: "24 juin 2025",
      texte: "Aujourd’hui, je me suis senti reconnaissant pour tout ce que j’ai accompli.",
      humeur: "🙏",
    },
    {
      date: "22 juin 2025",
      texte: "Une journée difficile mais pleine d’enseignements.",
      humeur: "😢",
    },
  ];

  return (
    <main className="px-4 py-8 max-w-3xl mx-auto space-y-10">
      {/* Accueil */}
      <section className="text-center animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-title mb-2">
          Mon Carnet de Vie 🌿
        </h1>
        <p className="text-lg text-gray-600">
          Chaque jour, prends quelques instants pour écrire et te souvenir.
        </p>
      </section>

      {/* Citation */}
      <section className="text-center text-lg text-gray-500 italic animate-fade-in-up">
        {citation}
      </section>

      {/* Écriture du jour */}
      <section className="space-y-4 animate-fade-in-up">
        <h2 className="text-xl font-title">Écrire une nouvelle entrée</h2>
        <textarea
          placeholder="Qu’aimerais-tu te rappeler de ce jour ?"
          rows={5}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full p-4 border rounded-lg bg-white shadow focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {humeurOptions.map((option) => (
            <button
              key={option.label}
              onClick={() => setHumeur(option.emoji)}
              className={`px-3 py-1 rounded-full border ${
                humeur === option.emoji
                  ? "bg-[#A78BFA] text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              {option.emoji} {option.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            
            setNote("");
            setHumeur("");
          }}
          className="button-racinae mt-4"
        >
          ✨ Enregistrer mon souvenir
        </button>
      </section>

      {/* Timeline */}
      <section className="space-y-4 animate-fade-in-up">
        <h2 className="text-xl font-title">Mes dernières entrées</h2>
        {entries.map((entry, i) => (
          <div
            key={i}
            className="p-4 bg-white rounded-lg shadow space-y-2"
          >
            <p className="text-sm text-gray-500">{entry.date}</p>
            <p className="text-gray-700">{entry.texte}</p>
            {entry.humeur && (
              <span className="text-xl">{entry.humeur}</span>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}

