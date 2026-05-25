import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import type { StudioComponentDefinition } from "../registry/components";
import { getContrastReport } from "../theme/contrast";
import { isValidHexColor } from "../theme/generator";
import { themePresets } from "../theme/presets";
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
  onApplyGeneratedTheme: (baseColor: string) => void;
  onApplyGeneratedDarkTheme: (baseColor: string) => void;
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
  const [baseColor, setBaseColor] = useState("#7c3aed");
  const [tokenQuery, setTokenQuery] = useState("");
  const [activeTokenGroup, setActiveTokenGroup] = useState<TokenGroup | "All">(
    "All",
  );
  const canGenerateTheme = isValidHexColor(baseColor);
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
    tokenOverrides,
    editableTokenDefaults,
  );

  return (
    <aside className="w-full shrink-0 border-t border-white/10 bg-[#080d1a] p-5 xl:w-80 xl:border-l xl:border-t-0">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-violet-300">
          Inspector
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          {selectedComponent?.name ?? "No component"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {selectedComponent?.description ??
            "Canvas üzerinden bir komponent seç."}
        </p>
      </div>

      <section className="mb-4 rounded-3xl border border-violet-400/20 bg-violet-500/10 p-4">
        <h3 className="text-sm font-semibold text-white">Theme generator</h3>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Tek bir base renkten primary, neutral, intent scale ve bağlı semantic
          tokenları üret.
        </p>
        <div className="mt-4 flex gap-2">
          <Input
            type="color"
            value={canGenerateTheme ? baseColor : "#7c3aed"}
            onChange={(event) => setBaseColor(event.target.value)}
            className="h-10 w-12 rounded-xl border border-white/10 bg-transparent p-1"
            aria-label="Base color"
          />
          <Input
            value={baseColor}
            onChange={(event) => setBaseColor(event.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#050814] px-3 py-2 text-sm text-slate-100"
            placeholder="#7c3aed"
          />
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {themePresets.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant="outline"
              title={preset.name}
              onClick={() => {
                setBaseColor(preset.color);
                if (previewScheme === "dark") {
                  onApplyGeneratedDarkTheme(preset.color);
                } else {
                  onApplyGeneratedTheme(preset.color);
                }
              }}
              className="flex h-9 items-center justify-center rounded-xl border border-white/10 text-[10px] font-medium text-white"
              style={{ background: preset.color }}
            >
              {preset.name.slice(0, 1)}
            </Button>
          ))}
        </div>
        <Button
          type="button"
          disabled={!canGenerateTheme}
          onClick={() => {
            if (previewScheme === "dark") {
              onApplyGeneratedDarkTheme(baseColor);
            } else {
              onApplyGeneratedTheme(baseColor);
            }
          }}
          className="mt-3 w-full rounded-xl px-4 py-2 text-sm font-medium"
        >
          Generate {previewScheme} theme
        </Button>
      </section>

      <section className="mb-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-sm font-semibold text-white">Contrast report</h3>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          OKLCH lightness farkına göre hızlı okunabilirlik sinyali.
        </p>
        <div className="mt-4 space-y-2">
          {contrastReport.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-black/20 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-100">
                  {item.label}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                    item.rating === "strong"
                      ? "bg-emerald-500/20 text-emerald-200"
                      : item.rating === "moderate"
                        ? "bg-amber-500/20 text-amber-200"
                        : item.rating === "weak"
                          ? "bg-red-500/20 text-red-200"
                          : "bg-white/10 text-slate-400"
                  }`}
                >
                  {item.rating}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Score: {item.score === null ? "n/a" : item.score.toFixed(0)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">Token editor</h3>
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
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Token değerlerini düzenle; değişiklikler canvas preview alanına anında
          uygulanır.
        </p>
        <label className="mt-4 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Token search
          </span>
          <Input
            value={tokenQuery}
            onChange={(event) => setTokenQuery(event.target.value)}
            placeholder="Search all tokens..."
            className="w-full rounded-2xl border border-white/10 bg-[#050814] px-3 py-2 text-sm text-slate-100"
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
                    ? "border-violet-400/40 bg-violet-500/10"
                    : "border-white/10 bg-black/20"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-100">
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
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-400">
                      {token?.group ?? "Token"}
                    </span>
                  </div>
                </div>
                <code className="mt-2 block break-all text-xs text-violet-200">
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
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {token.description}
                  </p>
                ) : null}
              </div>
            );
          })}
          {displayedTokenIds.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-slate-500">
              No tokens found.
            </p>
          ) : null}
        </div>
      </section>
    </aside>
  );
}
