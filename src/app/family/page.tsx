"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import type { BenefitPlan } from "@/types";
import cachedPlan from "@/data/cached/plan-rodriguez.json";

const NUTRITION: Record<string, { cal: number; protein: string; badge: string; source: string }> = {
  "Pupusas de Queso y Frijoles": { cal: 380, protein: "14g", badge: "🫘 Rico en hierro", source: "Black beans · USDA FDC #173735" },
  "Arroz con Leche":             { cal: 220, protein: "6g",  badge: "🥛 Calcio",         source: "Whole milk · USDA FDC #746782" },
  "Huevos Rancheros":            { cal: 310, protein: "16g", badge: "🥚 Alto en proteína", source: "Eggs · USDA FDC #748967" },
  "Griot ak Bannann Peze":       { cal: 420, protein: "28g", badge: "🥩 High protein",    source: "Pork · USDA FDC #168319" },
  "Diri ak Djon Djon":           { cal: 280, protein: "9g",  badge: "🍄 Iron-rich",       source: "Mushrooms · USDA FDC #169242" },
  "Soup Joumou":                 { cal: 190, protein: "12g", badge: "🎃 Vitamin A",       source: "Pumpkin · USDA FDC #168448" },
  "Cháo Cá với Gừng":           { cal: 180, protein: "18g", badge: "🐟 High protein",    source: "Tilapia · USDA FDC #175176" },
  "Canh Rau Cải với Đậu Hũ":    { cal: 120, protein: "8g",  badge: "🥬 Calcium",         source: "Tofu · USDA FDC #172475" },
  "Cơm Gà Hấp Sả":              { cal: 350, protein: "24g", badge: "🍗 Lean protein",    source: "Chicken · USDA FDC #331960" },
};

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(dateStr);
  exp.setHours(0, 0, 0, 0);
  return Math.ceil((exp.getTime() - today.getTime()) / 86400000);
}

const QUICK_QUESTIONS: Record<"es" | "en", string[]> = {
  es: ["¿Puedo comprar pollo caliente con EBT?", "¿Qué frutas duplican mi dinero en Safeway?", "¿Cuándo vence mi WIC?"],
  en: ["Can I buy hot food with EBT?", "What produce doubles my money at Safeway?", "When does my WIC expire?"],
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: "easeOut" as const },
});

