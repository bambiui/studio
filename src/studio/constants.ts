import { editableTokenDefaults, type TokenOverrides } from "./tokens/defaults";
import type { PreviewScheme } from "./types";

export const STORAGE_KEY = "bambiui-studio-theme";
export const CANVAS_STORAGE_KEY = "bambiui-studio-canvas";

export const PREVIEW_SCHEMES: Record<PreviewScheme, TokenOverrides> = {
  light: {
    "--bambi-background": editableTokenDefaults["--bambi-background"] ?? "",
    "--bambi-foreground": editableTokenDefaults["--bambi-foreground"] ?? "",
    "--bambi-card": editableTokenDefaults["--bambi-card"] ?? "",
    "--bambi-card-foreground":
      editableTokenDefaults["--bambi-card-foreground"] ?? "",
    "--bambi-muted": editableTokenDefaults["--bambi-muted"] ?? "",
    "--bambi-border": editableTokenDefaults["--bambi-border"] ?? "",
    "--bambi-input": editableTokenDefaults["--bambi-input"] ?? "",
    "--bambi-input-background":
      editableTokenDefaults["--bambi-input-background"] ?? "",
    "--bambi-input-foreground":
      editableTokenDefaults["--bambi-input-foreground"] ?? "",
    "--bambi-input-placeholder":
      editableTokenDefaults["--bambi-input-placeholder"] ?? "",
  },
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
