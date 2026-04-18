import { NextRequest, NextResponse } from "next/server";
import { generateBenefitPlan } from "@/lib/claude/prompts/benefitPlan";
import type { Family } from "@/types";

// 1. Statically import the cached JSON
import cachedRodriguezPlan from "@/data/cached/plan-rodriguez.json";

export async function POST(req: NextRequest) {
  try {
    const family: Family = await req.json();

    // 2. Demo Bypass: Instantly serve the static cache for Rosa
    if (family.id === "rodriguez") {
      console.log("[generate-plan] Serving static cache for demo");
      return NextResponse.json({ plan: cachedRodriguezPlan });
    }

    // 3. Fallback to live AI 
    const plan = await generateBenefitPlan(family);
    return NextResponse.json({ plan });
  } catch (err) {
    console.error("[generate-plan]", err);
    return NextResponse.json({ plan: null, error: "Failed to generate plan" }, { status: 500 });
  }
}