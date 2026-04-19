SavorBridge

AI copilot for SNAP caseworkers — fewer errors, more food on tables.

Built in 24 hours for George Hacks 2026 × UN Reboot the Earth Hackathon
🚀 Live Demo · 🎥 Demo Video · 📋 Devpost

The Problem
42 million Americans on food stamps leave hundreds of millions of dollars in food benefits unused every year — not because they're careless, but because:

SNAP rules are 400+ pages, updated quarterly, written at a 12th-grade reading level
Caseworkers process 15–20 applications a day, each with 40+ data points, in 30-minute interviews
40%+ of SNAP households speak another language at home
Only 13% of eligible families use Double Up Food Bucks (free produce matching)
Starting 2028, the One Big Beautiful Bill Act shifts $15B/year in SNAP error penalties from federal to state governments

Both problems — errors and underutilization — share the same root cause: caseworkers are stretched too thin.

The Solution
SavorBridge is an AI copilot with three functions, all powered by Claude:
FeatureWhat It Does🔍 Error DetectionCross-checks each application against SNAP rules and flags likely errors before submission📋 Benefit PlanGenerates a personalized shopping route, WIC priorities, and recipes in the family's language in 30 seconds🎙️ Voice Q&AFamilies get a mobile link, tap a mic, and ask questions in Spanish, Creole, Mandarin, or Amharic — no app install

Demo
Three demo families are pre-loaded:
FamilyLanguageKey Demo MomentRosa RodríguezSpanish (es)Missing childcare deduction — $84/month caughtMarie-Claire Jean-BaptisteHaitian Creole (ht)Multi-generational household, two error flagsLan NguyenVietnamese (vi)Elderly fixed-income, senior program eligibility
Demo flow:

/caseworker → click a family card
Submit → see error banner animate in
Click "Ask Rosa" → watch benefit jump from $487 → $571
Click "Generate Family Plan" → bilingual Spanish plan appears
Click "Send to Rosa's Phone" → open /family on a phone
Tap mic, ask in Spanish → Claude answers in Spanish
/admin → see the impact dashboard


Setup
Prerequisites

Node.js 20+
An Anthropic API key

Install & Run
bashgit clone https://github.com/kosmaxing/savorbridge.git
cd savorbridge
npm install
cp .env.example .env.local
# Add your Anthropic API key to .env.local
npm run dev
Open http://localhost:3000
Environment Variables
bash# .env.local
ANTHROPIC_API_KEY=sk-ant-your-key-here
NEXT_PUBLIC_DEMO_MODE=true

Cost tip: Use your own API key. The entire hackathon demo costs ~$4–9 in API calls. Cached responses are served during the live demo so it's effectively free on demo day.

Tech Stack
LayerToolFrontendNext.js 14 + TypeScript + Tailwind CSSAIAnthropic Claude API (Haiku 4.5 + Sonnet 4.6)VoiceWeb Speech API (browser-native, free)DatabaseJSON files + localStorage (demo-grade, no hosting needed)ChartsRechartsHostingVercel (free tier)

Project Structure
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


Why It Needs AI

Rule reasoning — SNAP rules change quarterly. Claude re-reasons; rule engines need engineers every update.
Messy inputs — Photos of paystubs, handwritten forms, nonstandard households.
Multilingual cultural output — "Salvadoran meal plan in Spanish" is an LLM-shaped problem.
Caseworker accountability — Claude drafts, human reviews. Trust stays with the human.


Business Model

State SaaS contracts: $250K–$1M/year per state (hard 2028 deadline = urgent pull)
Food bank subscriptions: ~$8K/year × 200 Feeding America banks
Medicaid PMPM fees: $3/member/month for food-as-medicine programs
Unit economics: ~$0.20 API cost per interaction, priced at $5–15 to enterprise → 85%+ gross margin


License
MIT — open source, built in 24 hours.

Team
Backend + API : Ketan Dhamdhere, Anvay Paralikar
Frontend + data : Liam Mcdonald, Kosma Chelkowski
