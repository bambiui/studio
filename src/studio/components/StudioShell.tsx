"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  componentCategories,
  studioComponents,
  type ComponentCategory,
  type StudioComponentDefinition,
} from "../registry/components";
import {
  serializeThemeAsCss,
  serializeThemeAsJson,
  serializeThemeAsPreset,
} from "../theme/exporters";
import { createThemeFromBaseColor, isValidHexColor } from "../theme/generator";
import { editableTokenDefaults, type TokenOverrides } from "../tokens/defaults";
import { tokenDefinitionMap, type TokenDefinition } from "../tokens/metadata";

type StudioStyle = CSSProperties & Record<`--${string}`, string>;
type ExportFormat = "css" | "json" | "preset";
type PreviewScheme = "light" | "dark";

const STORAGE_KEY = "bambiui-studio-theme";

const PREVIEW_SCHEMES: Record<PreviewScheme, TokenOverrides> = {
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

export function StudioShell() {
  const [selectedComponentId, setSelectedComponentId] = useState(
    studioComponents[0]?.id ?? "",
  );
  const [tokenOverrides, setTokenOverrides] = useState<TokenOverrides>({});
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [previewScheme, setPreviewScheme] = useState<PreviewScheme>("light");

  useEffect(() => {
    try {
      const storedTheme = window.localStorage.getItem(STORAGE_KEY);
      if (storedTheme) {
        setTokenOverrides(JSON.parse(storedTheme) as TokenOverrides);
      }
    } finally {
      setHasLoadedStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokenOverrides));
  }, [hasLoadedStorage, tokenOverrides]);

  const selectedComponent = useMemo(
    () =>
      studioComponents.find(
        (component) => component.id === selectedComponentId,
      ) ?? studioComponents[0],
    [selectedComponentId],
  );

  const previewStyle = useMemo(
    () =>
      ({ ...PREVIEW_SCHEMES[previewScheme], ...tokenOverrides }) as StudioStyle,
    [previewScheme, tokenOverrides],
  );

  const updateToken = (tokenId: string, value: string) => {
    setTokenOverrides((current) => {
      if (!value.trim()) {
        const next = { ...current };
        delete next[tokenId];
        return next;
      }

      return {
        ...current,
        [tokenId]: value,
      };
    });
  };

  const resetTokens = () => setTokenOverrides({});

  const applyGeneratedTheme = (baseColor: string) => {
    setTokenOverrides((current) => ({
      ...current,
      ...createThemeFromBaseColor(baseColor),
    }));
  };

  return (
    <div className="flex min-h-screen bg-[#0b1020] text-slate-100">
      <ComponentExplorer
        selectedComponentId={selectedComponent?.id ?? ""}
        onSelectComponent={setSelectedComponentId}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <TopBar
          tokenCount={Object.keys(tokenOverrides).length}
          previewScheme={previewScheme}
          onChangePreviewScheme={setPreviewScheme}
          onOpenExport={() => setIsExportOpen(true)}
        />
        <Canvas
          selectedComponentId={selectedComponent?.id ?? ""}
          onSelectComponent={setSelectedComponentId}
          previewStyle={previewStyle}
        />
      </main>
      <InspectorPanel
        selectedComponent={selectedComponent}
        tokenOverrides={tokenOverrides}
        onUpdateToken={updateToken}
        onResetTokens={resetTokens}
        onApplyGeneratedTheme={applyGeneratedTheme}
      />
      <ExportDialog
        isOpen={isExportOpen}
        tokens={tokenOverrides}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}

interface TopBarProps {
  tokenCount: number;
  previewScheme: PreviewScheme;
  onChangePreviewScheme: (scheme: PreviewScheme) => void;
  onOpenExport: () => void;
}

function TopBar({
  tokenCount,
  previewScheme,
  onChangePreviewScheme,
  onOpenExport,
}: TopBarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#11172a]/95 px-6 backdrop-blur">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-violet-300">
          BambiUI Platform
        </p>
        <h1 className="text-lg font-semibold text-white">Studio</h1>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-300">
        <div className="hidden rounded-full border border-white/10 bg-black/20 p-1 sm:flex">
          {(["light", "dark"] as const).map((scheme) => (
            <button
              key={scheme}
              type="button"
              onClick={() => onChangePreviewScheme(scheme)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                previewScheme === scheme
                  ? "bg-violet-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {scheme}
            </button>
          ))}
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
          {tokenCount} override
        </span>
        <button
          type="button"
          onClick={onOpenExport}
          className="rounded-full bg-violet-500 px-4 py-2 font-medium text-white shadow-lg shadow-violet-950/40 transition hover:bg-violet-400"
        >
          Export
        </button>
      </div>
    </header>
  );
}

interface ComponentExplorerProps {
  selectedComponentId: string;
  onSelectComponent: (componentId: string) => void;
}

function ComponentExplorer({
  selectedComponentId,
  onSelectComponent,
}: ComponentExplorerProps) {
  const [query, setQuery] = useState("");

  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#080d1a] p-5 lg:block">
      <div className="mb-8">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500 font-bold text-white">
          B
        </div>
        <h2 className="text-xl font-semibold text-white">Component Explorer</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          CLI ile eklenen BambiUI komponentlerini canvas üzerinde incele.
        </p>
      </div>

      <label className="mb-6 block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Search
        </span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Button, input, card..."
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-violet-400"
        />
      </label>

      <div className="space-y-6">
        {componentCategories.map((category) => (
          <ComponentCategoryGroup
            key={category}
            category={category}
            query={query}
            selectedComponentId={selectedComponentId}
            onSelectComponent={onSelectComponent}
          />
        ))}
      </div>
    </aside>
  );
}

