import type { TokenOverrides } from "../tokens/defaults";

export function serializeThemeAsCss(tokens: TokenOverrides): string {
  const lines = Object.entries(tokens)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([token, value]) => `  ${token}: ${value};`);

  return [":root {", ...lines, "}"].join("\n");
}

export function serializeThemeAsJson(tokens: TokenOverrides): string {
  return JSON.stringify(
    {
      name: "BambiUI Studio Theme",
      version: 1,
      tokens: Object.fromEntries(
        Object.entries(tokens).sort(([left], [right]) => left.localeCompare(right)),
      ),
    },
    null,
    2,
  );
}

export function serializeThemeAsPreset(tokens: TokenOverrides): string {
  return JSON.stringify(
    {
      $schema: "https://bambiui.com/schemas/theme-preset.json",
      name: "studio-theme",
      framework: "react",
      tokens: Object.fromEntries(
        Object.entries(tokens).sort(([left], [right]) => left.localeCompare(right)),
      ),
    },
    null,
    2,
  );
}
