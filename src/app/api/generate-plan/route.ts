import { NextRequest, NextResponse } from "next/server";
import { generateBenefitPlan } from "@/lib/claude/prompts/benefitPlan";
import type { Family } from "@/types";

// 1. Statically import all cached JSONs
import cachedRodriguezPlan from "@/data/cached/plan-rodriguez.json";
import cachedJeanBaptistePlan from "@/data/cached/plan-jean-baptiste.json";
import cachedNguyenPlan from "@/data/cached/plan-nguyen.json";

const CACHED_PLANS: Record<string, unknown> = {
  rodriguez: cachedRodriguezPlan,
  "jean-baptiste": cachedJeanBaptistePlan,
  nguyen: cachedNguyenPlan,
};

export async function POST(req: NextRequest) {
  try {
    const family: Family = await req.json();

    // 2. Demo Bypass: Serve static cache for all known demo families
    if (CACHED_PLANS[family.id]) {
      console.log(`[generate-plan] Serving static cache for ${family.id}`);
      return NextResponse.json({ plan: CACHED_PLANS[family.id] });
    }

    // 3. Fallback to live AI 
    const plan = await generateBenefitPlan(family);
    return NextResponse.json({ plan });
  } catch (err) {
    console.error("[generate-plan]", err);
    return NextResponse.json({ plan: null, error: "Failed to generate plan" }, { status: 500 });
  }
}