"use client";

import Link from "next/link";
import rodriguezData from "@/data/families/rodriguez.json";
import jeanBaptisteData from "@/data/families/jean-baptiste.json";
import nguyenData from "@/data/families/nguyen.json";

const families = [rodriguezData, jeanBaptisteData, nguyenData];

const langFlag: Record<string, string> = { es: "🇸🇻", ht: "🇭🇹", vi: "🇻🇳", en: "🇺🇸" };

const stats = [
  { label: "Families This Week", value: "84", icon: "👨‍👩‍👧" },
  { label: "Errors Caught", value: "7", icon: "🛡️" },
  { label: "Dollars Recovered", value: "$3,147", icon: "💰" },
];

export default function CaseworkerDashboard() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🧑‍💼</span>
          <div>
            <h1 className="text-2xl font-bold text-[#1F3A5F]">Caseworker Dashboard</h1>
            <p className="text-sm text-gray-500">Capital Area Food Bank · Maria Santos</p>
          </div>
          <Link href="/" className="ml-auto text-xs text-gray-400 hover:text-[#1F3A5F]">← Home</Link>
        </div>

        {/* Stat bar */}
        <div className="grid grid-cols-3 gap-4 my-7">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-xl font-bold text-[#1F3A5F]">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Family cards */}
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">Active Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {families.map((f) => (
            <Link
              key={f.id}
              href={`/caseworker/application/${f.id}`}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-[#1F3A5F] text-base">{f.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{f.caseNumber}</p>
                </div>
                <span className="text-xl">{langFlag[f.language] ?? "🌐"}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                <span>👤 Household: {f.householdSize}</span>
                <span>💵 ${f.monthlyIncome.toLocaleString()}/mo</span>
                <span>🍽️ SNAP: ${f.currentSnapBenefit}/mo</span>
                <span>🧒 Children: {f.children.length}</span>
              </div>
              <div className="mt-auto pt-1 flex items-center justify-between">
                <span className="text-xs bg-yellow-100 text-yellow-800 font-semibold px-2 py-0.5 rounded-full">Pending Review</span>
                <span className="text-xs text-[#1F3A5F] font-semibold">Review →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
