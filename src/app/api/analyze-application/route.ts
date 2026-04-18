import { NextRequest, NextResponse } from "next/server";
import { detectErrors } from "@/lib/claude/prompts/errorDetection";
import { cachedOrLive } from "@/lib/claude/client";
import type { Family } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const family: Family = await req.json();
    const errors = await cachedOrLive(`errors-${family.id}`, () =>
      detectErrors(family)
    );
    return NextResponse.json({ errors });
  } catch (err) {
    console.error("[analyze-application]", err);
    return NextResponse.json(
      {
        errors: [
          {
            id: "fallback-1",
            type: "system_error",
            title: "Unable to analyze application",
            explanation: "The AI analysis service is temporarily unavailable. Please review this application manually.",
            suggestedAction: "Check application fields manually using SNAP rules reference.",
            fieldAffected: "general",
            benefitImpact: 0,
            severity: "info",
            confidence: 1,
          },
        ],
      },
      { status: 200 }
    );
  }
}
