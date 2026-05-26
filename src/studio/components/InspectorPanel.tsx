import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Slider,
  SliderRange,
  SliderThumb,
  SliderTrack,
} from "@/src/components/ui/slider";
import { PREVIEW_SCHEMES } from "../constants";
import type { StudioComponentDefinition } from "../registry/components";
import { getContrastReport } from "../theme/contrast";
import {
  DEFAULT_BASE_SLIDER_VALUE,
  DEFAULT_GENERATOR_CHROMA,
  DEFAULT_GENERATOR_HUE,
  isValidGeneratorColorInput,
  oklchToHex,
  parseGeneratorColorInput,
} from "../theme/generator";
import { editableTokenDefaults, type TokenOverrides } from "../tokens/defaults";
import {
  tokenDefinitionMap,
  tokenDefinitions,
  type TokenGroup,
} from "../tokens/metadata";
import { TokenValueControl } from "./TokenValueControl";
import type { PreviewScheme } from "../types";

interface InspectorPanelProps {
  selectedComponent?: StudioComponentDefinition;
  tokenOverrides: TokenOverrides;
  previewScheme: PreviewScheme;
  onUpdateToken: (tokenId: string, value: string) => void;
  onResetTokens: () => void;
  onApplyGeneratedTheme: (baseColor: string, baseValue: number) => void;
  onApplyGeneratedDarkTheme: (baseColor: string, baseValue: number) => void;
}

function ratingClassName(rating: string): string {
  if (rating === "strong") return "studio-rating-strong";
  if (rating === "moderate") return "studio-rating-moderate";
  if (rating === "weak") return "studio-rating-weak";
  return "studio-rating-unknown";
}

