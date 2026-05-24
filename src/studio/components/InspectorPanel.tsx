import { useState } from "react";
import type { StudioComponentDefinition } from "../registry/components";
import { isValidHexColor } from "../theme/generator";
import { editableTokenDefaults, type TokenOverrides } from "../tokens/defaults";
import { tokenDefinitionMap } from "../tokens/metadata";
import { TokenValueControl } from "./TokenValueControl";

interface InspectorPanelProps {
  selectedComponent?: StudioComponentDefinition;
  tokenOverrides: TokenOverrides;
  onUpdateToken: (tokenId: string, value: string) => void;
  onResetTokens: () => void;
  onApplyGeneratedTheme: (baseColor: string) => void;
}

export function InspectorPanel({
  selectedComponent,
  tokenOverrides,
  onUpdateToken,
  onResetTokens,
  onApplyGeneratedTheme,
}: InspectorPanelProps) {
  const [baseColor, setBaseColor] = useState("#7c3aed");
  const canGenerateTheme = isValidHexColor(baseColor);

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
