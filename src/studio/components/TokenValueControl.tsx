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

export function TokenValueControl({
  token,
  value,
  placeholder,
  onChange,
}: TokenValueControlProps) {
  if (token?.kind === "opacity") {
    const numericValue = Number.parseFloat(value || placeholder || "0.5");
    const safeValue = Number.isFinite(numericValue) ? numericValue : 0.5;

    return (
      <label className="mt-3 block">
        <span className="mb-1 flex items-center justify-between text-xs font-medium text-[var(--bambi-muted-foreground)]">
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
        <span className="mb-1 block text-xs font-medium text-[var(--bambi-muted-foreground)]">
          Value
        </span>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-[var(--bambi-border)] bg-[var(--bambi-input-background)] px-3 py-2 text-xs text-[var(--bambi-input-foreground)]"
        />
      </label>
    </div>
  );
}
