import fs from "fs";
import path from "path";
import client, { SONNET, logCost, callWithRetry } from "../client";
import type { Family, BenefitPlan } from "@/types";

const storesData = fs.readFileSync(
  path.join(process.cwd(), "src/data/stores/dc.json"),
  "utf-8"
);
const wicData = fs.readFileSync(
  path.join(process.cwd(), "src/data/rules/wic-dc.json"),
  "utf-8"
);

const SYSTEM_PROMPT = `You are SavorBridge, an AI benefit navigator for SNAP and WIC recipients. You generate personalized, multilingual monthly benefit plans for families.

You have access to DC area store data and WIC food package rules:

<dc_stores>
${storesData}
</dc_stores>

<wic_dc_rules>
${wicData}
</wic_dc_rules>

When generating a plan:
1. Respond in the family's primary language (es=Spanish, ht=Haitian Creole, vi=Vietnamese, en=English)
2. Prioritize WIC items expiring soonest (urgency: high)
3. Include Double Up Food Bucks stores when available near the family
4. Recommend culturally relevant recipes that use WIC items
5. Write warmly and practically — this is going to a real family's phone
6. Shopping route should be ordered by priority (most benefit first)

Return only the tool_use block.`;

const generatePlanTool = {
  name: "generate_benefit_plan",
  description: "Generate a complete monthly benefit plan for a SNAP/WIC family",
  input_schema: {
    type: "object" as const,
    properties: {
      familyId: { type: "string" },
      language: { type: "string" },
      generatedAt: { type: "string" },
      monthlySummary: {
        type: "object",
        properties: {
          snapAmount: { type: "number" },
          wicValue: { type: "number" },
          doubleUpPotential: { type: "number" },
          totalFoodBudget: { type: "number" },
        },
        required: ["snapAmount", "wicValue", "doubleUpPotential", "totalFoodBudget"],
      },
      shoppingRoute: {
        type: "array",
        items: {
          type: "object",
          properties: {
            storeId: { type: "string" },
            storeName: { type: "string" },
            address: { type: "string" },
            snapAccepted: { type: "boolean" },
            wicAccepted: { type: "boolean" },
            doubleUpEligible: { type: "boolean" },
            doubleUpMatchMax: { type: "number" },
            recommendedItems: { type: "array", items: { type: "string" } },
            estimatedSavings: { type: "number" },
            priority: { type: "number" },
            notes: { type: "string" },
          },
          required: ["storeId", "storeName", "address", "snapAccepted", "wicAccepted", "doubleUpEligible", "doubleUpMatchMax", "recommendedItems", "estimatedSavings", "priority"],
        },
      },
      wicPriorities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: { type: "string" },
            quantity: { type: "string" },
            expiresAt: { type: "string" },
            urgency: { type: "string", enum: ["low", "medium", "high"] },
            notes: { type: "string" },
          },
          required: ["category", "quantity", "expiresAt", "urgency"],
        },
      },
      recipes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            nameTranslated: { type: "string" },
            description: { type: "string" },
            servings: { type: "number" },
            ingredients: { type: "array", items: { type: "string" } },
            usesWicItems: { type: "array", items: { type: "string" } },
            culturalOrigin: { type: "string" },
            prepTimeMinutes: { type: "number" },
            tags: { type: "array", items: { type: "string" } },
          },
          required: ["name", "description", "servings", "ingredients", "usesWicItems", "prepTimeMinutes", "tags"],
        },
      },
      tips: { type: "array", items: { type: "string" } },
      planNarrative: { type: "string" },
    },
    required: ["familyId", "language", "generatedAt", "monthlySummary", "shoppingRoute", "wicPriorities", "recipes", "tips", "planNarrative"],
  },
};

export async function generateBenefitPlan(family: Family): Promise<BenefitPlan> {
  const wicSummary = family.wicItems
    .map((i) => `${i.category} (${i.quantity}, expires ${i.expiresAt}, urgency: ${i.urgency})`)
    .join("\n");

  const prompt = `Generate a complete monthly benefit plan for this family:

Name: ${family.name}
Language: ${family.language}
Household: ${family.householdSize} people, children ages ${family.children.map((c) => c.age).join(", ") || "none"}
Monthly SNAP: $${family.currentSnapBenefit}
Monthly WIC value: $${family.currentWicBenefit}
Preferred stores: ${family.preferredStores.join(", ")}
Ethnicity/cuisine preferences: ${family.ethnicity}

WIC items (must use before expiry):
${wicSummary || "None"}

Notes: ${family.notes}

Generate the full plan in ${family.language === "es" ? "Spanish" : family.language === "ht" ? "Haitian Creole" : family.language === "vi" ? "Vietnamese" : "English"}, with recipes using the expiring WIC items.`;

  return callWithRetry(async () => {
    const response = await client.messages.create({
      model: SONNET,
      max_tokens: 2048,
      tools: [generatePlanTool],
      tool_choice: { type: "any" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    logCost(SONNET, response.usage.input_tokens, response.usage.output_tokens);

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("No tool_use block returned from Claude");
    }

    return toolUse.input as BenefitPlan;
  });
}
