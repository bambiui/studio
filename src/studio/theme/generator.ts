import type { TokenOverrides } from "../tokens/defaults";

function toLinear(c: number) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function toGamma(c: number) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
}

export function hexToOklch(
  hex: string,
): { hue: number; chroma: number } | null {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;

  const r = toLinear(parseInt(clean.slice(0, 2), 16) / 255);
  const g = toLinear(parseInt(clean.slice(2, 4), 16) / 255);
  const b = toLinear(parseInt(clean.slice(4, 6), 16) / 255);
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bv = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  return {
    chroma: Math.sqrt(a * a + bv * bv),
    hue: ((Math.atan2(bv, a) * 180) / Math.PI + 360) % 360,
  };
}

export function oklchToHex(L: number, C: number, H: number): string {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const rl = Math.max(
    0,
    Math.min(1, 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
  );
  const gl = Math.max(
    0,
    Math.min(1, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
  );
  const bl = Math.max(
    0,
    Math.min(1, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  );
  const rv = Math.round(toGamma(rl) * 255);
  const gv = Math.round(toGamma(gl) * 255);
  const bv = Math.round(toGamma(bl) * 255);

  return `#${rv.toString(16).padStart(2, "0")}${gv.toString(16).padStart(2, "0")}${bv.toString(16).padStart(2, "0")}`;
}

function relativeLuminance(L: number, C: number, H: number): number {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const r = Math.max(
    0,
    Math.min(1, 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
  );
  const g = Math.max(
    0,
    Math.min(1, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
  );
  const bv = Math.max(
    0,
    Math.min(1, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  );

  return 0.2126 * r + 0.7152 * g + 0.0722 * bv;
}

export function bestFg(bgL: number, bgC: number, bgH: number): string {
  const bgLum = relativeLuminance(bgL, bgC, bgH);
  const wLum = relativeLuminance(0.98, 0, 0);
  const hi = Math.max(bgLum, wLum);
  const lo = Math.min(bgLum, wLum);

  return (hi + 0.05) / (lo + 0.05) >= 4.5 ? "oklch(98% 0 0)" : "oklch(9% 0 0)";
}

function blendHue(primary: number, def: number): number {
  return (((def + (primary - 253.83) * 0.12) % 360) + 360) % 360;
}

function fmt(L: number, C: number, H: number): string {
  return `oklch(${Math.round(L * 100)}% ${C.toFixed(3)} ${Math.round(H)})`;
}

const SCALE_STEPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
];

const NEUTRAL_SCALE = [
  [0.97, 1],
  [0.95, 0.8],
  [0.9, 1],
  [0.83, 1.2],
  [0.68, 1.8],
  [0.55, 2.1],
  [0.45, 2],
  [0.36, 1.8],
  [0.28, 1.4],
  [0.21, 1.2],
  [0.09, 0],
] as const;

const PRIMARY_SCALE = [
  [0.97, 0.08],
  [0.94, 0.16],
  [0.88, 0.33],
  [0.78, 0.55],
  [0.66, 0.82],
  [0.55, 1],
  [0.49, 1.05],
  [0.42, 0.91],
  [0.34, 0.73],
  [0.27, 0.55],
  [0.18, 0.36],
] as const;

const DANGER_SCALE = [
  [0.97, 0.09],
  [0.93, 0.19],
  [0.86, 0.39],
  [0.78, 0.64],
  [0.71, 0.86],
  [0.65, 1],
  [0.58, 0.94],
  [0.49, 0.82],
  [0.4, 0.64],
  [0.32, 0.47],
  [0.22, 0.34],
] as const;

const SUCCESS_SCALE = [
  [0.97, 0.13],
  [0.93, 0.28],
  [0.87, 0.49],
  [0.8, 0.75],
  [0.76, 0.88],
  [0.73, 1],
  [0.64, 0.93],
  [0.54, 0.77],
  [0.43, 0.62],
  [0.33, 0.46],
  [0.22, 0.31],
] as const;

const WARNING_SCALE = [
  [0.98, 0.16],
  [0.95, 0.35],
  [0.9, 0.57],
  [0.84, 0.79],
  [0.81, 0.91],
  [0.78, 1],
  [0.69, 0.95],
  [0.58, 0.82],
  [0.46, 0.63],
  [0.35, 0.47],
  [0.24, 0.35],
] as const;

function addScale(
  tokens: TokenOverrides,
  name: string,
  hue: number,
  chroma: number,
  profile: readonly (readonly [number, number])[],
) {
  profile.forEach(([lightness, chromaRatio], index) => {
    const step = SCALE_STEPS[index];
    if (!step) return;
    tokens[`--bambi-${name}-${step}`] = fmt(
      lightness,
      chroma * chromaRatio,
      hue,
    );
  });
}

export function generateColorTokens(
  hue: number,
  chroma: number,
  base: number,
): TokenOverrides {
  const gc = 0.0015 + (base / 100) * (0.02 - 0.0015);
  const dHL = blendHue(hue, 25.74);
  const sH = blendHue(hue, 150.81);
  const wHL = blendHue(hue, 72.33);
  const tokens: TokenOverrides = {};

  addScale(tokens, "neutral", hue, gc, NEUTRAL_SCALE);
  addScale(tokens, "primary", hue, chroma, PRIMARY_SCALE);
  addScale(tokens, "danger", dHL, 0.233, DANGER_SCALE);
  addScale(tokens, "success", sH, 0.194, SUCCESS_SCALE);
  addScale(tokens, "warning", wHL, 0.159, WARNING_SCALE);

  return tokens;
}

export const DEFAULT_GENERATOR_HUE = 271;
export const DEFAULT_GENERATOR_CHROMA = 0.22;
export const DEFAULT_BASE_SLIDER_VALUE = 46;

export function createThemeFromBaseColor(
  hexColor: string,
  base = DEFAULT_BASE_SLIDER_VALUE,
): TokenOverrides {
  const color = hexToOklch(hexColor) ?? {
    hue: DEFAULT_GENERATOR_HUE,
    chroma: DEFAULT_GENERATOR_CHROMA,
  };
  return generateColorTokens(color.hue, color.chroma, base);
}

export function createDarkThemeFromBaseColor(
  hexColor: string,
  base = DEFAULT_BASE_SLIDER_VALUE,
): TokenOverrides {
  return {
    ...createThemeFromBaseColor(hexColor, base),
    "--bambi-background": "var(--bambi-neutral-950)",
    "--bambi-foreground": "var(--bambi-neutral-50)",
    "--bambi-card": "var(--bambi-neutral-900)",
    "--bambi-card-foreground": "var(--bambi-neutral-50)",
    "--bambi-popover": "var(--bambi-neutral-900)",
    "--bambi-popover-foreground": "var(--bambi-neutral-50)",
    "--bambi-secondary": "var(--bambi-neutral-800)",
    "--bambi-secondary-foreground": "var(--bambi-neutral-50)",
    "--bambi-accent": "var(--bambi-neutral-800)",
    "--bambi-accent-foreground": "var(--bambi-neutral-50)",
    "--bambi-muted": "var(--bambi-neutral-800)",
    "--bambi-muted-foreground": "var(--bambi-neutral-400)",
    "--bambi-border": "var(--bambi-neutral-800)",
    "--bambi-input": "var(--bambi-neutral-700)",
    "--bambi-input-background": "var(--bambi-neutral-900)",
    "--bambi-input-foreground": "var(--bambi-neutral-50)",
    "--bambi-input-placeholder": "var(--bambi-neutral-400)",
    "--bambi-separator": "var(--bambi-neutral-800)",
  };
}

export function isValidHexColor(value: string): boolean {
  return hexToOklch(value) !== null;
}
