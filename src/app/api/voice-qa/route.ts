import { NextRequest, NextResponse } from "next/server";
import { answerVoiceQA, PRE_CACHED_QA } from "@/lib/claude/prompts/voiceQA";
import type { VoiceQARequest } from "@/types";

import rodriguezPlan from "@/data/cached/plan-rodriguez.json";
import jeanBaptistePlan from "@/data/cached/plan-jean-baptiste.json";
import nguyenPlan from "@/data/cached/plan-nguyen.json";

type PlanSummary = {
  monthlySummary: { snapAmount: number; wicValue: number; totalFoodBudget: number };
  wicPriorities: { category: string; quantity: string; expiresAt?: string; urgency: string }[];
  shoppingRoute: { storeName: string; address: string; doubleUpEligible: boolean; wicAccepted: boolean }[];
};

const PLANS: Record<string, PlanSummary> = {
  rodriguez: rodriguezPlan as PlanSummary,
  "jean-baptiste": jeanBaptistePlan as PlanSummary,
  nguyen: nguyenPlan as PlanSummary,
};

function buildFamilyContext(plan: PlanSummary): string {
  const wicLines = plan.wicPriorities.map(
    (w) => `- ${w.category}: ${w.quantity}${w.expiresAt ? `, expires ${w.expiresAt}` : ""} (${w.urgency} urgency)`
  );
  const storeLines = plan.shoppingRoute.map(
    (s) => `- ${s.storeName} (${s.address})${s.doubleUpEligible ? " — Double Up Food Bucks eligible ($25 match)" : ""}${s.wicAccepted ? " — WIC accepted" : ""}`
  );
  return [
    `Monthly SNAP benefit: $${plan.monthlySummary.snapAmount}`,
    `Monthly WIC value: $${plan.monthlySummary.wicValue}`,
    `Total food budget: $${plan.monthlySummary.totalFoodBudget}`,
    `WIC items and expiration dates:`,
    ...wicLines,
    `Recommended stores:`,
    ...storeLines,
  ].join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const body: VoiceQARequest = await req.json();

    // Check pre-cached exact matches first
    const precached = PRE_CACHED_QA[body.query];
    if (precached) {
      return NextResponse.json({ answer: precached });
    }

    // Build family context from cached plan so Claude gives specific answers
    const plan = body.familyId ? PLANS[body.familyId] : undefined;
    const familyContext = plan ? buildFamilyContext(plan) : undefined;

    const result = await answerVoiceQA(body, familyContext);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[voice-qa]", err);
    return NextResponse.json(
      { answer: "Lo siento, no puedo responder en este momento. Por favor pregunta a tu caseworker." },
      { status: 200 }
    );
  }
}