interface ComponentCategoryGroupProps extends ComponentExplorerProps {
  category: ComponentCategory;
  query: string;
}

function ComponentCategoryGroup({
  category,
  query,
  selectedComponentId,
  onSelectComponent,
}: ComponentCategoryGroupProps) {
  const normalizedQuery = query.trim().toLowerCase();
  const components = studioComponents.filter((component) => {
    if (component.category !== category) return false;
    if (!normalizedQuery) return true;

    return [component.name, component.description, component.category]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  if (components.length === 0) return null;

  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {category}
      </h3>
      <div className="space-y-2">
        {components.map((component) => {
          const isSelected = component.id === selectedComponentId;

          return (
            <button
              key={component.id}
              type="button"
              onClick={() => onSelectComponent(component.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                isSelected
                  ? "border-violet-400 bg-violet-500/15 text-white"
                  : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]"
              }`}
            >
              <span className="block text-sm font-medium">
                {component.name}
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                {component.tokenIds.length} editable token
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

interface CanvasProps {
  selectedComponentId: string;
  onSelectComponent: (componentId: string) => void;
  previewStyle: StudioStyle;
}

function Canvas({
  selectedComponentId,
  onSelectComponent,
  previewStyle,
}: CanvasProps) {
  const [viewMode, setViewMode] = useState<"all" | "selected">("all");
  const visibleComponents =
    viewMode === "selected"
      ? studioComponents.filter(
          (component) => component.id === selectedComponentId,
        )
      : studioComponents;

  return (
    <section className="min-h-0 flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-violet-200">Free canvas</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                İlk fazda canvas, seçilebilir component showcase olarak
                çalışıyor. Sonraki fazlarda drag/drop, zoom ve layout editing bu
                katmanın üzerine eklenecek.
              </p>
            </div>
            <div className="flex rounded-full border border-white/10 bg-black/20 p-1">
              {(["all", "selected"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    viewMode === mode
                      ? "bg-violet-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {mode === "all" ? "All" : "Selected"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {visibleComponents.map((component) => (
            <CanvasCard
              key={component.id}
              component={component}
              isSelected={component.id === selectedComponentId}
              onSelect={() => onSelectComponent(component.id)}
              previewStyle={previewStyle}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface CanvasCardProps {
  component: StudioComponentDefinition;
  isSelected: boolean;
  onSelect: () => void;
  previewStyle: StudioStyle;
}

function CanvasCard({
  component,
  isSelected,
  onSelect,
  previewStyle,
}: CanvasCardProps) {
  return (
    <article
      className={`rounded-3xl border p-2 transition ${
        isSelected
          ? "border-violet-400 bg-violet-400/10 shadow-2xl shadow-violet-950/30"
          : "border-white/10 bg-white/[0.03] hover:border-white/20"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="block w-full rounded-[1.25rem] p-4 text-left"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white">
              {component.name}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              {component.description}
            </p>
          </div>
          {isSelected ? (
            <span className="rounded-full bg-violet-500 px-3 py-1 text-xs font-medium text-white">
              Selected
            </span>
          ) : null}
        </div>
      </button>
      <div
        className="bambi-preview rounded-[1.25rem] border border-slate-200 bg-[var(--bambi-background)] p-6 text-[var(--bambi-foreground)]"
        style={previewStyle}
      >
        {component.preview}
      </div>
    </article>
  );
}

interface InspectorPanelProps {
  selectedComponent?: StudioComponentDefinition;
  tokenOverrides: TokenOverrides;
  onUpdateToken: (tokenId: string, value: string) => void;
  onResetTokens: () => void;
  onApplyGeneratedTheme: (baseColor: string) => void;
}

function InspectorPanel({
  selectedComponent,
  tokenOverrides,
  onUpdateToken,
  onResetTokens,
  onApplyGeneratedTheme,
}: InspectorPanelProps) {
  const [baseColor, setBaseColor] = useState("#7c3aed");
  const canGenerateTheme = isValidHexColor(baseColor);
  return (
    <aside className="hidden w-80 shrink-0 border-l border-white/10 bg-[#080d1a] p-5 xl:block">
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
          Tek bir base renkten primary scale ve bağlı semantic tokenları üret.
        </p>
        <div className="mt-4 flex gap-2">
          <input
            type="color"
            value={canGenerateTheme ? baseColor : "#7c3aed"}
            onChange={(event) => setBaseColor(event.target.value)}
            className="h-10 w-12 rounded-xl border border-white/10 bg-transparent p-1"
            aria-label="Base color"
          />
          <input
            value={baseColor}
            onChange={(event) => setBaseColor(event.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#050814] px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-violet-400"
            placeholder="#7c3aed"
          />
        </div>
        <button
          type="button"
          disabled={!canGenerateTheme}
          onClick={() => onApplyGeneratedTheme(baseColor)}
          className="mt-3 w-full rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Generate theme
        </button>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">Token editor</h3>
          <button
            type="button"
            onClick={onResetTokens}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10"
          >
            Reset
          </button>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Token değerlerini düzenle; değişiklikler canvas preview alanına anında
          uygulanır.
        </p>
        <div className="mt-4 space-y-3">
          {selectedComponent?.tokenIds.map((tokenId) => {
            const token = tokenDefinitionMap.get(tokenId);

            return (
              <div
                key={tokenId}
                className="rounded-2xl border border-white/10 bg-black/20 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-100">
                    {token?.label ?? tokenId}
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-400">
                    {token?.group ?? "Token"}
                  </span>
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
        </div>
      </section>
    </aside>
  );
}

interface TokenValueControlProps {
  tokenId: string;
  token?: TokenDefinition;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

const COLOR_PRESETS = [
  "oklch(55% 0.22 271)",
  "oklch(62% 0.22 255)",
  "oklch(65% 0.233 28)",
  "oklch(73% 0.194 153)",
  "oklch(78% 0.159 74)",
] as const;

const RADIUS_PRESETS = [
  "0",
  "0.25rem",
  "0.5rem",
  "0.75rem",
  "1rem",
  "9999px",
] as const;

function TokenValueControl({
  tokenId,
  token,
  value,
  placeholder,
  onChange,
}: TokenValueControlProps) {
  const visibleValue = value || placeholder;

  if (token?.kind === "opacity") {
    const numericValue = Number.parseFloat(value || placeholder || "0.5");
    const safeValue = Number.isFinite(numericValue) ? numericValue : 0.5;

    return (
      <label className="mt-3 block">
        <span className="mb-1 flex items-center justify-between text-xs font-medium text-slate-400">
          <span>Opacity</span>
          <span>{safeValue.toFixed(2)}</span>
        </span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={safeValue}
          onChange={(event) => onChange(event.target.value)}
          className="w-full accent-violet-400"
        />
      </label>
    );
  }

  return (
    <div className="mt-3">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-400">
          Value
        </span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-white/10 bg-[#050814] px-3 py-2 text-xs text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-violet-400"
        />
      </label>

      {token?.kind === "color" ? (
        <div
          className="mt-2 flex flex-wrap gap-2"
          aria-label={`${tokenId} color presets`}
        >
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              title={preset}
              onClick={() => onChange(preset)}
              className={`h-6 w-6 rounded-full border transition ${
                visibleValue === preset
                  ? "border-white ring-2 ring-violet-400"
                  : "border-white/20 hover:border-white/50"
              }`}
              style={{ background: preset }}
            />
          ))}
        </div>
      ) : null}

      {token?.kind === "radius" ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {RADIUS_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`rounded-full border px-2 py-1 text-[10px] transition ${
                visibleValue === preset
                  ? "border-violet-400 bg-violet-500/20 text-white"
                  : "border-white/10 text-slate-400 hover:bg-white/10"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface ExportDialogProps {
  isOpen: boolean;
  tokens: TokenOverrides;
  onClose: () => void;
}

function ExportDialog({ isOpen, tokens, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("css");
  const [copyState, setCopyState] = useState("Copy");
  const serializedTheme = useMemo(() => {
    if (format === "json") return serializeThemeAsJson(tokens);
    if (format === "preset") return serializeThemeAsPreset(tokens);
    return serializeThemeAsCss(tokens);
  }, [format, tokens]);

  if (!isOpen) return null;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(serializedTheme);
    setCopyState("Copied");
    window.setTimeout(() => setCopyState("Copy"), 1200);
  };

  const downloadTheme = () => {
    const extension = format === "css" ? "css" : "json";
    const file = new Blob([serializedTheme], { type: "text/plain" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bambiui-studio-theme.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
      <section className="flex max-h-[80vh] w-full max-w-3xl flex-col rounded-3xl border border-white/10 bg-[#080d1a] shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-violet-300">
              Export
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Theme output
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Override edilen tokenları CSS, JSON veya BambiUI preset taslağı
              olarak al.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300 transition hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="flex flex-wrap gap-2 p-5">
          {(["css", "json", "preset"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFormat(option)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                format === option
                  ? "border-violet-400 bg-violet-500/20 text-white"
                  : "border-white/10 text-slate-300 hover:bg-white/10"
              }`}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 px-5 pb-5">
          <textarea
            readOnly
            value={serializedTheme}
            className="h-80 w-full resize-none rounded-2xl border border-white/10 bg-[#050814] p-4 font-mono text-xs leading-5 text-slate-100 outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 p-5">
          <button
            type="button"
            onClick={copyToClipboard}
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            {copyState}
          </button>
          <button
            type="button"
            onClick={downloadTheme}
            className="rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400"
          >
            Download
          </button>
        </div>
      </section>
    </div>
  );
}
