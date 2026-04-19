"use client";

import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import type { AgencyStats } from "@/types";

const agencyStats: AgencyStats = {
  totalFamiliesThisWeek: 47,
  errorsCaughtThisWeek: 23,
  dollarsRecoveredThisWeek: 1892,
  projectedAnnualSavings: 98384,
  dailyMetrics: [
    { date: "Lun 13", familiesServed: 8, errorsFound: 3, benefitsRecovered: 247 },
    { date: "Mar 14", familiesServed: 11, errorsFound: 5, benefitsRecovered: 392 },
    { date: "Mié 15", familiesServed: 6, errorsFound: 2, benefitsRecovered: 164 },
    { date: "Jue 16", familiesServed: 9, errorsFound: 5, benefitsRecovered: 410 },
    { date: "Vie 17", familiesServed: 7, errorsFound: 4, benefitsRecovered: 329 },
    { date: "Sáb 18", familiesServed: 6, errorsFound: 4, benefitsRecovered: 350 },
  ],
};

const caseworkers = [
  { name: "Maria Santos", families: 47, errors: 23, recovered: 1892 },
  { name: "James Williams", families: 38, errors: 18, recovered: 1476 },
  { name: "Ana Flores", families: 32, errors: 15, recovered: 1230 },
  { name: "David Kim", families: 26, errors: 12, recovered: 984 },
];

const recentFlags = [
  { family: "Rosa Rodríguez", type: "Childcare deduction", severity: "critical", impact: 84, caseworker: "Maria Santos" },
  { family: "Marie-Claire Jean-Baptiste", type: "Medical deduction", severity: "warning", impact: 62, caseworker: "James Williams" },
  { family: "Bà Nguyễn Thị Lan", type: "Medical deduction", severity: "warning", impact: 48, caseworker: "Ana Flores" },
  { family: "Carlos Mendez", type: "Utility deduction missing", severity: "warning", impact: 37, caseworker: "Maria Santos" },
  { family: "Amara Diallo", type: "Categorical eligibility", severity: "info", impact: 0, caseworker: "David Kim" },
];

const errorBreakdown = [
  { type: "Childcare deduction", count: 9 },
  { type: "Medical deduction", count: 7 },
  { type: "Utility deduction", count: 4 },
  { type: "Categorical eligibility", count: 2 },
  { type: "Shelter deduction", count: 1 },
];

const metricCards = [
  {
    label: "Familias esta semana",
    value: agencyStats.totalFamiliesThisWeek,
    format: "number",
    icon: "👨‍👩‍👧",
    bg: "bg-[#1F3A5F]",
    trend: "+12% vs semana anterior",
  },
  {
    label: "Errores detectados",
    value: agencyStats.errorsCaughtThisWeek,
    format: "number",
    icon: "🔍",
    bg: "bg-[#2563EB]",
    trend: "49% de aplicaciones",
  },
  {
    label: "Beneficios recuperados",
    value: agencyStats.dollarsRecoveredThisWeek,
    format: "dollars",
    icon: "💰",
    bg: "bg-[#10B981]",
    trend: "$82 promedio por familia",
  },
  {
    label: "Proyección anual",
    value: agencyStats.projectedAnnualSavings,
    format: "dollars",
    icon: "📈",
    bg: "bg-[#7C3AED]",
    trend: "basado en tasa actual",
  },
];

