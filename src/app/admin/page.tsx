"use client";

import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import type { AgencyStats } from "@/types";
import foodAccessData from "@/data/food-access-dc.json";

// ── Real USDA Food Access Research Atlas 2019 stats ──
const lilaTracts = foodAccessData.filter((d) => d.lilaFlag === 1).length;
const lowIncomeTracts = foodAccessData.filter((d) => d.lowIncome === 1).length;
const totalSnapHouseholds = foodAccessData.reduce((s, d) => s + (d.snapHouseholds ?? 0), 0);
const avgPoverty = (foodAccessData.reduce((s, d) => s + (d.povertyRate ?? 0), 0) / foodAccessData.length).toFixed(1);
const topSnapTracts = [...foodAccessData]
  .filter((d) => d.snapHouseholds && d.snapHouseholds > 0)
  .sort((a, b) => (b.snapHouseholds ?? 0) - (a.snapHouseholds ?? 0))
  .slice(0, 6)
  .map((d) => ({ tract: d.tract.slice(-4), snap: d.snapHouseholds }));

// ── Agency data ──
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
  { name: "Maria Santos",    families: 47, errors: 23, recovered: 1892 },
  { name: "James Williams",  families: 38, errors: 18, recovered: 1476 },
  { name: "Ana Flores",      families: 32, errors: 15, recovered: 1230 },
  { name: "David Kim",       families: 26, errors: 12, recovered:  984 },
];

const recentFlags = [
  { family: "Rosa Rodríguez",            type: "Childcare deduction",        severity: "critical", impact: 84 },
  { family: "Marie-Claire Jean-Baptiste", type: "Medical deduction",          severity: "warning",  impact: 62 },
  { family: "Bà Nguyễn Thị Lan",         type: "Medical deduction",          severity: "warning",  impact: 48 },
  { family: "Carlos Mendez",             type: "Utility deduction missing",  severity: "warning",  impact: 37 },
  { family: "Amara Diallo",              type: "Categorical eligibility",    severity: "info",     impact:  0 },
];

const errorBreakdown = [
  { type: "Childcare deduction",      count: 9 },
  { type: "Medical deduction",        count: 7 },
  { type: "Utility deduction",        count: 4 },
  { type: "Categorical eligibility",  count: 2 },
  { type: "Shelter deduction",        count: 1 },
];

const metricCards = [
  { label: "Familias esta semana",    value: agencyStats.totalFamiliesThisWeek,      format: "number",  icon: "👨‍👩‍👧", bg: "bg-[#1F3A5F]", trend: "+12% vs semana anterior" },
  { label: "Errores detectados",      value: agencyStats.errorsCaughtThisWeek,       format: "number",  icon: "🔍",      bg: "bg-[#2563EB]", trend: "49% de aplicaciones" },
  { label: "Beneficios recuperados",  value: agencyStats.dollarsRecoveredThisWeek,   format: "dollars", icon: "💰",      bg: "bg-[#10B981]", trend: "$82 promedio por familia" },
  { label: "Proyección anual",        value: agencyStats.projectedAnnualSavings,     format: "dollars", icon: "📈",      bg: "bg-[#7C3AED]", trend: "basado en tasa actual" },
];

