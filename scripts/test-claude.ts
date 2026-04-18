import { detectErrors } from "../src/lib/claude/prompts/errorDetection";
import { generateBenefitPlan } from "../src/lib/claude/prompts/benefitPlan";
import { answerVoiceQA } from "../src/lib/claude/prompts/voiceQA";
import { cachedOrLive } from "../src/lib/claude/client";
import rodriguez from "../src/data/families/rodriguez.json";
import type { Family, VoiceQARequest } from "../src/types";

const family = rodriguez as Family;

async function main() {
  console.log("\n=== TEST 1: Error Detection for Rosa Rodriguez ===");
  const errors = await cachedOrLive(`errors-${family.id}`, () => detectErrors(family));
  console.log(JSON.stringify(errors, null, 2));

  console.log("\n=== TEST 2: Benefit Plan for Rosa Rodriguez ===");
  const plan = await cachedOrLive(`plan-${family.id}`, () => generateBenefitPlan(family));
  console.log(JSON.stringify(plan, null, 2));

  console.log("\n=== TEST 3: Voice Q&A ===");
  const questions: VoiceQARequest[] = [
    { query: "Can I buy hot chicken with EBT?", language: "es-US", familyId: family.id },
    { query: "What produce doubles my money at Safeway?", language: "es-US", familyId: family.id },
    { query: "When does my WIC expire?", language: "es-US", familyId: family.id },
  ];
  for (const q of questions) {
    const key = `voice-${q.familyId}-${Buffer.from(q.query).toString("base64").slice(0, 20)}`;
    const answer = await cachedOrLive(key, () => answerVoiceQA(q));
    console.log(`Q: ${q.query}\nA: ${answer.answer}\n`);
  }

  console.log("\n✅ All tests complete. Cache files written to src/data/cached/");
}

main().catch(console.error);
