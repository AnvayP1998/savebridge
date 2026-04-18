import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

export const HAIKU = "claude-haiku-4-5-20251001";
export const SONNET = "claude-sonnet-4-6";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default client;

const CACHE_DIR = path.join(process.cwd(), "src/data/cached");

function getCachePath(key: string) {
  return path.join(CACHE_DIR, `${key}.json`);
}

export async function cachedOrLive<T>(
  cacheKey: string,
  fn: () => Promise<T>
): Promise<T> {
  const cachePath = getCachePath(cacheKey);
  try {
    if (fs.existsSync(cachePath)) {
      const raw = fs.readFileSync(cachePath, "utf-8");
      return JSON.parse(raw) as T;
    }
  } catch {
    // cache miss or parse error — fall through to live call
  }

  const result = await fn();

  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify(result, null, 2), "utf-8");
  } catch {
    // non-fatal — log and continue
    console.warn(`[cache] failed to write ${cacheKey}`);
  }

  return result;
}

export function logCost(
  model: string,
  inputTokens: number,
  outputTokens: number
) {
  const rates: Record<string, { in: number; out: number }> = {
    [HAIKU]: { in: 0.00025, out: 0.00125 },
    [SONNET]: { in: 0.003, out: 0.015 },
  };
  const rate = rates[model] ?? { in: 0.003, out: 0.015 };
  const cost = (inputTokens / 1000) * rate.in + (outputTokens / 1000) * rate.out;
  console.log(
    `[claude] model=${model} in=${inputTokens} out=${outputTokens} cost=$${cost.toFixed(4)}`
  );
}

export async function callWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Claude timeout")), 20_000)
        ),
      ]);
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
  throw new Error("unreachable");
}
