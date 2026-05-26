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
    "--bambi-popover": "var(--bambi-color-white)",
    "--bambi-popover-foreground": "var(--bambi-neutral-950)",
    "--bambi-primary": "var(--bambi-primary-500)",
    "--bambi-primary-foreground": "var(--bambi-color-white)",
    "--bambi-secondary": "var(--bambi-neutral-100)",
    "--bambi-secondary-foreground": "var(--bambi-neutral-950)",
    "--bambi-accent": "var(--bambi-neutral-100)",
    "--bambi-accent-foreground": "var(--bambi-neutral-950)",
    "--bambi-muted": editableTokenDefaults["--bambi-muted"] ?? "",
    "--bambi-muted-foreground": "var(--bambi-neutral-500)",
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
    "--bambi-background": "var(--bambi-neutral-950)",
    "--bambi-foreground": "var(--bambi-neutral-50)",
    "--bambi-card": "var(--bambi-neutral-900)",
    "--bambi-card-foreground": "var(--bambi-neutral-50)",
    "--bambi-popover": "var(--bambi-neutral-900)",
    "--bambi-popover-foreground": "var(--bambi-neutral-50)",
    "--bambi-primary": "var(--bambi-primary-400)",
    "--bambi-primary-foreground": "var(--bambi-neutral-950)",
    "--bambi-secondary": "var(--bambi-neutral-800)",
    "--bambi-secondary-foreground": "var(--bambi-neutral-50)",
    "--bambi-accent": "var(--bambi-neutral-800)",
    "--bambi-accent-foreground": "var(--bambi-neutral-50)",
    "--bambi-muted": "var(--bambi-neutral-800)",
    "--bambi-muted-foreground": "var(--bambi-neutral-400)",
    "--bambi-border": "var(--bambi-neutral-800)",
    "--bambi-input": "var(--bambi-neutral-800)",
    "--bambi-input-background": "var(--bambi-neutral-900)",
    "--bambi-input-foreground": "var(--bambi-neutral-50)",
    "--bambi-input-placeholder": "var(--bambi-neutral-400)",
  },
};
