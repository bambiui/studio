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
    const backgroundLuminance = getRelativeLuminance(backgroundValue);
    const foregroundLuminance = getRelativeLuminance(foregroundValue);
    const score =
      backgroundLuminance === null || foregroundLuminance === null
        ? null
        : getContrastRatio(backgroundLuminance, foregroundLuminance);

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
    const reference = value.match(/^var\(\s*(--[\w-]+)\s*(?:,[^)]+)?\)$/)?.[1];
    if (!reference || seen.has(reference)) return value;
    seen.add(reference);
    value = tokens[reference] ?? value;
  }

  return value;
}

function getRelativeLuminance(value: string): number | null {
  const oklch = parseOklch(value);
  if (oklch)
    return oklchRelativeLuminance(oklch.lightness, oklch.chroma, oklch.hue);

  const rgb = parseHex(value) ?? parseRgb(value);
  if (!rgb) return null;

  return rgbRelativeLuminance(rgb.r, rgb.g, rgb.b);
}

function parseOklch(
  value: string,
): { lightness: number; chroma: number; hue: number } | null {
  const match = value.match(
    /oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:deg)?/i,
  );
  if (!match?.[1] || !match[2] || !match[3]) return null;

  const rawLightness = Number.parseFloat(match[1]);
  const chroma = Number.parseFloat(match[2]);
  const hue = Number.parseFloat(match[3]);
  const lightness = rawLightness > 1 ? rawLightness / 100 : rawLightness;

  if (![lightness, chroma, hue].every(Number.isFinite)) return null;
  return { lightness, chroma, hue };
}

function parseHex(value: string): { r: number; g: number; b: number } | null {
  const clean = value.trim().replace("#", "");
  const normalized =
    clean.length === 3
      ? clean
          .split("")
          .map((part) => `${part}${part}`)
          .join("")
      : clean;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;

  return {
    r: parseInt(normalized.slice(0, 2), 16) / 255,
    g: parseInt(normalized.slice(2, 4), 16) / 255,
    b: parseInt(normalized.slice(4, 6), 16) / 255,
  };
}

function parseRgb(value: string): { r: number; g: number; b: number } | null {
  const match = value.match(/rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/i);
  if (!match?.[1] || !match[2] || !match[3]) return null;

  const r = Number.parseFloat(match[1]);
  const g = Number.parseFloat(match[2]);
  const b = Number.parseFloat(match[3]);
  if (![r, g, b].every(Number.isFinite)) return null;

  return { r: r / 255, g: g / 255, b: b / 255 };
}

function oklchRelativeLuminance(L: number, C: number, H: number): number {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  return rgbRelativeLuminance(
    clamp01(
      4.0767416621 * l_ ** 3 - 3.3077115913 * m_ ** 3 + 0.2309699292 * s_ ** 3,
    ),
    clamp01(
      -1.2684380046 * l_ ** 3 + 2.6097574011 * m_ ** 3 - 0.3413193965 * s_ ** 3,
    ),
    clamp01(
      -0.0041960863 * l_ ** 3 - 0.7034186147 * m_ ** 3 + 1.707614701 * s_ ** 3,
    ),
  );
}

function rgbRelativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function toLinear(channel: number): number {
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function getContrastRatio(luminanceA: number, luminanceB: number): number {
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}

function getRating(score: number | null): ContrastReportItem["rating"] {
  if (score === null) return "unknown";
  if (score >= 7) return "strong";
  if (score >= 4.5) return "moderate";
  return "weak";
}