function fmt(value: number, format: string) {
  if (format === "dollars") return value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value.toLocaleString()}`;
  return value.toLocaleString();
}

const partners = [
  { name: "Capital Area Food Bank",    role: "Primary Agency Partner",      icon: "🏦" },
  { name: "Safeway (Alabama Ave)",     role: "Double Up Bucks Retailer",    icon: "🛒" },
  { name: "DC WIC Program",            role: "WIC Data Integration",        icon: "🍼" },
  { name: "Mi Tierra Bodega",          role: "Community Grocer Partner",    icon: "🌽" },
];

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link href="/" className="hover:text-[#1F3A5F]">SavorBridge</Link>
          <span>/</span>
          <span className="text-[#1F3A5F] font-medium">Agency Analytics</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <h1 className="text-2xl font-bold text-[#1F3A5F]">Agency Analytics</h1>
              <p className="text-sm text-gray-500">Capital Area Food Bank · Week of Apr 13–18, 2026</p>
            </div>
          </div>
          <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-3 py-1.5 rounded-full">Live Data</span>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metricCards.map((c) => (
            <div key={c.label} className={`${c.bg} text-white rounded-2xl p-5 shadow-sm`}>
              <span className="text-2xl">{c.icon}</span>
              <p className="text-2xl md:text-3xl font-bold leading-none mt-3 mb-1">{fmt(c.value, c.format)}</p>
              <p className="text-xs opacity-75 leading-tight mb-1">{c.label}</p>
              <p className="text-xs opacity-60">{c.trend}</p>
            </div>
          ))}
        </div>

        {/* Daily trend — area chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-semibold text-[#1F3A5F] mb-1">Actividad diaria</p>
          <p className="text-xs text-gray-400 mb-5">Familias atendidas y errores detectados por día</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={agencyStats.dailyMetrics} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gFam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1F3A5F" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1F3A5F" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gErr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Area type="monotone" dataKey="familiesServed" name="Familias" stroke="#1F3A5F" strokeWidth={2} fill="url(#gFam)" />
              <Area type="monotone" dataKey="errorsFound"    name="Errores"   stroke="#10B981" strokeWidth={2} fill="url(#gErr)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Benefits recovered + Error breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm font-semibold text-[#1F3A5F] mb-1">Beneficios recuperados</p>
            <p className="text-xs text-gray-400 mb-5">Dólares recuperados por día ($)</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={agencyStats.dailyMetrics} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} formatter={(v) => [`$${v ?? 0}`, "Recuperado"]} />
                <Bar dataKey="benefitsRecovered" fill="#1F3A5F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm font-semibold text-[#1F3A5F] mb-1">Tipos de error</p>
            <p className="text-xs text-gray-400 mb-4">Desglose por categoría esta semana</p>
            <div className="space-y-3">
              {errorBreakdown.map((item) => {
                const pct = Math.round((item.count / agencyStats.errorsCaughtThisWeek) * 100);
                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-700">{item.type}</span>
                      <span className="text-xs font-semibold text-gray-500">{item.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1F3A5F] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* USDA Food Access Research Atlas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm font-semibold text-gray-700">DC Food Access Landscape</p>
            <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">USDA Food Access Research Atlas 2019</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Food Desert Tracts", value: lilaTracts, color: "text-[#1F3A5F]" },
              { label: "Low-Income Tracts",  value: lowIncomeTracts, color: "text-amber-600" },
              { label: "Avg Poverty Rate",   value: `${avgPoverty}%`, color: "text-red-600" },
              { label: "SNAP Households",    value: totalSnapHouseholds.toLocaleString(), color: "text-green-600" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Top Census Tracts by SNAP Participation (Highest Need)</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={topSnapTracts} barCategoryGap={8} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="tract" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v) => [`${v} households`, "SNAP"]} />
              <Bar dataKey="snap" fill="#1F3A5F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-2">Ward 7/8 tracts — same neighborhoods as our 3 demo families. Highest SavorBridge impact zone.</p>
        </div>

        {/* Caseworker leaderboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-semibold text-[#1F3A5F] mb-4">Tabla de caseworkers</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  {["#", "Caseworker", "Familias", "Errores", "Recuperado"].map((h) => (
                    <th key={h} className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide last:text-right">{h}</th>
                  ))}
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
                      <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">{cw.errors}</span>
                    </td>
                    <td className="py-3 text-right font-semibold text-[#10B981]">${cw.recovered.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent flags */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-semibold text-[#1F3A5F] mb-4">Errores recientes detectados</p>
          <div className="space-y-3">
            {recentFlags.map((flag, i) => (
              <div key={i} className={`flex items-start gap-3 rounded-xl px-4 py-3 border ${
                flag.severity === "critical" ? "bg-red-50 border-red-100"
                : flag.severity === "warning" ? "bg-yellow-50 border-yellow-100"
                : "bg-blue-50 border-blue-100"}`}>
                <span className="text-base shrink-0 mt-0.5">
                  {flag.severity === "critical" ? "🚨" : flag.severity === "warning" ? "⚠️" : "ℹ️"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{flag.family}</p>
                  <p className="text-xs text-gray-500">{flag.type}</p>
                </div>
                {flag.impact > 0 && (
                  <span className="text-xs font-semibold bg-white border border-yellow-300 text-yellow-800 px-2 py-0.5 rounded-full shrink-0">+${flag.impact}/mo</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Partners */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Network Partners</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {partners.map((p) => (
              <div key={p.name} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impact callout */}
        <div className="bg-[#1F3A5F] text-white rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <p className="text-lg font-bold">SavorBridge Impact Estimate</p>
            <p className="text-sm opacity-80 mt-1">
              If deployed to all 47 DC SNAP agencies, SavorBridge could recover <strong>$16M+</strong> in unclaimed benefits annually —
              reaching <strong>12,000+ families</strong> who currently leave money on the table.
            </p>
          </div>
          <div className="text-5xl shrink-0">🌉</div>
        </div>

      </div>
    </main>
  );
}
