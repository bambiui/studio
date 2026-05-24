import type { TokenOverrides } from "../tokens/defaults";

interface ThemePayload {
  tokens?: unknown;
}

export function parseThemeImport(source: string): TokenOverrides {
  const payload = JSON.parse(source) as ThemePayload | TokenOverrides;
  const rawTokens =
    isTokenMap(payload) && "tokens" in payload ? payload.tokens : payload;

  if (!isTokenMap(rawTokens)) {
    throw new Error(
      "Theme JSON must be a token map or contain a `tokens` object.",
    );
  }

  return Object.fromEntries(
    Object.entries(rawTokens).filter(
      ([token, value]) => token.startsWith("--") && typeof value === "string",
    ),
  );
}

function isTokenMap(value: unknown): value is TokenOverrides {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
