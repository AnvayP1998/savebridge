"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import rodriguezData from "@/data/families/rodriguez.json";
import jeanBaptisteData from "@/data/families/jean-baptiste.json";
import nguyenData from "@/data/families/nguyen.json";

const families = [rodriguezData, jeanBaptisteData, nguyenData];

const langFlag: Record<string, string> = { es: "🇸🇻", ht: "🇭🇹", vi: "🇻🇳", en: "🇺🇸" };

const langLabel: Record<string, string> = { es: "Español", ht: "Kreyòl", vi: "Tiếng Việt", en: "English" };

const stats = [
  { label: "Families This Week", value: 84, icon: "👨‍👩‍👧", color: "bg-blue-50 border-blue-100" },
  { label: "Errors Caught", value: 7, icon: "🛡️", color: "bg-green-50 border-green-100" },
  { label: "Dollars Recovered", value: 3147, icon: "💰", prefix: "$", color: "bg-amber-50 border-amber-100" },
];

export default function CaseworkerDashboard() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-[#1F3A5F] text-white rounded-xl p-2.5">
            <span className="text-2xl">🧑‍💼</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1F3A5F]">Caseworker Dashboard</h1>
            <p className="text-sm text-gray-500">Capital Area Food Bank · Maria Santos</p>
          </div>
          <Link href="/" className="ml-auto text-xs text-gray-400 hover:text-[#1F3A5F] transition-colors">
            ← Home
          </Link>
        </motion.div>

        {/* Stat bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className={`${s.color} rounded-2xl border p-5 flex items-center gap-4`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <span className="text-3xl">{s.icon}</span>
              <div>
                <p className="text-2xl font-extrabold text-[#1F3A5F]">
                  {s.prefix ?? ""}
                  <CountUp end={s.value} duration={1.8} separator="," />
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Alert banner */}
        <motion.div
          className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-amber-800 font-medium">
            3 families have unreviewed applications — errors may be costing them benefits.
          </p>
        </motion.div>

        {/* Family cards */}
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Active Cases
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {families.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.12 }}
            >
              <Link
                href={`/caseworker/application/${f.id}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col gap-3 group block h-full"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-[#1F3A5F] text-base">{f.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{f.caseNumber}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xl">{langFlag[f.language] ?? "🌐"}</span>
                    <span className="text-[10px] text-gray-400">{langLabel[f.language] ?? ""}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-600">
                  <span>👤 Household: {f.householdSize}</span>
                  <span>💵 ${f.monthlyIncome.toLocaleString()}/mo</span>
                  <span>🍽️ SNAP: ${f.currentSnapBenefit}/mo</span>
                  <span>🧒 Children: {f.children.length}</span>
                </div>

                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="text-xs bg-yellow-100 text-yellow-800 font-semibold px-2.5 py-1 rounded-full">
                    Pending Review
                  </span>
                  <span className="text-xs text-[#1F3A5F] font-semibold group-hover:translate-x-0.5 transition-transform">
                    Review →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          className="text-xs text-gray-400 text-center mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Powered by Claude AI · USDA Food Access Research Atlas 2019
        </motion.p>
      </div>
    </main>
  );
}