function formatValue(value: number, format: string) {
  if (format === "dollars") {
    return value >= 1000
      ? `$${(value / 1000).toFixed(1)}K`
      : `$${value.toLocaleString()}`;
  }
  return value.toLocaleString();
}

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Nav */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#1F3A5F]">SavorBridge</Link>
          <span>/</span>
          <span className="text-[#1F3A5F] font-medium">Agency Analytics</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <h1 className="text-2xl font-bold text-[#1F3A5F]">Agency Analytics</h1>
              <p className="text-sm text-gray-500">Capital Area Food Bank · Week of Apr 13–18, 2026</p>
            </div>
          </div>
          <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-3 py-1.5 rounded-full">
            Live Data
          </span>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {metricCards.map((card) => (
            <div
              key={card.label}
              className={`${card.bg} text-white rounded-2xl p-5 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{card.icon}</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold leading-none mb-1">
                {formatValue(card.value, card.format)}
              </p>
              <p className="text-xs opacity-75 leading-tight mb-2">{card.label}</p>
              <p className="text-xs opacity-60">{card.trend}</p>
            </div>
          ))}
        </div>

        {/* Daily Trend Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-[#1F3A5F] mb-1">Actividad diaria</h2>
          <p className="text-xs text-gray-400 mb-5">Familias atendidas y errores detectados por día</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={agencyStats.dailyMetrics} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFamilies" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1F3A5F" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1F3A5F" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                labelStyle={{ fontWeight: 600, color: "#1F3A5F" }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Area
                type="monotone"
                dataKey="familiesServed"
                name="Familias"
                stroke="#1F3A5F"
                strokeWidth={2}
                fill="url(#colorFamilies)"
              />
              <Area
                type="monotone"
                dataKey="errorsFound"
                name="Errores"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#colorErrors)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Benefits Recovered Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-[#1F3A5F] mb-1">Beneficios recuperados</h2>
            <p className="text-xs text-gray-400 mb-5">Dólares recuperados por día ($)</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={agencyStats.dailyMetrics} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                  formatter={(v) => [`$${v ?? 0}`, "Recuperado"]}
                />
                <Bar dataKey="benefitsRecovered" name="$" fill="#1F3A5F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Error Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-[#1F3A5F] mb-1">Tipos de error</h2>
            <p className="text-xs text-gray-400 mb-4">Desglose por categoría esta semana</p>
            <div className="space-y-3">
              {errorBreakdown.map((item) => {
                const pct = Math.round((item.count / agencyStats.errorsCaughtThisWeek) * 100);
                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-700">{item.type}</span>
                      <span className="text-xs font-semibold text-gray-500">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1F3A5F] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Caseworker Leaderboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-[#1F3A5F] mb-4">Tabla de caseworkers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">#</th>
                  <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Caseworker
                  </th>
                  <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">
                    Familias
                  </th>
                  <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">
                    Errores
                  </th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">
                    Recuperado
                  </th>
                </tr>
              </thead>
              <tbody>
                {caseworkers.map((cw, i) => (
                  <tr key={cw.name} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 text-gray-400 font-medium">{i + 1}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1F3A5F] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {cw.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="font-medium text-gray-800">{cw.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right text-gray-700 font-medium">{cw.families}</td>
                    <td className="py-3 pr-4 text-right">
                      <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                        {cw.errors}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold text-[#10B981]">
                      ${cw.recovered.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Flags */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10">
          <h2 className="text-sm font-semibold text-[#1F3A5F] mb-4">Errores recientes detectados</h2>
          <div className="space-y-3">
            {recentFlags.map((flag, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-xl px-4 py-3 border ${
                  flag.severity === "critical"
                    ? "bg-red-50 border-red-100"
                    : flag.severity === "warning"
                    ? "bg-yellow-50 border-yellow-100"
                    : "bg-blue-50 border-blue-100"
                }`}
              >
                <span className="text-base shrink-0 mt-0.5">
                  {flag.severity === "critical" ? "🚨" : flag.severity === "warning" ? "⚠️" : "ℹ️"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{flag.family}</p>
                  <p className="text-xs text-gray-500">{flag.type} · {flag.caseworker}</p>
                </div>
                {flag.impact > 0 && (
                  <span className="text-xs font-semibold bg-white border border-yellow-300 text-yellow-800 px-2 py-0.5 rounded-full shrink-0">
                    +${flag.impact}/mo
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
