import { NextRequest, NextResponse } from "next/server";
import { answerVoiceQA, PRE_CACHED_QA } from "@/lib/claude/prompts/voiceQA";
import { cachedOrLive } from "@/lib/claude/client";
import type { VoiceQARequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: VoiceQARequest = await req.json();

    // Check pre-cached exact matches first
    const precached = PRE_CACHED_QA[body.query];
    if (precached) {
      return NextResponse.json({ answer: precached });
    }

    const cacheKey = `voice-${body.familyId}-${Buffer.from(body.query).toString("base64").slice(0, 20)}`;
    const result = await cachedOrLive(cacheKey, () => answerVoiceQA(body));
    return NextResponse.json(result);
  } catch (err) {
    console.error("[voice-qa]", err);
    return NextResponse.json(
      { answer: "Lo siento, no puedo responder en este momento. Por favor pregunta a tu caseworker." },
      { status: 200 }
    );
  }
}
