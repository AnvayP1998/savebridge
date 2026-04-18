import client, { HAIKU, logCost, callWithRetry } from "../client";
import type { VoiceQARequest, VoiceQAResponse } from "@/types";

const SYSTEM_PROMPT = `You are SavorBridge, a friendly SNAP and WIC benefit assistant. You answer eligibility questions in the user's language.

Rules:
- Be concise: 2-3 sentences maximum
- Be warm and practical — you are speaking to a low-income family, not a caseworker
- When relevant, name specific DC stores (Safeway Alabama Ave, Eastern Market, Mi Tierra Bodega, Good Food Markets)
- When relevant, mention Double Up Food Bucks matching
- Answer in the same language the question is asked in
- Never give legal advice — say "your caseworker can confirm" for complex eligibility questions
- Be accurate about what SNAP can and cannot buy`;

export async function answerVoiceQA(
  req: VoiceQARequest
): Promise<VoiceQAResponse> {
  return callWithRetry(async () => {
    const response = await client.messages.create({
      model: HAIKU,
      max_tokens: 256,
      system: SYSTEM_PROMPT,
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

// Pre-cached Q&A pairs for offline demo
export const PRE_CACHED_QA: Record<string, string> = {
  "Can I buy hot chicken with EBT?":
    "No puedes comprar pollo caliente con EBT en el mostrador del deli porque está preparado y listo para comer. Sin embargo, puedes comprar pollo frío o crudo con tu tarjeta EBT. Tu caseworker puede explicarte más detalles.",
  "What produce doubles my money at Safeway?":
    "En Safeway Alabama Ave, el programa Double Up Food Bucks duplica tu dinero en frutas y verduras frescas — hasta $25 por visita. Compra manzanas, plátanos, zanahorias o cualquier fruta o verdura fresca y recibirás el mismo valor adicional gratis.",
  "When does my WIC expire?":
    "Tus beneficios WIC expiran el último día del mes. Los beneficios no utilizados no se transfieren al siguiente mes, así que asegúrate de usar todos tus artículos antes de que venza el período. Revisa tu tarjeta WIC o llama al 1-800-345-1942 para tu saldo.",
};
