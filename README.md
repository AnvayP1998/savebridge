# SavorBridge

AI copilot for SNAP caseworkers — fewer errors, more food on tables.

Built in 24 hours for George Hacks 2026 × UN Reboot the Earth Hackathon  
🚀 Live Demo · 🎥 Demo Video · 📋 Devpost

---

## The Problem

42 million Americans enrolled in SNAP leave hundreds of millions of dollars in food benefits unused every year — not because they're careless, but because:

- SNAP policy manuals run hundreds of pages, updated quarterly, written at a 12th-grade reading level
- Caseworkers process 15–20 applications a day, each with 40+ data points, in 30-minute interviews
- 40%+ of SNAP households speak another language at home
- Only 13% of eligible families use Double Up Food Bucks (free produce matching) — [source]
- Starting 2028, the One Big Beautiful Bill Act shifts significant SNAP error penalties from federal to state governments

Both problems — errors and underutilization — share the same root cause: caseworkers are stretched too thin.

---

## The Solution

SavorBridge is an AI copilot with three functions, all powered by Claude:

| Feature | What It Does |
|---|---|
| 🔍 Error Detection | Cross-checks each application against SNAP rules and flags likely errors before submission |
| 📋 Benefit Plan | Generates a personalized shopping route, WIC priorities, and recipes in the family's language in 30 seconds |
| 🎙️ Voice Q&A | Families get a mobile link, tap a mic, and ask questions in Spanish, Creole, Mandarin, or Amharic — no app install |

### Human Accountability

SavorBridge is designed around a clear principle: **Claude drafts, the caseworker decides.** Every flagged error and generated plan requires human review before any action is taken. AI surfaces the issue; the caseworker owns the outcome. This keeps trust and accountability where it belongs.

---

## Demo

Three demo families are pre-loaded:

| Family | Language | Key Demo Moment |
|---|---|---|
| Rosa Rodríguez | Spanish (es) | Missing childcare deduction — caseworker catches an $84/month error, raising monthly benefit from $487 → $571 |
| Marie-Claire Jean-Baptiste | Haitian Creole (ht) | Multi-generational household, two error flags |
| Lan Nguyen | Vietnamese (vi) | Elderly fixed-income, senior program eligibility |

**Demo flow:**

1. `/caseworker` → click a family card
2. Submit → see error banner animate in
3. Click "Ask Rosa" → watch benefit jump from $487 → $571 (the caught childcare deduction)
4. Click "Generate Family Plan" → bilingual Spanish plan appears
5. Click "Send to Rosa's Phone" → open `/family` on a phone
6. Tap mic, ask in Spanish → Claude answers in Spanish
7. `/admin` → see the impact dashboard

---

## Setup

### Prerequisites

- Node.js 20+
- An Anthropic API key

### Install & Run

```bash
git clone https://github.com/AnvayP1998/savorbridge.git
cd savorbridge
npm install
cp .env.example .env.local
# Add your Anthropic API key to .env.local
npm run dev
```

Open http://localhost:3000

### Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-your-key-here
NEXT_PUBLIC_DEMO_MODE=true
```

> **Cost tip:** The entire hackathon demo costs ~$4–9 in API calls. Pre-cached responses are served during the live demo so costs on demo day are effectively zero.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| AI | Anthropic Claude API (`claude-haiku-4-5-20251001` + `claude-sonnet-4-6`) |
| Voice | Web Speech API (browser-native, free) |
| Database | JSON files + localStorage (demo-grade, no hosting needed) |
| Charts | Recharts |
| Hosting | Vercel (free tier) |

---

## Project Structure

```
src/
├── app/
│   ├── caseworker/       # Caseworker dashboard + application review
│   ├── family/           # Family mobile companion (voice Q&A)
│   └── admin/            # Impact analytics dashboard
├── lib/claude/
│   ├── client.ts         # Anthropic SDK with retry + caching
│   └── prompts/          # Error detection, plan generation, voice Q&A
├── data/
│   ├── families/         # Demo family JSON files
│   ├── rules/            # SNAP rules (markdown), WIC food packages (JSON)
│   ├── stores/           # DC store list with Double Up eligibility
│   └── cached/           # Pre-cached Claude responses for demo reliability
└── types/
    └── index.ts          # Shared TypeScript interfaces
```

---

## Why It Needs AI

- **Rule reasoning** — SNAP rules change quarterly. Claude re-reasons from updated policy; traditional rule engines require engineer time with every update.
- **Messy inputs** — Photos of paystubs, handwritten forms, nonstandard household compositions.
- **Multilingual cultural output** — "Salvadoran meal plan in Spanish" is an LLM-shaped problem.
- **Caseworker accountability** — Claude drafts, human reviews. Trust stays with the human.

---

## Business Model

The strongest near-term opportunity is **state SaaS contracts** — the 2028 penalty-shift deadline creates urgent, budget-backed demand from state SNAP agencies. At $250K–$1M/year per state contract, even a handful of early state partners represents a sustainable and scalable revenue base.

Additional channels that complement the core:

- **Food bank subscriptions** — ~$8K/year × 200 Feeding America network banks
- **Medicaid food-as-medicine programs** — $3/member/month PMPM fee structure

Unit economics are strong: ~$0.20 API cost per interaction, priced at $5–15 to enterprise, yielding 85%+ gross margins.

---

## License

MIT — open source, built in 24 hours.

---

## Team

| Role | People |
|---|---|
| Backend + API | Ketan Dhamdhere, Anvay Paralikar |
| Frontend + Data | Liam MacDonald, Kosma Chelkowski |
