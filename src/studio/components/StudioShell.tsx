"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import {
  componentCategories,
  studioComponents,
  type ComponentCategory,
  type StudioComponentDefinition,
} from "../registry/components";
import { createThemeFromBaseColor, isValidHexColor } from "../theme/generator";
import { editableTokenDefaults, type TokenOverrides } from "../tokens/defaults";
import { tokenDefinitionMap } from "../tokens/metadata";

type StudioStyle = CSSProperties & Record<`--${string}`, string>;

export function StudioShell() {
  const [selectedComponentId, setSelectedComponentId] = useState(
    studioComponents[0]?.id ?? "",
  );
  const [tokenOverrides, setTokenOverrides] = useState<TokenOverrides>({});

  const selectedComponent = useMemo(
    () =>
      studioComponents.find(
        (component) => component.id === selectedComponentId,
      ) ?? studioComponents[0],
    [selectedComponentId],
  );

  const previewStyle = useMemo(
    () => tokenOverrides as StudioStyle,
    [tokenOverrides],
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
        <TopBar />
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
    </div>
  );
}

function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#11172a]/95 px-6 backdrop-blur">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-violet-300">
          BambiUI Platform
        </p>
        <h1 className="text-lg font-semibold text-white">Studio</h1>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-300">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
          Canvas MVP
        </span>
        <button className="rounded-full bg-violet-500 px-4 py-2 font-medium text-white shadow-lg shadow-violet-950/40 transition hover:bg-violet-400">
          Export soon
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

      <div className="space-y-6">
        {componentCategories.map((category) => (
          <ComponentCategoryGroup
            key={category}
            category={category}
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
}

function ComponentCategoryGroup({
  category,
  selectedComponentId,
  onSelectComponent,
}: ComponentCategoryGroupProps) {
  const components = studioComponents.filter(
    (component) => component.category === category,
  );

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
  return (
    <section className="min-h-0 flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-medium text-violet-200">Free canvas</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            İlk fazda canvas, seçilebilir component showcase olarak çalışıyor.
            Sonraki fazlarda drag/drop, zoom ve layout editing bu katmanın
            üzerine eklenecek.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {studioComponents.map((component) => (
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
                <label className="mt-3 block">
                  <span className="mb-1 block text-xs font-medium text-slate-400">
                    Value
                  </span>
                  <input
                    value={tokenOverrides[tokenId] ?? ""}
                    onChange={(event) =>
                      onUpdateToken(tokenId, event.target.value)
                    }
                    placeholder={editableTokenDefaults[tokenId] ?? "CSS value"}
                    className="w-full rounded-xl border border-white/10 bg-[#050814] px-3 py-2 text-xs text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-violet-400"
                  />
                </label>
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
