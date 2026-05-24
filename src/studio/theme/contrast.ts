import type { TokenOverrides } from "../tokens/defaults";

interface ContrastPair {
  id: string;
  label: string;
  background: string;
  foreground: string;
}

export interface ContrastReportItem extends ContrastPair {
  backgroundValue: string;
  foregroundValue: string;
  score: number | null;
  rating: "strong" | "moderate" | "weak" | "unknown";
}

const BUILT_IN_TOKENS: TokenOverrides = {
  "--bambi-color-white": "oklch(100% 0 0)",
  "--bambi-color-black": "oklch(0% 0 0)",
};

const CONTRAST_PAIRS: ContrastPair[] = [
  {
    id: "app",
    label: "App surface",
    background: "--bambi-background",
    foreground: "--bambi-foreground",
  },
  {
    id: "primary",
    label: "Primary action",
    background: "--bambi-primary",
    foreground: "--bambi-primary-foreground",
  },
  {
    id: "card",
    label: "Card surface",
    background: "--bambi-card",
    foreground: "--bambi-card-foreground",
  },
];

export function getContrastReport(
  tokens: TokenOverrides,
  fallbackTokens: TokenOverrides,
): ContrastReportItem[] {
  const tokenMap = { ...BUILT_IN_TOKENS, ...fallbackTokens, ...tokens };

  return CONTRAST_PAIRS.map((pair) => {
    const backgroundValue = resolveTokenValue(pair.background, tokenMap);
    const foregroundValue = resolveTokenValue(pair.foreground, tokenMap);
    const backgroundLightness = extractOklchLightness(backgroundValue);
    const foregroundLightness = extractOklchLightness(foregroundValue);
    const score =
      backgroundLightness === null || foregroundLightness === null
        ? null
        : Math.abs(backgroundLightness - foregroundLightness);

    return {
      ...pair,
      backgroundValue,
      foregroundValue,
      score,
      rating: getRating(score),
    };
  });
}

function resolveTokenValue(tokenId: string, tokens: TokenOverrides): string {
  let value = tokens[tokenId] ?? "";
  const seen = new Set<string>([tokenId]);

  for (let depth = 0; depth < 8; depth += 1) {
    const reference = value.match(/^var\((--[\w-]+)\)$/)?.[1];
    if (!reference || seen.has(reference)) return value;
    seen.add(reference);
    value = tokens[reference] ?? value;
  }

  return value;
}

function extractOklchLightness(value: string): number | null {
  const match = value.match(/oklch\(\s*([\d.]+)%/i);
  if (!match?.[1]) return null;

  const lightness = Number.parseFloat(match[1]);
  return Number.isFinite(lightness) ? lightness : null;
}

function getRating(score: number | null): ContrastReportItem["rating"] {
  if (score === null) return "unknown";
  if (score >= 60) return "strong";
  if (score >= 42) return "moderate";
  return "weak";
}
