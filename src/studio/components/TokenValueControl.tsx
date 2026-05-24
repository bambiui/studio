import type { TokenDefinition } from "../tokens/metadata";

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

export function TokenValueControl({
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
