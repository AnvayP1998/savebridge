"use client";

import Link from "next/link";

const cards = [
  {
    href: "/caseworker",
    title: "Caseworker Portal",
    subtitle: "Capital Area Food Bank",
    description:
      "Review SNAP applications, catch missing deductions, and generate multilingual benefit plans for families.",
    icon: "🧑‍💼",
    cta: "Open Dashboard",
    color: "bg-[#1F3A5F]",
    textColor: "text-white",
  },
  {
    href: "/family",
    title: "Family Benefits View",
    subtitle: "Para familias / For families",
    description:
      "Check your monthly benefits, find Double Up Food Bucks stores, and get recipe ideas using your WIC items.",
    icon: "🏠",
    cta: "View My Benefits",
    color: "bg-[#10B981]",
    textColor: "text-white",
  },
  {
    href: "/admin",
    title: "Agency Analytics",
    subtitle: "Program Administration",
    description:
      "Track error rates, benefit recovery, and program impact across all caseworkers and families served.",
    icon: "📊",
    cta: "View Analytics",
    color: "bg-white",
    textColor: "text-[#1F3A5F]",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="text-4xl">🌉</span>
          <h1 className="text-4xl font-bold text-[#1F3A5F] tracking-tight">SavorBridge</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          AI copilot for SNAP caseworkers — catching errors before they cost families money.
        </p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
            UN Reboot the Earth Hackathon
          </span>
          <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
            Track 1 &amp; 2
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`${card.color} ${card.textColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col gap-3 border border-gray-100`}
          >
            <div className="text-4xl">{card.icon}</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">
                {card.subtitle}
              </p>
              <h2 className="text-xl font-bold">{card.title}</h2>
            </div>
            <p
              className={`text-sm leading-relaxed ${
                card.textColor === "text-white" ? "opacity-85" : "text-gray-600"
              }`}
            >
              {card.description}
            </p>
            <div className="mt-auto pt-2">
              <span className={`inline-flex items-center gap-1 text-sm font-semibold`}>
                {card.cta} →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-xs text-gray-400">
        Built for the UN Reboot the Earth Hackathon · Capital Area Food Bank Demo
      </p>
    </main>
  );
}
