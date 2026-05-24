"use client";

import { useEffect, useMemo, useState } from "react";
import { PREVIEW_SCHEMES, STORAGE_KEY } from "../constants";
import { studioComponents } from "../registry/components";
import { createThemeFromBaseColor } from "../theme/generator";
import { parseThemeImport } from "../theme/importers";
import type { TokenOverrides } from "../tokens/defaults";
import type { PreviewScheme, StudioStyle } from "../types";
import { Canvas } from "./Canvas";
import { ComponentExplorer } from "./ComponentExplorer";
import { ExportDialog } from "./ExportDialog";
import { InspectorPanel } from "./InspectorPanel";
import { TopBar } from "./TopBar";

export function StudioShell() {
  const [selectedComponentId, setSelectedComponentId] = useState(
    studioComponents[0]?.id ?? "",
  );
  const [tokenOverrides, setTokenOverrides] = useState<TokenOverrides>({});
  const [historyPast, setHistoryPast] = useState<TokenOverrides[]>([]);
  const [historyFuture, setHistoryFuture] = useState<TokenOverrides[]>([]);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [previewScheme, setPreviewScheme] = useState<PreviewScheme>("light");
  const [importMessage, setImportMessage] = useState<string | null>(null);

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

  const commitTokenOverrides = (
    updater: TokenOverrides | ((current: TokenOverrides) => TokenOverrides),
  ) => {
    setTokenOverrides((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      setHistoryPast((past) => [...past, current]);
      setHistoryFuture([]);
      return next;
    });
  };

  const updateToken = (tokenId: string, value: string) => {
    commitTokenOverrides((current) => {
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

  const resetTokens = () => commitTokenOverrides({});

  const undoThemeChange = () => {
    setHistoryPast((past) => {
      const previous = past[past.length - 1];
      if (!previous) return past;
      setHistoryFuture((future) => [tokenOverrides, ...future]);
      setTokenOverrides(previous);
      return past.slice(0, -1);
    });
  };

  const redoThemeChange = () => {
    setHistoryFuture((future) => {
      const next = future[0];
      if (!next) return future;
      setHistoryPast((past) => [...past, tokenOverrides]);
      setTokenOverrides(next);
      return future.slice(1);
    });
  };

  const applyGeneratedTheme = (baseColor: string) => {
    commitTokenOverrides((current) => ({
      ...current,
      ...createThemeFromBaseColor(baseColor),
    }));
  };

  const importTheme = async (file: File) => {
    try {
      const source = await file.text();
      const importedTokens = parseThemeImport(source);
      commitTokenOverrides(importedTokens);
      setImportMessage(`Imported ${Object.keys(importedTokens).length} tokens`);
    } catch (error) {
      setImportMessage(
        error instanceof Error ? error.message : "Theme import failed",
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0b1020] text-slate-100 xl:flex-row">
      <ComponentExplorer
        selectedComponentId={selectedComponent?.id ?? ""}
        onSelectComponent={setSelectedComponentId}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <TopBar
          tokenCount={Object.keys(tokenOverrides).length}
          previewScheme={previewScheme}
          importMessage={importMessage}
          canUndo={historyPast.length > 0}
          canRedo={historyFuture.length > 0}
          onChangePreviewScheme={setPreviewScheme}
          onImportTheme={importTheme}
          onUndo={undoThemeChange}
          onRedo={redoThemeChange}
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
        previewTokens={PREVIEW_SCHEMES[previewScheme]}
        previewScheme={previewScheme}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
