"use client";

import { useState, useEffect, useRef } from "react";
import type { BenefitPlan } from "@/types";
import cachedPlan from "@/data/cached/plan-rodriguez.json";

export default function FamilyPage() {
  const [plan, setPlan] = useState<BenefitPlan | null>(null);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [asking, setAsking] = useState(false);
  const [lang, setLang] = useState<"es" | "en">("es");
  const inputRef = useRef<HTMLInputElement>(null);

const QUICK_QUESTIONS: Record<"es" | "en", string[]> = {
  es: ["¿Puedo comprar pollo caliente con EBT?", "¿Qué frutas duplican mi dinero en Safeway?", "¿Cuándo vence mi WIC?"],
  en: ["Can I buy hot food with EBT?", "What produce doubles my money at Safeway?", "When does my WIC expire?"],
};

  useEffect(() => {
    const stored = localStorage.getItem("savorbridge-plan");
    if (stored) {
      try { setPlan(JSON.parse(stored)); return; } catch { /* fall through */ }
    }
    setPlan(cachedPlan as BenefitPlan);
  }, []);

  async function askQuestion(q: string) {
    if (!q.trim()) return;
    setAsking(true);
    setAnswer("");
    try {
      const res = await fetch("/api/voice-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, language: lang === "es" ? "es-US" : "en-US", familyId: "rodriguez" }),
      });
      const data = await res.json();
      setAnswer(data.answer ?? "");
      if (data.answer && typeof window !== "undefined" && "speechSynthesis" in window) {
        const utt = new SpeechSynthesisUtterance(data.answer);
        utt.lang = lang === "es" ? "es-US" : "en-US";
        window.speechSynthesis.speak(utt);
      }
    } finally {
      setAsking(false);
    }
  }

  function startListening() {
    const SR = (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (!SR) { inputRef.current?.focus(); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SR as new () => any)()
    recognition.lang = lang === "es" ? "es-US" : "en-US";
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setQuery(transcript);
      askQuestion(transcript);
    };
    recognition.start();
  }

  if (!plan) return <div className="flex items-center justify-center min-h-screen text-gray-400">Cargando...</div>;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-md mx-auto flex flex-col min-h-screen">

        {/* Header */}
        <div className="bg-[#1F3A5F] text-white px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">🌉 SavorBridge</h1>
            <p className="text-xs opacity-70">Plan de Beneficios · Rosa Rodríguez</p>
          </div>
          <button
            onClick={() => setLang(l => l === "es" ? "en" : "es")}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors font-semibold">
            {lang === "es" ? "🇸🇻 ES" : "🇺🇸 EN"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-32">

          {/* Monthly summary */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              {lang === "es" ? "Este mes tienes" : "Your benefits this month"}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#1F3A5F] text-white rounded-xl p-3 text-center">
                <p className="text-xs opacity-60 mb-0.5">SNAP</p>
                <p className="text-xl font-bold">${plan.monthlySummary.snapAmount}</p>
              </div>
              <div className="bg-green-600 text-white rounded-xl p-3 text-center">
                <p className="text-xs opacity-60 mb-0.5">WIC</p>
                <p className="text-xl font-bold">${plan.monthlySummary.wicValue}</p>
              </div>
              <div className="bg-emerald-500 text-white rounded-xl p-3 text-center">
                <p className="text-xs opacity-60 mb-0.5">{lang === "es" ? "Total" : "Total"}</p>
                <p className="text-xl font-bold">${plan.monthlySummary.totalFoodBudget}</p>
              </div>
            </div>
          </div>

          {/* WIC expiration warnings */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              {lang === "es" ? "Artículos WIC — ¡No los pierdas!" : "WIC Items — Don't lose them!"}
            </p>
            <div className="space-y-2">
              {plan.wicPriorities.map((item, i) => (
                <div key={i} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                  item.urgency === "high" ? "bg-red-50 border border-red-200"
                  : item.urgency === "medium" ? "bg-yellow-50 border border-yellow-200"
                  : "bg-gray-50 border border-gray-100"}`}>
                  <span className="text-xl">{item.urgency === "high" ? "🔴" : item.urgency === "medium" ? "🟡" : "🟢"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{item.category}</p>
                    <p className="text-xs text-gray-500">{item.quantity}</p>
                  </div>
                  {item.urgency === "high" && (
                    <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full shrink-0">
                      {lang === "es" ? "¡Vence pronto!" : "Expires soon!"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Shopping route */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              {lang === "es" ? "🗺️ Dónde comprar" : "🗺️ Where to shop"}
            </p>
            <div className="space-y-2">
              {plan.shoppingRoute.map((stop, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start gap-2">
                    <span className="bg-[#1F3A5F] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{stop.storeName}</p>
                      <p className="text-xs text-gray-400">{stop.address}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {stop.doubleUpEligible && (
                          <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                            💰 Double Up 2x
                          </span>
                        )}
                        {stop.wicAccepted && (
                          <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">WIC ✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recipes */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              {lang === "es" ? "🍽️ Recetas con tus beneficios" : "🍽️ Recipes using your benefits"}
            </p>
            <div className="space-y-2">
              {plan.recipes.map((r, i) => (
                <div key={i} className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="font-bold text-gray-800">{r.name}</p>
                  {r.nameTranslated && <p className="text-xs text-gray-400 mb-1">{r.nameTranslated}</p>}
                  <p className="text-sm text-gray-600">{r.description}</p>
                  <p className="text-xs text-gray-400 mt-1">⏱️ {r.prepTimeMinutes} min · {r.servings} {lang === "es" ? "porciones" : "servings"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          {plan.tips && plan.tips.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                💡 {lang === "es" ? "Consejos del mes" : "Tips this month"}
              </p>
              <div className="space-y-2">
                {plan.tips.map((tip, i) => (
                  <p key={i} className="text-sm text-gray-700 bg-green-50 rounded-xl px-4 py-3 leading-relaxed">{tip}</p>
                ))}
              </div>
            </div>
          )}

          {/* Voice answer */}
          {answer && (
            <div className="bg-[#1F3A5F] text-white rounded-2xl p-4">
              <p className="text-xs opacity-60 mb-1">{lang === "es" ? "Respuesta:" : "Answer:"}</p>
              <p className="text-sm leading-relaxed">{answer}</p>
            </div>
          )}

          {/* Quick questions */}
          <div className="pb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              {lang === "es" ? "Preguntas frecuentes" : "Common questions"}
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS[lang].map((q) => (
                <button
                  key={q}
                  onClick={() => { setQuery(q); askQuestion(q); }}
                  className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-full px-3 py-1.5 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Voice Q&A bar — fixed bottom */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center">
          <div className="w-full max-w-md bg-white border-t border-gray-100 px-4 py-3 shadow-lg">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askQuestion(query)}
                placeholder={lang === "es" ? "Pregúntame algo…" : "Ask me anything…"}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1F3A5F]"
              />
              <button
                onClick={startListening}
                disabled={asking}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  listening ? "bg-red-500 animate-pulse" : "bg-[#1F3A5F] hover:bg-[#162d4a]"
                } text-white text-xl shrink-0`}>
                {asking ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "🎤"}
              </button>
              <button
                onClick={() => askQuestion(query)}
                disabled={asking || !query.trim()}
                className="w-12 h-12 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white flex items-center justify-center shrink-0 disabled:opacity-40 text-lg">
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
