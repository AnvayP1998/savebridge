import client, { HAIKU, logCost, callWithRetry } from "../client";
import type { VoiceQARequest, VoiceQAResponse } from "@/types";

function buildSystemPrompt(familyContext?: string): string {
  return `You are SavorBridge, a friendly SNAP and WIC benefit assistant. You answer questions from a specific family about their own benefits.

Rules:
- Be concise: 2-3 sentences maximum
- Be warm and practical — you are speaking to a low-income family, not a caseworker
- Use the FAMILY DATA below to give specific, personalized answers (exact dates, amounts, store names)
- When relevant, name specific DC stores (Safeway Alabama Ave, Eastern Market, Mi Tierra Bodega, Good Food Markets)
- When relevant, mention Double Up Food Bucks matching at Safeway Alabama Ave ($25 match on produce)
- Answer in the same language the question is asked in
- Never say "I don't have access" — you have their benefit data below
- Never give legal advice — say "your caseworker can confirm" for complex eligibility questions
- Be accurate about what SNAP can and cannot buy

${familyContext ? `FAMILY DATA:\n${familyContext}` : ""}`;
}

export async function answerVoiceQA(
  req: VoiceQARequest,
  familyContext?: string
): Promise<VoiceQAResponse> {
  return callWithRetry(async () => {
    const response = await client.messages.create({
      model: HAIKU,
      max_tokens: 256,
      system: buildSystemPrompt(familyContext),
      messages: [
        {
          role: "user",
          content: req.query,
        },
      ],
    });

    logCost(HAIKU, response.usage.input_tokens, response.usage.output_tokens);

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    return { answer: text };
  });
}

// Pre-cached Q&A pairs for questions that don't need personalized data
export const PRE_CACHED_QA: Record<string, string> = {
  "Can I buy hot chicken with EBT?":
    "No puedes comprar pollo caliente con EBT en el mostrador del deli porque está preparado y listo para comer. Sin embargo, puedes comprar pollo frío o crudo con tu tarjeta EBT. Tu caseworker puede explicarte más detalles.",
  "What produce doubles my money at Safeway?":
    "En Safeway Alabama Ave, el programa Double Up Food Bucks duplica tu dinero en frutas y verduras frescas — hasta $25 por visita. Compra manzanas, plátanos, zanahorias o cualquier fruta o verdura fresca y recibirás el mismo valor adicional gratis.",
};
