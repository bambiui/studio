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
    <div className="studio-export-overlay">
      <section className="studio-export-panel">
        <div className="studio-export-header">
          <div>
            <p className="studio-kicker">Export</p>
            <h2 className="studio-title">Theme output</h2>
            <p className="studio-export-description">
              Override edilen tokenları CSS, JSON veya BambiUI preset taslağı
              olarak al.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="studio-action-button"
          >
            Close
          </Button>
        </div>

        <div className="studio-export-controls">
          <div className="studio-format-list">
            {(["css", "json", "preset"] as const).map((option) => (
              <Button
                key={option}
                type="button"
                variant={format === option ? "primary" : "outline"}
                onClick={() => setFormat(option)}
                className="studio-format-button"
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
            className="studio-export-checkbox"
          >
            <CheckboxIndicator>✓</CheckboxIndicator>
            <CheckboxLabel>
              Include {previewScheme} preview tokens
            </CheckboxLabel>
          </Checkbox>
        </div>

        <div className="studio-export-summary-wrap">
          <div className="studio-export-summary">
            <div className="studio-export-summary-head">
              <h3 className="studio-export-title-small">Export summary</h3>
              <span className="studio-token-count-pill">
                {tokenEntries.length} tokens
              </span>
            </div>
            <div className="studio-export-tags">
              {tokenEntries.slice(0, 8).map(([token]) => (
                <span key={token} className="studio-export-tag">
                  {token}
                </span>
              ))}
              {tokenEntries.length > 8 ? (
                <span className="studio-export-tag-muted">
                  +{tokenEntries.length - 8} more
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="studio-export-body">
          <Textarea
            readOnly
            value={serializedTheme}
            resize="none"
            className="studio-export-textarea"
          />
        </div>

        <div className="studio-export-footer">
          <Button
            type="button"
            variant="outline"
            onClick={copyToClipboard}
            className="studio-export-footer-button"
          >
            {copyState}
          </Button>
          <Button
            type="button"
            onClick={downloadTheme}
            className="studio-export-footer-button"
          >
            Download
          </Button>
        </div>
      </section>
    </div>
  );
}
