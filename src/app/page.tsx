"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import CountUp from "react-countup";

const impactStats = [
  { value: 2847, label: "Families Helped", prefix: "", suffix: "" },
  { value: 1200000, label: "Benefits Recovered", prefix: "$", suffix: "" },
  { value: 94, label: "Error Detection Rate", prefix: "", suffix: "%" },
];

const cards = [
  {
    href: "/caseworker",
    title: "Caseworker Portal",
    subtitle: "Capital Area Food Bank",
    description:
      "Review SNAP applications, catch missing deductions, and generate multilingual benefit plans for families.",
    icon: "🧑‍💼",
    cta: "Open Dashboard",
    gradient: "from-[#1F3A5F] to-[#2d5286]",
    border: "border-[#1F3A5F]/20",
  },
  {
    href: "/family",
    title: "Family Benefits View",
    subtitle: "Para familias · For families",
    description:
      "Check your monthly benefits, find Double Up Food Bucks stores, and get recipe ideas using your WIC items.",
    icon: "🏠",
    cta: "View My Benefits",
    gradient: "from-[#059669] to-[#10B981]",
    border: "border-[#10B981]/20",
  },
  {
    href: "/admin",
    title: "Agency Analytics",
    subtitle: "Program Administration",
    description:
      "Track error rates, benefit recovery, and program impact across all caseworkers and families served.",
    icon: "📊",
    cta: "View Analytics",
    gradient: "from-[#7C3AED] to-[#9F67FF]",
    border: "border-purple-200",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0D1B2A] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] bg-[#1F3A5F] opacity-30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[-80px] w-[360px] h-[360px] bg-[#059669] opacity-20 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero */}
      <motion.div
        className="text-center mb-12 z-10"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="inline-flex items-center gap-3 mb-5">
          <span className="text-5xl drop-shadow-lg">🌉</span>
          <h1 className="text-5xl font-extrabold text-white tracking-tight">
            SavorBridge
          </h1>
        </div>
        <p className="text-lg text-gray-300 max-w-xl mx-auto leading-relaxed">
          AI copilot for SNAP caseworkers — catching errors before they cost
          families money.
        </p>
        <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
          <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full font-medium">
            UN Reboot the Earth Hackathon
          </span>
          <span className="text-xs bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1 rounded-full font-medium">
            Track 1 &amp; 2
          </span>
          <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full font-medium">
            George Hacks 2026
          </span>
        </div>
      </motion.div>

      {/* Impact stats */}
      <motion.div
        className="grid grid-cols-3 gap-6 max-w-2xl w-full mb-14 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        {impactStats.map((s) => (
          <div
            key={s.label}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center backdrop-blur-sm"
          >
            <p className="text-3xl font-extrabold text-white">
              {s.prefix}
              <CountUp end={s.value} duration={2} separator="," />
              {s.suffix}
            </p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full z-10">
        {cards.map((card, i) => (
          <motion.div
            key={card.href}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 + i * 0.12, ease: "easeOut" }}
          >
            <Link
              href={card.href}
              className={`bg-gradient-to-br ${card.gradient} ${card.border} rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-200 flex flex-col gap-3 border group block`}
            >
              <div className="text-4xl">{card.icon}</div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-1">
                  {card.subtitle}
                </p>
                <h2 className="text-xl font-bold text-white">{card.title}</h2>
              </div>
              <p className="text-sm leading-relaxed text-white/80">
                {card.description}
              </p>
              <div className="mt-auto pt-2">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-white group-hover:gap-2 transition-all duration-150">
                  {card.cta} →
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.p
        className="mt-12 text-xs text-gray-500 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Built for the UN Reboot the Earth Hackathon · Capital Area Food Bank Demo
      </motion.p>
    </main>
  );
}
