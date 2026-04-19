import { NextRequest, NextResponse } from "next/server";
import { detectErrors } from "@/lib/claude/prompts/errorDetection";
import type { Family } from "@/types";

// 1. Statically import all cached JSONs so Next.js bundles them automatically
import cachedRodriguezErrors from "@/data/cached/errors-rodriguez.json";
import cachedJeanBaptisteErrors from "@/data/cached/errors-jean-baptiste.json";
import cachedNguyenErrors from "@/data/cached/errors-nguyen.json";

const CACHED_ERRORS: Record<string, unknown[]> = {
  rodriguez: cachedRodriguezErrors,
  "jean-baptiste": cachedJeanBaptisteErrors,
  nguyen: cachedNguyenErrors,
};

export async function POST(req: NextRequest) {
  try {
    const family: Family = await req.json();

    // 2. Demo Bypass: Serve static cache for all known demo families
    if (CACHED_ERRORS[family.id]) {
      console.log(`[analyze-application] Serving static cache for ${family.id}`);
      return NextResponse.json({ errors: CACHED_ERRORS[family.id] });
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