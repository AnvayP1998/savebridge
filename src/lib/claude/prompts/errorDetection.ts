import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import client, { SONNET, logCost, callWithRetry } from "../client";
import type { Family, ErrorFlag } from "@/types";

const snapRules = fs.readFileSync(
  path.join(process.cwd(), "src/data/rules/snap.md"),
  "utf-8"
);

const SYSTEM_PROMPT = `You are an expert SNAP (Supplemental Nutrition Assistance Program) eligibility specialist and error detection AI embedded in the SavorBridge caseworker portal. Your job is to review SNAP application data and flag potential errors, missing deductions, and benefit maximization opportunities.

You have deep knowledge of 7 CFR Part 273 and the following condensed SNAP rules:

<snap_rules>
${snapRules}
</snap_rules>

When reviewing an application:
1. Check for missing deductions (dependent care, medical, shelter optimization)
2. Verify household composition makes sense given ages and notes
3. Look for signs of under-reported or over-reported income
4. Check if utility standard allowance would be more beneficial than actual costs
5. Flag categorical eligibility opportunities

Be conservative — only flag issues you are highly confident about. Do not flag things that are merely possible; flag things that are probable given the data.

Return only the tool_use block. Do not add commentary outside the tool call.`;

const detectErrorsTool: Anthropic.Tool = {
  name: "flag_application_errors",
  description:
    "Flag potential errors, missing deductions, or benefit maximization opportunities in a SNAP application",
  input_schema: {
    type: "object" as const,
    properties: {
      errors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string" },
            title: { type: "string" },
            explanation: { type: "string" },
            suggestedAction: { type: "string" },
            fieldAffected: { type: "string" },
            benefitImpact: { type: "number" },
            severity: { type: "string", enum: ["critical", "warning", "info"] },
            confidence: { type: "number" },
            references: { type: "array", items: { type: "string" } },
          },
          required: ["id", "type", "title", "explanation", "suggestedAction", "fieldAffected", "benefitImpact", "severity", "confidence"],
        },
      },
    },
    required: ["errors"],
  },
};

export async function detectErrors(family: Family): Promise<ErrorFlag[]> {
  const applicationSummary = `
Family: ${family.name}, age ${family.age}, ${family.ethnicity}
Case #: ${family.caseNumber}
Household size: ${family.householdSize}
Children: ${family.children.map((c) => `${c.name} age ${c.age}`).join(", ") || "none"}
Monthly gross income: $${family.monthlyIncome}
Monthly rent: $${family.rent}
Monthly utilities: $${family.utilities}
Childcare cost reported: $${family.childcareCost}
Medical expenses reported: $${family.medicalExpenses}
Current SNAP benefit: $${family.currentSnapBenefit}
Notes: ${family.notes}
  `.trim();

  return callWithRetry(async () => {
    const response = await client.messages.create({
      model: SONNET,
      max_tokens: 1024,
      tools: [detectErrorsTool],
      tool_choice: { type: "any" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Please review this SNAP application for errors or missing deductions:\n\n${applicationSummary}`,
        },
      ],
    });

    logCost(
      SONNET,
      response.usage.input_tokens,
      response.usage.output_tokens
    );

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") return [];

    const { errors } = toolUse.input as { errors: ErrorFlag[] };
    return errors ?? [];
  });
}
