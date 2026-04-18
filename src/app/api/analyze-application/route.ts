import { NextRequest, NextResponse } from "next/server";
import { detectErrors } from "@/lib/claude/prompts/errorDetection";
import type { Family } from "@/types";

// 1. Statically import the cached JSON so Next.js bundles it automatically
import cachedRodriguezErrors from "@/data/cached/errors-rodriguez.json";

export async function POST(req: NextRequest) {
  try {
    const family: Family = await req.json();

    // 2. Demo Bypass: If it's Rosa (fam-001), instantly serve the static cache
    if (family.id === "rodriguez") {
      console.log("[analyze-application] Serving static cache for demo");
      return NextResponse.json({ errors: cachedRodriguezErrors });
    }

    // 3. Fallback to live AI if it's a different family (will fail if no credits)
    const errors = await detectErrors(family);
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