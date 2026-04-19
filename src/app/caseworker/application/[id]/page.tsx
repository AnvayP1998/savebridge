"use client";

import { useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import Link from "next/link";
import type { ErrorFlag, BenefitPlan, Family } from "@/types";
import rodriguezData from "@/data/families/rodriguez.json";
import jeanBaptisteData from "@/data/families/jean-baptiste.json";
import nguyenData from "@/data/families/nguyen.json";

const familyMap: Record<string, Family> = {
  rodriguez: rodriguezData as Family,
  "jean-baptiste": jeanBaptisteData as Family,
  nguyen: nguyenData as Family,
};

type Phase = "idle" | "analyzing" | "errors" | "asked" | "planning" | "planned";

export default function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const family = familyMap[id];

  const [phase, setPhase] = useState<Phase>("idle");
  const [errors, setErrors] = useState<ErrorFlag[]>([]);
  const [plan, setPlan] = useState<BenefitPlan | null>(null);

  if (!family) {
    return <div className="p-8 text-red-500">Family not found: {id}</div>;
  }

  async function analyzeApplication() {
    setPhase("analyzing");
    await new Promise((r) => setTimeout(r, 1200));
    const res = await fetch("/api/analyze-application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(family),
    });
    const data = await res.json();
    setErrors(data.errors ?? []);
    setPhase("errors");
  }

  async function generatePlan() {
    setPhase("planning");
    const res = await fetch("/api/generate-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(family),
    });
    const data = await res.json();
    if (data.plan) {
      setPlan(data.plan);
      localStorage.setItem("savorbridge-plan", JSON.stringify(data.plan));
      localStorage.setItem("savorbridge-familyId", family.id);
    }
    setPhase("planned");
  }

  const showErrors = ["errors", "asked", "planning", "planned"].includes(phase);
  const benefitUpdated = ["asked", "planning", "planned"].includes(phase);
  const totalImpact = errors.reduce((sum, e) => sum + e.benefitImpact, 0);
  const updatedBenefit = family.currentSnapBenefit + totalImpact;

  const langLabel: Record<string, string> = { es: "Español 🇸🇻", ht: "Kreyòl 🇭🇹", vi: "Tiếng Việt 🇻🇳", en: "English 🇺🇸" };

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#1F3A5F]">SavorBridge</Link>
          <span>/</span>
          <Link href="/caseworker" className="hover:text-[#1F3A5F]">Dashboard</Link>
          <span>/</span>
          <span className="text-[#1F3A5F] font-medium">{family.firstName} {family.lastName}</span>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">🧑‍💼</span>
          <div>
            <h1 className="text-2xl font-bold text-[#1F3A5F]">SNAP Application Review</h1>
            <p className="text-sm text-gray-500">Capital Area Food Bank · Caseworker: Maria Santos</p>
          </div>
        </div>

        {/* Application card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-[#1F3A5F]">{family.name}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Case #{family.caseNumber} · Updated {family.lastUpdated}</p>
            </div>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">Pending Review</span>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6 text-sm">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Household Size</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-800">
                {family.householdSize} members
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Children</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-800 text-xs">
                {family.children.length > 0 ? family.children.map((c) => `${c.name} (age ${c.age})`).join(", ") : "None"}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Monthly Income</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-800">
                ${family.monthlyIncome.toLocaleString()}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Monthly Rent</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-800">
                ${family.rent.toLocaleString()}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Utilities</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-800">
                ${family.utilities}/mo
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Childcare Cost</p>
              <div className={`border rounded-lg px-3 py-2 font-medium text-sm ${
                family.childcareCost === 0 && !benefitUpdated
                  ? "bg-yellow-50 border-yellow-300 text-yellow-800"
                  : "bg-gray-50 border-gray-200 text-gray-800"
              }`}>
                ${family.childcareCost}/mo
                {family.childcareCost === 0 && !benefitUpdated && (
                  <span className="ml-1 text-yellow-600 text-xs">(none entered)</span>
                )}
                {benefitUpdated && family.childcareCost === 0 && <span className="ml-1 text-green-600 text-xs">pending verification</span>}
              </div>
            </div>
          </div>

          {/* Benefit display */}
          <div className="bg-[#1F3A5F] text-white rounded-xl p-4 mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs opacity-60 uppercase tracking-wide mb-1">Monthly SNAP Benefit</p>
              <p className="text-3xl font-bold leading-none">
                ${benefitUpdated
                  ? <CountUp start={family.currentSnapBenefit} end={updatedBenefit} duration={2} />
                  : family.currentSnapBenefit}
                <span className="text-base font-normal opacity-60 ml-1">/mo</span>
              </p>
              {benefitUpdated && totalImpact > 0 && (
                <p className="text-xs text-green-300 mt-1">↑ +${totalImpact} in deductions applied</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs opacity-60 uppercase tracking-wide mb-1">WIC Benefits</p>
              <p className="text-xl font-bold">${family.currentWicBenefit}/mo</p>
            </div>
          </div>

          {phase === "idle" && (
            <button onClick={analyzeApplication}
              className="w-full bg-[#1F3A5F] hover:bg-[#162d4a] text-white font-semibold py-3 rounded-xl transition-colors">
              Submit &amp; Analyze Application
            </button>
          )}
          {phase === "analyzing" && (
            <div className="flex items-center justify-center gap-2 py-3 text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-[#1F3A5F] rounded-full animate-spin" />
              Analyzing with AI…
            </div>
          )}
        </div>

        {/* Error banners — animated */}
        <AnimatePresence>
          {showErrors && errors.map((err, i) => (
            <motion.div
              key={err.id}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.35, delay: i * 0.12, ease: "easeOut" }}
              className={`rounded-2xl border-l-4 p-5 mb-4 ${
                err.severity === "warning" ? "bg-yellow-50 border-yellow-400"
                : err.severity === "critical" ? "bg-red-50 border-red-500"
                : "bg-blue-50 border-blue-400"}`}>
              <div className="flex items-start gap-2 mb-1">
                <span className="shrink-0">{err.severity === "warning" ? "⚠️" : "ℹ️"}</span>
                <h3 className="font-bold text-gray-900 text-sm flex-1">{err.title}</h3>
                <span className="shrink-0 text-xs font-semibold bg-white border border-yellow-300 text-yellow-800 px-2 py-0.5 rounded-full">
                  +${err.benefitImpact}/mo
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2 ml-6">{err.explanation}</p>
              <p className="text-sm font-medium text-gray-800 ml-6">💡 {err.suggestedAction}</p>
              {err.references && (
                <p className="text-xs text-gray-400 ml-6 mt-1">Ref: {err.references.join(", ")}</p>
              )}
              <div className="ml-6 mt-3">
                {phase === "errors" && (
                  <button onClick={() => setPhase("asked")}
                    className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
                    Ask {family.firstName} →
                  </button>
                )}
                {benefitUpdated && (
                  <p className="text-sm font-medium text-green-700 flex items-center gap-1">
                    ✅ Deductions confirmed — benefit updated to ${updatedBenefit}/mo
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {phase === "asked" && (
          <button onClick={generatePlan}
            className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 rounded-xl transition-colors mb-4">
            Generate Family Plan 🌎
          </button>
        )}
        {phase === "planning" && (
          <div className="flex items-center justify-center gap-2 py-3 text-gray-500 mb-4">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-[#10B981] rounded-full animate-spin" />
            Generating multilingual plan…
          </div>
        )}

        {/* Benefit plan */}
        {phase === "planned" && plan && (
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📋</span>
              <h2 className="text-xl font-bold text-[#1F3A5F]">Plan Familiar</h2>
              <span className="ml-auto text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">{langLabel[family.language] ?? "🌐"}</span>
            </div>
            <p className="text-xs text-gray-400 mb-4">{family.name} · {plan.familyId}</p>
            <p className="text-sm text-gray-700 italic leading-relaxed mb-5 border-l-4 border-green-200 pl-3">
              &ldquo;{plan.planNarrative}&rdquo;
            </p>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-[#1F3A5F] text-white rounded-xl p-3 text-center">
                <p className="text-xs opacity-60 mb-0.5">SNAP</p>
                <p className="text-2xl font-bold">${plan.monthlySummary.snapAmount}</p>
              </div>
              <div className="bg-green-600 text-white rounded-xl p-3 text-center">
                <p className="text-xs opacity-60 mb-0.5">WIC</p>
                <p className="text-2xl font-bold">${plan.monthlySummary.wicValue}</p>
              </div>
              <div className="bg-emerald-500 text-white rounded-xl p-3 text-center">
                <p className="text-xs opacity-60 mb-0.5">Total</p>
                <p className="text-2xl font-bold">${plan.monthlySummary.totalFoodBudget}</p>
              </div>
            </div>

            {/* Shopping route */}
            {plan.shoppingRoute?.length > 0 && (
              <div className="mb-5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">🗺️ Ruta de Compras</h3>
                <div className="space-y-2">
                  {plan.shoppingRoute.map((stop, i) => (
                    <div key={i} className="bg-blue-50 rounded-xl p-3 flex items-start gap-3">
                      <span className="bg-[#1F3A5F] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-gray-800">{stop.storeName}</p>
                          {stop.doubleUpEligible && (
                            <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Double Up 2x</span>
                          )}
                          {stop.wicAccepted && (
                            <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">WIC ✓</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{stop.address}</p>
                        {stop.notes && <p className="text-xs text-gray-600 mt-1">{stop.notes}</p>}
                        {stop.estimatedSavings > 0 && (
                          <p className="text-xs text-green-600 font-semibold mt-1">💰 Ahorra hasta ${stop.estimatedSavings} con Double Up</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Prioridades WIC</h3>
              <div className="space-y-2">
                {plan.wicPriorities.map((item, i) => (
                  <div key={i} className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                    item.urgency === "high" ? "bg-red-50" : item.urgency === "medium" ? "bg-yellow-50" : "bg-gray-50"}`}>
                    <span>{item.urgency === "high" ? "🔴" : item.urgency === "medium" ? "🟡" : "🟢"}</span>
                    <span className="font-medium text-gray-800">{item.category}</span>
                    <span className="text-gray-500 text-xs mt-0.5 ml-1">{item.notes}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Consejos</h3>
              <div className="space-y-2">
                {plan.tips.map((tip, i) => (
                  <p key={i} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{tip}</p>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Recetas Sugeridas</h3>
              <div className="space-y-2">
                {plan.recipes.map((recipe, i) => (
                  <div key={i} className="bg-amber-50 rounded-xl p-3">
                    <p className="font-semibold text-gray-800 text-sm">{recipe.name}</p>
                    {recipe.nameTranslated && <p className="text-xs text-gray-400 mb-1">{recipe.nameTranslated}</p>}
                    <p className="text-xs text-gray-600">{recipe.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
  localStorage.setItem("savorbridge-plan", JSON.stringify(plan));
  localStorage.setItem("savorbridge-familyId", family.id);
  localStorage.setItem("savorbridge-familyName", family.name);
  window.open("/family", "_blank");
}}
              className="w-full bg-[#1F3A5F] hover:bg-[#162d4a] text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              📱 Send to {family.firstName}&apos;s Phone
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">Opens family view — Rosa can access on her phone</p>
          </div>
        )}
      </div>
    </main>
  );
}