export function InspectorPanel({
  selectedComponent,
  tokenOverrides,
  previewScheme,
  onUpdateToken,
  onResetTokens,
  onApplyGeneratedTheme,
  onApplyGeneratedDarkTheme,
}: InspectorPanelProps) {
  const [genHue, setGenHue] = useState(DEFAULT_GENERATOR_HUE);
  const [colorValue, setColorValue] = useState(
    oklchToHex(0.55, DEFAULT_GENERATOR_CHROMA, DEFAULT_GENERATOR_HUE),
  );
  const [baseValue, setBaseValue] = useState(DEFAULT_BASE_SLIDER_VALUE);
  const [tokenQuery, setTokenQuery] = useState("");
  const [activeTokenGroup, setActiveTokenGroup] = useState<TokenGroup | "All">(
    "All",
  );
  const isGeneratorColorValid = isValidGeneratorColorInput(colorValue);
  const normalizedTokenQuery = tokenQuery.trim().toLowerCase();
  const baseTokenIds = normalizedTokenQuery
    ? tokenDefinitions.map((token) => token.id)
    : (selectedComponent?.tokenIds ?? []);
  const tokenGroups: Array<TokenGroup | "All"> = [
    "All",
    "Primitive",
    "Semantic",
    "Intent",
    "Component",
  ];
  const displayedTokenIds = baseTokenIds.filter((tokenId) => {
    const token = tokenDefinitionMap.get(tokenId);
    if (!token) return false;
    if (activeTokenGroup !== "All" && token.group !== activeTokenGroup) {
      return false;
    }
    if (!normalizedTokenQuery) return true;

    return [token.id, token.label, token.group, token.description]
      .join(" ")
      .toLowerCase()
      .includes(normalizedTokenQuery);
  });
  const contrastReport = getContrastReport(
    { ...PREVIEW_SCHEMES[previewScheme], ...tokenOverrides },
    editableTokenDefaults,
  );
  const baseGradient =
    previewScheme === "dark"
      ? `linear-gradient(to right, oklch(12% 0.0015 ${genHue}), oklch(12% 0.02 ${genHue}))`
      : `linear-gradient(to right, oklch(97% 0.0015 ${genHue}), oklch(97% 0.02 ${genHue}))`;

  const applyGeneratedTokens = (hex: string, base: number) => {
    if (!isValidGeneratorColorInput(hex)) return;

    if (previewScheme === "dark") {
      onApplyGeneratedDarkTheme(hex, base);
    } else {
      onApplyGeneratedTheme(hex, base);
    }
  };

  const updateFromColorInput = (nextValue: string, apply = true) => {
    setColorValue(nextValue);
    const parsed = parseGeneratorColorInput(nextValue);
    if (!parsed || parsed.chroma <= 0.01) return;

    setGenHue(Math.round(parsed.hue));
    if (apply) applyGeneratedTokens(nextValue, baseValue);
  };

  const updateFromBase = (nextBase: number) => {
    const normalizedBase = Math.max(0, Math.min(100, Math.round(nextBase)));
    setBaseValue(normalizedBase);
    applyGeneratedTokens(colorValue, normalizedBase);
  };

  return (
    <aside className="w-full shrink-0 border-t border-[var(--bambi-border)] bg-[var(--bambi-card)] p-5 text-[var(--bambi-card-foreground)] xl:w-80 xl:border-l xl:border-t-0">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--bambi-primary)]">
          Inspector
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--bambi-foreground)]">
          {selectedComponent?.name ?? "No component"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--bambi-muted-foreground)]">
          {selectedComponent?.description ??
            "Canvas üzerinden bir komponent seç."}
        </p>
      </div>

      <section className="mb-4 rounded-3xl border border-[var(--bambi-border)] bg-[var(--bambi-muted)] p-4">
        <h3 className="text-sm font-semibold text-[var(--bambi-foreground)]">
          Theme generator
        </h3>
        <p className="mt-2 text-xs leading-5 text-[var(--bambi-muted-foreground)]">
          Tek bir base renkten primary, neutral, intent scale ve bağlı semantic
          tokenları üret.
        </p>
        <label className="mt-4 block">
          <span className="mb-2 flex items-center justify-between text-xs font-medium text-[var(--bambi-muted-foreground)]">
            <span>Primary Color</span>
            <span>{genHue}°</span>
          </span>
          <Input
            value={colorValue}
            spellCheck={false}
            onChange={(event) => updateFromColorInput(event.target.value)}
            className="w-full rounded-xl border border-[var(--bambi-border)] bg-[var(--bambi-input-background)] px-3 py-2 text-sm text-[var(--bambi-input-foreground)]"
            placeholder="#7c3aed or oklch(55% 0.22 271)"
            aria-label="Primary color as hex or OKLCH"
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-2 flex items-center justify-between text-xs font-medium text-[var(--bambi-muted-foreground)]">
            <span>Base</span>
            <span>{baseValue}</span>
          </span>
          <Slider
            value={[baseValue]}
            min={0}
            max={100}
            step={1}
            onValueChange={(detail) =>
              updateFromBase(detail.value[0] ?? DEFAULT_BASE_SLIDER_VALUE)
            }
            aria-label="Base color balance"
          >
            <SliderTrack style={{ background: baseGradient }}>
              <SliderRange style={{ background: "transparent" }} />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </label>
        {!isGeneratorColorValid ? (
          <p className="mt-3 text-xs text-[var(--bambi-muted-foreground)]">
            Geçerli bir hex veya OKLCH değeri gir.
          </p>
        ) : null}
      </section>

      <section className="mb-4 rounded-3xl border border-[var(--bambi-border)] bg-[var(--bambi-card)] p-4">
        <h3 className="text-sm font-semibold text-[var(--bambi-foreground)]">
          Contrast report
        </h3>
        <p className="mt-2 text-xs leading-5 text-[var(--bambi-muted-foreground)]">
          Aktif light/dark scheme ve token override&apos;larıyla WCAG contrast
          ratio.
        </p>
        <div className="mt-4 space-y-2">
          {contrastReport.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[var(--bambi-border)] bg-[var(--bambi-muted)] p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[var(--bambi-foreground)]">
                  {item.label}
                </span>
                <span
                  className={`studio-rating-badge ${ratingClassName(item.rating)}`}
                >
                  {item.rating}
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--bambi-muted-foreground)]">
                Ratio:{" "}
                {item.score === null ? "n/a" : `${item.score.toFixed(2)}:1`}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--bambi-border)] bg-[var(--bambi-card)] p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-[var(--bambi-foreground)]">
            Token editor
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetTokens}
            className="rounded-full px-3 py-1 text-xs"
          >
            Reset
          </Button>
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--bambi-muted-foreground)]">
          Token değerlerini düzenle; değişiklikler canvas preview alanına anında
          uygulanır.
        </p>
        <label className="mt-4 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--bambi-muted-foreground)]">
            Token search
          </span>
          <Input
            value={tokenQuery}
            onChange={(event) => setTokenQuery(event.target.value)}
            placeholder="Search all tokens..."
            className="w-full rounded-2xl border border-[var(--bambi-border)] bg-[var(--bambi-input-background)] px-3 py-2 text-sm text-[var(--bambi-input-foreground)]"
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {tokenGroups.map((group) => (
            <Button
              key={group}
              type="button"
              variant={activeTokenGroup === group ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveTokenGroup(group)}
              className="rounded-full px-3 py-1 text-xs"
            >
              {group}
            </Button>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {displayedTokenIds.map((tokenId) => {
            const token = tokenDefinitionMap.get(tokenId);

            const isOverridden = tokenOverrides[tokenId] !== undefined;

            return (
              <div
                key={tokenId}
                className={`rounded-2xl border p-3 ${
                  isOverridden
                    ? "studio-token-overridden"
                    : "studio-token-inherited"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-[var(--bambi-foreground)]">
                    {token?.label ?? tokenId}
                  </span>
                  <div className="flex items-center gap-2">
                    {isOverridden ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateToken(tokenId, "")}
                        className="rounded-full px-2 py-1 text-[10px] uppercase tracking-wide"
                      >
                        Reset
                      </Button>
                    ) : null}
                    <span className="rounded-full bg-[var(--bambi-card)] px-2 py-1 text-[10px] uppercase tracking-wide text-[var(--bambi-muted-foreground)]">
                      {token?.group ?? "Token"}
                    </span>
                  </div>
                </div>
                <code className="mt-2 block break-all text-xs text-[var(--bambi-primary)]">
                  {tokenId}
                </code>
                <TokenValueControl
                  tokenId={tokenId}
                  token={token}
                  value={tokenOverrides[tokenId] ?? ""}
                  placeholder={editableTokenDefaults[tokenId] ?? "CSS value"}
                  onChange={(value) => onUpdateToken(tokenId, value)}
                />
                {token?.description ? (
                  <p className="mt-2 text-xs leading-5 text-[var(--bambi-muted-foreground)]">
                    {token.description}
                  </p>
                ) : null}
              </div>
            );
          })}
          {displayedTokenIds.length === 0 ? (
            <p className="rounded-2xl border border-[var(--bambi-border)] bg-[var(--bambi-muted)] p-3 text-sm text-[var(--bambi-muted-foreground)]">
              No tokens found.
            </p>
          ) : null}
        </div>
      </section>
    </aside>
  );
}
