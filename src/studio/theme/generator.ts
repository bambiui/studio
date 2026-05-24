import type { TokenOverrides } from "../tokens/defaults";

const PRIMARY_SCALE = [
  ["50", 97, 0.018],
  ["100", 94, 0.036],
  ["200", 88, 0.072],
  ["300", 78, 0.12],
  ["400", 66, 0.18],
  ["500", 55, 0.22],
  ["600", 49, 0.23],
  ["700", 42, 0.2],
  ["800", 34, 0.16],
  ["900", 27, 0.12],
  ["950", 18, 0.08],
] as const;

interface RgbColor {
  red: number;
  green: number;
  blue: number;
}

export function createThemeFromBaseColor(hexColor: string): TokenOverrides {
  const rgb = parseHexColor(hexColor) ?? { red: 124, green: 58, blue: 237 };
  const hue = Math.round(rgbToHslHue(rgb));
  const foreground = relativeLuminance(rgb) > 0.56 ? "oklch(9% 0 0)" : "oklch(100% 0 0)";

  const primaryScale = Object.fromEntries(
    PRIMARY_SCALE.map(([step, lightness, chroma]) => [
      `--bambi-primary-${step}`,
      `oklch(${lightness}% ${chroma} ${hue})`,
    ]),
  );

  return {
    ...primaryScale,
    "--bambi-primary": "var(--bambi-primary-500)",
    "--bambi-primary-foreground": foreground,
    "--bambi-ring": "var(--bambi-primary)",
    "--bambi-intent-primary-bg": "var(--bambi-primary)",
    "--bambi-intent-primary-fg": "var(--bambi-primary-foreground)",
    "--bambi-intent-primary-hover-bg": "var(--bambi-primary-600)",
  };
}

export function isValidHexColor(value: string): boolean {
  return parseHexColor(value) !== null;
}

function parseHexColor(value: string): RgbColor | null {
  const normalized = value.trim().replace(/^#/, "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return null;

  return {
    red: Number.parseInt(expanded.slice(0, 2), 16),
    green: Number.parseInt(expanded.slice(2, 4), 16),
    blue: Number.parseInt(expanded.slice(4, 6), 16),
  };
}

function rgbToHslHue({ red, green, blue }: RgbColor): number {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (delta === 0) return 271;

  let hue = 0;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;

  const degrees = hue * 60;
  return degrees < 0 ? degrees + 360 : degrees;
}

function relativeLuminance({ red, green, blue }: RgbColor): number {
  const channels = [red, green, blue].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  const [r, g, b] = channels;
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}
