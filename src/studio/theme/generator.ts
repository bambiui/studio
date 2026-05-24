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

const NEUTRAL_SCALE = [
  ["50", 97, 0.01],
  ["100", 95, 0.008],
  ["200", 90, 0.01],
  ["300", 83, 0.012],
  ["400", 68, 0.018],
  ["500", 55, 0.021],
  ["600", 45, 0.02],
  ["700", 36, 0.018],
  ["800", 28, 0.014],
  ["900", 21, 0.012],
  ["950", 9, 0],
] as const;

const INTENT_SCALE = [
  ["50", 97, 0.02],
  ["100", 93, 0.045],
  ["200", 86, 0.09],
  ["300", 78, 0.15],
  ["400", 71, 0.2],
  ["500", 65, 0.233],
  ["600", 58, 0.22],
  ["700", 49, 0.19],
  ["800", 40, 0.15],
  ["900", 32, 0.11],
  ["950", 22, 0.08],
] as const;

const WARNING_SCALE = [
  ["50", 98, 0.025],
  ["100", 95, 0.055],
  ["200", 90, 0.09],
  ["300", 84, 0.125],
  ["400", 81, 0.145],
  ["500", 78, 0.159],
  ["600", 69, 0.15],
  ["700", 58, 0.13],
  ["800", 46, 0.1],
  ["900", 35, 0.075],
  ["950", 24, 0.055],
] as const;

interface RgbColor {
  red: number;
  green: number;
  blue: number;
}

export function createThemeFromBaseColor(hexColor: string): TokenOverrides {
  const rgb = parseHexColor(hexColor) ?? { red: 124, green: 58, blue: 237 };
  const hue = Math.round(rgbToHslHue(rgb));
  const primaryForeground =
    relativeLuminance(rgb) > 0.56 ? "oklch(9% 0 0)" : "oklch(100% 0 0)";
  const neutralHue = normalizeHue(hue + 8);

  return {
    ...createScale("--bambi-primary", PRIMARY_SCALE, hue),
    ...createScale("--bambi-neutral", NEUTRAL_SCALE, neutralHue),
    ...createScale("--bambi-danger", INTENT_SCALE, 28),
    ...createScale("--bambi-success", INTENT_SCALE, 153),
    ...createScale("--bambi-warning", WARNING_SCALE, 74),
    "--bambi-background": "var(--bambi-neutral-50)",
    "--bambi-foreground": "var(--bambi-neutral-950)",
    "--bambi-card": "var(--bambi-color-white)",
    "--bambi-card-foreground": "var(--bambi-neutral-950)",
    "--bambi-popover": "var(--bambi-color-white)",
    "--bambi-popover-foreground": "var(--bambi-neutral-950)",
    "--bambi-primary": "var(--bambi-primary-500)",
    "--bambi-primary-foreground": primaryForeground,
    "--bambi-secondary": "var(--bambi-neutral-100)",
    "--bambi-secondary-foreground": "var(--bambi-neutral-950)",
    "--bambi-accent": "var(--bambi-neutral-100)",
    "--bambi-accent-foreground": "var(--bambi-neutral-950)",
    "--bambi-muted": "var(--bambi-neutral-100)",
    "--bambi-muted-foreground": "var(--bambi-neutral-500)",
    "--bambi-danger": "var(--bambi-danger-500)",
    "--bambi-danger-foreground": "var(--bambi-color-white)",
    "--bambi-success": "var(--bambi-success-500)",
    "--bambi-success-foreground": "var(--bambi-neutral-950)",
    "--bambi-warning": "var(--bambi-warning-500)",
    "--bambi-warning-foreground": "var(--bambi-neutral-950)",
    "--bambi-border": "var(--bambi-neutral-200)",
    "--bambi-input": "var(--bambi-neutral-200)",
    "--bambi-input-background": "var(--bambi-color-white)",
    "--bambi-input-foreground": "var(--bambi-neutral-950)",
    "--bambi-input-placeholder": "var(--bambi-neutral-500)",
    "--bambi-ring": "var(--bambi-primary)",
    "--bambi-separator": "var(--bambi-neutral-200)",
    "--bambi-intent-primary-bg": "var(--bambi-primary)",
    "--bambi-intent-primary-fg": "var(--bambi-primary-foreground)",
    "--bambi-intent-primary-hover-bg": "var(--bambi-primary-600)",
    "--bambi-intent-secondary-bg": "var(--bambi-secondary)",
    "--bambi-intent-secondary-fg": "var(--bambi-secondary-foreground)",
    "--bambi-intent-secondary-hover-bg": "var(--bambi-accent)",
    "--bambi-intent-danger-bg": "var(--bambi-danger)",
    "--bambi-intent-danger-fg": "var(--bambi-danger-foreground)",
    "--bambi-intent-danger-hover-bg": "var(--bambi-danger-600)",
    "--bambi-intent-success-bg": "var(--bambi-success)",
    "--bambi-intent-success-fg": "var(--bambi-success-foreground)",
    "--bambi-intent-success-hover-bg": "var(--bambi-success-600)",
    "--bambi-intent-warning-bg": "var(--bambi-warning)",
    "--bambi-intent-warning-fg": "var(--bambi-warning-foreground)",
    "--bambi-intent-warning-hover-bg": "var(--bambi-warning-600)",
  };
}

export function isValidHexColor(value: string): boolean {
  return parseHexColor(value) !== null;
}

function createScale(
  prefix: string,
  scale: readonly (readonly [string, number, number])[],
  hue: number,
): TokenOverrides {
  return Object.fromEntries(
    scale.map(([step, lightness, chroma]) => [
      `${prefix}-${step}`,
      `oklch(${lightness}% ${chroma} ${normalizeHue(hue)})`,
    ]),
  );
}

function normalizeHue(hue: number): number {
  const normalized = hue % 360;
  return normalized < 0 ? normalized + 360 : normalized;
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
