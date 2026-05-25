import { useMemo, useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Checkbox,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/src/components/ui/checkbox";
import { Textarea } from "@/src/components/ui/textarea";
import {
  serializeThemeAsCss,
  serializeThemeAsJson,
  serializeThemeAsPreset,
} from "../theme/exporters";
import type { TokenOverrides } from "../tokens/defaults";
import type { ExportFormat, PreviewScheme } from "../types";

interface ExportDialogProps {
  isOpen: boolean;
  tokens: TokenOverrides;
  previewTokens: TokenOverrides;
  previewScheme: PreviewScheme;
  onClose: () => void;
}

export function ExportDialog({
  isOpen,
  tokens,
  previewTokens,
  previewScheme,
  onClose,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("css");
  const [copyState, setCopyState] = useState("Copy");
  const [includePreviewTokens, setIncludePreviewTokens] = useState(false);
  const exportTokens = useMemo(
    () => (includePreviewTokens ? { ...previewTokens, ...tokens } : tokens),
    [includePreviewTokens, previewTokens, tokens],
  );
  const serializedTheme = useMemo(() => {
    if (format === "json") return serializeThemeAsJson(exportTokens);
    if (format === "preset") return serializeThemeAsPreset(exportTokens);
    return serializeThemeAsCss(exportTokens);
  }, [exportTokens, format]);
  const tokenEntries = useMemo(
    () =>
      Object.entries(exportTokens).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    [exportTokens],
  );

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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm"
          >
            Close
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex flex-wrap gap-2">
            {(["css", "json", "preset"] as const).map((option) => (
              <Button
                key={option}
                type="button"
                variant={format === option ? "primary" : "outline"}
                onClick={() => setFormat(option)}
                className="rounded-full px-4 py-2 text-sm font-medium"
              >
                {option.toUpperCase()}
              </Button>
            ))}
          </div>
          <Checkbox
            checked={includePreviewTokens}
            onCheckedChange={(detail) =>
              setIncludePreviewTokens(detail.checked === true)
            }
            ariaLabel="Include preview tokens"
            className="flex items-center gap-2 text-xs text-slate-400"
          >
            <CheckboxIndicator>✓</CheckboxIndicator>
            <CheckboxLabel>
              Include {previewScheme} preview tokens
            </CheckboxLabel>
          </Checkbox>
        </div>

        <div className="px-5 pb-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white">
                Export summary
              </h3>
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-400">
                {tokenEntries.length} tokens
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {tokenEntries.slice(0, 8).map(([token]) => (
                <span
                  key={token}
                  className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-violet-200"
                >
                  {token}
                </span>
              ))}
              {tokenEntries.length > 8 ? (
                <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-slate-500">
                  +{tokenEntries.length - 8} more
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 px-5 pb-5">
          <Textarea
            readOnly
            value={serializedTheme}
            resize="none"
            className="h-80 w-full rounded-2xl border border-white/10 bg-[#050814] p-4 font-mono text-xs leading-5 text-slate-100"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 p-5">
          <Button
            type="button"
            variant="outline"
            onClick={copyToClipboard}
            className="rounded-full px-4 py-2 text-sm font-medium"
          >
            {copyState}
          </Button>
          <Button
            type="button"
            onClick={downloadTheme}
            className="rounded-full px-4 py-2 text-sm font-medium"
          >
            Download
          </Button>
        </div>
      </section>
    </div>
  );
}
