import type { TokenOverrides } from "../tokens/defaults";

interface ThemePayload {
  tokens?: unknown;
}

export function parseThemeImport(source: string): TokenOverrides {
  const trimmedSource = source.trim();
  if (!trimmedSource) throw new Error("Theme import file is empty.");

  const tokens = trimmedSource.startsWith("{")
    ? parseJsonTheme(trimmedSource)
    : parseCssTheme(trimmedSource);

  if (Object.keys(tokens).length === 0) {
    throw new Error(
      "Theme import did not contain any valid CSS variable tokens.",
    );
  }

  return tokens;
}

function parseJsonTheme(source: string): TokenOverrides {
  const payload = JSON.parse(source) as ThemePayload | TokenOverrides;
  const rawTokens =
    isTokenMap(payload) && "tokens" in payload ? payload.tokens : payload;

  if (!isTokenMap(rawTokens)) {
    throw new Error(
      "Theme JSON must be a token map or contain a `tokens` object.",
    );
  }

  return normalizeTokenMap(rawTokens);
}

function parseCssTheme(source: string): TokenOverrides {
  const tokens: TokenOverrides = {};
  const declarationPattern = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;

  while ((match = declarationPattern.exec(source)) !== null) {
    const [, token, value] = match;
    if (token && value) tokens[token] = value.trim();
  }

  return tokens;
}

function normalizeTokenMap(rawTokens: TokenOverrides): TokenOverrides {
  return Object.fromEntries(
    Object.entries(rawTokens).filter(
      ([token, value]) => token.startsWith("--") && typeof value === "string",
    ),
  );
}

function isTokenMap(value: unknown): value is TokenOverrides {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
