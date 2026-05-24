import type { TokenOverrides } from "./tokens/defaults";
import type { PreviewScheme } from "./types";

export const STORAGE_KEY = "bambiui-studio-theme";

export const PREVIEW_SCHEMES: Record<PreviewScheme, TokenOverrides> = {
  light: {},
  dark: {
    "--bambi-background": "oklch(9% 0 0)",
    "--bambi-foreground": "oklch(97% 0.01 271)",
    "--bambi-card": "oklch(14% 0.01 271)",
    "--bambi-card-foreground": "oklch(97% 0.01 271)",
    "--bambi-muted": "oklch(21% 0.012 271)",
    "--bambi-border": "oklch(28% 0.014 271)",
    "--bambi-input": "oklch(36% 0.018 271)",
    "--bambi-input-background": "oklch(14% 0.01 271)",
    "--bambi-input-foreground": "oklch(97% 0.01 271)",
    "--bambi-input-placeholder": "oklch(68% 0.018 271)",
  },
};