export default function FamilyPage() {
  const [plan, setPlan] = useState<BenefitPlan | null>(null);
  const [familyId, setFamilyId] = useState("rodriguez");
  const [familyDisplayName, setFamilyDisplayName] = useState("Rosa Rodríguez");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [asking, setAsking] = useState(false);
  const [lang, setLang] = useState<"es" | "en">("es");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hasSR = typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setSpeechSupported(hasSR);

    const stored = localStorage.getItem("savorbridge-plan");
    const storedId = localStorage.getItem("savorbridge-familyId");
    const storedName = localStorage.getItem("savorbridge-familyName");
    if (stored) {
      try {
        setPlan(JSON.parse(stored));
        if (storedId) setFamilyId(storedId);
        if (storedName) setFamilyDisplayName(storedName);
        return;
      } catch { /* fall through */ }
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
        body: JSON.stringify({ query: q, language: lang === "es" ? "es-US" : "en-US", familyId }),
      });
      const data = await res.json();
      setAnswer(data.answer ?? "");
      if (data.answer && "speechSynthesis" in window) {
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
    const recognition = new (SR as new () => any)();
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

  function copyPlan() {
    if (!plan) return;
    const text = [
      `SavorBridge — ${lang === "es" ? "Plan de Beneficios" : "Benefit Plan"}`,
      `SNAP: $${plan.monthlySummary.snapAmount} · WIC: $${plan.monthlySummary.wicValue} · Total: $${plan.monthlySummary.totalFoodBudget}`,
      "",
      lang === "es" ? "Artículos WIC:" : "WIC Items:",
      ...plan.wicPriorities.map(w => `• ${w.category} — ${w.quantity}`),
      "",
      lang === "es" ? "Dónde comprar:" : "Where to shop:",
      ...plan.shoppingRoute.map(s => `• ${s.storeName} — ${s.address}`),
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!plan) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <span className="w-8 h-8 border-2 border-[#1F3A5F] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Cargando tu plan…</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-md mx-auto flex flex-col min-h-screen">

        {/* Header — gradient */}
        <div className="bg-gradient-to-r from-[#1F3A5F] to-[#2d5a8e] text-white px-4 py-4 flex items-center justify-between shadow-md">
          <div>
            <h1 className="font-bold text-lg tracking-tight">🌉 SavorBridge</h1>
            <p className="text-xs opacity-70 mt-0.5">
              {lang === "es" ? "Plan de Beneficios" : "Benefit Plan"} · {familyDisplayName}
            </p>
          </div>
          <button
            onClick={() => setLang(l => l === "es" ? "en" : "es")}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors font-semibold border border-white/20">
            {lang === "es" ? "🇸🇻 ES" : "🇺🇸 EN"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-32">

          {/* Monthly summary — CountUp */}
          <motion.div {...fadeUp(0.05)}>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
              {lang === "es" ? "Este mes tienes" : "Your benefits this month"}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "SNAP", value: plan.monthlySummary.snapAmount, bg: "bg-[#1F3A5F]" },
                { label: "WIC",  value: plan.monthlySummary.wicValue,   bg: "bg-green-600" },
                { label: "Total", value: plan.monthlySummary.totalFoodBudget, bg: "bg-emerald-500" },
              ].map((item) => (
                <div key={item.label} className={`${item.bg} text-white rounded-xl p-3 text-center shadow-sm`}>
                  <p className="text-xs opacity-60 mb-0.5">{item.label}</p>
                  <p className="text-xl font-extrabold">
                    $<CountUp end={item.value} duration={1.5} />
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* WIC items */}
          {plan.wicPriorities.length > 0 && (
            <motion.div {...fadeUp(0.12)}>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                {lang === "es" ? "Artículos WIC — ¡No los pierdas!" : "WIC Items — Don't lose them!"}
              </p>
              <div className="space-y-2">
                {plan.wicPriorities.map((item, i) => {
                  const days = item.expiresAt ? daysUntil(item.expiresAt) : null;
                  const urgent = days !== null && days <= 7;
                  const soon = days !== null && days <= 14 && days > 7;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.08 }}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
                        item.urgency === "high" ? "bg-red-50 border-red-200"
                        : item.urgency === "medium" ? "bg-yellow-50 border-yellow-200"
                        : "bg-gray-50 border-gray-100"}`}>
                      <span className={`text-xl ${urgent ? "animate-pulse" : ""}`}>
                        {item.urgency === "high" ? "🔴" : item.urgency === "medium" ? "🟡" : "🟢"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm">{item.category}</p>
                        <p className="text-xs text-gray-500">{item.quantity}</p>
                      </div>
                      {days !== null && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          urgent ? "bg-red-100 text-red-700"
                          : soon ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-500"}`}>
                          {urgent || soon
                            ? lang === "es" ? `${days}d restantes` : `${days}d left`
                            : lang === "es" ? `vence ${item.expiresAt?.slice(5).replace("-", "/")}` : `exp ${item.expiresAt?.slice(5).replace("-", "/")}`}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Shopping route */}
          <motion.div {...fadeUp(0.2)}>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
              {lang === "es" ? "🗺️ Dónde comprar" : "🗺️ Where to shop"}
            </p>
            <div className="space-y-2">
              {plan.shoppingRoute.map((stop, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <span className="bg-[#1F3A5F] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{stop.storeName}</p>
                      <p className="text-xs text-gray-400">{stop.address}</p>
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {stop.doubleUpEligible && (
                          <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">💰 Double Up 2×</span>
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
          </motion.div>

          {/* Recipes */}
          <motion.div {...fadeUp(0.28)}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                {lang === "es" ? "🍽️ Recetas con tus beneficios" : "🍽️ Recipes using your benefits"}
              </p>
              <span className="text-xs text-gray-400">USDA FDC</span>
            </div>
            <div className="space-y-2">
              {plan.recipes.map((r, i) => {
                const nut = NUTRITION[r.name];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="bg-amber-50 border border-amber-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{r.name}</p>
                        {r.nameTranslated && <p className="text-xs text-gray-400 mb-1">{r.nameTranslated}</p>}
                      </div>
                      {nut && (
                        <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full shrink-0">{nut.badge}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{r.description}</p>
                    {nut && (
                      <div className="flex gap-3 mt-2 pt-2 border-t border-amber-200">
                        <span className="text-xs text-gray-500">🔥 {nut.cal} kcal</span>
                        <span className="text-xs text-gray-500">💪 {nut.protein} {lang === "es" ? "proteína" : "protein"}</span>
                        <span className="text-xs text-gray-400 ml-auto">{nut.source}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">⏱️ {r.prepTimeMinutes} min · {r.servings} {lang === "es" ? "porciones" : "servings"}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Tips */}
          {plan.tips && plan.tips.length > 0 && (
            <motion.div {...fadeUp(0.36)}>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                💡 {lang === "es" ? "Consejos del mes" : "Tips this month"}
              </p>
              <div className="space-y-2">
                {plan.tips.map((tip, i) => (
                  <p key={i} className="text-sm text-gray-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 leading-relaxed">{tip}</p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Voice answer */}
          <AnimatePresence>
            {answer && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-gradient-to-br from-[#1F3A5F] to-[#2d5a8e] text-white rounded-2xl p-4 shadow-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">🤖</span>
                  <p className="text-xs opacity-60 font-semibold uppercase tracking-wide">
                    {lang === "es" ? "Respuesta de Claude" : "Claude's Answer"}
                  </p>
                </div>
                <p className="text-sm leading-relaxed">{answer}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Print / Copy */}
          <motion.div {...fadeUp(0.42)} className="flex gap-2 pb-1">
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:shadow-sm transition-all">
              🖨️ {lang === "es" ? "Imprimir plan" : "Print plan"}
            </button>
            <button
              onClick={copyPlan}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:shadow-sm transition-all">
              {copied ? "✅" : "📋"} {copied
                ? (lang === "es" ? "¡Copiado!" : "Copied!")
                : (lang === "es" ? "Copiar resumen" : "Copy summary")}
            </button>
          </motion.div>

          {/* Quick questions */}
          <motion.div {...fadeUp(0.48)} className="pb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
              {lang === "es" ? "Preguntas frecuentes" : "Common questions"}
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS[lang].map((q) => (
                <button
                  key={q}
                  onClick={() => { setQuery(q); askQuestion(q); }}
                  className="text-xs text-[#1F3A5F] bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-full px-3 py-1.5 transition-colors font-medium text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Voice Q&A bar — fixed bottom */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center">
          <div className="w-full max-w-md bg-white border-t border-gray-100 px-4 py-3 shadow-xl">
            {!speechSupported && (
              <p className="text-xs text-amber-600 text-center mb-2 font-medium">
                ⌨️ {lang === "es"
                  ? "Voz disponible solo en Chrome — escribe tu pregunta abajo"
                  : "Voice only available in Chrome — type your question below"}
              </p>
            )}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askQuestion(query)}
                placeholder={lang === "es" ? "Pregúntame algo…" : "Ask me anything…"}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]/20 transition-all"
              />
              <button
                onClick={speechSupported ? startListening : () => inputRef.current?.focus()}
                disabled={asking}
                title={!speechSupported ? (lang === "es" ? "Requiere Chrome" : "Requires Chrome") : undefined}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 text-white text-xl shadow-sm ${
                  !speechSupported ? "bg-gray-300 cursor-not-allowed"
                  : listening ? "bg-red-500 animate-pulse shadow-red-200"
                  : "bg-[#1F3A5F] hover:bg-[#162d4a]"
                }`}>
                {asking
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : speechSupported ? "🎤" : "⌨️"}
              </button>
              <button
                onClick={() => askQuestion(query)}
                disabled={asking || !query.trim()}
                className="w-12 h-12 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white flex items-center justify-center shrink-0 disabled:opacity-40 text-lg shadow-sm transition-colors">
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
