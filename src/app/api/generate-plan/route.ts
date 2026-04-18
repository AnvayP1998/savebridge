import { NextRequest, NextResponse } from "next/server";
import { generateBenefitPlan } from "@/lib/claude/prompts/benefitPlan";
import { cachedOrLive } from "@/lib/claude/client";
import type { Family } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const family: Family = await req.json();
    const plan = await cachedOrLive(`plan-${family.id}`, () =>
      generateBenefitPlan(family)
    );
    return NextResponse.json({ plan });
  } catch (err) {
    console.error("[generate-plan]", err);
    return NextResponse.json({ plan: null, error: "Failed to generate plan" }, { status: 500 });
  }
}
