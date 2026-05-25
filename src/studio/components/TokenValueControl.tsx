import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Slider,
  SliderRange,
  SliderThumb,
  SliderTrack,
} from "@/src/components/ui/slider";
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
        <Slider
          value={[safeValue]}
          min={0}
          max={1}
          step={0.05}
          onValueChange={(detail) =>
            onChange(String(detail.value[0] ?? safeValue))
          }
          aria-label="Opacity"
        >
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </label>
    );
  }

  return (
    <div className="mt-3">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-400">
          Value
        </span>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-white/10 bg-[#050814] px-3 py-2 text-xs text-slate-100"
        />
      </label>

      {token?.kind === "color" ? (
        <div
          className="mt-2 flex flex-wrap gap-2"
          aria-label={`${tokenId} color presets`}
        >
          {COLOR_PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant="outline"
              title={preset}
              onClick={() => onChange(preset)}
              className={`h-6 w-6 rounded-full border p-0 ${
                visibleValue === preset
                  ? "border-white ring-2 ring-violet-400"
                  : "border-white/20"
              }`}
              style={{ background: preset }}
            />
          ))}
        </div>
      ) : null}

      {token?.kind === "radius" ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {RADIUS_PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={visibleValue === preset ? "primary" : "outline"}
              size="sm"
              onClick={() => onChange(preset)}
              className="rounded-full px-2 py-1 text-[10px]"
            >
              {preset}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
