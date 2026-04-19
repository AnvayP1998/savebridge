"use client";

import { useState } from "react";
import Link from "next/link";
import type { BenefitPlan, VoiceQAResponse } from "@/types";
import familyData from "@/data/families/rodriguez.json";
import cachedPlan from "@/data/cached/plan-rodriguez.json";

const QUICK_QUESTIONS = [
  "¿Puedo comprar pollo caliente con EBT?",
  "¿Qué frutas duplican mi dinero en Safeway?",
  "¿Cuándo vence mi WIC?",
];

export default function FamilyPage() {
  const family = familyData;
  const plan = cachedPlan as BenefitPlan;

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<VoiceQAResponse | null>(null);
  const [asking, setAsking] = useState(false);

  async function askQuestion(q?: string) {
    const query = q ?? question;
    if (!query.trim()) return;
    if (q) setQuestion(q);
    setAsking(true);
    setAnswer(null);
    try {
      const res = await fetch("/api/voice-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, language: "es", familyId: family.id }),
      });
      const data = await res.json();
      setAnswer(data);
    } finally {
      setAsking(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        {/* Nav */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#10B981]">SavorBridge</Link>
          <span>/</span>
          <span className="text-[#10B981] font-medium">Mi Plan Familiar</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">🏠</span>
          <div>
            <h1 className="text-2xl font-bold text-[#1F3A5F]">¡Hola, {family.firstName}!</h1>
            <p className="text-sm text-gray-500">Beneficios de este mes · Caso #{family.caseNumber}</p>
          </div>
          <span className="ml-auto text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full shrink-0">
            Español 🇸🇻
          </span>
        </div>

        {/* Budget Summary */}
        <div className="bg-[#10B981] text-white rounded-2xl p-6 mb-5 shadow-sm">
          <p className="text-xs font-semibold opacity-75 mb-3 uppercase tracking-wide">
            Tu presupuesto este mes
          </p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-xs opacity-75 mb-0.5">SNAP / EBT</p>
              <p className="text-2xl font-bold">${plan.monthlySummary.snapAmount}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-xs opacity-75 mb-0.5">WIC</p>
              <p className="text-2xl font-bold">${plan.monthlySummary.wicValue}</p>
            </div>
            <div className="bg-white/30 rounded-xl p-3 text-center">
              <p className="text-xs opacity-75 mb-0.5">Total</p>
              <p className="text-2xl font-bold">${plan.monthlySummary.totalFoodBudget}</p>
            </div>
          </div>
          <p className="text-sm opacity-90 italic leading-relaxed border-t border-white/20 pt-3">
            &ldquo;{plan.planNarrative}&rdquo;
          </p>
        </div>

        {/* WIC Priorities */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2">
            <span>⏰</span> Beneficios WIC — Usar antes de que expiren
          </h2>
          <div className="space-y-2">
            {plan.wicPriorities.map((item, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-xl px-4 py-3 ${
                  item.urgency === "high"
                    ? "bg-red-50 border border-red-100"
                    : item.urgency === "medium"
                    ? "bg-yellow-50 border border-yellow-100"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                <span className="text-base shrink-0 mt-0.5">
                  {item.urgency === "high" ? "🔴" : item.urgency === "medium" ? "🟡" : "🟢"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm">{item.category}</span>
                    <span className="text-xs text-gray-500">{item.quantity}</span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{item.notes}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0 mt-0.5">
                  vence {item.expiresAt.slice(5).replace("-", "/")}
                </span>
              </div>
            ))}
          </div>
          {plan.monthlySummary.doubleUpPotential > 0 && (
            <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              <span className="text-base">💰</span>
              <p className="text-sm font-medium text-green-800">
                Puedes ganar hasta{" "}
                <strong>${plan.monthlySummary.doubleUpPotential} extra gratis</strong> con
                Double Up Food Bucks en Safeway
              </p>
            </div>
          )}
        </div>

        {/* Shopping Route */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2">
            <span>🛒</span> Dónde hacer tus compras
          </h2>
          <div className="space-y-4">
            {plan.shoppingRoute.map((stop, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-bold text-gray-900 text-sm">{stop.storeName}</span>
                      {stop.doubleUpEligible && (
                        <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                          Double Up 💰
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{stop.address}</p>
                  </div>
                  {stop.distance && (
                    <span className="text-xs text-gray-400 shrink-0">{stop.distance}</span>
                  )}
                </div>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {stop.snapAccepted && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      ✓ EBT/SNAP
                    </span>
                  )}
                  {stop.wicAccepted && (
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                      ✓ WIC
                    </span>
                  )}
                  {stop.doubleUpEligible && stop.doubleUpMatchMax > 0 && (
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                      Double Up hasta ${stop.doubleUpMatchMax}
                    </span>
                  )}
                </div>
                <div className="space-y-1 mb-3">
                  {stop.recommendedItems.map((item, j) => (
                    <p key={j} className="text-xs text-gray-700 flex items-start gap-1.5">
                      <span className="text-gray-300 shrink-0 mt-0.5">•</span>
                      {item}
                    </p>
                  ))}
                </div>
                {stop.notes && (
                  <p className="text-xs text-[#10B981] font-medium border-t border-gray-100 pt-2">
                    💡 {stop.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            💡 Consejos del mes
          </h2>
          <div className="space-y-2">
            {plan.tips.map((tip, i) => (
              <p
                key={i}
                className="text-sm text-gray-700 bg-green-50 rounded-lg px-4 py-3 leading-relaxed"
              >
                {tip}
              </p>
            ))}
          </div>
        </div>

        {/* Recipes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            🍽️ Recetas sugeridas
          </h2>
          <div className="space-y-4">
            {plan.recipes.map((recipe, i) => (
              <div key={i} className="bg-amber-50 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{recipe.name}</p>
                    {recipe.nameTranslated && (
                      <p className="text-xs text-gray-400">{recipe.nameTranslated}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">⏱ {recipe.prepTimeMinutes} min</span>
                </div>
                <p className="text-xs text-gray-600 mb-2 leading-relaxed">{recipe.description}</p>
                <div className="space-y-0.5">
                  {recipe.ingredients.map((ing, j) => (
                    <p key={j} className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                      {ing}
                    </p>
                  ))}
                </div>
                {recipe.usesWicItems.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-amber-100">
                    {recipe.usesWicItems.map((wic, k) => (
                      <span
                        key={k}
                        className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
                      >
                        WIC: {wic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Q&A */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            🙋 Pregúntame sobre tus beneficios
          </h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !asking && askQuestion()}
              placeholder="Ej: ¿Puedo comprar pollo caliente con EBT?"
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] text-gray-800 placeholder-gray-400"
            />
            <button
              onClick={() => askQuestion()}
              disabled={asking || !question.trim()}
              className="bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shrink-0 flex items-center gap-1.5"
            >
              {asking ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ...
                </>
              ) : (
                "Preguntar"
              )}
            </button>
          </div>
          {answer && (
            <div className="bg-green-50 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed mb-3">
              <p className="font-semibold text-[#10B981] mb-1 text-xs uppercase tracking-wide">
                Respuesta
              </p>
              <p>{answer.answer}</p>
              {answer.relatedStores && answer.relatedStores.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Tiendas: {answer.relatedStores.join(", ")}
                </p>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => askQuestion(q)}
                className="text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
